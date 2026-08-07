# Mini Binance

Aplicação mobile simplificada para simulação de compra e venda de Bitcoin, desenvolvida como teste técnico.

O projeto é composto por uma API REST desenvolvida com Laravel e uma aplicação mobile desenvolvida com React Native + Expo.

## Tecnologias

### Backend

- PHP
- Laravel
- PostgreSQL
- Laravel Sanctum
- Redis
- Docker

### Mobile

- React Native
- Expo
- Expo Router
- TypeScript
- NativeWind

---

## Estrutura do projeto

```text
.
├── backend/        # API REST Laravel
├── mobile/         # Aplicação React Native / Expo
├── docker-compose.yml
└── README.md
```

---

# Requisitos

## 1. Autenticação

A aplicação deve permitir:

- Cadastro de usuário
- Login
- Logout
- Proteção dos endpoints autenticados

A autenticação da API será realizada utilizando Laravel Sanctum.

---

## 2. Carteira

Cada usuário possui uma carteira individual.

Ao criar uma nova conta, a carteira deve iniciar com:

```text
BRL: R$ 10.000,00
BTC: 0 BTC
```

A carteira deve armazenar separadamente:

- Saldo em BRL
- Saldo em BTC

Endpoint:

```http
GET /api/wallet
```

---

## 3. Mercado Bitcoin

A aplicação deve disponibilizar o preço atual simulado do Bitcoin.

Endpoint:

```http
GET /api/market/btc
```

O preço deve ser dinâmico.

Como referência, o preço simulado pode variar entre:

```text
R$ 200.000,00
R$ 300.000,00
```

O Redis pode ser utilizado para manter temporariamente o preço atual do Bitcoin, evitando gerar um novo valor em cada requisição.

---

## 4. Compra de Bitcoin

O usuário deve conseguir converter parte do seu saldo BRL em BTC utilizando o preço atual do Bitcoin.

Endpoint:

```http
POST /api/trade/buy
```

Fluxo esperado:

```text
Usuário informa valor em BRL
        ↓
API obtém preço atual do BTC
        ↓
Valida saldo disponível
        ↓
Calcula quantidade de BTC
        ↓
Debita saldo BRL
        ↓
Credita saldo BTC
        ↓
Registra transação
```

A operação deve ser atômica.

Caso qualquer etapa falhe, nenhuma alteração parcial deve permanecer na carteira.

---

## 5. Venda de Bitcoin

O usuário deve conseguir vender BTC e receber o valor correspondente em BRL.

Endpoint:

```http
POST /api/trade/sell
```

Fluxo esperado:

```text
Usuário informa quantidade de BTC
        ↓
API obtém preço atual
        ↓
Valida saldo BTC
        ↓
Calcula valor em BRL
        ↓
Debita BTC
        ↓
Credita BRL
        ↓
Registra transação
```

A operação também deve ser atômica.

---

## 6. Histórico de transações

Todas as operações de compra e venda devem ser registradas.

Endpoint:

```http
GET /api/transactions
```

Cada transação deve armazenar informações como:

- Tipo da operação (`BUY` ou `SELL`)
- Quantidade de BTC
- Valor em BRL
- Preço do BTC no momento da operação
- Data e hora

---

# Concorrência e consistência

As operações financeiras devem garantir consistência mesmo quando múltiplas requisições forem realizadas simultaneamente.

Compra e venda devem utilizar transações de banco de dados.

A carteira deve ser bloqueada durante a operação para evitar condições de corrida.

Exemplo conceitual:

```php
DB::transaction(function () {
    // Wallet retrieved using lockForUpdate()
});
```

Isso evita situações em que duas operações simultâneas utilizem o mesmo saldo disponível.

---

# Banco de dados

A estrutura principal é composta pelas seguintes entidades:

```text
User
 │
 ├──── Wallet
 │
 └──── Transactions
```

## users

Responsável pelos dados e autenticação do usuário.

## wallets

