# Mini Binance

Plataforma simplificada de trading de Bitcoin (teste técnico), com API Laravel e app React Native + Expo.

```text
.
├── backend/           # API REST Laravel
├── mobile/            # React Native / Expo
├── docker-compose.yml
└── README.md
```

## Stack

| Camada  | Tecnologias                                              |
| ------- | -------------------------------------------------------- |
| Backend | PHP 8.4+, Laravel 13, PostgreSQL, Sanctum, Redis, Docker |
| Mobile  | React Native, Expo, TypeScript, NativeWind               |

---

## Requisitos cobertos

1. Autenticação com Sanctum (`register`, `login`, `refresh`, `logout`, `me`)
2. Carteira automática no cadastro (BRL `10000.00`, BTC `0`)
3. Preço fake dinâmico de BTC com cache Redis (TTL 10s)
4. Compra e venda atômicas com `lockForUpdate()`
5. Histórico de transações paginado
6. Precisão decimal com BCMath
7. Testes automatizados (Pest)
8. Docker Compose (app + PostgreSQL + Redis)

---

## Arquitetura do backend

```text
backend/app/
├── Enums/TransactionType.php
├── Exceptions/InsufficientBalanceException.php
├── Http/
│   ├── Controllers/   # Controllers finos
│   ├── Requests/      # Validação estrutural
│   └── Resources/     # Respostas JSON
├── Models/
├── Services/
│   ├── AuthService.php
│   ├── BitcoinPriceService.php
│   └── TradeService.php
└── Support/Money.php  # Aritmética BCMath
```

Controllers recebem a request, chamam services e devolvem Resources.  
Regras financeiras ficam em `TradeService`. Preço/cache ficam em `BitcoinPriceService`.

---

## Decisões técnicas

1. **DECIMAL no PostgreSQL** — `float`/`double` causam erros de arredondamento. Usamos `decimal(15,2)` para BRL/preço e `decimal(20,8)` para BTC, com BCMath em `App\Support\Money`.
2. **DB transaction** — débito, crédito e registro da transaction precisam ser atômicos; falha implica rollback completo.
3. **`lockForUpdate()`** — impede race conditions em compras/vendas concorrentes sobre a mesma wallet (pessimistic locking).
4. **Redis para preço fake** — `Cache::remember` com TTL de 10s mantém o mesmo preço para market e trades durante a janela.
5. **Servidor é fonte da verdade** — o cliente envia apenas a intenção (`amount`). Usuário, wallet, preço e cálculos vêm do backend.

### Market público

`GET /api/market/btc` é **público**. O enunciado não exige autenticação e o preço é simulado; manter público simplifica o consumo e a avaliação.

### Concorrência nos testes

Em PostgreSQL, o teste verifica SQL com `FOR UPDATE`. O grammar do SQLite (usado em `php artisan test`) ignora `FOR UPDATE`; por isso esse assert é skipped no SQLite, e há um teste sequencial que prova que o segundo gasto não ultrapassa o saldo. Em produção/Docker usa-se PostgreSQL.

---

## Instalação com Docker (recomendado)

Na raiz do repositório:

```bash
docker compose --env-file backend/.env up -d
```

Isso sobe:

- API Laravel em `http://localhost:8000`
- PostgreSQL (`liqd` / `liqd` / `secret`)
- Redis

O entrypoint executa `migrate` e seed do usuário demo.

```bash
docker compose down
```

---

## Instalação local (sem Docker da app)

Pré-requisitos: PHP 8.4+, Composer, PostgreSQL, Redis, extensão `bcmath` e `redis`/`phpredis`.

```bash
cd backend
cp .env.example .env
composer install
php artisan key:generate
```

Ajuste `.env` se necessário (`DB_*`, `REDIS_*`, `CACHE_STORE=redis`).

```bash
php artisan migrate
php artisan db:seed
php artisan serve
```

API: `http://localhost:8000`

---

## Testes e qualidade

```bash
cd backend
php artisan test
./vendor/bin/pint
php artisan route:list
```

Os testes usam SQLite in-memory e `CACHE_STORE=array` (`phpunit.xml`).

---

## Credenciais demo

| Campo | Valor              |
| ----- | ------------------ |
| Email | `demo@example.com` |
| Senha | `password`         |

Apenas para avaliação local. Não são credenciais reais.

---

## Autenticação

- Registro/login retornam `token` (access, Sanctum) e `refresh_token` (opaco, armazenado com hash).
- Access token: curto (padrão 60 min). Refresh token: longo (padrão 30 dias). Ambos configuráveis via `.env`.
- Endpoints privados: header `Authorization: Bearer {token}`.
- `POST /api/refresh` rotaciona o par de tokens (refresh antigo deixa de valer).
- Logout revoga o access token atual e o refresh associado.
- Senhas usam hash do Laravel; nunca são retornadas na API.

