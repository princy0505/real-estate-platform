import { RequestHandler } from 'express';
import * as auth from '../services/auth.service';

export const register: RequestHandler = async (req, res) => {
  const result = await auth.register(req.body.name, req.body.email, req.body.password);
  res.status(201).json({ success: true, data: result });
};

export const login: RequestHandler = async (req, res) => {
  const result = await auth.login(req.body.email, req.body.password);
  res.json({ success: true, data: result });
};

export const refresh: RequestHandler = async (req, res) => {
  const result = await auth.refresh(req.body.refreshToken);
  res.json({ success: true, data: result });
};