Armazena:

```text
user_id
brl_balance
btc_balance
```

## transactions

Armazena:

```text
user_id
type
btc_amount
brl_amount
btc_price
created_at
```

Valores financeiros não devem utilizar tipos de ponto flutuante para persistência.

---

# Aplicação Mobile

O aplicativo deve possuir as principais áreas:

## Autenticação

- Login
- Cadastro

## Dashboard

Exibe:

- Saldo total
- Saldo em BRL
- Saldo em BTC
- Preço atual do Bitcoin
- Ações para compra e venda
- Transações recentes

## Compra

Permite:

- Informar valor em BRL
- Visualizar quantidade estimada de BTC
- Confirmar operação

## Venda

Permite:

- Informar quantidade de BTC
- Visualizar valor estimado em BRL
- Confirmar operação

## Histórico

Exibe as operações de compra e venda realizadas pelo usuário.

---

# Navegação Mobile

A aplicação utiliza Expo Router.

Estrutura principal:

```text
Root Stack
│
├── Auth
│   ├── Login
│   └── Register
│
└── Application
    │
    ├── Bottom Tabs
    │   ├── Home
    │   ├── Trade
    │   ├── Transactions
    │   └── Profile
    │
    ├── Buy Bitcoin
    ├── Sell Bitcoin
    ├── Trade Success
    └── Transaction Details
```

---

# Executando o projeto

## Pré-requisitos

É necessário possuir:

- Docker
- Docker Compose
- Node.js
- npm
- Expo Go ou Development Build

---

## Backend

Entre na pasta:

```bash
cd backend
```

Copie as variáveis de ambiente:

```bash
cp .env.example .env
```

Instale as dependências:

```bash
composer install
```

Gere a chave da aplicação:

```bash
php artisan key:generate
```

Execute as migrations:

```bash
php artisan migrate
```

Inicie o servidor:

```bash
php artisan serve
```

A API ficará disponível por padrão em:

```text
http://localhost:8000
```

---

## Mobile

Entre na pasta:

```bash
cd mobile
```

Instale as dependências:

```bash
npm install
```

Inicie o Expo:

```bash
npx expo start
```

Para limpar o cache:

```bash
npx expo start --clear
```

---

# Docker

O ambiente deverá disponibilizar os serviços necessários para execução da API, incluindo:

```text
Laravel
PostgreSQL
Redis
```

Para iniciar os containers:

```bash
docker compose up -d
```

Para encerrar:

```bash
docker compose down
```

---

# Testes

Os testes automatizados devem priorizar as regras financeiras da aplicação.

Principais cenários:

- Criação da carteira com saldo inicial correto
- Compra de BTC
- Atualização correta dos saldos após compra
- Bloqueio de compra com saldo BRL insuficiente
- Venda de BTC
- Atualização correta dos saldos após venda
- Bloqueio de venda com saldo BTC insuficiente
- Registro de transações
- Proteção de endpoints autenticados
- Consistência das operações financeiras

Para executar os testes do backend:

```bash
php artisan test
```

---

# Diferenciais implementados / planejados

- Redis para cache do preço do Bitcoin
- Testes automatizados
- Controle de concorrência nas operações financeiras
- Docker
- Arquitetura preparada para integração com uma fonte externa de preços
- Interface mobile responsiva e componentizada

---

# API

Resumo dos principais endpoints:

```text
POST   /api/register
POST   /api/login
POST   /api/logout

GET    /api/me

GET    /api/wallet

GET    /api/market/btc

POST   /api/trade/buy
POST   /api/trade/sell

GET    /api/transactions
```

Endpoints privados exigem autenticação.

---

# Critérios principais

A implementação prioriza:

1. Correção das regras de negócio
2. Consistência das operações financeiras
3. Organização e qualidade do código
4. Segurança básica
5. Clareza da arquitetura
6. Experiência de uso no aplicativo mobile
7. Facilidade de execução e avaliação do projeto
