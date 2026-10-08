#!/usr/bin/env bash
# Scoped in-place application update. Never replaces MongoDB, proxy, gateway,
# certificates, firewall rules or learner collections on a shared VPS.
set -Eeuo pipefail
umask 077
say() { printf '\n%s\n' "$*"; }
die() { printf '\nDỪNG: %s\n' "$*" >&2; exit 1; }
usage() { printf '%s\n' 'Usage: bash update.sh LIVE_DIR SOURCE_COMMIT ARCHIVE_SHA256 [--check]' >&2; exit 2; }
(( $# == 3 || $# == 4 )) || usage
live_dir="$1"; source_commit="$2"; archive_sha256="$3"
[[ $# == 3 || "$4" == --check ]] || usage
[[ "$source_commit" =~ ^[a-f0-9]{40}$ && "$archive_sha256" =~ ^[a-f0-9]{64}$ ]] || usage
[[ "$live_dir" =~ ^/[A-Za-z0-9._/-]+$ && -d "$live_dir" && ! -L "$live_dir" ]] || usage
(( EUID == 0 )) || die 'Chạy trong phiên SSH VPS bằng root; không chạy trên PC.'
for required in docker python3 curl sha256sum awk readlink stat mktemp date sort comm cmp ss df getconf systemctl nginx flock cp chmod mkdir mv rm wc; do
  command -v "$required" >/dev/null || die "Thiếu $required; không tự cài hoặc nâng cấp hệ thống."
done
[[ "$(readlink -e -- "$live_dir")" == "$live_dir" && "$(stat -c '%u' "$live_dir")" == 0 ]] || die 'Thư mục live phải là đường dẫn thật do root sở hữu.'
private_dir="$live_dir/.local/deploy"
[[ "$(readlink -e -- "$private_dir")" == "$private_dir" && "$(stat -c '%u' "$private_dir")" == 0 ]] || die 'Thư mục private deploy bị thiếu hoặc chuyển hướng.'
config_file="$private_dir/deploy.env"; compose_file="$live_dir/deploy/compose.yaml"
compose_wrapper="$live_dir/deploy/compose.sh"; domain_override="$private_dir/domain.compose.yaml"
release_override="$private_dir/release.compose.yaml"
for file in "$config_file" "$compose_file" "$compose_wrapper" "$domain_override" "$private_dir/app.env" "$live_dir/deploy/nginx.conf" "$private_dir/tls/site.crt"; do
  [[ -f "$file" && ! -L "$file" && "$(readlink -e -- "$file")" == "$file" && "$(stat -c '%u' "$file")" == 0 ]] || die 'Thiếu file triển khai thật/root-owned, hoặc có symlink không được phép.'
done
[[ "$(readlink -e -- "$private_dir/tls")" == "$private_dir/tls" ]] || die 'TLS upstream bị chuyển hướng.'
if [[ -e "$release_override" || -L "$release_override" ]]; then
  [[ -f "$release_override" && ! -L "$release_override" && "$(stat -c '%u' "$release_override")" == 0 ]] || die 'Release override không phải file thật do root sở hữu.'
fi
read_setting() { awk -F= -v ielts_key="$1" '$1==ielts_key{n++;value=substr($0,index($0,"=")+1);sub(/\r$/,"",value)}END{if(n!=1)exit 1;print value}' "$config_file"; }
project="$(read_setting IELTS_COMPOSE_PROJECT)" || die 'Compose project thiếu hoặc bị lặp.'
public_host="$(read_setting IELTS_PUBLIC_HOST)" || die 'Thiếu địa chỉ IP đã triển khai.'
public_port="$(read_setting IELTS_PUBLIC_PORT)" || die 'Thiếu cổng HTTPS IP.'
[[ "$project" =~ ^website-ielts-ai-[a-z0-9][a-z0-9_-]{0,47}$ && "$public_host" == 66.42.62.123 && "$public_port" == 8088 ]] || die 'Metadata không khớp website IELTS đã triển khai; không ghi đè project khác.'
domain='sutonghanyu.vn'; origin="https://$domain"; loopback_port=19088
base_args=(--project-name "$project" --env-file "$config_file" -f "$compose_file" -f "$domain_override")
old_args=("${base_args[@]}")
if [[ -f "$release_override" ]]; then old_args+=(-f "$release_override"); fi
current_args=("${old_args[@]}")
private_mode="$(stat -c '%a' "$private_dir")"
[[ "$private_mode" =~ ^[0-7]{3,4}$ ]] && (( (8#$private_mode & 0077) == 0 )) || die 'Thư mục private deploy cần chặn truy cập của group/other.'
docker info >/dev/null 2>&1 || die 'Docker chưa hoạt động; không restart Docker.'
docker compose version >/dev/null 2>&1 || die 'Thiếu Compose v2; không nâng cấp dùng chung.'
docker compose "${old_args[@]}" config --quiet || die 'Compose hiện tại không hợp lệ.'
old_source_dir="$(docker compose "${old_args[@]}" config --format json | python3 -c 'import json,sys;x=json.load(sys.stdin);print(x["services"]["app"]["build"]["context"])')" || die 'Không đọc được build context cũ.'
[[ "$old_source_dir" =~ ^/[A-Za-z0-9._/-]+$ && "$(readlink -e -- "$old_source_dir")" == "$old_source_dir" && "$(stat -c '%u' "$old_source_dir")" == 0 ]] || die 'Build context cũ không phải đường dẫn thật/root-owned.'
[[ "$old_source_dir" == "$live_dir" || "$old_source_dir" == "$live_dir/.local/releases/"* ]] || die 'Build context cũ nằm ngoài source của project này.'
if [[ -f "$release_override" ]]; then
  python3 - "$project" "$config_file" "$compose_file" "$domain_override" "$release_override" <<'PYRELEASE' || die 'Release cũ chứa thay đổi ngoài image/build context app; cần kiểm tra riêng.'
import json,subprocess,sys
project,env,base,domain,release=sys.argv[1:]
args=['docker','compose','--project-name',project,'--env-file',env,'-f',base,'-f',domain]
def read(extra):
 x=subprocess.run(args+extra+['config','--format','json'],capture_output=True,text=True,timeout=30);assert x.returncode==0;return json.loads(x.stdout)
a,b=read([]),read(['-f',release])
for data in (a,b):
 app=data['services']['app'];app.pop('image',None);app['build'].pop('context',None)
assert a==b
PYRELEASE
fi
up_help="$(docker compose up --help)"
for option in --wait --wait-timeout; do
  printf '%s\n' "$up_help" | awk -v ielts_option="$option" '$1==ielts_option{ok=1}END{exit !ok}' || die "Compose thiếu $option."
done
build_help="$(DOCKER_BUILDKIT=0 docker build --help 2>/dev/null)"
for option in --memory --memory-swap --cpu-period --cpu-quota; do
  [[ "$build_help" == *"$option "* ]] || die "Docker không hỗ trợ giới hạn build $option."
done
[[ "$(docker info --format '{{.MemoryLimit}} {{.CPUCfsQuota}} {{.CPUCfsPeriod}} {{.SwapLimit}}')" == 'true true true true' ]] || die 'Kernel/Docker thiếu giới hạn RAM/CPU/swap; không build không giới hạn.'
available_kib="$(awk '/^MemAvailable:/{print $2}' /proc/meminfo)"
[[ "$available_kib" =~ ^[0-9]+$ ]] && (( available_kib >= 2 * 1024 * 1024 )) || die 'Cần ít nhất 2 GiB RAM khả dụng để bảo vệ các project khác.'
docker_root="$(docker info --format '{{.DockerRootDir}}')"
for disk_path in "$live_dir" "$docker_root"; do
  disk_kib="$(df -Pk "$disk_path" | awk 'NR==2{print $4}')"
  [[ "$disk_kib" =~ ^[0-9]+$ ]] && (( disk_kib >= 8 * 1024 * 1024 )) || die 'Cần ít nhất 8 GiB trống tại nguồn và kho Docker.'
done
cpu_count="$(getconf _NPROCESSORS_ONLN)"; cpu_load="$(awk '{print $1}' /proc/loadavg)"
[[ "$cpu_count" =~ ^[1-9][0-9]*$ && "$cpu_load" =~ ^[0-9]+([.][0-9]+)?$ ]] || die 'Không đọc được tải CPU.'
[[ "$(awk -v ielts_load_average="$cpu_load" -v ielts_cpu_count="$cpu_count" 'BEGIN{print(ielts_load_average<ielts_cpu_count*0.8?"ready":"busy")}')" == ready ]] || die 'Server đang bận; chưa build hoặc dừng app.'
nginx_pid="$(systemctl show nginx.service --property=MainPID --value)"
[[ "$nginx_pid" =~ ^[1-9][0-9]*$ && "$(systemctl is-active nginx.service)" == active ]] || die 'Host gateway chưa hoạt động; không sửa hoặc restart.'
nginx -t >/dev/null 2>&1 || die 'Nginx hiện tại không qua kiểm tra; chưa thay đổi app.'
service_id() { docker ps -q --no-trunc --filter "label=com.docker.compose.project=$project" --filter "label=com.docker.compose.service=$1"; }
old_app_id="$(service_id app)"; mongo_id="$(service_id mongo)"; proxy_id="$(service_id proxy)"
for id in "$old_app_id" "$mongo_id" "$proxy_id"; do [[ "$id" =~ ^[a-f0-9]{64}$ ]] || die 'Cần đúng một app, MongoDB và proxy của project đang chạy.'; done
old_image="$(docker inspect --format '{{.Image}}' "$old_app_id")"
old_image_ref="$(docker inspect --format '{{.Config.Image}}' "$old_app_id")"
[[ "$old_image" =~ ^sha256:[a-f0-9]{64}$ && "$(docker image inspect --format '{{.Id}}' "$old_image_ref")" == "$old_image" ]] || die 'Tag image hiện tại không khớp app đang chạy.'
current_origin="$(docker inspect --format '{{range .Config.Env}}{{if eq (index (split . "=") 0) "APP_ORIGIN"}}{{println (index (split . "=") 1)}}{{end}}{{end}}' "$old_app_id")"
[[ "$current_origin" == "$origin" ]] || die 'APP_ORIGIN không khớp tên miền đã được cấu hình.'
docker inspect "$old_app_id" "$mongo_id" "$proxy_id" | python3 -c 'import json,sys; rows=json.load(sys.stdin); project,live,port=sys.argv[1:]; assert len(rows)==3; names=set()
for row in rows:
 labels=row["Config"]["Labels"]; assert labels.get("com.docker.compose.project")==project; names.add(labels.get("com.docker.compose.service")); assert labels.get("com.docker.compose.project.working_dir")==live+"/deploy"; assert row["State"]["Running"]
 if labels.get("com.docker.compose.service")=="app": assert row["NetworkSettings"]["Ports"].get("3001/tcp")==[{"HostIp":"127.0.0.1","HostPort":port}]
assert names=={"app","mongo","proxy"}' "$project" "$live_dir" "$loopback_port" || die 'Labels/cổng của container không thuộc chính xác triển khai IELTS.'
for parent in "$private_dir/updates" "$live_dir/.local/releases"; do
  if [[ -e "$parent" || -L "$parent" ]]; then [[ -d "$parent" && ! -L "$parent" && "$(readlink -e "$parent")" == "$parent" && "$(stat -c '%u' "$parent")" == 0 ]] || die 'Thư mục update/release bị chuyển hướng.'; fi
done
curl_domain() { curl --silent --show-error --noproxy '*' --connect-timeout 10 --max-time 30 --resolve "$domain:443:127.0.0.1" "$@"; }
curl_domain --fail "$origin/api/health" | python3 -c 'import json,sys;x=json.load(sys.stdin);assert x["status"]=="ok" and x["database"]=="mongodb" and x["demoEnabled"] is False' || die 'Website hiện tại chưa healthy qua HTTPS hợp lệ.'
if (( $# == 4 )); then say 'Preflight đạt; --check không tải/build/dừng/thay đổi ứng dụng hoặc dữ liệu.'; exit 0; fi

# No mutation occurs above this line. Lock only this deployment, never Docker.
[[ ! -L "$private_dir/update.lock" ]] || die 'Lock bị chuyển hướng.'
exec 9>"$private_dir/update.lock"
flock -n 9 || die 'Project này đang có một lượt cập nhật khác.'
mkdir -p -m 700 "$private_dir/updates" "$live_dir/.local/releases"
audit_dir="$(mktemp -d "$private_dir/updates/${source_commit:0:12}-$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")"
release_dir="$(mktemp -d "$live_dir/.local/releases/${source_commit:0:12}-XXXXXX")"
source_dir="$release_dir/source"; mkdir -m 700 "$source_dir"
nonce="${release_dir##*-}"; nonce="${nonce,,}"
new_image="$project-app:release-${source_commit:0:12}-$nonce"
rollback_tag="$project-app:rollback-${source_commit:0:12}-$nonce"
if docker image inspect "$new_image" >/dev/null 2>&1 || docker image inspect "$rollback_tag" >/dev/null 2>&1; then die 'Tên image riêng đã tồn tại; chưa build.'; fi
app_stopped=false; new_app_started=false; baseline_ready=false; rollback_allowed=false
had_release=false
snapshot_containers() {
  local id
  while IFS= read -r id; do [[ -z "$id" ]] || docker inspect --format '{{.Id}} {{.State.Running}} {{.State.StartedAt}}' "$id" || return 1; done < "$audit_dir/before.ids"
}
snapshot_listeners() { ss -H -lntu | awk '{print $1" "$5}' | sort -u; }
protected_files=("$config_file" "$compose_file" "$domain_override" "$private_dir/app.env" "$live_dir/deploy/nginx.conf" "$private_dir/tls/site.crt")
verify_existing() {
  snapshot_containers > "$audit_dir/after.containers" || return 1
  cmp -s "$audit_dir/before.containers" "$audit_dir/after.containers" || return 1
  snapshot_listeners > "$audit_dir/after.listeners" || return 1
  comm -23 "$audit_dir/before.listeners" "$audit_dir/after.listeners" > "$audit_dir/missing.listeners" || return 1
  [[ ! -s "$audit_dir/missing.listeners" ]] || return 1
  [[ "$(systemctl show nginx.service --property=MainPID --value)" == "$nginx_pid" && "$(systemctl is-active nginx.service)" == active ]] || return 1
  sha256sum --check --status "$audit_dir/protected.sha256" || return 1
  python3 - "$audit_dir/nginx-files.json" <<'PYVERIFY' || return 1
import hashlib,json,os,sys
for path,old in json.load(open(sys.argv[1])).items():
 st=os.stat(path); now={'real':os.path.realpath(path),'sha':hashlib.sha256(open(path,'rb').read()).hexdigest(),'mode':st.st_mode,'uid':st.st_uid,'gid':st.st_gid}; assert now==old
PYVERIFY
}
mongo_exec() { docker exec -i "$mongo_id" mongosh --quiet --norc mongodb://127.0.0.1:27017/ielts_ai --eval "$1"; }
preserve_ip_endpoint() {
  if curl --fail --silent --show-error --noproxy '*' --connect-timeout 5 --max-time 15 --cacert "$private_dir/tls/site.crt" --resolve "$public_host:$public_port:127.0.0.1" "https://$public_host:$public_port/api/health" -o "$audit_dir/ip-health.json" 2>/dev/null; then return 0; fi
  # Re-resolve only this project's upstream after app recreation. No host reload.
  docker compose "${current_args[@]}" exec -T proxy nginx -t > "$audit_dir/ip-proxy.log" 2>&1 || return 1
  docker compose "${current_args[@]}" exec -T proxy nginx -s reload >> "$audit_dir/ip-proxy.log" 2>&1 || return 1
  curl --fail --silent --show-error --noproxy '*' --connect-timeout 5 --max-time 30 --cacert "$private_dir/tls/site.crt" --resolve "$public_host:$public_port:127.0.0.1" "https://$public_host:$public_port/api/health" -o "$audit_dir/ip-health.json" 2>/dev/null
}
restore_config() {
  # The domain-install wrapper predates release overrides. Keep the compatible
  # new wrapper so later compose commands continue to use the pinned OLD image.
  # The exact previous wrapper/release bytes remain in the private audit folder.
  cp -p -- "$source_dir/deploy/compose.sh" "$compose_wrapper" || return 1
  cat > "$audit_dir/release.compose.rollback" <<EOROLLBACK
services:
  app:
    image: $rollback_tag
    build:
      context: $old_source_dir
      dockerfile: Dockerfile
EOROLLBACK
  chmod 600 "$audit_dir/release.compose.rollback" || return 1
  cp -p -- "$audit_dir/release.compose.rollback" "$release_override" || return 1
  current_args=("${base_args[@]}" -f "$release_override")
}
rollback_public() {
  # The new app is stopped first. Restore only public seeded additions, only
  # when old documents are identical and no learner record references new IDs.
  python3 - "$audit_dir/public.before.ejson" "$audit_dir/seed-manifest.json" "$audit_dir/rollback-input.json" <<'PYINPUT' || return 1
import json,sys
before,manifest,out=sys.argv[1:]
json.dump({'before':json.load(open(before)),'manifest':json.load(open(manifest))},open(out,'w'))
PYINPUT
  mongo_exec '/* UPDATE_ROLLBACK_GUARD_BEGIN */
const fs=require("fs"); const input=EJSON.parse(fs.readFileSync(0,"utf8"));
const canonical=(value)=>{const plain=EJSON.serialize(value,{relaxed:true});const order=v=>Array.isArray(v)?v.map(order):v&&typeof v==="object"?Object.fromEntries(Object.keys(v).sort().map(k=>[k,order(v[k])])):v;return JSON.stringify(order(plain));};
const added={};const oldIds=Object.fromEntries(Object.entries(input.before).map(([name,rows])=>[name,rows.map(d=>d._id)]));
for(const name of ["content","vocabulary","placementItems"]){
 const old=new Map(input.before[name].map(d=>[String(d._id),d]));const expected=new Map(input.manifest[name].map(d=>[String(d._id),d]));const now=db.getCollection(name).find().toArray();const current=new Map(now.map(d=>[String(d._id),d]));
 for(const [id,doc] of old){if(!current.has(id)||canonical(doc)!==canonical(current.get(id)))throw new Error("Pre-existing public document changed; automatic rollback blocked");}
 added[name]=[];
 for(const doc of now){const id=String(doc._id);if(old.has(id))continue;if(!expected.has(id)||canonical(doc)!==canonical(expected.get(id)))throw new Error("Unknown or modified new public document; automatic rollback blocked");added[name].push(doc._id);}
}
if(db.attempts.countDocuments({contentId:{$nin:oldIds.content,$ne:null}})||db.cards.countDocuments({vocabularyId:{$nin:oldIds.vocabulary,$ne:null}})||db.placements.countDocuments({$or:[{currentQuestionId:{$nin:oldIds.placementItems,$ne:null}},{answers:{$elemMatch:{questionId:{$nin:oldIds.placementItems,$ne:null}}}}]})||db.plans.countDocuments({tasks:{$elemMatch:{contentId:{$nin:oldIds.content,$ne:null}}}}))throw new Error("Learner record references new or missing material; automatic rollback blocked");
// Audio and recording records reference attempts, already covered above.
for(const name of ["content","vocabulary","placementItems"]){if(added[name].length)db.getCollection(name).deleteMany({_id:{$in:added[name]}});}
print("Guarded rollback removed only verified public additions; learner collections untouched.");
/* UPDATE_ROLLBACK_GUARD_END */' < "$audit_dir/rollback-input.json" > "$audit_dir/rollback-data.log" 2>&1
}
on_exit() {
  local code=$?; trap - EXIT; set +e
  if (( code != 0 )); then
    if [[ "$app_stopped" == true ]]; then
      local stopped_ok=false data_ok=false
      if docker compose "${current_args[@]}" stop --timeout 30 app > "$audit_dir/rollback-stop.log" 2>&1; then stopped_ok=true; fi
      if [[ "$stopped_ok" == true ]]; then
        if [[ "$new_app_started" == false ]] || rollback_public; then data_ok=true; fi
      fi
      if [[ "$data_ok" == true && "$(docker image inspect --format '{{.Id}}' "$rollback_tag")" == "$old_image" ]] && restore_config; then
        docker compose "${current_args[@]}" up -d --no-deps --no-build --wait --wait-timeout 240 app > "$audit_dir/rollback-app.log" 2>&1
        if [[ $? == 0 && "$(docker inspect --format '{{.Image}}' "$(service_id app)")" == "$old_image" ]] && preserve_ip_endpoint && verify_existing; then
          rollback_allowed=true
          printf '%s\n' 'Đã khôi phục app cũ và chỉ loại bỏ học liệu mới đã xác minh; tài khoản/tiến độ/ghi âm giữ nguyên.' >&2
        fi
      fi
      if [[ "$rollback_allowed" != true ]]; then
        # Keep public data and learner references. Restore new configuration so
        # data requiring the new client is not served by an incompatible image.
        cp -p -- "$source_dir/deploy/compose.sh" "$compose_wrapper"
        cp -p -- "$audit_dir/release.compose.new" "$release_override"
        current_args=("${base_args[@]}" -f "$release_override")
        docker compose "${current_args[@]}" up -d --no-deps --no-build --wait --wait-timeout 240 app > "$audit_dir/recovery-new-app.log" 2>&1
        preserve_ip_endpoint >> "$audit_dir/recovery-new-app.log" 2>&1
        printf '%s\n' 'Không rollback tự động: dữ liệu đã đổi/có tham chiếu mới hoặc khôi phục chưa đạt. Giữ bản mới và mọi dữ liệu; cần đọc log riêng để xử lý.' >&2
      fi
    fi
    if [[ "$baseline_ready" == true ]] && verify_existing; then printf '%s\n' 'Container khác/MongoDB/proxy, cổng cũ và cấu hình host Nginx vẫn giữ nguyên.' >&2; fi
    printf 'Cập nhật chưa được xác nhận. Log riêng: %s\n' "$audit_dir" >&2
  fi
  exit "$code"
}
trap on_exit EXIT

docker ps -q --no-trunc | awk -v ielts_app="$old_app_id" '$0!=ielts_app' | sort > "$audit_dir/before.ids"
snapshot_containers > "$audit_dir/before.containers"
snapshot_listeners > "$audit_dir/before.listeners"
sha256sum "${protected_files[@]}" > "$audit_dir/protected.sha256"
python3 - "$audit_dir/nginx-files.json" <<'PYNGINX'
import hashlib,json,os,re,subprocess,sys
x=subprocess.run(['nginx','-T'],capture_output=True,text=True,timeout=30);assert x.returncode==0;assert len(x.stdout)<10_000_000
paths=re.findall(r'(?m)^# configuration file (.+):\s*$',x.stdout);assert paths
result={}
for path in paths:
 st=os.stat(path);result[path]={'real':os.path.realpath(path),'sha':hashlib.sha256(open(path,'rb').read()).hexdigest(),'mode':st.st_mode,'uid':st.st_uid,'gid':st.st_gid}
json.dump(result,open(sys.argv[1],'w'),sort_keys=True)
PYNGINX
baseline_ready=true
say 'Đang tải đúng commit và kiểm SHA256; app hiện tại vẫn chạy.'
curl --fail --show-error --silent --location --proto '=https' --proto-redir '=https' --connect-timeout 20 --max-time 300 --retry 2 "https://codeload.github.com/thaituegia/websiteIeltsAi/tar.gz/$source_commit" -o "$audit_dir/source.tar.gz"
printf '%s  %s\n' "$archive_sha256" "$audit_dir/source.tar.gz" | sha256sum --check --status || die 'Checksum archive không khớp; chưa giải nén hoặc build.'
python3 - "$audit_dir/source.tar.gz" "$source_dir" "$source_commit" <<'PYEXTRACT'
import os,pathlib,sys,tarfile
archive,destination,commit=sys.argv[1:];assert os.path.getsize(archive)<128*1024*1024
with tarfile.open(archive,'r:gz') as bundle:
 members=bundle.getmembers();assert members and len(members)<100_000 and sum(m.size for m in members)<512*1024*1024
 expected='websiteIeltsAi-'+commit
 for member in members:
  parts=pathlib.PurePosixPath(member.name).parts
  assert parts and parts[0]==expected and not pathlib.PurePosixPath(member.name).is_absolute() and '..' not in parts
  assert member.isdir() or member.isfile(), 'Symlink/hardlink/special archive member rejected'
 for member in members:
  parts=pathlib.PurePosixPath(member.name).parts[1:]
  if not parts:continue
  target=os.path.join(destination,*parts)
  if member.isdir():os.makedirs(target,mode=0o755,exist_ok=True)
  else:
   os.makedirs(os.path.dirname(target),mode=0o755,exist_ok=True)
   with bundle.extractfile(member) as source,open(target,'xb') as output:output.write(source.read())
   os.chmod(target,0o644)
PYEXTRACT
for file in "$source_dir/Dockerfile" "$source_dir/.dockerignore" "$source_dir/deploy/compose.sh"; do [[ -f "$file" && ! -L "$file" ]] || die 'Archive thiếu file build/wrapper đã kiểm tra.'; done
bash -n "$source_dir/deploy/compose.sh"
awk '/release\.compose\.yaml/{ok=1}END{exit !ok}' "$source_dir/deploy/compose.sh" || die 'Wrapper của bản mới chưa hỗ trợ release override bền vững.'
cp -p -- "$compose_wrapper" "$audit_dir/compose.sh.before"
if [[ -f "$release_override" ]]; then had_release=true; cp -p -- "$release_override" "$audit_dir/release.compose.before"; fi
say 'Build riêng tối đa 1024 MiB RAM, không swap và 0,5 CPU; chưa dừng app.'
DOCKER_BUILDKIT=0 docker build --pull --memory=1024m --memory-swap=1024m --cpu-period=100000 --cpu-quota=50000 --cpu-shares=128 --tag "$new_image" "$source_dir" > "$audit_dir/build.log" 2>&1 || die "Build lỗi; app cũ vẫn chạy. Xem $audit_dir/build.log"
docker run --rm --network none --memory=512m --memory-swap=512m --cpus=0.25 --entrypoint node "$new_image" --import tsx --input-type=module -e 'const{contentBank,vocabularyBank,placementBank}=await import("/app/server/data/index.ts");console.log(JSON.stringify({content:contentBank.map(x=>({...x,_id:x.id})),vocabulary:vocabularyBank.map(x=>({...x,_id:x.id})),placementItems:placementBank.map(x=>({...x,_id:x.id}))}));' > "$audit_dir/seed-manifest.json" 2> "$audit_dir/manifest.log" || die 'Không đọc được manifest học liệu trong image mới.'
python3 - "$audit_dir/seed-manifest.json" <<'PYMANIFEST'
import json,sys
x=json.load(open(sys.argv[1]));assert set(x)=={'content','vocabulary','placementItems'}
assert len(x['content'])==552 and len(x['vocabulary'])==648 and len(x['placementItems'])==576
assert sum(d['format']=='lesson' for d in x['content'])==480 and sum(d['format']=='full-mock' for d in x['content'])==72
for rows in x.values():assert len({d['_id'] for d in rows})==len(rows) and all(isinstance(d['_id'],str) and d['_id']==d['id'] for d in rows)
PYMANIFEST
verify_existing || die 'Hiện trạng project khác thay đổi trong lúc build; chưa chuyển app.'
[[ "$(service_id app)" == "$old_app_id" && "$(docker image inspect --format '{{.Id}}' "$old_image_ref")" == "$old_image" ]] || die 'App/image cũ đã thay đổi trong lúc build.'
docker tag "$old_image" "$rollback_tag"
cat > "$audit_dir/release.compose.new" <<EORELEASE
services:
  app:
    image: $new_image
    build:
      context: $source_dir
      dockerfile: Dockerfile
EORELEASE
chmod 600 "$audit_dir/release.compose.new"
docker compose "${base_args[@]}" -f "$audit_dir/release.compose.new" config --quiet || die 'Release override chưa hợp lệ; chưa dừng app.'
say 'Bản build đạt. Chỉ app IELTS tạm dừng để lưu ngân hàng cũ và chuyển bản mới; MongoDB/proxy/website khác giữ nguyên.'
app_stopped=true
docker compose "${old_args[@]}" stop --timeout 30 app > "$audit_dir/stop-old-app.log" 2>&1 || die 'Không dừng được riêng app IELTS.'
mongo_exec 'const x={};for(const name of ["content","vocabulary","placementItems"])x[name]=db.getCollection(name).find().sort({_id:1}).toArray();print(EJSON.stringify(x,null,0,{relaxed:false}));' > "$audit_dir/public.before.ejson" 2> "$audit_dir/snapshot.log" || die 'Chưa lưu được ngân hàng công khai cũ.'
python3 - "$audit_dir/public.before.ejson" <<'PYSNAPSHOT'
import json,sys
x=json.load(open(sys.argv[1]));assert set(x)=={'content','vocabulary','placementItems'}
assert all(isinstance(rows,list) and rows for rows in x.values())
PYSNAPSHOT
cp -p -- "$source_dir/deploy/compose.sh" "$compose_wrapper"
cp -p -- "$audit_dir/release.compose.new" "$release_override"
chmod 600 "$release_override"
current_args=("${base_args[@]}" -f "$release_override")
bash "$compose_wrapper" validate || die 'Wrapper/live Compose không hợp lệ sau cập nhật.'
new_app_started=true
docker compose "${current_args[@]}" up -d --no-deps --no-build --wait --wait-timeout 240 app > "$audit_dir/up-new-app.log" 2>&1 || die 'App mới chưa healthy.'
new_app_id="$(service_id app)"
[[ "$new_app_id" =~ ^[a-f0-9]{64}$ && "$(docker inspect --format '{{.Config.Image}}' "$new_app_id")" == "$new_image" ]] || die 'App không chạy đúng image mới.'
docker inspect --format '{{json .NetworkSettings.Ports}}' "$new_app_id" | python3 -c 'import json,sys;assert json.load(sys.stdin).get("3001/tcp")==[{"HostIp":"127.0.0.1","HostPort":"19088"}]' || die 'Binding mới không còn loopback chính xác.'
[[ "$(docker inspect --format '{{range .Config.Env}}{{if eq (index (split . "=") 0) "APP_ORIGIN"}}{{println (index (split . "=") 1)}}{{end}}{{end}}' "$new_app_id")" == "$origin" ]] || die 'Origin bị thay đổi.'
curl_domain --fail "$origin/api/health" -o "$audit_dir/health.json"
python3 - "$audit_dir/health.json" <<'PYHEALTH'
import json,sys
x=json.load(open(sys.argv[1]));assert x['status']=='ok' and x['database']=='mongodb' and x['demoEnabled'] is False
targets={'lessons':480,'mocks':72,'vocabulary':648,'placement':576}
assert all(type(x['bank'].get(name)) is int and x['bank'][name]>=count for name,count in targets.items())
PYHEALTH
mongo_exec 'const fs=require("fs");const x=JSON.parse(fs.readFileSync(0,"utf8"));const result={};for(const name of ["content","vocabulary","placementItems"]){const ids=x[name].map(d=>d._id);const seeded=db.getCollection(name).countDocuments({_id:{$in:ids}});if(seeded!==ids.length)throw new Error("Seeded IDs missing");result[name]={seeded,total:db.getCollection(name).countDocuments()};}print(JSON.stringify(result));' < "$audit_dir/seed-manifest.json" > "$audit_dir/mongo-counts.json" 2> "$audit_dir/mongo-counts.log" || die 'Số ID học liệu thực trong MongoDB chưa đủ.'
mongo_exec 'const fs=require("fs");const x=EJSON.parse(fs.readFileSync(0,"utf8"));for(const name of ["content","vocabulary","placementItems"]){const ids=x[name].map(d=>d._id);if(db.getCollection(name).countDocuments({_id:{$in:ids}})!==ids.length)throw new Error("Pre-existing public IDs missing");}print("All pre-existing public IDs retained.");' < "$audit_dir/public.before.ejson" > "$audit_dir/old-ids.log" 2>&1 || die 'Thiếu ID học liệu cũ.'
curl_domain --fail "$origin/api/auth/me" -o "$audit_dir/auth.json"
python3 - "$audit_dir/auth.json" <<'PYAUTH'
import json,sys
assert json.load(open(sys.argv[1]))['user'] is None
PYAUTH
status="$(curl_domain -X POST -H "Origin: $origin" -H 'Content-Type: application/json' --data '{}' "$origin/api/auth/register" -o "$audit_dir/invalid-registration.json" -w '%{http_code}')"
[[ "$status" == 400 ]] || die 'Origin/validation đăng ký chưa đạt; không tạo tài khoản thử.'
status="$(curl_domain -X POST -H 'Origin: https://example.invalid' -H 'Content-Type: application/json' --data '{}' "$origin/api/auth/register" -o "$audit_dir/wrong-origin.json" -w '%{http_code}')"
[[ "$status" == 403 ]] || die 'Origin khác chưa bị từ chối.'
curl_domain --fail "$origin/" -o "$audit_dir/index.html"
asset="$(python3 - "$audit_dir/index.html" <<'PYASSET'
import re,sys
m=re.search(r'<script[^>]+src="(/assets/[a-zA-Z0-9._-]+\.js)"',open(sys.argv[1]).read());assert m;print(m.group(1))
PYASSET
)" || die 'Giao diện thiếu JavaScript build.'
curl_domain --fail "$origin$asset" -D "$audit_dir/asset.headers" -o "$audit_dir/app.js"
awk 'tolower($0)~/^content-type:.*(javascript|ecmascript)/{ok=1}END{exit !ok}' "$audit_dir/asset.headers" || die 'File frontend trả sai kiểu dữ liệu.'
[[ "$(wc -c < "$audit_dir/app.js")" -gt 100 ]] || die 'JavaScript trống.'
preserve_ip_endpoint || die 'Endpoint IP cũ chưa hoạt động sau cập nhật.'
verify_existing || die 'Container/cổng/cấu hình khác đã thay đổi trong lúc cập nhật.'
printf '%s\n' "$source_commit" > "$audit_dir/source.commit"
printf '%s\n' success > "$audit_dir/result"
say 'HOÀN TẤT kiểm tra trên server: đủ bộ seed 480 bài luyện, 72 đề mô phỏng, 648 từ vựng, 576 câu placement. Các ID cũ và học liệu tự tạo ngoài bộ seed giữ nguyên.'
python3 - "$audit_dir/mongo-counts.json" <<'PYCOUNTS'
import json,sys
x=json.load(open(sys.argv[1]))
for name in ['content','vocabulary','placementItems']:
 row=x[name];print(f"MongoDB {name}: seed {row['seeded']}, tổng {row['total']}, ngoài seed {row['total']-row['seeded']}")
PYCOUNTS
printf 'Website: %s\nImage riêng: %s\nNguồn mới: %s\nLog riêng: %s\n' "$origin" "$new_image" "$source_dir" "$audit_dir"
say 'Tài khoản/tiến độ/ghi âm, MongoDB/proxy, gateway/chứng chỉ/gia hạn và project khác không bị thay thế. Chưa xác nhận truy cập Internet từ lệnh này.'
