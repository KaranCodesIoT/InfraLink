# InfraLink Backend

> AI-powered construction hiring marketplace — Node.js/Express REST API backend.

## Tech Stack

- **Runtime**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Cache / Queues**: Redis + Bull
- **AI**: Google Gemini API
- **Real-time**: Socket.IO
- **Storage**: Cloudinary
- **Payments**: Razorpay / Stripe
- **Docs**: Swagger / OpenAPI
- **Containerisation**: Docker + docker-compose

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MongoDB ≥ 6
- Redis ≥ 7

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/your-org/infralink-backend.git
cd infralink-backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Fill in all values in .env

# 4. Run in development
npm run dev
```

### Docker

```bash
docker-compose up --build
```

## Project Structure

See the `docs/api.md` for the module breakdown and API overview.

## Testing

```bash
npm test               # all tests
npm run test:unit      # unit tests only
npm run test:integration  # integration tests only
```

## Scripts

```bash
npm run seed    # seed database with demo data
npm run reset   # wipe the database
```

## API Docs

Available at `http://localhost:5000/api-docs` when `SWAGGER_ENABLED=true`.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md).
