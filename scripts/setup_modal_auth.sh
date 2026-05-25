#!/usr/bin/env bash
# Bulletproof Modal auth setup. Usage:
#   bash scripts/setup_modal_auth.sh ak-XXX as-XXX

set -e

TOKEN_ID="$1"
TOKEN_SECRET="$2"

if [ -z "$TOKEN_ID" ] || [ -z "$TOKEN_SECRET" ]; then
  echo "Usage: bash scripts/setup_modal_auth.sh <ak-XXX> <as-XXX>"
  exit 1
fi

if [[ "$TOKEN_ID" != ak-* ]]; then
  echo "ERROR: token_id must start with 'ak-'"
  exit 1
fi

if [[ "$TOKEN_SECRET" != as-* ]]; then
  echo "ERROR: token_secret must start with 'as-'"
  exit 1
fi

TOML_PATH="$HOME/.modal.toml"

# Backup existing
if [ -f "$TOML_PATH" ]; then
  cp "$TOML_PATH" "$TOML_PATH.bak.$(date +%s)"
  echo "Backed up existing $TOML_PATH"
fi

# Write fresh config
cat > "$TOML_PATH" <<EOF
[default]
token_id = "$TOKEN_ID"
token_secret = "$TOKEN_SECRET"
active = true
EOF

chmod 600 "$TOML_PATH"
echo "Wrote $TOML_PATH (chmod 600)"
echo
echo "Contents:"
cat "$TOML_PATH"
echo
echo "Verifying with 'modal profile current'..."
modal profile current && echo "✓ Auth working" || echo "✗ Auth failed — check token validity at https://modal.com/settings/tokens"