---

## Endpoints

### Públicos

| Método | Path              | Descrição                      |
| ------ | ----------------- | ------------------------------ |
| POST   | `/api/register`   | Cadastro + wallet inicial      |
| POST   | `/api/login`      | Login                          |
| POST   | `/api/refresh`    | Renova access + refresh tokens |
| GET    | `/api/market/btc` | Preço fake do BTC              |

### Autenticados (`auth:sanctum`)

| Método | Path                     | Descrição                  |
| ------ | ------------------------ | -------------------------- |
| GET    | `/api/me`                | Usuário autenticado        |
| POST   | `/api/logout`            | Revoga access + refresh    |
| GET    | `/api/wallet`            | Carteira do usuário        |
| POST   | `/api/trade/buy`         | Compra BTC com BRL         |
| POST   | `/api/trade/sell`        | Vende BTC por BRL          |
| GET    | `/api/transactions`      | Histórico (paginado)       |
| GET    | `/api/transactions/{id}` | Detalhe de uma transaction |

### Exemplos

**Register** — `201`

```http
POST /api/register
Content-Type: application/json

{
  "name": "Nome",
  "email": "nome@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

```json
{
  "message": "Usuário registrado com sucesso.",
  "token": "...",
  "refresh_token": "...",
  "user": {
    "id": 1,
    "name": "Nome",
    "email": "nome@example.com",
    "created_at": "2026-08-08T18:00:00+00:00"
  }
}
```

**Login** — `200`

```http
POST /api/login
Content-Type: application/json

{
  "email": "demo@example.com",
  "password": "password"
}
```

```json
{
  "message": "Login realizado com sucesso.",
  "token": "...",
  "refresh_token": "...",
  "user": {
    "id": 1,
    "name": "Demo",
    "email": "demo@example.com",
    "created_at": "2026-08-08T18:00:00+00:00"
  }
}
```

**Refresh** — `200`

```http
POST /api/refresh
Content-Type: application/json

