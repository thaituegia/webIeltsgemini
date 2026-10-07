#!/usr/bin/env bash
set -euo pipefail
start="${1:-8088}"
end="${2:-8188}"
for number in "$start" "$end"; do
  if [[ ! "$number" =~ ^[0-9]{1,5}$ ]] || (( 10#$number < 1024 || 10#$number > 65535 )); then
    printf '%s\n' 'Usage: bash deploy/select-port.sh [FIRST_PORT=8088] [LAST_PORT=8188]' >&2
    exit 2
  fi
done
start=$((10#$start))
end=$((10#$end))
if (( end < start || end - start > 1000 )); then
  printf '%s\n' 'Port range must be ascending and contain at most 1001 ports.' >&2
  exit 2
fi
command -v ss >/dev/null
command -v docker >/dev/null
docker info >/dev/null
listeners="$(ss -H -lntu)"
published="$(docker ps -q | while IFS= read -r id; do docker port "$id" 2>/dev/null || true; done)"
for ((port=start; port<=end; port++)); do
  if printf '%s\n' "$listeners" | awk -v p="$port" '$5 ~ ":" p "$" {found=1} END {exit !found}'; then continue; fi
  if printf '%s\n' "$published" | awk -v p="$port" '{n=split($NF,a,":"); if(a[n]==p)found=1} END {exit !found}'; then continue; fi
  printf '%s\n' "$port"
  exit 0
done
printf 'No unused port found in %s-%s.\n' "$start" "$end" >&2
exit 1
