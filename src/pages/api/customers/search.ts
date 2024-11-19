// src/pages/api/customers/search.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { Customer } from '@/types/customer';
import { getCustomers } from '../../../../lib/mockDataCache';

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Customer[] | { error: string }>
) {
  try {
    const { email, phone, name, address } = req.query;

    const customers = getCustomers();

    // Normalize and filter based on query params
    const normalizedEmail = email?.toString().trim().toLowerCase();
    const normalizedPhone = phone?.toString().trim();
    const normalizedName = name?.toString().trim().toLowerCase();
    const normalizedAddress = address?.toString().trim().toLowerCase();

    let results = customers;

    if (normalizedEmail) {
      results = results.filter((c) =>
        c.email.toLowerCase().includes(normalizedEmail)
      );
    }

    if (normalizedPhone) {
      results = results.filter((c) => c.phone === normalizedPhone);
    }
    if (normalizedName) {
      results = results.filter((c) =>
        c.name.toLowerCase().includes(normalizedName)
      );
    }
    if (normalizedAddress) {
      results = results.filter((c) =>
        c.address.toLowerCase().includes(normalizedAddress)
      );
    }

    res.status(200).json(results);
  } catch (error) {
    console.error('Error in /api/customers/search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
