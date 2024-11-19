import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const newCustomer = req.body;
    // Add logic to validate and store the new customer (mock database)
    res.status(201).json({ success: true, customer: { ...newCustomer, id: 'new_id' } });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
