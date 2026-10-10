import { RequestHandler } from 'express';
import { createInquiry } from '../services/inquiry.service';

export const create: RequestHandler = async (req, res) => {
 const inquiry = await createInquiry(String(req.params.propertyId), req.user!.id, req.body.message);
};
