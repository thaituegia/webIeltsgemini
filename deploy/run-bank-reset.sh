#!/usr/bin/env bash
# Operator convenience entrypoint. Reuses the two private credentials from
# this exact running deployment, without putting them in chat or shell history.
set -Eeuo pipefail
umask 077
(( $# == 4 )) || { printf '%s\n' 'Usage: run-bank-reset.sh LIVE_DIR SOURCE_COMMIT ARCHIVE_SHA256 RESET_SCRIPT_SHA256' >&2; exit 2; }
live_dir="$1"; source_commit="$2"; archive_sha="$3"; reset_sha="$4"
[[ "$live_dir" =~ ^/[A-Za-z0-9._/-]+$ && "$source_commit" =~ ^[a-f0-9]{40}$ && "$archive_sha" =~ ^[a-f0-9]{64}$ && "$reset_sha" =~ ^[a-f0-9]{64}$ && $EUID == 0 ]] || exit 2
credentials_file=''; reset_file=''
trap 'rm -f -- "$credentials_file" "$reset_file"' EXIT
credentials_file="$(mktemp /tmp/ielts-reset-accounts.XXXXXX)"
reset_file="$(mktemp /tmp/ielts-reset-code.XXXXXX)"
# RUN_RESET_EXISTING_CREDENTIALS_BEGIN
python3 - "$live_dir" > "$credentials_file" <<'PYACCOUNTS'
import json,os,re,stat,subprocess,sys
try:
 root=sys.argv[1];assert os.path.realpath(root)==root and os.stat(root).st_uid==0
 config=root+'/.local/deploy/deploy.env'
 assert os.path.realpath(config)==config and stat.S_ISREG(os.stat(config).st_mode) and os.stat(config).st_uid==0
 entries=[line.split('=',1)[1].strip() for line in open(config) if line.startswith('IELTS_COMPOSE_PROJECT=')]
 assert len(entries)==1 and re.fullmatch(r'website-ielts-ai-[a-z0-9][a-z0-9_-]{0,47}',entries[0])
 project=entries[0]
 def docker(args):
  r=subprocess.run(['docker']+args,capture_output=True,text=True,timeout=30);assert r.returncode==0;return r.stdout
 ids=docker(['ps','-q','--no-trunc','--filter','label=com.docker.compose.project='+project,'--filter','label=com.docker.compose.service=app']).split()
 assert len(ids)==1 and re.fullmatch(r'[a-f0-9]{64}',ids[0])
 rows=json.loads(docker(['inspect',ids[0]]));assert len(rows)==1
 app=rows[0];labels=app['Config']['Labels']
 assert app['State']['Running'] and labels['com.docker.compose.project']==project and labels['com.docker.compose.service']=='app'
 assert labels['com.docker.compose.project.working_dir']==root+'/deploy'
 env={}
 for line in app['Config']['Env']:
  key,value=line.split('=',1);assert key not in env;env[key]=value
 assert env.get('DUO_ENABLED')=='true' and not env.get('DUO_CREDENTIALS_FILE')
 settings=json.loads(env['DUO_ACCOUNTS_JSON'])
 assert isinstance(settings,dict) and set(settings)=={'duoId','accounts'}
 assert isinstance(settings['duoId'],str) and re.fullmatch(r'[a-z0-9][a-z0-9-]{2,79}',settings['duoId'])
 assert isinstance(settings['accounts'],list) and len(settings['accounts'])==2
 assert {a['role'] for a in settings['accounts']}=={'husband','wife'}
 assert len({a['phone'] for a in settings['accounts']})==2
 for a in settings['accounts']:
  assert isinstance(a,dict) and set(a)=={'role','name','phone','passwordHash'}
  assert isinstance(a['name'],str) and 2<=len(a['name'].strip())<=80 and len(a['name'])<=80 and not re.search(r'[\x00-\x1f]',a['name'])
  assert isinstance(a['phone'],str) and re.fullmatch(r'0[35789][0-9]{8}',a['phone'])
  assert isinstance(a['passwordHash'],str) and re.fullmatch(r'scrypt:[a-f0-9]{32}:[a-f0-9]{128}',a['passwordHash'])
 # The output is redirected only to a new 0600 temp file, never the terminal.
 json.dump(settings,sys.stdout,ensure_ascii=False,separators=(',',':'))
except Exception:
 sys.exit('Cannot verify existing private Duo configuration; no credentials printed or database changes made.')
PYACCOUNTS
# RUN_RESET_EXISTING_CREDENTIALS_END
curl --fail --silent --show-error --location --proto '=https' --proto-redir '=https' --connect-timeout 15 --max-time 60 \
  "https://raw.githubusercontent.com/thaituegia/websiteIeltsAi/$source_commit/deploy/reset-bank.sh" -o "$reset_file"
printf '%s  %s\n' "$reset_sha" "$reset_file" | sha256sum --check --status
bash "$reset_file" "$live_dir" "$source_commit" "$archive_sha" < "$credentials_file"
