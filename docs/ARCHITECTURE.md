# Architecture Notes

## Request flow

Browser -> Next.js -> Express API -> validation -> auth middleware -> service -> PostgreSQL.

## Authentication

Access token:
- JWT
- 15 minute default lifetime
- sent in `Authorization: Bearer <token>`

Refresh token:
- JWT
- 30 day default lifetime
- only its SHA-256 hash is persisted
- rotated on refresh
- previous token is revoked

For a high-security production browser application, an HttpOnly Secure SameSite refresh-token cookie is preferable to localStorage. This assignment keeps the implementation easy to run locally.

## Ownership

Update/delete queries include both `property_id` and `owner_id`, so knowing another property's ID is not enough to modify it.

## Duplicate inquiries

`UNIQUE(property_id, user_id)` makes duplicate prevention race-condition safe. Application-level checks alone are not sufficient.

## Pagination

Default listing pagination uses a cursor containing `(created_at, id)`. This avoids progressively expensive `OFFSET N` scans.

## Index strategy

Indexes are aligned to common filters and sort patterns. The partial active-listing index keeps the hot listing path smaller.

## Images

The database stores image URLs rather than binary image data. In production, upload images directly to object storage using signed URLs.

## SEO

The Next.js property detail route uses `generateMetadata()` and server rendering. A production deployment can use ISR/revalidation if listing freshness requirements allow it.
