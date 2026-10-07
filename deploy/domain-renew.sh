#!/usr/bin/env bash
# Renew only this site's private Certbot lineage; never edit global Certbot state.
set -Eeuo pipefail
umask 077
certbot_image='certbot/certbot@sha256:f70ad0adbb7e117f0fe42a63c553f28ea451edabc0148757b6efcd9735acaa20'
domain="${1:-}"
live_dir="${2:-}"
[[ $# == 2 && "$domain" =~ ^[a-z0-9][a-z0-9.-]*[a-z0-9]$ && "$domain" == *.* && "$domain" != *..* && "$live_dir" =~ ^/[A-Za-z0-9._/-]+$ ]] || exit 2
(( EUID == 0 )) || exit 1
for required in docker openssl python3 awk readlink flock nginx systemctl curl mktemp date sha256sum cut cat stat cp chmod ln mv rm sleep; do
  command -v "$required" >/dev/null || { printf 'Missing renewal tool: %s\n' "$required" >&2; exit 1; }
done
[[ "$(readlink -e -- "$live_dir")" == "$live_dir" ]] || exit 1
private_dir="$live_dir/.local/deploy"
[[ "$(readlink -e -- "$private_dir")" == "$private_dir" ]] || exit 1
project="$(awk -F= '$1=="IELTS_COMPOSE_PROJECT" {n++; value=$2} END {if(n!=1)exit 1; print value}' "$private_dir/deploy.env")"
[[ "$project" =~ ^[a-z0-9][a-z0-9_-]{0,62}$ ]] || exit 1
domain_hash="$(printf '%s' "$domain" | sha256sum | cut -c1-12)"
scope="$project-$domain_hash"
state_dir="$private_dir/domain-$domain_hash"
webroot="/var/lib/website-ielts-ai-acme-$scope"
site_file="/etc/nginx/sites-enabled/website-ielts-ai-$scope.conf"
[[ -d "$state_dir" && "$(readlink -e -- "$state_dir")" == "$state_dir" && -f "$state_dir/owner" && ! -L "$state_dir/owner" ]] || exit 1
expected_owner="$(printf '%s\n%s\n%s\n' "$domain" "$live_dir" "$project")"
[[ "$(cat "$state_dir/owner")" == "$expected_owner" && "$(stat -c '%u' "$state_dir")" == 0 && -f "$site_file" && ! -L "$site_file" ]] || exit 1
[[ "$(readlink -e -- "$webroot")" == "$webroot" && "$(stat -c '%u' "$webroot")" == 0 ]] || exit 1
exec 9>"$state_dir/operation.lock"
flock -n 9 || exit 0
[[ "$(cat "$state_dir/result")" == healthy-on-server ]] || exit 1
sha256sum --check --status "$state_dir/site.sha256" || { printf '%s\n' 'Owned vhost was changed; renewal refuses to reload it.' >&2; exit 1; }
nginx -t > "$state_dir/renew.nginx-test.log" 2>&1 || exit 1
nginx_pid="$(systemctl show nginx.service --property=MainPID --value)"
[[ "$nginx_pid" =~ ^[1-9][0-9]*$ && "$(systemctl is-active nginx.service)" == active ]] || exit 1
[[ "$(docker info --format '{{.MemoryLimit}} {{.CPUCfsQuota}} {{.CPUCfsPeriod}} {{.SwapLimit}}')" == 'true true true true' ]] || exit 1
current_target="$(readlink -- "$state_dir/tls-current")"
[[ "$current_target" =~ ^certs/[A-Za-z0-9._-]+$ && "$(readlink -e "$state_dir/tls-current")" == "$state_dir/$current_target" ]] || exit 1
before_sha="$(sha256sum "$state_dir/tls-current/fullchain.pem" | awk '{print $1}')"
verify_presented_certificate() {
  python3 - "$domain" "$state_dir/tls-current/fullchain.pem" <<'PYTLS'
import socket, ssl, subprocess, sys, time
domain, certificate = sys.argv[1:]
expected = subprocess.check_output(['openssl', 'x509', '-in', certificate, '-outform', 'DER'], timeout=10)
context = ssl.create_default_context()
for attempt in range(6):
    try:
        with socket.create_connection(('127.0.0.1', 443), timeout=3) as connection:
            with context.wrap_socket(connection, server_hostname=domain) as tls:
                if tls.getpeercert(binary_form=True) == expected:
                    print('Trusted TLS and exact served certificate verified.')
                    raise SystemExit(0)
    except OSError:
        pass
    time.sleep(0.5)
raise SystemExit('Nginx is not presenting the expected trusted certificate.')
PYTLS
}
docker run --rm --name "ielts-acme-$scope-renew" --memory=256m --memory-swap=256m --cpus=0.25 --pids-limit=128 --cap-drop=ALL --security-opt=no-new-privileges:true \
  -v "$state_dir/acme-config:/etc/letsencrypt" -v "$state_dir/acme-work:/var/lib/letsencrypt" -v "$state_dir/acme-logs:/var/log/letsencrypt" -v "$webroot:/var/www/acme" \
  "$certbot_image" renew --cert-name "$domain" --non-interactive --no-random-sleep-on-renew --no-directory-hooks \
  --config-dir /etc/letsencrypt --work-dir /var/lib/letsencrypt --logs-dir /var/log/letsencrypt > "$state_dir/renew.certbot.log" 2>&1
cert_dir="$state_dir/acme-config/live/$domain"
for certificate_file in fullchain.pem privkey.pem cert.pem chain.pem; do
  certificate_path="$(readlink -e -- "$cert_dir/$certificate_file")"
  [[ "$certificate_path" == "$state_dir/acme-config/archive/$domain/"* && -f "$certificate_path" ]] || exit 1
done
openssl x509 -in "$cert_dir/cert.pem" -checkhost "$domain" -noout >/dev/null
openssl x509 -in "$cert_dir/cert.pem" -checkend 604800 -noout >/dev/null
openssl verify -untrusted "$cert_dir/chain.pem" "$cert_dir/cert.pem" > "$state_dir/renew.chain.log" 2>&1
new_sha="$(sha256sum "$cert_dir/fullchain.pem" | awk '{print $1}')"
if [[ "$new_sha" == "$before_sha" ]]; then
  verify_presented_certificate > "$state_dir/renew.presented-certificate.log" 2>&1
  printf '%s\n' 'Certificate is current; no Nginx reload.'
  exit 0
fi
version_dir="$(mktemp -d "$state_dir/certs/$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")"
cp -- "$cert_dir/fullchain.pem" "$version_dir/fullchain.pem"
cp -- "$cert_dir/privkey.pem" "$version_dir/privkey.pem"
chmod 600 "$version_dir/fullchain.pem" "$version_dir/privkey.pem"
reload_attempted=false
switched=false
rollback() {
  local code=$?
  trap - EXIT
  set +e
  if (( code != 0 )) && [[ "$switched" == true ]]; then
    rollback_link="$version_dir/rollback-link"
    local restored=false
    if ln -s -- "$current_target" "$rollback_link" && mv -Tf -- "$rollback_link" "$state_dir/tls-current"; then
      if [[ "$reload_attempted" == false ]]; then
        restored=true
      elif [[ "$(systemctl show nginx.service --property=MainPID --value)" == "$nginx_pid" ]] && nginx -t > "$state_dir/renew.rollback-test.log" 2>&1; then
        if systemctl reload nginx.service >> "$state_dir/renew.rollback-test.log" 2>&1 && verify_presented_certificate >> "$state_dir/renew.rollback-test.log" 2>&1; then restored=true; fi
      fi
    fi
    if [[ "$restored" == true ]]; then
      printf '%s\n' 'Renewal failed validation; restored this site certificate only.' >&2
    else
      printf '%s\n' 'Renewal rollback is incomplete; inspect this site renewal logs.' >&2
    fi
  fi
  exit "$code"
}
trap rollback EXIT
next_link="$version_dir/next-link"
ln -s -- "certs/${version_dir##*/}" "$next_link"
mv -Tf -- "$next_link" "$state_dir/tls-current"
switched=true
nginx -t > "$state_dir/renew.nginx-test.log" 2>&1
[[ "$(systemctl show nginx.service --property=MainPID --value)" == "$nginx_pid" ]]
reload_attempted=true
systemctl reload nginx.service >> "$state_dir/renew.nginx-test.log" 2>&1
[[ "$(systemctl show nginx.service --property=MainPID --value)" == "$nginx_pid" && "$(systemctl is-active nginx.service)" == active ]]
verify_presented_certificate > "$state_dir/renew.presented-certificate.log" 2>&1
curl --fail --silent --show-error --noproxy '*' --connect-timeout 10 --max-time 30 --resolve "$domain:443:127.0.0.1" "https://$domain/api/health" -o "$state_dir/renew.health.json"
python3 - "$state_dir/renew.health.json" <<'PY'
import json, sys
x=json.load(open(sys.argv[1])); assert x['status']=='ok' and x['database']=='mongodb'
PY
switched=false
printf 'Renewed and verified HTTPS certificate for %s; graceful Nginx reload only.\n' "$domain"
