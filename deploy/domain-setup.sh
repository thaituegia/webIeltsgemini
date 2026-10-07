#!/usr/bin/env bash
# Attach one apex hostname to the existing IELTS app and host Nginx gateway.
# One downloaded file is enough: the scoped Compose wrapper and renewal helper
# are embedded below, and existing application/MongoDB data are never replaced.
set -Eeuo pipefail
umask 077
certbot_image='certbot/certbot@sha256:f70ad0adbb7e117f0fe42a63c553f28ea451edabc0148757b6efcd9735acaa20'
domain="${1:-}"
live_dir="${2:-}"
state_dir=''
site_created=false
wrapper_changed=false
override_created=false
app_changed=false
baseline_ready=false
cron_created=false
nginx_stage=''
wrapper_stage=''

say() { printf '\n%s\n' "$*"; }
die() { printf '\nDỪNG: %s\n' "$*" >&2; exit 1; }
usage() { printf '%s\n' 'Usage: bash domain-setup.sh DOMAIN /absolute/path/to/existing/websiteIeltsAi' >&2; exit 2; }
(( $# == 2 )) || usage
domain="${domain,,}"
[[ ${#domain} -le 253 && "$domain" == *.* && "$domain" != *..* && "$domain" != *. ]] || usage
[[ ! "$domain" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] || usage
IFS=. read -r -a labels <<< "$domain"
for label in "${labels[@]}"; do
  [[ ${#label} -ge 1 && ${#label} -le 63 && "$label" =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$ ]] || usage
done
[[ "$live_dir" =~ ^/[A-Za-z0-9._/-]+$ && -d "$live_dir" && ! -L "$live_dir" ]] || usage
(( EUID == 0 )) || die 'Hãy chạy bằng root trong phiên SSH VPS đã mở.'
for required in docker nginx systemctl python3 openssl curl readlink awk sha256sum cut stat mktemp date sort comm cmp ss flock cp chmod mkdir mv ln cat rm wc sleep; do
  command -v "$required" >/dev/null || die "VPS thiếu $required; script không tự cài hoặc nâng cấp hệ thống."
done
[[ "$(readlink -e -- "$live_dir")" == "$live_dir" && "$(stat -c '%u' "$live_dir")" == 0 ]] || die 'Thư mục ứng dụng phải là đường dẫn thật, do root sở hữu.'
private_dir="$live_dir/.local/deploy"
[[ "$(readlink -e -- "$private_dir")" == "$private_dir" && "$(stat -c '%u' "$private_dir")" == 0 ]] || die 'Thư mục private deploy bị thiếu hoặc chuyển hướng.'
config_file="$private_dir/deploy.env"
compose_file="$live_dir/deploy/compose.yaml"
compose_wrapper="$live_dir/deploy/compose.sh"
for regular_file in "$config_file" "$compose_file" "$compose_wrapper" "$private_dir/tls/site.crt"; do
  [[ -f "$regular_file" && ! -L "$regular_file" ]] || die 'Thiếu cấu hình triển khai thật hoặc có symlink không được phép.'
done
[[ "$(readlink -e -- "$private_dir/tls")" == "$private_dir/tls" ]] || die 'Thư mục TLS upstream bị chuyển hướng.'
read_setting() {
  awk -F= -v ielts_key="$1" '$1==ielts_key {n++; value=substr($0,index($0,"=")+1); sub(/\r$/,"",value)} END {if(n!=1)exit 1; print value}' "$config_file"
}
project="$(read_setting IELTS_COMPOSE_PROJECT)" || die 'Tên Compose project thiếu hoặc trùng.'
public_host="$(read_setting IELTS_PUBLIC_HOST)" || die 'Thiếu upstream hostname.'
public_port="$(read_setting IELTS_PUBLIC_PORT)" || die 'Thiếu upstream port.'
[[ "$project" =~ ^[a-z0-9][a-z0-9_-]{0,62}$ && "$public_host" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ && "$public_port" =~ ^[0-9]{1,5}$ ]] || die 'Metadata project/IP/cổng không hợp lệ.'
IFS=. read -r -a ip_parts <<< "$public_host"
for part in "${ip_parts[@]}"; do (( 10#$part <= 255 )) || die 'Địa chỉ IP upstream không hợp lệ.'; done
public_port=$((10#$public_port))
(( public_port >= 1024 && public_port <= 65535 )) || die 'Cổng upstream không hợp lệ.'
domain_hash="$(printf '%s' "$domain" | sha256sum | cut -c1-12)"
scope="$project-$domain_hash"
state_dir="$private_dir/domain-$domain_hash"
webroot="/var/lib/website-ielts-ai-acme-$scope"
site_file="/etc/nginx/sites-enabled/website-ielts-ai-$scope.conf"
cron_file="/etc/cron.d/website-ielts-ai-$scope"
# These are newly created, independently owned paths. Never overwrite a site,
# prior domain attempt, ACME webroot, or cron belonging to another deployment.
for new_path in "$state_dir" "$webroot" "$site_file" "$cron_file" "$private_dir/domain.compose.yaml"; do
  [[ ! -e "$new_path" && ! -L "$new_path" ]] || die "Đường dẫn đã tồn tại; không ghi đè: $new_path"
done
[[ "$(readlink -e /etc/nginx/sites-enabled)" == /etc/nginx/sites-enabled && "$(readlink -e /etc/cron.d)" == /etc/cron.d && "$(readlink -e /var/lib)" == /var/lib ]] || die 'Thư mục Nginx/cron/webroot không phải đường dẫn hệ thống thật.'
docker info >/dev/null 2>&1 || die 'Docker chưa hoạt động; không restart Docker.'
docker compose version >/dev/null 2>&1 || die 'Thiếu Docker Compose v2; không tự nâng cấp.'
compose_args=(--project-name "$project" --env-file "$config_file" -f "$compose_file")
docker compose "${compose_args[@]}" config --quiet || die 'Compose hiện tại không hợp lệ.'
compose_up_help="$(docker compose up --help)"
for compose_option in --wait --wait-timeout; do
  printf '%s\n' "$compose_up_help" | awk -v ielts_option="$compose_option" '$1==ielts_option{ok=1}END{exit !ok}' || die "Compose thiếu $compose_option; không sửa hệ thống."
done
[[ "$(docker info --format '{{.MemoryLimit}} {{.CPUCfsQuota}} {{.CPUCfsPeriod}} {{.SwapLimit}}')" == 'true true true true' ]] || die 'Docker không có đủ giới hạn tài nguyên ACME; không chạy không giới hạn.'
available_kib="$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)"
[[ "$available_kib" =~ ^[0-9]+$ ]] && (( available_kib >= 512 * 1024 )) || die 'Cần ít nhất 512 MiB RAM khả dụng để giữ khoảng trống cho project khác.'
nginx_pid="$(systemctl show nginx.service --property=MainPID --value)"
[[ "$nginx_pid" =~ ^[1-9][0-9]*$ && "$(systemctl is-active nginx.service)" == active ]] || die 'Host Nginx chưa active; không chiếm cổng bằng gateway khác.'
[[ "$(systemctl is-active cron.service)" == active ]] || die 'cron.service chưa hoạt động; không tự enable/restart cron dùng chung.'
for gateway_port in 80 443; do
  ss -H -ltnp | awk -v ielts_port="$gateway_port" -v ielts_pid="$nginx_pid" '$4 ~ (":"ielts_port"$") {if($0 !~ /\("nginx"/ || $0 !~ ("pid="ielts_pid","))exit 1; ielts_row=$0; gsub(/\("nginx",[^)]*\)/,"",ielts_row); if(ielts_row ~ /\("[^"]+",/)exit 1; found=1} END {if(!found)exit 1}' || die "Cổng $gateway_port không được host Nginx sở hữu độc quyền."
done
openssl x509 -in "$private_dir/tls/site.crt" -checkip "$public_host" -noout >/dev/null || die 'TLS upstream không khớp địa chỉ IP đã cài.'
app_id="$(docker ps -q --no-trunc --filter "label=com.docker.compose.project=$project" --filter 'label=com.docker.compose.service=app')"
[[ "$app_id" =~ ^[a-f0-9]{64}$ ]] || die 'Cần đúng một app container IELTS đang chạy.'
old_origin="$(docker inspect --format '{{range .Config.Env}}{{if eq (index (split . "=") 0) "APP_ORIGIN"}}{{println (index (split . "=") 1)}}{{end}}{{end}}' "$app_id")"
[[ "$old_origin" == "https://$public_host:$public_port" ]] || die 'APP_ORIGIN hiện tại khác triển khai IP đã kiểm tra; không tự ghi đè.'

# Select a separate loopback-only app binding. Public HTTPS terminates on the
# host gateway; the old self-signed 8088 endpoint is not an upstream dependency.
loopback_port="$(python3 - <<'PYPORT'
import re,subprocess
s=subprocess.check_output(['ss','-H','-lntu'],text=True)
busy=set()
for row in s.splitlines():
    columns=row.split()
    if len(columns)>4:
        try: busy.add(int(columns[4].rsplit(':',1)[1]))
        except ValueError: pass
ports=subprocess.check_output(['docker','ps','--format','{{.Ports}}'],text=True)
for start,end in re.findall(r'(?:[\d.:]+|\[[\da-f:]+\]):(\d+)(?:-(\d+))?->',ports):
    busy.update(range(int(start),int(end or start)+1))
for port in range(19088,19189):
    if port not in busy:
        print(port); break
else: raise SystemExit('No unused app loopback port')
PYPORT
)" || die 'Không có cổng loopback trống cho riêng app IELTS.'
[[ "$loopback_port" =~ ^[0-9]{5}$ ]] || die 'Cổng loopback không hợp lệ.'
say 'Đang kiểm tra DNS, Nginx và website hiện tại; chưa thay cấu hình.'
# AF_INET6 without AI_ADDRCONFIG checks AAAA even if this host has no IPv6 route.
# Unknown/transient DNS failure stops; it is never treated as an empty AAAA set.
python3 - "$domain" "$public_host" <<'PY' || die 'DNS chưa trỏ duy nhất đến đúng IPv4 VPS, hoặc có AAAA/lookup lỗi. Chưa thay cấu hình.'
import socket, sys
name, expected = sys.argv[1:]
def lookup(family):
    try:
        return sorted({x[4][0] for x in socket.getaddrinfo(name, 443, family, socket.SOCK_STREAM, 0, 0)})
    except socket.gaierror as e:
        if e.errno in (socket.EAI_NONAME, getattr(socket, 'EAI_NODATA', -5)):
            return []
        raise
v4, v6 = lookup(socket.AF_INET), lookup(socket.AF_INET6)
print('DNS A: '+(', '.join(v4) or '(none)'))
print('DNS AAAA: '+(', '.join(v6) or '(none)'))
assert v4 == [expected] and not v6
PY
curl --fail --silent --show-error --noproxy '*' --connect-timeout 10 --max-time 30 --cacert "$private_dir/tls/site.crt" --resolve "$public_host:$public_port:127.0.0.1" "https://$public_host:$public_port/api/health" >/dev/null || die 'Website HTTPS hiện tại chưa healthy; chưa chuyển tên miền.'

# Validate exact/wildcard/regex server_name ownership and the HTTP include point
# from nginx -T kept only in process memory. Never print existing site contents.
python3 - "$domain" <<'PY' || die 'Nginx chưa đủ điều kiện thêm riêng tên miền; chưa thay cấu hình.'
import fnmatch, re, subprocess, sys
x=subprocess.run(['nginx','-T'],capture_output=True,text=True,timeout=30)
if x.returncode: raise SystemExit('nginx -T failed (diagnostics omitted)')
if len(x.stdout)>10_000_000: raise SystemExit('nginx dump exceeds inspection limit')
chunks=re.split(r'(?m)^# configuration file (.+):\s*$',x.stdout)
include_ok=False
for i in range(1,len(chunks),2):
    path, source=chunks[i],chunks[i+1]
    # Tokenize comments and quoted Nginx strings without displaying values.
    tokens=re.findall(r'#[^\n]*|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'|[{};]|[^\s{};]+', source)
    stack=[]; statement=[]
    for raw in tokens:
        if raw.startswith('#'): continue
        token=raw[1:-1] if raw[:1] in ('"',"'") else raw
        if token=='{':
            stack.append(statement[0] if statement else ''); statement=[]
        elif token=='}':
            if stack: stack.pop()
            statement=[]
        elif token==';':
            if statement:
                kind,values=statement[0],statement[1:]
                if kind=='include' and values==['/etc/nginx/sites-enabled/*'] and stack==['http']:
                    include_ok=True
                if kind=='server_name':
                    for name in values:
                        name=name.lower()
                        matched=name==sys.argv[1]
                        if name.startswith('.'):
                            matched=sys.argv[1]==name[1:] or sys.argv[1].endswith(name)
                        elif '*' in name: matched=fnmatch.fnmatchcase(sys.argv[1],name)
                        elif name.startswith('~'):
                            try: matched=bool(re.search(name.lstrip('~*'),sys.argv[1],re.I if name.startswith('~*') else 0))
                            except re.error: raise SystemExit('Unsupported existing regex server_name; manual ownership review required')
                        elif '$' in name: raise SystemExit('Dynamic existing server_name; manual ownership review required')
                        if matched: raise SystemExit('The requested hostname already belongs to an existing virtual host')
            statement=[]
        else: statement.append(token)
if not include_ok: raise SystemExit('Expected sites-enabled HTTP include not found')
print('Nginx configuration valid; target hostname unused; scoped HTTP include verified.')
PY

mkdir -m 700 -- "$state_dir"
mkdir -m 700 -- "$state_dir/audit" "$state_dir/acme-config" "$state_dir/acme-work" "$state_dir/acme-logs" "$state_dir/certs"
printf '%s\n%s\n%s\n' "$domain" "$live_dir" "$project" > "$state_dir/owner"
audit_dir="$state_dir/audit"
exec 8>"$state_dir/operation.lock"
flock -n 8 || die 'Một lần cấu hình khác đang chạy.'
cp -p -- "$compose_wrapper" "$audit_dir/compose.sh.before"
printf '%s\n' "$old_origin" > "$audit_dir/origin.before"
# All previously running containers except this app must retain ID/start time.
docker ps -q --no-trunc | awk -v ielts_app="$app_id" '$0!=ielts_app' | sort > "$audit_dir/before.ids"
snapshot_containers() {
  local container_id
  while IFS= read -r container_id; do
    [[ -n "$container_id" ]] || continue
    docker inspect --format '{{.Id}} {{.State.Running}} {{.State.StartedAt}}' "$container_id" || return 1
  done < "$audit_dir/before.ids"
}
snapshot_listeners() { ss -H -lntu | awk '{print $1" "$5}' | sort -u; }
snapshot_containers > "$audit_dir/before.containers"
snapshot_listeners > "$audit_dir/before.listeners"
# Save hashes/real paths/modes of files already loaded by Nginx, never contents.
python3 - "$audit_dir/nginx-files.json" <<'PY'
import hashlib,json,os,re,subprocess,sys
x=subprocess.run(['nginx','-T'],capture_output=True,text=True,timeout=30); assert x.returncode==0
paths=re.findall(r'(?m)^# configuration file (.+):\s*$',x.stdout)
assert paths
result={}
for path in paths:
    st=os.stat(path)
    result[path]={'real':os.path.realpath(path),'sha':hashlib.sha256(open(path,'rb').read()).hexdigest(),'mode':st.st_mode,'uid':st.st_uid,'gid':st.st_gid}
json.dump(result,open(sys.argv[1],'w'),sort_keys=True)
PY
baseline_ready=true
verify_existing() {
  snapshot_containers > "$audit_dir/after.containers" || return 1
  cmp -s "$audit_dir/before.containers" "$audit_dir/after.containers" || return 1
  snapshot_listeners > "$audit_dir/after.listeners" || return 1
  comm -23 "$audit_dir/before.listeners" "$audit_dir/after.listeners" > "$audit_dir/missing.listeners" || return 1
  [[ ! -s "$audit_dir/missing.listeners" ]] || return 1
  [[ "$(systemctl show nginx.service --property=MainPID --value)" == "$nginx_pid" && "$(systemctl is-active nginx.service)" == active ]] || return 1
  python3 - "$audit_dir/nginx-files.json" <<'PY' || return 1
import hashlib,json,os,sys
for path,old in json.load(open(sys.argv[1])).items():
    st=os.stat(path)
    now={'real':os.path.realpath(path),'sha':hashlib.sha256(open(path,'rb').read()).hexdigest(),'mode':st.st_mode,'uid':st.st_uid,'gid':st.st_gid}
    assert now==old, 'A pre-existing Nginx configuration changed'
PY
}
reload_gateway() {
  verify_existing || return 1
  nginx -t > "$audit_dir/nginx-test.log" 2>&1 || return 1
  systemctl reload nginx.service >> "$audit_dir/nginx-test.log" 2>&1 || return 1
  verify_existing
}
preserve_ip_endpoint() {
  local check_attempt
  if curl --fail --silent --show-error --noproxy '*' --connect-timeout 5 --max-time 15 --cacert "$private_dir/tls/site.crt" --resolve "$public_host:$public_port:127.0.0.1" "https://$public_host:$public_port/api/health" -o "$audit_dir/ip-health.json" 2>/dev/null; then return 0; fi
  # Docker may change app IP on recreation. Resolve it again by reloading only
  # this project's existing proxy process; never recreate its container.
  docker compose "${compose_args[@]}" exec -T proxy nginx -t > "$audit_dir/ip-proxy-reload.log" 2>&1 || return 1
  docker compose "${compose_args[@]}" exec -T proxy nginx -s reload >> "$audit_dir/ip-proxy-reload.log" 2>&1 || return 1
  for check_attempt in 1 2 3 4 5; do
    if curl --fail --silent --show-error --noproxy '*' --connect-timeout 5 --max-time 15 --cacert "$private_dir/tls/site.crt" --resolve "$public_host:$public_port:127.0.0.1" "https://$public_host:$public_port/api/health" -o "$audit_dir/ip-health.json" 2>/dev/null; then return 0; fi
    sleep 1
  done
  return 1
}
on_exit() {
  local code=$?
  trap - EXIT
  set +e
  if (( code != 0 )); then
    local rollback_ok=true
    printf '%s\n' 'Có lỗi; đang khôi phục riêng cấu hình tên miền IELTS, giữ nguyên MongoDB/tài khoản/ghi âm.' >&2
    if [[ "$cron_created" == true ]]; then rm -f -- "$cron_file" || rollback_ok=false; fi
    if [[ -n "$nginx_stage" ]]; then rm -f -- "$nginx_stage" || rollback_ok=false; fi
    if [[ -n "$wrapper_stage" ]]; then rm -f -- "$wrapper_stage" || rollback_ok=false; fi
    if [[ "$site_created" == true ]]; then
      rm -f -- "$site_file" || rollback_ok=false
      if [[ "$(systemctl show nginx.service --property=MainPID --value)" == "$nginx_pid" ]] && nginx -t > "$audit_dir/rollback.nginx.log" 2>&1; then
        systemctl reload nginx.service >> "$audit_dir/rollback.nginx.log" 2>&1 || rollback_ok=false
      else
        rollback_ok=false
      fi
    fi
    if [[ "$override_created" == true ]]; then rm -f -- "$private_dir/domain.compose.yaml" || rollback_ok=false; fi
    if [[ "$wrapper_changed" == true ]]; then cp -p -- "$audit_dir/compose.sh.before" "$compose_wrapper" || rollback_ok=false; fi
    if [[ "$app_changed" == true ]]; then
      docker compose "${compose_args[@]}" up -d --no-deps --no-build --wait --wait-timeout 180 app > "$audit_dir/rollback.app.log" 2>&1 || rollback_ok=false
      preserve_ip_endpoint >> "$audit_dir/rollback.app.log" 2>&1 || rollback_ok=false
    fi
    if [[ "$baseline_ready" == true ]] && verify_existing; then
      printf '%s\n' 'Các container khác, master Nginx, file cấu hình cũ và cổng cũ giữ nguyên.' >&2
    else
      rollback_ok=false
      printf '%s\n' 'Hiện trạng cũ đã thay đổi trong lúc chạy; script không restart/sửa các project khác.' >&2
    fi
    if [[ "$rollback_ok" == true && ! -e "$site_file" && ! -L "$site_file" && ! -e "$cron_file" && ! -L "$cron_file" && ! -e "$private_dir/domain.compose.yaml" && ! -L "$private_dir/domain.compose.yaml" ]]; then
      printf '%s\n' failed-safe > "$state_dir/result"
      printf '%s\n' 'Đã khôi phục cấu hình IP cũ. Giữ log/chứng chỉ riêng để kiểm tra trước khi thử lại.' >&2
    else
      printf '%s\n' failed-incomplete > "$state_dir/result"
      printf '%s\n' 'Khôi phục chưa được xác minh đầy đủ; cần đọc log riêng, không chạy lại hoặc xóa trạng thái.' >&2
    fi
    printf 'Chưa hoàn tất. Log riêng: %s\n' "$audit_dir" >&2
  fi
  exit "$code"
}
trap on_exit EXIT

mkdir -m 755 -- "$webroot"
mkdir -m 755 -- "$webroot/.well-known" "$webroot/.well-known/acme-challenge"
nginx_stage="$(mktemp /etc/nginx/.website-ielts-ai-domain-XXXXXX)"
cat > "$nginx_stage" <<EOF
# Owned exclusively by websiteIeltsAi: $scope
server {
    listen 80;
    server_name $domain;
    access_log $state_dir/http.access.log;
    error_log $state_dir/http.error.log warn;
    location ^~ /.well-known/acme-challenge/ {
        root $webroot;
        default_type text/plain;
        try_files \$uri =404;
    }
    location / { return 404; }
}
EOF
chmod 600 "$nginx_stage"
site_created=true
mv -T -- "$nginx_stage" "$site_file"
nginx_stage=''
reload_gateway || die "Cấu hình HTTP riêng không qua kiểm tra/reload. Xem $audit_dir/nginx-test.log"
probe_token="$(openssl rand -hex 24)"
printf '%s\n' "$probe_token" > "$webroot/.well-known/acme-challenge/ielts-$probe_token"
chmod 644 "$webroot/.well-known/acme-challenge/ielts-$probe_token"
http_probe="$(curl --fail --silent --show-error --noproxy '*' --connect-timeout 10 --max-time 30 --resolve "$domain:80:127.0.0.1" "http://$domain/.well-known/acme-challenge/ielts-$probe_token")"
[[ "$http_probe" == "$probe_token" ]] || die 'Nginx worker chưa đọc được webroot HTTP-01 riêng.'
rm -- "$webroot/.well-known/acme-challenge/ielts-$probe_token"

say 'Đang tải Certbot chính thức, giới hạn 256 MiB RAM và 0,25 CPU; không dùng plugin sửa Nginx.'
docker pull "$certbot_image" > "$audit_dir/certbot-pull.log" 2>&1 || die "Không tải được Certbot đã pin. Xem $audit_dir/certbot-pull.log"
run_certbot() {
  docker run --rm --name "ielts-acme-$scope-setup" --memory=256m --memory-swap=256m --cpus=0.25 --pids-limit=128 --cap-drop=ALL --security-opt=no-new-privileges:true \
    -v "$state_dir/acme-config:/etc/letsencrypt" -v "$state_dir/acme-work:/var/lib/letsencrypt" -v "$state_dir/acme-logs:/var/log/letsencrypt" -v "$webroot:/var/www/acme" \
    "$certbot_image" certonly --webroot --webroot-path /var/www/acme --cert-name "$domain" --domains "$domain" \
    --non-interactive --agree-tos --register-unsafely-without-email --no-eff-email --no-directory-hooks \
    --config-dir /etc/letsencrypt --work-dir /var/lib/letsencrypt --logs-dir /var/log/letsencrypt "$@"
}
say 'Đang kiểm tra ACME staging trước: DNS/CAA/HTTP-01 phải qua; chưa xin chứng chỉ production.'
run_certbot --dry-run > "$audit_dir/acme-dry-run.log" 2>&1 || die "ACME dry-run chưa thành công. Xem $audit_dir/acme-dry-run.log"
verify_existing || die 'Hiện trạng project khác thay đổi; dừng trước khi xin chứng chỉ production.'
say 'ACME staging đã qua; đang cấp chứng chỉ HTTPS công khai cho đúng tên miền.'
run_certbot > "$audit_dir/acme-production.log" 2>&1 || die "Cấp chứng chỉ chưa thành công. Xem $audit_dir/acme-production.log"
cert_dir="$state_dir/acme-config/live/$domain"
for certificate_file in fullchain.pem privkey.pem cert.pem chain.pem; do
  certificate_path="$(readlink -e -- "$cert_dir/$certificate_file")"
  [[ "$certificate_path" == "$state_dir/acme-config/archive/$domain/"* && -f "$certificate_path" ]] || die 'Certbot certificate lineage không đúng thư mục riêng.'
done
openssl x509 -in "$cert_dir/cert.pem" -checkhost "$domain" -noout >/dev/null || die 'Chứng chỉ mới không khớp tên miền.'
openssl x509 -in "$cert_dir/cert.pem" -checkend 604800 -noout >/dev/null || die 'Chứng chỉ mới không đủ thời hạn.'
openssl verify -untrusted "$cert_dir/chain.pem" "$cert_dir/cert.pem" > "$audit_dir/cert-chain.log" 2>&1 || die 'Chuỗi chứng chỉ không được CA hệ thống tin cậy.'
version_dir="$(mktemp -d "$state_dir/certs/$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")"
cp -- "$cert_dir/fullchain.pem" "$version_dir/fullchain.pem"
cp -- "$cert_dir/privkey.pem" "$version_dir/privkey.pem"
chmod 600 "$version_dir/fullchain.pem" "$version_dir/privkey.pem"
ln -s -- "certs/${version_dir##*/}" "$state_dir/tls-current"

nginx_stage="$(mktemp /etc/nginx/.website-ielts-ai-domain-XXXXXX)"
cat > "$nginx_stage" <<EOF
# Owned exclusively by websiteIeltsAi: $scope
server {
    listen 80;
    server_name $domain;
    access_log $state_dir/http.access.log;
    error_log $state_dir/http.error.log warn;
    location ^~ /.well-known/acme-challenge/ {
        root $webroot;
        default_type text/plain;
        try_files \$uri =404;
    }
    location / { return 301 https://$domain\$request_uri; }
}
server {
    listen 443 ssl;
    server_name $domain;
    ssl_certificate $state_dir/tls-current/fullchain.pem;
    ssl_certificate_key $state_dir/tls-current/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_session_timeout 1d;
    ssl_session_cache shared:IELTS_$domain_hash:1m;
    access_log $state_dir/https.access.log;
    error_log $state_dir/https.error.log warn;
    client_max_body_size 26m;
    client_body_timeout 960s;
    send_timeout 960s;
    location / {
        # Localhost stays on this host; browser-to-gateway TLS is CA verified.
        proxy_pass http://127.0.0.1:$loopback_port;
        proxy_http_version 1.1;
        proxy_set_header Host $domain;
        proxy_set_header X-Forwarded-Host $domain;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header Connection "";
        proxy_connect_timeout 10s;
        proxy_read_timeout 960s;
        proxy_send_timeout 960s;
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
EOF
chmod 600 "$nginx_stage"
mv -T -- "$nginx_stage" "$site_file"
nginx_stage=''
reload_gateway || die "Cấu hình HTTPS riêng không qua kiểm tra/reload. Xem $audit_dir/nginx-test.log"

# Embedded Compose wrapper: same base file/env/project; optional private override.
wrapper_stage="$(mktemp "$live_dir/deploy/.domain-compose-XXXXXX")"
cat > "$wrapper_stage" <<'IELTS_COMPOSE_WRAPPER'
#!/usr/bin/env bash
set -euo pipefail
deploy_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd -- "$deploy_dir/.." && pwd)"
config_file="$root_dir/.local/deploy/deploy.env"
if [[ ! -f "$config_file" || -L "$config_file" ]]; then
  printf '%s\n' 'Run deploy/init.sh first; .local/deploy/deploy.env is missing or a symlink.' >&2
  exit 1
fi
project="$(awk -F= '$1=="IELTS_COMPOSE_PROJECT" {print $2}' "$config_file")"
if [[ ! "$project" =~ ^[a-z0-9][a-z0-9_-]{0,62}$ ]]; then
  printf '%s\n' 'Invalid project name in private deploy.env.' >&2
  exit 1
fi
compose_arguments=(--project-name "$project" --env-file "$config_file" -f "$deploy_dir/compose.yaml")
domain_override="$root_dir/.local/deploy/domain.compose.yaml"
if [[ -e "$domain_override" || -L "$domain_override" ]]; then
  if [[ ! -f "$domain_override" || -L "$domain_override" ]]; then
    printf '%s\n' 'Refusing a redirected or invalid domain override.' >&2
    exit 1
  fi
  compose_arguments+=(-f "$domain_override")
fi
case "${1:-}" in
  validate)
    shift
    if (( $# != 0 )); then exit 2; fi
    exec docker compose "${compose_arguments[@]}" config --quiet
    ;;
  ps|logs|build|up|stop|start|restart|exec) ;;
  down)
    for argument in "$@"; do
      if [[ "$argument" == --volumes || "$argument" == --volumes=* || "$argument" == -v || "$argument" == -v=* ]]; then
        printf '%s\n' 'Refusing to delete the persistent MongoDB volume.' >&2
        exit 1
      fi
    done
    ;;
  *)
    printf '%s\n' 'Allowed commands: validate, ps, logs, build, up, stop, start, restart, exec, down (preserves volumes).' >&2
    exit 2
    ;;
esac
exec docker compose "${compose_arguments[@]}" "$@"
IELTS_COMPOSE_WRAPPER
chmod --reference="$compose_wrapper" "$wrapper_stage"
wrapper_changed=true
mv -Tf -- "$wrapper_stage" "$compose_wrapper"
wrapper_stage=''
override_created=true
cat > "$private_dir/domain.compose.yaml" <<EOF
services:
  app:
    environment:
      APP_ORIGIN: https://$domain
    ports:
      - "127.0.0.1:$loopback_port:3001"
EOF
chmod 600 "$private_dir/domain.compose.yaml"
bash "$compose_wrapper" validate || die 'Compose domain override không hợp lệ.'
verify_existing || die 'Hiện trạng project khác thay đổi; chưa chuyển APP_ORIGIN.'
# Recheck the selected port immediately before recreating just the app.
ss -H -lntu | awk -v ielts_port="$loopback_port" '$5 ~ (":"ielts_port"$"){busy=1} END{exit busy}' || die 'Cổng loopback vừa bị chiếm; không khởi động app.'
say "Đang đổi APP_ORIGIN và thêm cổng nội bộ 127.0.0.1:$loopback_port; chỉ tạo lại app IELTS."
app_changed=true
bash "$compose_wrapper" up -d --no-deps --no-build --wait --wait-timeout 180 app > "$audit_dir/app-origin.log" 2>&1 || die "App IELTS chưa healthy. Xem $audit_dir/app-origin.log"

# Verify the new publication is precisely loopback-only, never 0.0.0.0.
new_app_id="$(docker ps -q --no-trunc --filter "label=com.docker.compose.project=$project" --filter 'label=com.docker.compose.service=app')"
[[ "$new_app_id" =~ ^[a-f0-9]{64}$ ]] || die 'App mới không duy nhất.'
docker inspect --format '{{json .NetworkSettings.Ports}}' "$new_app_id" | python3 -c 'import json,sys; x=json.load(sys.stdin); p=x.get("3001/tcp"); assert p==[{"HostIp":"127.0.0.1","HostPort":sys.argv[1]}]' "$loopback_port" || die 'App không bind chính xác loopback; đang rollback.'
preserve_ip_endpoint || die 'Endpoint IP cũ chưa healthy sau chuyển APP_ORIGIN.'

curl_domain() {
  # System CA trust and exact SNI/hostname are required; never skip TLS checks.
  curl --silent --show-error --noproxy '*' --connect-timeout 10 --max-time 30 --resolve "$domain:443:127.0.0.1" "$@"
}
say 'Đang kiểm tra HTTPS tin cậy, MongoDB, dữ liệu, origin đăng ký và JavaScript giao diện.'
curl_domain --fail "https://$domain/api/health" -o "$audit_dir/health.json"
python3 - "$domain" "$state_dir/tls-current/fullchain.pem" <<'PYTLS' > "$audit_dir/presented-certificate.log" 2>&1 || die 'Nginx chưa phục vụ đúng chứng chỉ công khai vừa cấp.'
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
python3 - "$audit_dir/health.json" <<'PY' || die 'Health/counts không đúng.'
import json,sys
x=json.load(open(sys.argv[1])); assert x['status']=='ok' and x['database']=='mongodb' and x['demoEnabled'] is False
assert x['bank']=={'lessons':160,'mocks':24,'vocabulary':216,'placement':192}
PY
curl_domain --fail "https://$domain/api/auth/me" -o "$audit_dir/auth.json"
python3 - "$audit_dir/auth.json" <<'PY' || die 'Kiểm tra phiên đăng nhập không đúng.'
import json,sys
assert json.load(open(sys.argv[1]))['user'] is None
PY
status="$(curl_domain -X POST -H "Origin: https://$domain" -H 'Content-Type: application/json' --data '{}' "https://$domain/api/auth/register" -o "$audit_dir/register-valid-origin.json" -w '%{http_code}')"
[[ "$status" == 400 ]] || die 'Origin tên miền/validation đăng ký chưa đúng; không tạo tài khoản thử.'
status="$(curl_domain -X POST -H "Origin: https://$public_host:$public_port" -H 'Content-Type: application/json' --data '{}' "https://$domain/api/auth/register" -o "$audit_dir/register-wrong-origin.json" -w '%{http_code}')"
[[ "$status" == 403 ]] || die 'Origin cũ chưa bị từ chối; cần kiểm tra APP_ORIGIN.'
curl_domain --fail "https://$domain/" -o "$audit_dir/index.html"
asset="$(python3 - "$audit_dir/index.html" <<'PY'
import re,sys
x=re.search(r'<script[^>]+src="(/assets/[a-zA-Z0-9._-]+\.js)"',open(sys.argv[1]).read()); assert x
print(x.group(1))
PY
)" || die 'Giao diện thiếu JavaScript build.'
curl_domain --fail "https://$domain$asset" -D "$audit_dir/asset.headers" -o "$audit_dir/app.js"
awk 'tolower($0)~/^content-type:.*(javascript|ecmascript)/{ok=1}END{exit !ok}' "$audit_dir/asset.headers" || die 'JavaScript sai Content-Type.'
[[ $(wc -c < "$audit_dir/app.js") -gt 100 ]] || die 'JavaScript trống.'
redirect_status="$(curl --silent --show-error --noproxy '*' --connect-timeout 10 --max-time 30 --resolve "$domain:80:127.0.0.1" "http://$domain/ielts-check?x=1" -D "$audit_dir/redirect.headers" -o /dev/null -w '%{http_code}')"
[[ "$redirect_status" == 301 ]] && awk -v ielts_expected="https://$domain/ielts-check?x=1" 'tolower($1)=="location:" {sub(/\r$/, "",$2); if($2==ielts_expected)ok=1} END{exit !ok}' "$audit_dir/redirect.headers" || die 'HTTP redirect chưa đúng.'
verify_existing || die 'Container/Nginx master/file/cổng cũ thay đổi trong lúc chuyển tên miền.'
sha256sum "$site_file" > "$state_dir/site.sha256"
# The embedded renewal script is byte-for-byte deploy/domain-renew.sh.
cat > "$state_dir/renew.sh" <<'IELTS_RENEW_SCRIPT'
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
IELTS_RENEW_SCRIPT
chmod 700 "$state_dir/renew.sh"
: > "$state_dir/renewal.log"
chmod 600 "$state_dir/renewal.log"
printf '%s\n' healthy-on-server > "$state_dir/result"
flock -u 8
bash "$state_dir/renew.sh" "$domain" "$live_dir" > "$audit_dir/renew-first-check.log" 2>&1 || die "Kiểm tra tác vụ gia hạn riêng thất bại. Xem $audit_dir/renew-first-check.log"
flock -n 8 || die 'Không lấy lại được khóa cấu hình sau kiểm tra gia hạn.'
verify_existing || die 'Hiện trạng cũ thay đổi sau kiểm tra tác vụ gia hạn.'
# Spread this site's two daily checks deterministically; Certbot renews only
# when due, and helper reloads Nginx only when the served certificate changes.
cron_minute=$((16#${domain_hash:0:2} % 60))
cron_created=true
cat > "$cron_file" <<EOF
# websiteIeltsAi owner: $scope
SHELL=/bin/bash
PATH=/usr/sbin:/usr/bin:/sbin:/bin
$cron_minute 3,15 * * * root "$state_dir/renew.sh" "$domain" "$live_dir" >> "$state_dir/renewal.log" 2>&1
EOF
chmod 644 "$cron_file"
printf '%s\n' healthy-on-server > "$state_dir/result"
openssl x509 -in "$state_dir/tls-current/fullchain.pem" -noout -dates -fingerprint -sha256 > "$audit_dir/public-certificate.txt"
say 'HOÀN TẤT kiểm tra trên server: HTTPS hợp lệ, origin đúng, dữ liệu giữ nguyên.'
printf 'Website: https://%s\nThư mục ứng dụng: %s\nLog riêng: %s\n' "$domain" "$live_dir" "$audit_dir"
cat "$audit_dir/public-certificate.txt"
printf '%s\n' 'Các container khác/MongoDB/proxy, master Nginx, cấu hình cũ và cổng cũ đã được đối chiếu giữ nguyên.'
printf '%s\n' 'Đã thêm gia hạn tự động riêng 2 lần/ngày; không sửa Certbot/cron của website khác.'
printf '%s\n' 'Hãy đăng nhập lại tại tên miền mới. Chưa xác nhận truy cập từ Internet; mở URL trên trình duyệt để kiểm tra.'
