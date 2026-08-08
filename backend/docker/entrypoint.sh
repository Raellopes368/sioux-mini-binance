#!/usr/bin/env sh
set -e

cd /var/www/html

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
fi

if [ ! -d vendor ]; then
  composer install --no-interaction --prefer-dist
fi

# Keep volume-mounted .env aligned with container environment.
sync_env_var() {
  key="$1"
  value="$2"

  if [ -z "$value" ]; then
    return
  fi

  case "$value" in
    *[!A-Za-z0-9_./:@+-]*|'')
      escaped=$(printf '%s' "$value" | sed 's/"/\\"/g')
      rendered="${key}=\"${escaped}\""
      ;;
    *)
      rendered="${key}=${value}"
      ;;
  esac

  if grep -q "^${key}=" .env 2>/dev/null; then
    sed -i "s|^${key}=.*|${rendered}|" .env
  else
    echo "${rendered}" >> .env
  fi
}

sync_env_var "APP_NAME" "${APP_NAME}"
sync_env_var "APP_ENV" "${APP_ENV}"
sync_env_var "APP_DEBUG" "${APP_DEBUG}"
sync_env_var "APP_URL" "${APP_URL}"
sync_env_var "DB_CONNECTION" "${DB_CONNECTION}"
sync_env_var "DB_HOST" "${DB_HOST}"
sync_env_var "DB_PORT" "${DB_PORT}"
sync_env_var "DB_DATABASE" "${DB_DATABASE}"
sync_env_var "DB_USERNAME" "${DB_USERNAME}"
sync_env_var "DB_PASSWORD" "${DB_PASSWORD}"
sync_env_var "CACHE_STORE" "${CACHE_STORE}"
sync_env_var "QUEUE_CONNECTION" "${QUEUE_CONNECTION}"
sync_env_var "SESSION_DRIVER" "${SESSION_DRIVER}"
sync_env_var "REDIS_CLIENT" "${REDIS_CLIENT}"
sync_env_var "REDIS_HOST" "${REDIS_HOST}"
sync_env_var "REDIS_PORT" "${REDIS_PORT}"
sync_env_var "BITCOIN_PRICE_CACHE_KEY" "${BITCOIN_PRICE_CACHE_KEY}"
sync_env_var "BITCOIN_PRICE_CACHE_TTL" "${BITCOIN_PRICE_CACHE_TTL}"
sync_env_var "BITCOIN_MIN_PRICE" "${BITCOIN_MIN_PRICE}"
sync_env_var "BITCOIN_MAX_PRICE" "${BITCOIN_MAX_PRICE}"
sync_env_var "WALLET_INITIAL_BRL" "${WALLET_INITIAL_BRL}"
sync_env_var "WALLET_INITIAL_BTC" "${WALLET_INITIAL_BTC}"

if [ -z "${APP_KEY}" ]; then
  CURRENT_KEY=$(grep '^APP_KEY=' .env | cut -d '=' -f2- || true)
  if [ -z "${CURRENT_KEY}" ]; then
    php artisan key:generate --force --no-interaction
  fi
else
  sync_env_var "APP_KEY" "${APP_KEY}"
fi

php artisan config:clear --no-interaction >/dev/null 2>&1 || true

echo "Waiting for PostgreSQL..."
until php -r "new PDO('pgsql:host=' . getenv('DB_HOST') . ';port=' . (getenv('DB_PORT') ?: '5432') . ';dbname=' . getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));" 2>/dev/null; do
  sleep 2
done

php artisan migrate --force --no-interaction

if [ "${RUN_SEEDERS:-false}" = "true" ]; then
  php artisan db:seed --force --no-interaction
fi

exec "$@"
