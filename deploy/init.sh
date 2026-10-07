#!/usr/bin/env bash
set -euo pipefail
umask 077

deploy_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
root_dir="$(cd -- "$deploy_dir/.." && pwd)"
host="${1:-}"
port="${2:-}"
project="${3:-website-ielts-ai-prod}"
certificate_mode="${4:-provided}"
if [[ ! "$host" =~ ^[a-zA-Z0-9][a-zA-Z0-9.-]{0,252}$ ]] || [[ "$host" == *..* ]]; then
  printf '%s\n' 'Usage: bash deploy/init.sh PUBLIC_IP_OR_DOMAIN FREE_PORT [UNIQUE_PROJECT] [--self-signed]' >&2
  exit 2
fi
if [[ ! "$port" =~ ^[0-9]{1,5}$ ]] || (( 10#$port < 1024 || 10#$port > 65535 )); then
  printf '%s\n' 'Port must be an integer from 1024 to 65535.' >&2
  exit 2
fi
port=$((10#$port))
if [[ ! "$project" =~ ^[a-z0-9][a-z0-9_-]{0,62}$ ]]; then
  printf '%s\n' 'Invalid Compose project name.' >&2
  exit 2
fi
if [[ "$certificate_mode" != provided && "$certificate_mode" != --self-signed ]]; then
  printf '%s\n' 'Certificate mode must be omitted or --self-signed.' >&2
  exit 2
fi
if [[ -L "$root_dir/.local" || -e "$root_dir/.local/deploy" || -L "$root_dir/.local/deploy" ]]; then
  printf '%s\n' 'Refusing to overwrite an existing or redirected .local/deploy directory.' >&2
  exit 1
fi
if [[ "$certificate_mode" == --self-signed ]]; then
  command -v openssl >/dev/null || { printf '%s\n' 'OpenSSL is required to create a self-signed certificate.' >&2; exit 1; }
fi

mkdir -p -- "$root_dir/.local/deploy/tls"
cp -- "$deploy_dir/app.env.example" "$root_dir/.local/deploy/app.env"
cat > "$root_dir/.local/deploy/deploy.env" <<EOF
IELTS_PUBLIC_HOST=$host
IELTS_PUBLIC_PORT=$port
IELTS_BIND_ADDRESS=0.0.0.0
IELTS_COMPOSE_PROJECT=$project
IELTS_APP_MEMORY=768m
IELTS_APP_CPUS=1.0
IELTS_MONGO_MEMORY=768m
IELTS_MONGO_CPUS=0.75
EOF
chmod 600 "$root_dir/.local/deploy/app.env" "$root_dir/.local/deploy/deploy.env"

if [[ "$certificate_mode" == --self-signed ]]; then
  san="DNS:$host"
  if [[ "$host" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then san="IP:$host"; fi
  openssl req -x509 -newkey rsa:3072 -nodes -days 365 \
    -subj "/CN=$host" -addext "subjectAltName=$san" \
    -keyout "$root_dir/.local/deploy/tls/site.key" \
    -out "$root_dir/.local/deploy/tls/site.crt" >/dev/null 2>&1
  chmod 600 "$root_dir/.local/deploy/tls/site.key"
  chmod 644 "$root_dir/.local/deploy/tls/site.crt"
  printf '%s\n' 'Self-signed TLS certificate created. Browsers will require explicit certificate acceptance.'
else
  printf '%s\n' 'Copy your certificate chain to .local/deploy/tls/site.crt and private key to site.key (0600).'
fi
printf 'Private runtime configuration created for https://%s:%s; no containers started.\n' "$host" "$port"
