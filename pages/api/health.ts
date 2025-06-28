// pages/api/health.ts
import { NextApiRequest, NextApiResponse } from 'next';

interface CustomNextApiRequest extends NextApiRequest {
  file?: any;
}

export default async function handler(
  req: CustomNextApiRequest,
  res: NextApiResponse
) {
  res.status(200).send({ status: true });
}
