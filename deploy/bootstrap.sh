#!/usr/bin/env bash
# One-time, isolated VPS installation; never replaces an existing checkout.
set -Eeuo pipefail
umask 077

source_commit='382a5ef9633663720d7030b9a665948944e0d6b1'
archive_sha256='0608b89f261b0bf3650ad5474959f8641999db2518ab17abec32f99df3426d82'
archive_url="https://codeload.github.com/thaituegia/websiteIeltsAi/tar.gz/$source_commit"
public_ip="${1:-66.42.62.123}"
install_dir=''
services_started=false
baseline_ready=false

say() { printf '\n%s\n' "$*"; }
die() { printf '\nDỪNG: %s\n' "$*" >&2; exit 1; }

if (( $# > 1 )); then die 'Chỉ nhận một đối số: địa chỉ IPv4 của VPS.'; fi
if [[ ! "$public_ip" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]; then die 'Địa chỉ IPv4 không hợp lệ.'; fi
IFS=. read -r -a ip_parts <<< "$public_ip"
for part in "${ip_parts[@]}"; do
  (( 10#$part <= 255 )) || die 'Địa chỉ IPv4 không hợp lệ.'
done
(( EUID == 0 )) || die 'Hãy chạy lệnh này trong Console VPS bằng tài khoản root.'
for required in curl sha256sum tar mktemp date awk ss df free sort comm cmp openssl docker getconf wc; do
  command -v "$required" >/dev/null || die "VPS thiếu lệnh $required. Chưa cài hoặc sửa hệ thống."
done
docker info >/dev/null 2>&1 || die 'Docker chưa có hoặc chưa hoạt động. Không tự cài/restart Docker vì có thể ảnh hưởng project khác.'
docker compose version >/dev/null 2>&1 || die 'Thiếu Docker Compose v2. Không tự nâng cấp Docker.'
compose_up_help="$(docker compose up --help)" || die 'Không đọc được các tùy chọn Docker Compose. Chưa build.'
for compose_option in --wait --wait-timeout; do
  printf '%s\n' "$compose_up_help" | awk -v ielts_option="$compose_option" '$1 == ielts_option {found=1} END {exit !found}' || die "Docker Compose chưa hỗ trợ $compose_option. Không tự nâng cấp."
done
build_help="$(DOCKER_BUILDKIT=0 docker build --help 2>/dev/null)"
for flag in --memory --memory-swap --cpu-period --cpu-quota; do
  [[ "$build_help" == *"$flag "* ]] || die "Docker không hỗ trợ giới hạn build $flag. Dừng thay vì build không giới hạn."
done
# Go-template field names use the CPU acronym; the JSON keys use Cpu.
limits="$(docker info --format '{{.MemoryLimit}} {{.CPUCfsQuota}} {{.CPUCfsPeriod}} {{.SwapLimit}}')" || die 'Không đọc được khả năng giới hạn tài nguyên từ Docker. Chưa build.'
[[ "$limits" == 'true true true true' ]] || die 'Docker/kernel chưa hỗ trợ đủ giới hạn RAM, swap và CPU. Chưa build.'
[[ -d /opt && ! -L /opt ]] || die '/opt phải là thư mục thật, không phải symlink.'
available_kib="$(awk '/^MemAvailable:/ {print $2}' /proc/meminfo)"
[[ "$available_kib" =~ ^[0-9]+$ ]] && (( available_kib >= 2 * 1024 * 1024 )) || die 'Cần ít nhất 2 GiB RAM khả dụng để giữ khoảng trống cho project cũ. Chưa build.'
build_memory=1536m
runtime_memory=768m
if (( available_kib < 3 * 1024 * 1024 )); then
  build_memory=1024m
  runtime_memory=512m
fi
disk_kib="$(df -Pk /opt | awk 'NR==2 {print $4}')"
[[ "$disk_kib" =~ ^[0-9]+$ ]] && (( disk_kib >= 8 * 1024 * 1024 )) || die 'Cần ít nhất 8 GiB trống tại /opt. Chưa tải hoặc build.'
docker_root="$(docker info --format '{{.DockerRootDir}}')"
disk_kib="$(df -Pk "$docker_root" | awk 'NR==2 {print $4}')"
[[ "$disk_kib" =~ ^[0-9]+$ ]] && (( disk_kib >= 8 * 1024 * 1024 )) || die 'Kho Docker cần ít nhất 8 GiB trống. Chưa tải hoặc build.'
host_cpu_count="$(getconf _NPROCESSORS_ONLN)"
host_load_average="$(awk '{print $1}' /proc/loadavg)"
[[ "$host_cpu_count" =~ ^[1-9][0-9]*$ && "$host_load_average" =~ ^[0-9]+([.][0-9]+)?$ ]] || die 'Không đọc được tải CPU của server. Chưa build.'
# Names must not collide with awk keywords such as GNU awk's `load`.
load_state="$(awk -v ielts_load_average="$host_load_average" -v ielts_cpu_count="$host_cpu_count" 'BEGIN {print (ielts_load_average < ielts_cpu_count * 0.8 ? "ready" : "busy")}')" || die 'Không kiểm tra được tải CPU. Chưa build.'
case "$load_state" in
  ready) ;;
  busy) die 'Server đang bận (load cao). Dừng để tránh làm chậm project cũ; thử lại lúc ít tải.' ;;
  *) die 'Kết quả kiểm tra tải CPU không hợp lệ. Chưa build.' ;;
esac

say 'Đang lưu hiện trạng và kiểm tra tài nguyên; chưa thay đổi các project đang chạy.'
install_dir="$(mktemp -d "/opt/websiteIeltsAi-$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")"
audit_dir="$install_dir/.local/installer"
# .local is excluded by the pinned Dockerfile's build context; archives/logs
# and future runtime secrets must never enter the application image.
mkdir -p -m 700 "$audit_dir"
project="website-ielts-ai-$(date -u +%Y%m%d%H%M%S)-${install_dir##*-}"
project="${project,,}"
docker ps -q --no-trunc | sort > "$audit_dir/before.ids"
snapshot_containers() {
  local id
  while IFS= read -r id; do
    [[ -n "$id" ]] || continue
    docker inspect --format '{{.Id}} {{.State.Running}} {{.State.StartedAt}}' "$id" || return 1
  done < "$audit_dir/before.ids"
}
snapshot_listeners() { ss -H -lntu | awk '{print $1 " " $5}' | sort -u; }
snapshot_containers > "$audit_dir/before.containers"
snapshot_listeners > "$audit_dir/before.listeners"
docker ps --format '{{.ID}} {{.Names}} {{.Image}} {{.Status}} {{.Ports}}' > "$audit_dir/before.projects"
docker stats --no-stream --format '{{.Name}} {{.CPUPerc}} {{.MemUsage}}' > "$audit_dir/before.resources"
free -h > "$audit_dir/before.memory"
df -h /opt "$docker_root" > "$audit_dir/before.disk"
baseline_ready=true

verify_existing() {
  snapshot_containers > "$audit_dir/after.containers" || return 1
  snapshot_listeners > "$audit_dir/after.listeners" || return 1
  cmp -s "$audit_dir/before.containers" "$audit_dir/after.containers" || return 1
  comm -23 "$audit_dir/before.listeners" "$audit_dir/after.listeners" > "$audit_dir/missing.listeners" || return 1
  [[ ! -s "$audit_dir/missing.listeners" ]]
}
on_exit() {
  local code=$?
  trap - EXIT
  if (( code != 0 )); then
    if [[ "$services_started" == true ]]; then
      printf '%s\n' 'Có lỗi; chỉ dừng container thuộc website IELTS vừa tạo, giữ nguyên dữ liệu.' >&2
      bash "$install_dir/deploy/compose.sh" stop >/dev/null 2>&1 || true
    fi
    if [[ "$baseline_ready" == true ]]; then
      if verify_existing; then
        printf '%s\n' 'Container cũ và các cổng đang nghe trước đó vẫn giữ nguyên.' >&2
      else
        printf '%s\n' 'Hiện trạng project cũ đã thay đổi trong lúc chạy; script không sửa/khởi động lại chúng. Cần kiểm tra hồ sơ riêng.' >&2
      fi
    fi
    printf 'Chưa xác nhận triển khai thành công. Giữ file và log tại: %s\n' "$install_dir" >&2
  fi
  exit "$code"
}
trap on_exit EXIT

say 'Đang tải phiên bản đã kiểm tra và xác minh SHA256 trước khi giải nén.'
curl --fail --show-error --silent --location --proto '=https' --proto-redir '=https' --connect-timeout 20 --max-time 300 --retry 2 "$archive_url" -o "$audit_dir/source.tar.gz"
printf '%s  %s\n' "$archive_sha256" "$audit_dir/source.tar.gz" | sha256sum --check --status || die 'Checksum mã nguồn không khớp; không giải nén hoặc chạy.'
tar -xzf "$audit_dir/source.tar.gz" -C "$install_dir" --strip-components=1 --no-same-owner
printf '%s\n' "$source_commit" > "$audit_dir/source.commit"
cd -- "$install_dir"
port="$(bash deploy/select-port.sh 8088 8188)"
bash deploy/preflight.sh "$port" "$project" > "$audit_dir/preflight.before-build.log" 2>&1 || die "Preflight không đạt. Xem $audit_dir/preflight.before-build.log"
bash deploy/init.sh "$public_ip" "$port" "$project" --self-signed > "$audit_dir/init.log" 2>&1
awk -v memory="$runtime_memory" '/^IELTS_(APP|MONGO)_MEMORY=/ {sub(/=.*/, "=" memory)} {print}' .local/deploy/deploy.env > .local/deploy/deploy.env.new
mv -- .local/deploy/deploy.env.new .local/deploy/deploy.env
bash deploy/compose.sh validate
say "Đã chọn cổng trống $port. Build riêng, tối đa $build_memory RAM và 0,5 CPU; có thể mất vài phút."
# The validated Dockerfile has no BuildKit-only syntax. Legacy build enforces
# CPU/memory limits per build container; never silently falls back to no limits.
DOCKER_BUILDKIT=0 docker build --pull --memory="$build_memory" --memory-swap="$build_memory" --cpu-period=100000 --cpu-quota=50000 --cpu-shares=128 --tag "$project-app" . > "$audit_dir/build.log" 2>&1 || die "Build không đạt. Xem $audit_dir/build.log"
verify_existing || die 'Hiện trạng project cũ đã thay đổi trong lúc build; không khởi chạy website mới.'
bash deploy/preflight.sh "$port" "$project" > "$audit_dir/preflight.before-up.log" 2>&1 || die 'Cổng hoặc tên project vừa bị chiếm; không khởi chạy.'
say 'Đang khởi động MongoDB, ứng dụng và HTTPS của riêng website IELTS.'
services_started=true
bash deploy/compose.sh up -d --no-build --wait --wait-timeout 300 > "$audit_dir/up.log" 2>&1 || die "Container chưa healthy. Xem $audit_dir/up.log"

site_url="https://$public_ip:$port"
curl_site() {
  # This request is resolved to this VPS's loopback, even with a proxy set.
  curl --silent --show-error --connect-timeout 10 --max-time 30 --noproxy "$public_ip,127.0.0.1,localhost" --cacert .local/deploy/tls/site.crt --resolve "$public_ip:$port:127.0.0.1" "$@"
}
say 'Đang kiểm tra HTTPS, MongoDB, dữ liệu, đăng nhập và file giao diện.'
curl_site --fail "$site_url/api/health" -o "$audit_dir/health.json"
bash deploy/compose.sh exec -T app node -e 'const x=JSON.parse(require("fs").readFileSync(0,"utf8"));if(x.status!=="ok"||x.database!=="mongodb"||x.demoEnabled!==false||x.bank.lessons!==160||x.bank.mocks!==24||x.bank.vocabulary!==216||x.bank.placement!==192)process.exit(1)' < "$audit_dir/health.json" || die 'Health hoặc số lượng dữ liệu không đúng.'
curl_site --fail "$site_url/api/auth/me" -o "$audit_dir/auth.json"
bash deploy/compose.sh exec -T app node -e 'const x=JSON.parse(require("fs").readFileSync(0,"utf8"));if(x.user!==null)process.exit(1)' < "$audit_dir/auth.json" || die 'Kiểm tra phiên đăng nhập không đạt.'
status="$(curl_site -X POST -H "Origin: $site_url" -H 'Content-Type: application/json' --data '{}' "$site_url/api/auth/register" -o "$audit_dir/invalid-registration.json" -w '%{http_code}')"
[[ "$status" == 400 ]] || die 'Kiểm tra validation đăng ký không đạt; không tạo tài khoản thử.'
curl_site --fail "$site_url/" -o "$audit_dir/index.html"
asset="$(bash deploy/compose.sh exec -T app node -e 'const s=require("fs").readFileSync(0,"utf8");const m=s.match(/<script[^>]+src="(\/assets\/[a-zA-Z0-9._-]+\.js)"/);if(!m)process.exit(1);console.log(m[1])' < "$audit_dir/index.html")" || die 'Giao diện thiếu JavaScript build.'
curl_site --fail "$site_url$asset" -D "$audit_dir/asset.headers" -o "$audit_dir/app.js"
awk 'tolower($0) ~ /^content-type:.*(javascript|ecmascript)/ {ok=1} END {exit !ok}' "$audit_dir/asset.headers" || die 'File JavaScript trả sai loại nội dung.'
[[ $(wc -c < "$audit_dir/app.js") -gt 100 ]] || die 'File JavaScript trống.'
verify_existing || die 'Container/cổng của project cũ đã thay đổi. Dừng website mới để kiểm tra.'
openssl x509 -in .local/deploy/tls/site.crt -noout -fingerprint -sha256 > "$audit_dir/tls.fingerprint"
bash deploy/compose.sh ps > "$audit_dir/services.log"
printf '%s\n' "$site_url" > "$audit_dir/website.url"
if command -v ufw >/dev/null 2>&1 && LC_ALL=C ufw status | awk '/^Status: active$/ {active=1} END {exit !active}'; then
  LC_ALL=C ufw status verbose > "$audit_dir/firewall.before"
  if ufw allow "$port/tcp" comment "websiteIeltsAi:$project" > "$audit_dir/firewall.rule.log" 2>&1; then
    printf 'Đã cho phép riêng cổng TCP %s trong UFW; không tắt/reset firewall hoặc sửa rule project khác.\n' "$port"
  else
    printf 'Không thêm được rule UFW. Website đã chạy nội bộ; cần kiểm tra riêng cổng TCP %s trước khi truy cập Internet.\n' "$port"
  fi
else
  printf 'Không sửa firewall khác. Nếu chưa mở được website, cần kiểm tra riêng cổng TCP %s tại firewall/security group VPS.\n' "$port"
fi
printf '%s\n' 'healthy-on-server' > "$audit_dir/result"
services_started=false
say 'HOÀN TẤT kiểm tra trên server. Các container cũ không đổi và cổng cũ vẫn đang nghe.'
printf 'Website: %s\nThư mục: %s\n' "$site_url" "$install_dir"
printf '%s\n' 'Chưa có domain nên HTTPS dùng chứng chỉ tự ký; trình duyệt sẽ hiện cảnh báo chứng chỉ.'
printf '%s\n' 'Đăng ký tài khoản trên giao diện; tối đa 2 tài khoản. Chấm AI trực tiếp cần API key thật, hiện để trống.'
printf '%s\n' 'Đã kiểm tra qua HTTPS tại server; chưa xác nhận truy cập từ Internet.'
printf 'Nếu cần dừng riêng website: cd %q && bash deploy/compose.sh stop\n' "$install_dir"
