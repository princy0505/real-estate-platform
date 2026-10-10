# Real Estate Listing Platform

Full-stack technical assignment implementation using:

- Frontend: Next.js App Router + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL
- Auth: JWT access token + refresh token rotation
- API Docs: Swagger / OpenAPI at `/api-docs`

## Features

- User registration/login
- JWT authentication and protected APIs
- Property CRUD with owner authorization
- Search by city/location
- Budget, property type and bedroom filters
- Sorting + cursor pagination
- Similar-property recommendations
- Inquiry creation with duplicate prevention
- Rate limiting and validation
- SEO-friendly property pages with dynamic metadata
- PostgreSQL indexes for 50,000+ property records
- Centralized error handling
- Swagger documentation

## Architecture Decisions

### Database Indexing Strategy
- `idx_properties_filter_sort` — Composite (city, property_type, bedrooms, price, id) for filter + sort
- `idx_properties_created_cursor` — (created_at DESC, id DESC) for cursor pagination
- `idx_properties_active_city_price` — Partial index WHERE status = 'ACTIVE'
- `idx_properties_location_trgm` — GIN trigram for fuzzy location search
- `idx_inquiries_property_user` — UNIQUE for duplicate inquiry prevention

### Pagination
- **Cursor-based** (not offset) — O(log n) vs O(n)
- Supports newest, price_asc, price_desc sorts
- Encodes relevant fields (createdAt or price) + id in base64url

### Similar Properties Algorithm
Weighted score in SQL:
- Same city: +50
- Same property type: +25
- Same bedrooms: +15 (or ±1: +8)
- Price within ±20%: +10

### Authentication
- **Access token:** JWT, 7 days
- **Refresh token:** JWT, 30 days, SHA-256 hashed in DB
- **Rotation:** Old refresh token revoked on use
- **Reuse detection:** Revoked token reuse → all sessions revoked

### Inquiry Spam Prevention
1. UNIQUE(property_id, user_id) — DB-level
2. Rate limit: 10 / 15 min per IP
3. Self-inquiry block: Owner cannot inquire own property

### SEO Strategy
- **ISR:** revalidate = 60 on property detail
- **Metadata:** generateMetadata() with title + description
- **JSON-LD:** RealEstateListing schema for Google rich results

## Project structure

```text
real-estate-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── db/
│   │   ├── docs/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validators/
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── properties/
│   │   ├── dashboard/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── .env.local.example
│   ├── next.config.ts
│   ├── package.json
│   └── tsconfig.json
├── database/
│   ├── schema.sql
│   └── seed.sql
└── docker-compose.yml
```

## 1. Start PostgreSQL

```bash
docker compose up -d postgres
```

Or create a PostgreSQL database manually and run:

```bash
psql "$DATABASE_URL" -f database/schema.sql
psql "$DATABASE_URL" -f database/seed.sql
```

## 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs at `http://localhost:4000`.

Swagger: `http://localhost:4000/api-docs`

## 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

## Security decisions

- Passwords are hashed using bcrypt.
- Access tokens are short-lived JWTs.
- Refresh tokens are stored as hashes in PostgreSQL and rotated.
- Ownership is enforced at the database query/service layer.
- Zod validates request bodies/query parameters.
- Helmet adds security headers.
- CORS is restricted by configuration.
- Authentication and inquiry endpoints are rate-limited.
- Duplicate inquiries are blocked with a PostgreSQL unique constraint.

## Scalability decisions

The property table has indexes for:

- city
- location
- property type
- bedrooms
- price
- `(city, price)`
- `(city, property_type, bedrooms, price)`
- `(created_at DESC, id DESC)`

The listing endpoint uses cursor pagination instead of expensive deep `OFFSET` pagination.

For production, image files should be uploaded to object storage such as S3/Cloudinary and only URLs should be stored in PostgreSQL.

## Similarity algorithm

The backend recommends properties using:

1. Same city
2. Same property type
3. Bedroom proximity
4. Price proximity

The query is intentionally bounded and indexed so the recommendation query does not scan the entire property table.
