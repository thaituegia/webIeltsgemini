#!/usr/bin/env bash
set -euo pipefail

port="${1:-}"
project="${2:-website-ielts-ai-prod}"
if [[ ! "$port" =~ ^[0-9]{1,5}$ ]] || (( 10#$port < 1024 || 10#$port > 65535 )); then
  printf '%s\n' 'Usage: bash deploy/preflight.sh FREE_PORT [UNIQUE_PROJECT_NAME]' >&2
  exit 2
fi
port=$((10#$port))
if [[ ! "$project" =~ ^[a-z0-9][a-z0-9_-]{0,62}$ ]]; then
  printf '%s\n' 'Invalid Compose project name.' >&2
  exit 2
fi
for command in docker ss awk df free; do
  command -v "$command" >/dev/null || { printf 'Missing required command: %s\n' "$command" >&2; exit 1; }
done
docker info >/dev/null
docker compose version

printf '%s\n' 'Existing listening sockets (read-only baseline):'
ss -lntup
printf '%s\n' 'Existing containers (no environment or credentials):'
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
printf '%s\n' 'Current container resource usage:'
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}'
printf '%s\n' 'Host memory and disk:'
free -h
df -h . /var/lib/docker 2>/dev/null || df -h .

if ss -H -lntu | awk -v p="$port" '$5 ~ ":" p "$" {found=1} END {exit !found}'; then
  printf 'Refusing deployment: port %s already has a listener.\n' "$port" >&2
  exit 1
fi
published="$(docker ps -q | while IFS= read -r id; do docker port "$id" 2>/dev/null || true; done)"
if printf '%s\n' "$published" | awk -v p="$port" '{n=split($NF,a,":"); if(a[n]==p)found=1} END {exit !found}'; then
  printf 'Refusing deployment: port %s is already published by Docker.\n' "$port" >&2
  exit 1
fi
if [[ -n "$(docker ps -aq --filter "label=com.docker.compose.project=$project")" ]]; then
  printf 'Refusing initial deployment: Compose project %s already exists.\n' "$project" >&2
  exit 1
fi
if [[ -n "$(docker volume ls -q --filter "label=com.docker.compose.project=$project")" || -n "$(docker network ls -q --filter "label=com.docker.compose.project=$project")" ]]; then
  printf 'Refusing initial deployment: project %s has existing volumes or networks; inspect ownership first.\n' "$project" >&2
  exit 1
fi
architecture="$(uname -m)"
if [[ "$architecture" == x86_64 || "$architecture" == amd64 ]] && [[ -r /proc/cpuinfo ]] && ! awk '/^flags/ && /(^| )avx( |$)/ {found=1} END {exit !found}' /proc/cpuinfo; then
  printf '%s\n' 'MongoDB 8 requires AVX; this host does not report AVX. Choose a compatible host.' >&2
  exit 1
fi
printf 'Port %s is free; project %s is unused. Review host resources before building.\n' "$port" "$project"
