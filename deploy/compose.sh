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
case "${1:-}" in
  validate)
    shift
    if (( $# != 0 )); then exit 2; fi
    exec docker compose --project-name "$project" --env-file "$config_file" -f "$deploy_dir/compose.yaml" config --quiet
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
exec docker compose --project-name "$project" --env-file "$config_file" -f "$deploy_dir/compose.yaml" "$@"
