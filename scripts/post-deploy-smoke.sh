#!/usr/bin/env bash
set -Eeuo pipefail

BASE_URL="${BASE_URL:?Defina BASE_URL, por exemplo: https://seu-site.workers.dev}"
BASE_URL="$(printf %s "$BASE_URL" | tr -d "[:space:]")"
BASE_URL="${BASE_URL%/}"
failures=0

pass() { printf 'PASS  %s\n' "$1"; }
fail() { printf 'FAIL  %s\n' "$1" >&2; failures=$((failures + 1)); }

status() {
  curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$1" || printf '000'
}

expect_status() {
  local label="$1" url="$2" expected="$3" actual
  actual="$(status "$url")"
  if [[ "$actual" == "$expected" ]]; then pass "$label ($actual)"; else fail "$label (expected $expected, got $actual)"; fi
}

expect_json_key() {
  local label="$1" url="$2" key="$3" body
  if body="$(curl -fsS --max-time 20 "$url")" && grep -qE "[\"']${key}[\"']" <<<"$body"; then pass "$label"; else fail "$label"; fi
}

expect_json() {
  local label="$1" url="$2" body first
  if body="$(curl -fsS --max-time 20 "$url")"; then
    first="${body:0:1}"
    if [[ "$first" == '{' || "$first" == '[' ]]; then pass "$label"; return; fi
  fi
  fail "$label"
}

printf 'Post-deploy smoke tests: %s\n' "$BASE_URL"
expect_status 'home pública' "$BASE_URL/" '200'
expect_json_key 'health do Worker' "$BASE_URL/api/health" 'ok'
expect_json_key 'textos públicos' "$BASE_URL/api/site-content" 'hero_description'
expect_json 'testemunhos públicos (JSON, inclusive vazio)' "$BASE_URL/api/testimonials"
expect_status 'notificações sem autenticação bloqueadas' "$BASE_URL/api/notifications" '401'
expect_status 'testemunhos administrativos sem autenticação bloqueados' "$BASE_URL/api/testimonials/admin/all" '401'

# A home deve carregar ao menos um asset JavaScript e um CSS.
html="$(curl -fsS --max-time 20 "$BASE_URL/")" || { fail 'HTML da home'; html=''; }
if grep -Eq 'src="[^"]+\.js[^\"]*"' <<<"$html"; then pass 'bundle JavaScript encontrado'; else fail 'bundle JavaScript encontrado'; fi
if grep -Eq 'href="[^"]+\.css[^\"]*"' <<<"$html"; then pass 'stylesheet encontrado'; else fail 'stylesheet encontrado'; fi

if (( failures > 0 )); then
  printf '\n%d teste(s) falharam.\n' "$failures" >&2
  exit 1
fi
printf '\nTodos os smoke tests passaram.\n'
