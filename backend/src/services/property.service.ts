import { query } from '../db/pool';
import { AppError } from '../utils/errors';

type PropertyInput = {
  title: string;
  description: string;
  city: string;
  location: string;
  propertyType: string;
  price: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  areaSqft: number;
  images: string[];
};

const selectFields = `
  p.id, p.owner_id AS "ownerId", p.title, p.description, p.city, p.location,
  p.property_type AS "propertyType", p.price, p.bedrooms, p.bathrooms,
  p.area_sqft AS "areaSqft", p.images, p.status, p.created_at AS "createdAt",
  p.updated_at AS "updatedAt", u.name AS "ownerName"
`;

export async function createProperty(ownerId: string, input: PropertyInput) {
  const result = await query(
    `INSERT INTO properties
      (owner_id, title, description, city, location, property_type, price,
       bedrooms, bathrooms, area_sqft, images)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     RETURNING id`,
    [
      ownerId, input.title, input.description, input.city, input.location,
      input.propertyType, input.price, input.bedrooms ?? null,
      input.bathrooms ?? null, input.areaSqft, input.images
    ]
  );
  return getProperty(result.rows[0].id);
}

export async function updateProperty(id: string, ownerId: string, input: PropertyInput) {
  const result = await query(
    `UPDATE properties
     SET title=$1, description=$2, city=$3, location=$4, property_type=$5,
         price=$6, bedrooms=$7, bathrooms=$8, area_sqft=$9, images=$10
     WHERE id=$11 AND owner_id=$12
     RETURNING id`,
    [
      input.title, input.description, input.city, input.location,
      input.propertyType, input.price, input.bedrooms ?? null,
      input.bathrooms ?? null, input.areaSqft, input.images, id, ownerId
    ]
  );

  if (!result.rowCount) throw new AppError('Property not found or not owned by you', 404, 'NOT_FOUND');
  return getProperty(id);
}

export async function deleteProperty(id: string, ownerId: string) {
  const result = await query(
    `DELETE FROM properties WHERE id=$1 AND owner_id=$2 RETURNING id`,
    [id, ownerId]
  );
  if (!result.rowCount) throw new AppError('Property not found or not owned by you', 404, 'NOT_FOUND');
}

export async function getProperty(id: string) {
  const result = await query(
    `SELECT ${selectFields}
     FROM properties p
     JOIN users u ON u.id = p.owner_id
     WHERE p.id = $1`,
    [id]
  );
  const property = result.rows[0];
  if (!property) throw new AppError('Property not found', 404, 'NOT_FOUND');
  return property;
}

function encodeCursor(data: { createdAt?: string; price?: number; id: string }) {
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

function decodeCursor(cursor?: string): 
  | { createdAt?: string; price?: number; id: string } 
  | null {
  if (!cursor) return null;
  try {
    return JSON.parse(Buffer.from(cursor, 'base64url').toString());
  } catch {
    throw new AppError('Invalid pagination cursor', 400, 'INVALID_CURSOR');
  }
}

export async function listProperties(filters: {
  search?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  bedrooms?: number;
  ownerId?: string;
  sort: 'newest' | 'price_asc' | 'price_desc';
  limit: number;
  cursor?: string;
}) {
  const values: unknown[] = [];
  const where: string[] = [`p.status = 'ACTIVE'`];

  const add = (value: unknown) => {
    values.push(value);
    return `$${values.length}`;
  };

  if (filters.search) {
    const x = add(`%${filters.search}%`);
    where.push(`(p.city ILIKE ${x} OR p.location ILIKE ${x} OR p.title ILIKE ${x})`);
  }
  if (filters.city) where.push(`p.city = ${add(filters.city)}`);
  if (filters.minPrice !== undefined) where.push(`p.price >= ${add(filters.minPrice)}`);
  if (filters.maxPrice !== undefined) where.push(`p.price <= ${add(filters.maxPrice)}`);
  if (filters.propertyType) where.push(`p.property_type = ${add(filters.propertyType)}`);
  if (filters.bedrooms !== undefined) where.push(`p.bedrooms = ${add(filters.bedrooms)}`);

   if (filters.ownerId) {where.push(`p.owner_id = ${add(filters.ownerId)}`);
  }
  

   const cursor = decodeCursor(filters.cursor);

  let order = 'p.created_at DESC, p.id DESC';
  if (filters.sort === 'price_asc') order = 'p.price ASC, p.id ASC';
  if (filters.sort === 'price_desc') order = 'p.price DESC, p.id DESC';

  // ✅ Cursor handling based on sort type
  if (cursor) {
    if (filters.sort === 'newest' && cursor.createdAt) {
      where.push(`(p.created_at, p.id) < (${add(cursor.createdAt)}, ${add(cursor.id)})`);
    } else if (filters.sort === 'price_asc' && cursor.price !== undefined) {
      where.push(`(p.price, p.id) > (${add(cursor.price)}, ${add(cursor.id)})`);
    } else if (filters.sort === 'price_desc' && cursor.price !== undefined) {
      where.push(`(p.price, p.id) < (${add(cursor.price)}, ${add(cursor.id)})`);
    }
  }

  const limitParam = add(filters.limit + 1);

  const result = await query(
    `SELECT ${selectFields}
     FROM properties p
     JOIN users u ON u.id = p.owner_id
     WHERE ${where.join(' AND ')}
     ORDER BY ${order}
     LIMIT ${limitParam}`,
    values
  );

  const hasMore = result.rows.length > filters.limit;
  const rows = hasMore ? result.rows.slice(0, filters.limit) : result.rows;
  
  // ✅ Cursor based on sort type
  let nextCursor: string | null = null;
  if (hasMore) {
    const last = rows[rows.length - 1];
    if (filters.sort === 'newest') {
      nextCursor = encodeCursor({ createdAt: last.createdAt, id: last.id });
    } else if (filters.sort === 'price_asc' || filters.sort === 'price_desc') {
      nextCursor = encodeCursor({ price: last.price, id: last.id });
    }
  }

  return { items: rows, nextCursor };
}

export async function similarProperties(propertyId: string) {
  const base = await getProperty(propertyId);

  const result = await query(
    `SELECT ${selectFields},
      (
        CASE WHEN p.city = $2 THEN 50 ELSE 0 END +
        CASE WHEN p.property_type = $3 THEN 25 ELSE 0 END +
        CASE WHEN p.bedrooms IS NOT DISTINCT FROM $4 THEN 15
             WHEN p.bedrooms IS NOT NULL AND $4 IS NOT NULL AND ABS(p.bedrooms - $4) = 1 THEN 8
             ELSE 0 END +
        CASE WHEN p.price BETWEEN $5 * 0.8 AND $5 * 1.2 THEN 10 ELSE 0 END
      ) AS similarity_score
     FROM properties p
     JOIN users u ON u.id = p.owner_id
     WHERE p.id <> $1
       AND p.status = 'ACTIVE'
       AND p.city = $2
       AND p.price BETWEEN $5 * 0.5 AND $5 * 1.5
     ORDER BY similarity_score DESC, p.created_at DESC
     LIMIT 6`,
    [propertyId, base.city, base.propertyType, base.bedrooms, base.price]
  );

  return result.rows;
}
