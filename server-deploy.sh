#!/bin/bash
# Деплой mehmon-yordam.uz с GitHub: забирает готовую сборку из ветки "deploy"
# репозитория anisakhmedov/guide-samarkand-backend и раскладывает по хостингу.
# Секреты (~/guide_api/.env) не трогает.
#
# Запуск вручную:   bash ~/deploy.sh          (ставит, только если в ветке есть новый коммит)
#                   bash ~/deploy.sh --force  (ставит заново в любом случае)
set -euo pipefail
REPO=https://github.com/anisakhmedov/guide-samarkand-backend.git
DIR="$HOME/deploy_src"

exec 9>"$HOME/.deploy.lock"
flock -n 9 || exit 0

if [ ! -d "$DIR/.git" ]; then
  git clone -q --depth 1 -b deploy "$REPO" "$DIR"
else
  git -C "$DIR" fetch -q --depth 1 origin deploy
  git -C "$DIR" reset -q --hard origin/deploy
fi

REV=$(git -C "$DIR" rev-parse HEAD)
if [ "${1:-}" != "--force" ] && [ "$(cat "$HOME/.deployed_rev" 2>/dev/null)" = "$REV" ]; then
  exit 0
fi
echo "[$(date '+%F %T')] deploying $REV"

# API: заменяем только bundle.js (app.js — загрузчик .env, его не трогаем)
if [ -f "$DIR/api/bundle.js" ]; then
  cp "$DIR/api/bundle.js" "$HOME/guide_api/bundle.js.new"
  mv "$HOME/guide_api/bundle.js.new" "$HOME/guide_api/bundle.js"
  mkdir -p "$HOME/guide_api/tmp"
  touch "$HOME/guide_api/tmp/restart.txt"
fi

# Фронтенды
for pair in guide-frontend:mehmon-yordam.uz admin-frontend:admin.mehmon-yordam.uz; do
  src="$DIR/${pair%%:*}"
  dst="$HOME/domains/${pair##*:}/public_html"
  [ -f "$src/index.html" ] || continue
  rm -rf "$dst/assets" "$dst/index.html"
  cp -r "$src/." "$dst/"
done

echo "$REV" > "$HOME/.deployed_rev"
echo "[$(date '+%F %T')] done $REV"
