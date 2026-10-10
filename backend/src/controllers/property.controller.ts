import { RequestHandler } from 'express';
import * as service from '../services/property.service';

export const create: RequestHandler = async (req, res) => {
  const property = await service.createProperty(req.user!.id, req.body);
  res.status(201).json({ success: true, data: property });
};

export const update: RequestHandler = async (req, res) => {
  const property = await service.updateProperty(String(req.params.id), req.user!.id, req.body);
  res.json({ success: true, data: property });
};

export const remove: RequestHandler = async (req, res) => {
  await service.deleteProperty(String(req.params.id), req.user!.id);
  res.status(204).send();
};

export const getOne: RequestHandler = async (req, res) => {
  const property = await service.getProperty(String(req.params.id));
  res.json({ success: true, data: property });
};

export const list: RequestHandler = async (req, res) => {
  const result = await service.listProperties(req.query as any);
  res.json({ success: true, data: result });
};

export const similar: RequestHandler = async (req, res) => {
  const result = await service.similarProperties(String(req.params.id));
  res.json({ success: true, data: result });
};