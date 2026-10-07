#!/usr/bin/env bash
# Inspect the existing deployment and domain gateway. No configuration is sourced.
set -euo pipefail

domain="${1:-}"
live_input="${2:-}"
usage() {
  printf '%s\n' 'Usage: bash domain-preflight.sh DOMAIN /absolute/path/to/existing/websiteIeltsAi' >&2
  exit 2
}
(( $# == 2 )) || usage
domain="${domain,,}"
[[ ${#domain} -le 253 && "$domain" == *.* && "$domain" != *..* ]] || usage
[[ ! "$domain" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] || usage
IFS='.' read -r -a labels <<< "$domain"
for label in "${labels[@]}"; do
  [[ ${#label} -ge 1 && ${#label} -le 63 && "$label" =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$ ]] || usage
done
[[ "$domain" != *. && "$live_input" == /* && -d "$live_input" && ! -L "$live_input" ]] || usage
for required in awk readlink ss; do
  command -v "$required" >/dev/null || { printf 'Missing required inspection tool: %s\n' "$required" >&2; exit 1; }
done
live_dir="$(readlink -e -- "$live_input")"
[[ "$live_dir" == "${live_input%/}" ]] || { printf '%s\n' 'Refusing a redirected or non-canonical deployment path.' >&2; exit 1; }
private_dir="$live_dir/.local/deploy"
[[ -d "$private_dir" && "$(readlink -e -- "$private_dir")" == "$private_dir" ]] || {
  printf '%s\n' 'The existing .local/deploy directory is missing or redirected.' >&2; exit 1;
}
config_file="$private_dir/deploy.env"
[[ -f "$config_file" && ! -L "$config_file" ]] || { printf '%s\n' 'Private deploy.env is missing or is a symlink.' >&2; exit 1; }
read_setting() {
  awk -F= -v selected_key="$1" '
    $1 == selected_key { count++; selected_value = substr($0, index($0, "=") + 1); sub(/\r$/, "", selected_value) }
    END { if (count != 1) exit 1; print selected_value }
  ' "$config_file"
}
project="$(read_setting IELTS_COMPOSE_PROJECT)" || { printf '%s\n' 'Missing or duplicated project setting.' >&2; exit 1; }
public_host="$(read_setting IELTS_PUBLIC_HOST)" || { printf '%s\n' 'Missing or duplicated public host setting.' >&2; exit 1; }
public_port="$(read_setting IELTS_PUBLIC_PORT)" || { printf '%s\n' 'Missing or duplicated public port setting.' >&2; exit 1; }
[[ "$project" =~ ^[a-z0-9][a-z0-9_-]{0,62}$ && "$public_host" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]{0,252}$ && "$public_host" != *..* ]] || {
  printf '%s\n' 'Private project/host metadata has an unexpected format; values omitted.' >&2; exit 1;
}
[[ "$public_port" =~ ^[0-9]{1,5}$ ]] || { printf '%s\n' 'Private port setting has an unexpected format.' >&2; exit 1; }
public_port=$((10#$public_port))
(( public_port >= 1 && public_port <= 65535 )) || usage

printf '%s\n' 'DOMAIN PREFLIGHT: inspection only; no DNS/configuration changes, installation, build, or service restart.'
printf 'Domain: %s\nDeployment: %s\nCompose project: %s\nCurrent public endpoint: https://%s:%s\n' "$domain" "$live_dir" "$project" "$public_host" "$public_port"
if (( EUID != 0 )); then
  printf '%s\n' 'NOTE: run as root to see socket owners and protected Nginx configuration.'
fi

printf '\n%s\n' 'DNS (the server current resolver):'
if command -v dig >/dev/null; then
  for record_type in A AAAA NS CAA; do
    printf '%s: ' "$record_type"
    if answer="$(dig +time=3 +tries=1 +short "$domain" "$record_type" 2>/dev/null)"; then
      # Only emit printable DNS record characters, never terminal control bytes.
      printf '%s\n' "$answer" | LC_ALL=C awk '{ gsub(/[^ -~]/, "?"); if (length($0)) { print substr($0, 1, 400); any_record = 1 } } END { if (!any_record) print "(no answer)" }'
    else
      printf '%s\n' '(lookup failed)'
    fi
  done
else
  printf '%s\n' 'dig is not installed; NS/CAA and exact A/AAAA record queries were not performed.'
  if command -v getent >/dev/null; then
    if ! getent ahosts "$domain" | awk '{ if (!seen_address[$1]++) print "Resolved address: " $1 }'; then
      printf '%s\n' 'The system resolver returned no address.'
    fi
  fi
fi

printf '\n%s\n' 'Listening TCP sockets on 80, 443, and the current IELTS port (addresses and process owners only):'
ss -H -ltnp | awk -v selected_port="$public_port" '
  $4 ~ (":(80|443|" selected_port ")$") { print; found_socket = 1 }
  END { if (!found_socket) print "(no matching listeners)" }
'
if command -v ps >/dev/null; then
  printf '\n%s\n' 'Gateway process names (PID/PPID/command name; no command arguments):'
  ps -eo pid=,ppid=,comm= | awk '$3 ~ /^(nginx|apache2|httpd|caddy|traefik|docker-proxy)$/ { print; found_process = 1 } END { if (!found_process) print "(none found)" }'
fi

printf '\n%s\n' 'Docker gateway ownership and current IELTS services:'
if command -v docker >/dev/null && docker info --format '{{.ServerVersion}}' >/dev/null 2>&1; then
  # These formatted fields contain no environment variables or arbitrary labels.
  docker ps --format '{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Ports}}' | awk -F '\t' -v selected_port="$public_port" '
    $4 ~ (":(80|443|" selected_port ")->") { print; found_container = 1 }
    END { if (!found_container) print "(no matching published Docker ports; host-network containers can still own sockets)" }
  '
  docker ps -a --filter "label=com.docker.compose.project=$project" --format '{{.ID}}\t{{.Names}}\t{{.Label "com.docker.compose.service"}}\t{{.Status}}'
  app_ids="$(docker ps -q --filter "label=com.docker.compose.project=$project" --filter 'label=com.docker.compose.service=app')"
  if [[ "$app_ids" =~ ^[a-f0-9]{12,64}$ ]]; then
    # Docker filters before emitting output, so other environment values do
    # not even enter the pipeline. Redact any non-conventional origin URL.
    docker inspect --format '{{range .Config.Env}}{{if eq (index (split . "=") 0) "APP_ORIGIN"}}{{println .}}{{end}}{{end}}' "$app_ids" | awk '
      /^APP_ORIGIN=/ {
        selected_origin = substr($0, 12)
        if (selected_origin ~ /^https?:\/\/[a-zA-Z0-9.-]+(:[0-9]+)?\/?$/) print "Running APP_ORIGIN: " selected_origin
        else print "Running APP_ORIGIN: (non-standard value omitted)"
        found_origin = 1
      }
      END { if (!found_origin) print "Running APP_ORIGIN: (not set)" }
    '
  else
    printf '%s\n' 'Running APP_ORIGIN: not inspected (expected exactly one running app container).'
  fi
else
  printf '%s\n' 'Docker is unavailable to this account; no Docker metadata inspected.'
fi

printf '\n%s\n' 'Existing IELTS public TLS certificate (not its private key):'
cert_file="$private_dir/tls/site.crt"
if command -v openssl >/dev/null && [[ -f "$cert_file" && ! -L "$cert_file" ]] && [[ "$(readlink -e -- "$private_dir/tls")" == "$private_dir/tls" ]]; then
  if ! openssl x509 -in "$cert_file" -noout -dates -fingerprint -sha256 -ext subjectAltName 2>/dev/null; then
    printf '%s\n' 'Certificate metadata could not be read.'
  fi
else
  printf '%s\n' 'Certificate metadata not inspected (missing OpenSSL/certificate or redirected TLS path).'
fi

printf '\n%s\n' 'Host Nginx gateway configuration:'
if command -v systemctl >/dev/null; then
  if nginx_state="$(systemctl show nginx.service --property=ActiveState,SubState,MainPID --no-pager 2>/dev/null)"; then
    printf '%s\n' "$nginx_state" | awk -F= '
      $1 ~ /^(ActiveState|SubState)$/ && $2 ~ /^[a-z-]+$/ { print "nginx.service " $1 "=" $2 }
      $1 == "MainPID" && $2 ~ /^[0-9]+$/ { print "nginx.service MainPID=" $2 }
    '
  else
    printf '%s\n' 'nginx.service state is unavailable (systemd may not be active).'
  fi
fi
if ! command -v nginx >/dev/null; then
  printf '%s\n' 'No nginx command on the host PATH. A container gateway may still be present.'
elif ! command -v python3 >/dev/null; then
  nginx -v 2>&1 | awk '/^nginx version:/ { print }'
  if nginx -t >/dev/null 2>&1; then printf '%s\n' 'nginx -t: PASS'; else printf '%s\n' 'nginx -t: FAIL (raw diagnostics omitted)'; fi
  printf '%s\n' 'Python 3 is unavailable; server_name ownership was not inspected. No software was installed.'
else
  nginx -v 2>&1 | awk '/^nginx version:/ { print }'
  # Nginx -T also validates configuration. The full dump and diagnostics are
  # captured in process memory, never written to disk or printed. Only the
  # allowlisted directives below can appear in this report.
  python3 - "$domain" <<'PY'
import fnmatch
import re
import subprocess
import sys

target = sys.argv[1]
try:
    result = subprocess.run(["nginx", "-T"], capture_output=True, text=True, timeout=20)
except (OSError, subprocess.TimeoutExpired):
    print("nginx -T/configuration test: unavailable or timed out (raw diagnostics omitted)")
    sys.exit(0)
if result.returncode:
    print("nginx -T/configuration test: FAIL (raw diagnostics omitted)")
    print("Do not reload or replace the existing gateway until its configuration is checked.")
    sys.exit(0)
print("nginx -T/configuration test: PASS")
if len(result.stdout) > 10_000_000:
    print("Configuration dump exceeds the inspection limit; directive report omitted.")
    sys.exit(0)

safe_path = re.compile(r"^/[A-Za-z0-9_./+@*?=,:-]{1,510}$")
safe_name = re.compile(r"^(?:_|\.?[a-z0-9_-]+(?:\.[a-z0-9_-]+)*|\*\.[a-z0-9_-]+(?:\.[a-z0-9_-]+)*|[a-z0-9_-]+(?:\.[a-z0-9_-]+)*\.\*)$", re.I)
safe_endpoint = re.compile(r"^(?:[0-9]{1,5}|(?:\[[0-9a-fA-F:]+\]|[A-Za-z0-9.*_-]+):[0-9]{1,5})$")
safe_listen_option = re.compile(r"^(?:ssl|http2|quic|default_server|default|bind|reuseport|proxy_protocol|deferred|ipv6only=(?:on|off)|(?:backlog|rcvbuf|sndbuf)=[0-9]+[kKmM]?)$")

def tokens(source):
    """Read Nginx strings/comments without exposing unrelated directives."""
    i = 0
    while i < len(source):
        if source[i].isspace():
            i += 1
            continue
        if source[i] == "#":
            end = source.find("\n", i)
            i = len(source) if end < 0 else end + 1
            continue
        if source[i] in "{};":
            yield source[i], True
            i += 1
            continue
        quote = source[i] if source[i] in "\"'" else None
        if quote:
            i += 1
        value = []
        while i < len(source):
            char = source[i]
            if char == "\\" and i + 1 < len(source):
                value.append(source[i + 1])
                i += 2
                continue
            if not quote and char == "$" and i + 1 < len(source) and source[i + 1] == "{":
                end = source.find("}", i + 2)
                if end >= 0:
                    value.append(source[i:end + 1])
                    i = end + 1
                    continue
            if quote and char == quote:
                i += 1
                break
            if not quote and (char.isspace() or char in "{};#"):
                break
            value.append(char)
            i += 1
        yield "".join(value), False

files = []
servers = []
chunks = re.split(r"(?m)^# configuration file (.+):\s*$", result.stdout)
for index in range(1, len(chunks), 2):
    file_path, source = chunks[index], chunks[index + 1]
    display_path = file_path if safe_path.fullmatch(file_path) else "(non-standard path omitted)"
    files.append(display_path)
    stack, statement = [], []
    for token, structural in tokens(source):
        if structural and token == "{":
            kind = statement[0] if statement else ""
            record = None
            if kind == "server":
                record = {"file": display_path, "names": [], "listen": [], "certs": [], "includes": [], "other_names": 0}
                servers.append(record)
            stack.append((kind, record))
            statement = []
        elif structural and token == "}":
            if stack:
                stack.pop()
            statement = []
        elif structural and token == ";":
            if stack and stack[-1][0] == "server" and statement:
                record = stack[-1][1]
                directive, values = statement[0], statement[1:]
                if directive == "server_name":
                    for value in values:
                        if safe_name.fullmatch(value):
                            record["names"].append(value.lower())
                        else:
                            record["other_names"] += 1
                elif directive == "listen":
                    if values and safe_endpoint.fullmatch(values[0]):
                        flags = [value for value in values[1:] if safe_listen_option.fullmatch(value)]
                        record["listen"].append(" ".join([values[0], *flags]))
                elif directive == "ssl_certificate" and len(values) == 1:
                    record["certs"].append(values[0] if safe_path.fullmatch(values[0]) else "(non-standard certificate reference omitted)")
                elif directive == "include" and len(values) == 1:
                    record["includes"].append(values[0] if safe_path.fullmatch(values[0]) else "(non-standard include reference omitted)")
            statement = []
        else:
            statement.append(token)

def matches(name):
    if name == target:
        return True
    if name.startswith("."):
        base = name[1:]
        return target == base or target.endswith("." + base)
    if name.startswith("*."):
        return target.endswith(name[1:])
    if name.endswith(".*"):
        return target.startswith(name[:-1])
    return False

matching = [server for server in servers if any(matches(name) for name in server["names"])]
print("Target literal/wildcard server_name ownership: " + (str(len(matching)) + " server block(s)" if matching else "no matching literal/wildcard name found"))
if any(server["other_names"] for server in servers):
    print("Regex/variable server_name values exist; values were omitted and their ownership is not inferred.")
print("Loaded configuration file paths: " + ("; ".join(dict.fromkeys(files))[:2200] if files else "(none parsed)"))
print("Server directives inherited from include fragments are not associated with their parent block; inspect listed include paths if ownership is unclear.")
ordered = matching + [server for server in servers if server not in matching]
for server in ordered[:24]:
    marker = "TARGET" if server in matching else "existing"
    names = ",".join(server["names"][:12]) or "(implicit/omitted)"
    listeners = ",".join(server["listen"][:6]) or "(implicit/non-standard omitted)"
    print(f"{marker}: file={server['file']} names={names} listen={listeners}")
    if server["certs"]:
        print("  public certificate path: " + "; ".join(server["certs"][:4]))
    if server["includes"]:
        print("  server include paths: " + "; ".join(server["includes"][:4]))
if len(ordered) > 24:
    print(f"({len(ordered) - 24} additional server blocks omitted from the small report)")
PY
fi

printf '\n%s\n' 'PREFLIGHT COMPLETE. This report does not map the domain or prove public DNS/HTTPS reachability.'
printf '%s\n' 'Share this output to select the existing gateway and plan the domain change without replacing other projects.'
