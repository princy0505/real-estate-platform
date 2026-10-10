import { query } from '../db/pool';
import { AppError } from '../utils/errors';

export async function createInquiry(propertyId: string, userId: string, message: string) {
  const property = await query<{ owner_id: string }>(
    `SELECT owner_id FROM properties WHERE id = $1 AND status = 'ACTIVE'`,
    [propertyId]
  );
  if (!property.rowCount) throw new AppError('Property not found', 404, 'NOT_FOUND');

  if (property.rows[0].owner_id === userId) {
    throw new AppError('You cannot inquire about your own property', 400, 'INVALID_INQUIRY');
  }

  try {
    const result = await query(
      `INSERT INTO inquiries (property_id, user_id, message)
       VALUES ($1, $2, $3)
       RETURNING id, property_id AS "propertyId", user_id AS "userId",
                 message, created_at AS "createdAt"`,
      [propertyId, userId, message]
    );
    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') {
      throw new AppError('You have already sent an inquiry for this property', 409, 'DUPLICATE_INQUIRY');
    }
    throw error;
  }
}