{
  "refresh_token": "..."
}
```

```json
{
  "token": "...",
  "refresh_token": "..."
}
```

Refresh inválido/expirado/reutilizado → `422`.

**Me** — `200`

```http
GET /api/me
Authorization: Bearer {token}
```

```json
{
  "data": {
    "id": 1,
    "name": "Demo",
    "email": "demo@example.com",
    "created_at": "2026-08-08T18:00:00+00:00"
  }
}
```

**Logout** — `200`

```http
POST /api/logout
Authorization: Bearer {token}
```

```json
{
  "message": "Logout realizado com sucesso."
}
```

**Wallet** — `200`

```http
GET /api/wallet
Authorization: Bearer {token}
```

```json
{
  "data": {
    "id": 1,
    "brl_balance": "10000.00",
    "btc_balance": "0.00000000",
    "total_balance_brl": "10000.00",
    "updated_at": "2026-08-08T18:00:00+00:00"
  }
}
```

`total_balance_brl` = `brl_balance` + (`btc_balance` × cotação atual).

**Market** — `200`

```http
GET /api/market/btc
```

```json
{
  "data": {
    "symbol": "BTC",
    "price": "250123.45",
    "changePercent24h": 2.45,
    "currency": "BRL",
    "expires_at": "2026-08-08T18:35:20Z"
  }
}
```

`expires_at` e `changePercent24h` vêm do mesmo payload armazenado no Redis junto com o preço (mesmo ciclo de vida do TTL).

**Buy** (`amount` = BRL; `expected_price` = cotação visualizada pelo usuário) — `201`

```http
POST /api/trade/buy
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": "1000.00",
  "expected_price": "250123.45"
}
```

```json
{
  "data": {
    "id": 1,
    "type": "BUY",
    "btc_amount": "0.00399800",
    "brl_amount": "1000.00",
    "btc_price": "250123.45",
    "created_at": "2026-08-08T18:00:00+00:00"
  }
}
```

**Sell** (`amount` = BTC; `expected_price` = cotação visualizada pelo usuário) — `201`

```http
POST /api/trade/sell
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": "0.00200000",
  "expected_price": "250123.45"
}
```

```json
{
  "data": {
    "id": 2,
    "type": "SELL",
    "btc_amount": "0.00200000",
    "brl_amount": "500.25",
    "btc_price": "250123.45",
    "created_at": "2026-08-08T18:01:00+00:00"
  }
}
```

**Transactions** (opcional: `?type=BUY|SELL`, paginação Laravel) — `200`

```http
GET /api/transactions
Authorization: Bearer {token}
```

```json
{
  "data": [
    {
      "id": 2,
      "type": "SELL",
      "btc_amount": "0.00200000",
      "brl_amount": "500.25",
      "btc_price": "250123.45",
      "created_at": "2026-08-08T18:01:00+00:00"
    }
  ],
  "links": {
    "first": "/transactions?page=1",
    "last": "/transactions?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "path": "/transactions",
    "per_page": 15,
    "total": 1
  }
}
```

**Transaction show** — `200`

```http
GET /api/transactions/1
Authorization: Bearer {token}
```

```json
{
  "data": {
    "id": 1,
    "type": "BUY",
    "btc_amount": "0.00399800",
    "brl_amount": "1000.00",
    "btc_price": "250123.45",
    "created_at": "2026-08-08T18:00:00+00:00"
  }
}
```

**Erro de saldo** — `422`

```json
{
  "message": "Saldo em BRL insuficiente."
}
```

(ou `"Saldo em BTC insuficiente."` na venda)

**Preço alterado** — `409`

```json
{
  "message": "O preço do Bitcoin foi atualizado.",
  "data": {
    "previous_price": "292713.37",
    "current_price": "295428.91"
  }
}
```

---

## Fluxos financeiros

### Buy

```text
amount (BRL) + expected_price → preço Redis/serviço → compara expected_price
→ se diferente: 409 (sem mutação) → se igual: DB::transaction
→ wallet lockForUpdate → valida BRL → btc = brl / current_price
→ debita BRL → credita BTC → registra BUY (btc_price = current_price) → commit
```

### Sell

```text
amount (BTC) + expected_price → preço Redis/serviço → compara expected_price
→ se diferente: 409 (sem mutação) → se igual: DB::transaction
→ wallet lockForUpdate → valida BTC → brl = btc * current_price
→ debita BTC → credita BRL → registra SELL (btc_price = current_price) → commit
```

Escalas: BRL/preço = 2 casas; BTC = 8 casas. Saldos negativos são rejeitados.

---

## Price consistency

O preço simulado do BTC fica em cache Redis com TTL curto. O mobile envia, em buy/sell, o preço que o usuário visualizou e confirmou como `expected_price`.

O backend:

- obtém a cotação atual via `BitcoinPriceService` (fonte da verdade);
- compara `expected_price` com essa cotação usando BCMath (`Money::compare`, escala 2);
- **nunca** usa `expected_price` para calcular BTC/BRL nem para gravar `btc_price`;
- se os preços diferirem, responde HTTP `409` com `previous_price` e `current_price`, sem alterar wallet nem criar transaction;
- o cliente deve consultar a nova cotação e pedir confirmação novamente.

`expected_price` é input não confiável: enviar um valor artificialmente baixo (ex.: `1.00`) apenas gera `409` enquanto a cotação do servidor for outra.

---

## Redis

- Driver de cache padrão em produção/Docker: `redis`
- Chave: `market:btc:price` (`config/bitcoin.php`)
- TTL: 10 segundos
- Payload: `{ "price": "250123.45", "changePercent24h": 2.45, "expires_at": "2026-08-08T18:35:20Z" }`
- Range: R$ 200.000,00 – R$ 300.000,00
- `changePercent24h`: simulado entre -5 e +5

`BitcoinPriceService` centraliza geração e cache. Futuramente pode receber um provider externo sem alterar controllers.

---

## CORS

`config/cors.php` libera `api/*` com origins `*`, adequado a token Bearer no React Native (sem cookies). Não há IP pessoal hardcoded.

---

## Mobile

```bash
cd mobile
npm install
npx expo start
```

Configure `EXPO_PUBLIC_API_URL` apontando para a API (ex.: `http://<IP-da-rede>:8000/api`).

---

## Variáveis relevantes (`.env`)

| Variável                            | Exemplo                   |
| ----------------------------------- | ------------------------- |
| `DB_CONNECTION`                     | `pgsql`                   |
| `DB_HOST`                           | `127.0.0.1` ou `postgres` |
| `CACHE_STORE`                       | `redis`                   |
| `REDIS_HOST`                        | `127.0.0.1` ou `redis`    |
| `BITCOIN_PRICE_CACHE_TTL`           | `10`                      |
| `WALLET_INITIAL_BRL`                | `10000.00`                |
| `SANCTUM_ACCESS_TOKEN_EXPIRATION`   | `60` (minutos)            |
| `SANCTUM_REFRESH_TOKEN_EXPIRATION`  | `43200` (minutos)         |
