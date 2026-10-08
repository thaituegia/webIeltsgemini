#!/usr/bin/env bash
# Verify the already-running v3 release without rebuilding, restarting or
# changing application/database records. Writes only its own private receipt.
set -Eeuo pipefail
umask 077
die() { printf '\nDỪNG XÁC MINH: %s\n' "$*" >&2; exit 1; }
(( $# == 1 || $# == 2 )) || die 'Usage: bash verify-update.sh LIVE_DIR [AUDIT_DIR]'
(( EUID == 0 )) || die 'Chạy trong cửa sổ SSH root của VPS.'
live_dir="$1"
[[ "$live_dir" =~ ^/[A-Za-z0-9._/-]+$ && -d "$live_dir" && ! -L "$live_dir" ]] || die 'Đường dẫn live không hợp lệ.'
for command in docker python3 curl sha256sum awk readlink stat mktemp sort comm cmp ss systemctl nginx wc; do
  command -v "$command" >/dev/null || die "Thiếu $command; không tự cài hệ thống."
done
[[ "$(readlink -e -- "$live_dir")" == "$live_dir" && "$(stat -c '%u' "$live_dir")" == 0 ]] || die 'Thư mục live phải là đường dẫn thật, thuộc root.'
private_dir="$live_dir/.local/deploy"
updates_dir="$private_dir/updates"
for directory in "$private_dir" "$updates_dir"; do
  [[ -d "$directory" && ! -L "$directory" && "$(readlink -e -- "$directory")" == "$directory" && "$(stat -c '%u' "$directory")" == 0 ]] || die 'Thư mục triển khai không hợp lệ.'
done
source_commit='3e6037bf7da2d9ddf5e84b4193353f7a721e9bc9'
if (( $# == 2 )); then audit_dir="$2"; else
  audit_dir="$(python3 - "$updates_dir" "${source_commit:0:12}" <<'PYAUDIT'
import pathlib,re,sys
root,prefix=sys.argv[1:]
paths=sorted(p for p in pathlib.Path(root).iterdir() if not p.is_symlink() and p.is_dir() and re.fullmatch(re.escape(prefix)+r'-\d{8}T\d{6}Z-[A-Za-z0-9]+',p.name))
assert paths, 'No matching v3 update audit'
assert len(paths)<2 or paths[-1].name.split('-')[1]!=paths[-2].name.split('-')[1], 'Ambiguous latest audit; supply AUDIT_DIR explicitly'
print(paths[-1])
PYAUDIT
)" || die 'Không xác định được log của lần cập nhật v3.'
fi
[[ "$audit_dir" == "$updates_dir/${source_commit:0:12}-"* && -d "$audit_dir" && ! -L "$audit_dir" && "$(readlink -e -- "$audit_dir")" == "$audit_dir" && "$(stat -c '%u' "$audit_dir")" == 0 ]] || die 'Audit không thuộc lần cập nhật của website này.'
config_file="$private_dir/deploy.env"
compose_file="$live_dir/deploy/compose.yaml"
domain_override="$private_dir/domain.compose.yaml"
release_override="$private_dir/release.compose.yaml"
for file in "$config_file" "$compose_file" "$domain_override" "$release_override" "$private_dir/app.env" "$private_dir/tls/site.crt" "$audit_dir/release.compose.new" "$audit_dir/seed-manifest.json" "$audit_dir/public.before.ejson" "$audit_dir/before.containers" "$audit_dir/before.listeners" "$audit_dir/protected.sha256" "$audit_dir/nginx-files.json"; do
  [[ -f "$file" && ! -L "$file" && "$(readlink -e -- "$file")" == "$file" && "$(stat -c '%u' "$file")" == 0 ]] || die 'Thiếu file triển khai/audit thật, thuộc root.'
done
project="$(awk -F= '$1=="IELTS_COMPOSE_PROJECT"{n++;value=substr($0,index($0,"=")+1)}END{if(n!=1)exit 1;print value}' "$config_file")" || die 'Không đọc được Compose project.'
[[ "$project" =~ ^website-ielts-ai-[a-z0-9][a-z0-9_-]{0,47}$ ]] || die 'Project không thuộc website IELTS.'
compose_args=(--project-name "$project" --env-file "$config_file" -f "$compose_file" -f "$domain_override" -f "$release_override")
docker compose "${compose_args[@]}" config --quiet || die 'Compose hiện tại chưa hợp lệ.'
cmp -s "$release_override" "$audit_dir/release.compose.new" || die 'Release hiện tại khác bản mới đã build; không tự thay đổi.'
expected_image="$(python3 - "$audit_dir/release.compose.new" "$project" "${source_commit:0:12}" <<'PYIMAGE'
import re,sys
path,project,prefix=sys.argv[1:]
matches=re.findall(r'^    image: (\S+)\s*$',open(path).read(),re.M)
assert len(matches)==1 and re.fullmatch(re.escape(project)+r'-app:release-'+re.escape(prefix)+r'-[a-z0-9]+',matches[0])
print(matches[0])
PYIMAGE
)" || die 'Image trong audit không thuộc commit v3.'
service_id() { docker ps -q --no-trunc --filter "label=com.docker.compose.project=$project" --filter "label=com.docker.compose.service=$1"; }
app_id="$(service_id app)"; mongo_id="$(service_id mongo)"; proxy_id="$(service_id proxy)"
for id in "$app_id" "$mongo_id" "$proxy_id"; do [[ "$id" =~ ^[a-f0-9]{64}$ ]] || die 'Cần đúng một app, MongoDB và proxy đang chạy.'; done
[[ "$(docker inspect --format '{{.Config.Image}}' "$app_id")" == "$expected_image" ]] || die 'App không chạy đúng image đã build.'
expected_digest="$(docker image inspect --format '{{.Id}}' "$expected_image")" || die 'Không đọc được image đã build.'
[[ "$expected_digest" =~ ^sha256:[a-f0-9]{64}$ && "$(docker inspect --format '{{.Image}}' "$app_id")" == "$expected_digest" ]] || die 'Digest app không khớp image đã build.'
docker inspect "$app_id" "$mongo_id" "$proxy_id" | python3 -c 'import json,sys;rows=json.load(sys.stdin);project,live=sys.argv[1:];assert len(rows)==3
for row in rows:
 labels=row["Config"]["Labels"];assert labels.get("com.docker.compose.project")==project;assert labels.get("com.docker.compose.project.working_dir")==live+"/deploy";assert row["State"]["Running"]
 if labels.get("com.docker.compose.service")=="app":assert row["NetworkSettings"]["Ports"].get("3001/tcp")==[{"HostIp":"127.0.0.1","HostPort":"19088"}]' "$project" "$live_dir" || die 'Container/cổng không khớp triển khai đã kiểm tra.'
[[ "$(docker inspect --format '{{range .Config.Env}}{{if eq (index (split . "=") 0) "APP_ORIGIN"}}{{println (index (split . "=") 1)}}{{end}}{{end}}' "$app_id")" == https://sutonghanyu.vn ]] || die 'Origin của app chưa đúng.'
nginx_pid="$(systemctl show nginx.service --property=MainPID --value)"
[[ "$nginx_pid" =~ ^[1-9][0-9]*$ && "$(systemctl is-active nginx.service)" == active ]] || die 'Host Nginx chưa hoạt động.'
nginx -t >/dev/null 2>&1 || die 'Cấu hình Nginx chưa hợp lệ.'
receipt_dir="$(mktemp -d "$audit_dir/verification-XXXXXX")"
verify_baseline() {
  python3 - "$audit_dir" "$live_dir" <<'PYBASELINE' || return 1
import hashlib,json,os,re,subprocess,sys
audit,live=sys.argv[1:]
for line in open(audit+'/before.containers'):
 fields=line.strip().split();assert len(fields)==3 and re.fullmatch(r'[a-f0-9]{64}',fields[0]) and fields[1]=='true'
 now=subprocess.run(['docker','inspect','--format','{{.Id}} {{.State.Running}} {{.State.StartedAt}}',fields[0]],capture_output=True,text=True,timeout=20);assert now.returncode==0 and now.stdout.strip()==line.strip(),'Existing container changed'
for line in open(audit+'/protected.sha256'):
 digest,path=line.rstrip('\n').split('  ',1);assert re.fullmatch(r'[a-f0-9]{64}',digest) and path.startswith(live+'/') and os.path.realpath(path)==path
 assert hashlib.sha256(open(path,'rb').read()).hexdigest()==digest,'Protected deployment file changed'
for path,old in json.load(open(audit+'/nginx-files.json')).items():
 st=os.stat(path);now={'real':os.path.realpath(path),'sha':hashlib.sha256(open(path,'rb').read()).hexdigest(),'mode':st.st_mode,'uid':st.st_uid,'gid':st.st_gid};assert now==old,'Host Nginx configuration changed'
PYBASELINE
  ss -H -lntu | awk '{print $1" "$5}' | sort -u > "$receipt_dir/listeners.now" || return 1
  comm -23 "$audit_dir/before.listeners" "$receipt_dir/listeners.now" > "$receipt_dir/missing.listeners" || return 1
  [[ ! -s "$receipt_dir/missing.listeners" && "$(systemctl show nginx.service --property=MainPID --value)" == "$nginx_pid" && "$(systemctl is-active nginx.service)" == active ]]
}
verify_baseline || die 'Baseline container/cổng/cấu hình đã thay đổi; xem log riêng, không tự sửa.'
python3 - "$audit_dir/seed-manifest.json" "$audit_dir/public.before.ejson" "$receipt_dir/input.json" <<'PYINPUT'
import json,os,sys
manifest,before,out=sys.argv[1:]
assert all(0<os.path.getsize(p)<=32*1024*1024 for p in [manifest,before])
x=json.load(open(manifest));old=json.load(open(before));names=['content','vocabulary','placementItems']
assert set(x)==set(old)==set(names)
assert [len(x[n]) for n in names]==[552,648,576]
assert sum(d['format']=='lesson' for d in x['content'])==480 and sum(d['format']=='full-mock' for d in x['content'])==72
for n in names:
 assert old[n] and len({d['_id'] for d in x[n]})==len(x[n]) and all(isinstance(d['_id'],str) and d['_id']==d['id'] for d in x[n])
json.dump({'manifest':x,'before':old},open(out,'w'),ensure_ascii=False,separators=(',',':'))
PYINPUT
# UPDATE_MONGO_INPUT_BEGIN
mongo_exec_input() {
  # mongosh makes pipe fd 0 nonblocking. Large fs.readFileSync(0) reads can
  # throw EAGAIN, so upload only to this Mongo container's private temp file
  # before giving the unchanged query/guard a regular-file stdin descriptor.
  local input_bytes input_sha
  [[ -f "$2" && ! -L "$2" ]] || return 1
  input_bytes="$(wc -c < "$2")" || return 1
  [[ "$input_bytes" =~ ^[0-9]+$ ]] && (( input_bytes > 0 && input_bytes <= 64 * 1024 * 1024 )) || return 1
  input_sha="$(sha256sum -- "$2")" || return 1
  input_sha="${input_sha%% *}"
  docker exec -i "$mongo_id" sh -c '
set -eu
umask 077
ielts_input="$(mktemp /tmp/ielts-update-input.XXXXXX)"
trap '\''rm -f -- "$ielts_input"'\'' EXIT HUP INT TERM
cat > "$ielts_input"
[ "$(wc -c < "$ielts_input")" -eq "$2" ]
ielts_digest="$(sha256sum -- "$ielts_input")"
[ "${ielts_digest%% *}" = "$3" ]
mongosh --quiet --norc mongodb://127.0.0.1:27017/ielts_ai --eval "$1" < "$ielts_input"
' sh "$1" "$input_bytes" "$input_sha" < "$2"
}
# UPDATE_MONGO_INPUT_END
printf '%s\n' 'Đang xác minh bộ seed và dữ liệu cũ; ứng dụng tiếp tục chạy, không ghi vào database.'
mongo_exec_input '/* VERIFY_UPDATE_PUBLIC_BEGIN */
const fs=require("fs");const input=EJSON.parse(fs.readFileSync(0,"utf8"));
const canonical=value=>{const plain=EJSON.serialize(value,{relaxed:true});const order=v=>Array.isArray(v)?v.map(order):v&&typeof v==="object"?Object.fromEntries(Object.keys(v).sort().map(k=>[k,order(v[k])])):v;return JSON.stringify(order(plain));};
const report={};
for(const name of ["content","vocabulary","placementItems"]){
 const rows=db.getCollection(name).find().maxTimeMS(15000).toArray();const current=new Map(rows.map(d=>[String(d._id),d]));
 for(const expected of input.manifest[name]){const doc=current.get(String(expected._id));if(!doc||canonical(doc)!==canonical(expected))throw new Error("Seed record missing or changed: "+name+"/"+expected._id);}
 for(const previous of input.before[name]){const doc=current.get(String(previous._id));if(!doc||canonical(doc)!==canonical(previous))throw new Error("Pre-existing public record missing or changed: "+name+"/"+previous._id);}
 report[name]={seeded:input.manifest[name].length,total:rows.length,oldPreserved:input.before[name].length};
}
print(JSON.stringify(report));
/* VERIFY_UPDATE_PUBLIC_END */' "$receipt_dir/input.json" > "$receipt_dir/mongo.json" 2> "$receipt_dir/mongo.log" || die "Kiểm tra MongoDB chưa đạt. Log riêng: $receipt_dir/mongo.log"
curl_domain() { curl --fail --silent --show-error --noproxy '*' --connect-timeout 10 --max-time 30 --resolve sutonghanyu.vn:443:127.0.0.1 "$@"; }
curl_domain https://sutonghanyu.vn/api/health -o "$receipt_dir/health.json"
curl_domain https://sutonghanyu.vn/api/auth/me -o "$receipt_dir/auth.json"
python3 - "$receipt_dir/health.json" "$receipt_dir/auth.json" <<'PYHEALTH'
import json,sys
health=json.load(open(sys.argv[1]));assert health['status']=='ok' and health['database']=='mongodb' and health['demoEnabled'] is False
assert all(type(health['bank'].get(k)) is int and health['bank'][k]>=v for k,v in {'lessons':480,'mocks':72,'vocabulary':648,'placement':576}.items())
assert json.load(open(sys.argv[2]))['user'] is None
PYHEALTH
curl_domain https://sutonghanyu.vn/ -o "$receipt_dir/index.html"
asset="$(python3 - "$receipt_dir/index.html" <<'PYASSET'
import re,sys
m=re.search(r'<script[^>]+src="(/assets/[a-zA-Z0-9._-]+\.js)"',open(sys.argv[1]).read());assert m;print(m.group(1))
PYASSET
)" || die 'Giao diện không có JavaScript build.'
curl_domain "https://sutonghanyu.vn$asset" -D "$receipt_dir/asset.headers" -o "$receipt_dir/app.js"
awk 'tolower($0)~/^content-type:.*(javascript|ecmascript)/{ok=1}END{exit !ok}' "$receipt_dir/asset.headers" || die 'JavaScript trả sai kiểu dữ liệu.'
[[ "$(wc -c < "$receipt_dir/app.js")" -gt 100 ]] || die 'JavaScript trống.'
curl --fail --silent --show-error --noproxy '*' --connect-timeout 10 --max-time 30 --cacert "$private_dir/tls/site.crt" --resolve 66.42.62.123:8088:127.0.0.1 https://66.42.62.123:8088/api/health -o "$receipt_dir/ip-health.json"
verify_baseline || die 'Baseline thay đổi trong lúc xác minh; không tự sửa.'
printf '%s\n' passed > "$receipt_dir/result"
python3 - "$receipt_dir/mongo.json" <<'PYCOUNTS'
import json,sys
for name,row in json.load(open(sys.argv[1])).items():print(f"MongoDB {name}: seed {row['seeded']}, tổng {row['total']}, bản ghi cũ giữ nguyên {row['oldPreserved']}")
PYCOUNTS
printf '\nHOÀN TẤT XÁC MINH: https://sutonghanyu.vn — 480 bài luyện, 72 đề, 648 từ, 576 câu placement.\n'
printf 'Không build/restart app hoặc thay đổi bản ghi database; MongoDB/proxy/project khác và cấu hình được đối chiếu giữ nguyên.\nLog xác minh riêng: %s\n' "$receipt_dir"
