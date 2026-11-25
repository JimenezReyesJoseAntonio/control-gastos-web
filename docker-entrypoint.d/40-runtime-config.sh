#!/bin/sh
set -eu

cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__MIS_COMPRAS_CONFIG__ = {
  VITE_SUPABASE_URL: "$(printf '%s' "${VITE_SUPABASE_URL:-}" | sed 's/[\\"]/\\&/g')",
  VITE_SUPABASE_ANON_KEY: "$(printf '%s' "${VITE_SUPABASE_ANON_KEY:-}" | sed 's/[\\"]/\\&/g')"
};
EOF
