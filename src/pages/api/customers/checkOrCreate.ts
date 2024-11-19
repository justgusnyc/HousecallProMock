import { NextApiRequest, NextApiResponse } from 'next';
import { Customer } from '@/types/customer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { refreshMockDataIfStale } from '../../../../lib/mockDataCache';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'customers.json');

refreshMockDataIfStale();

function readCustomers(): Customer[] {
  const data = fs.readFileSync(dataFilePath, 'utf8');
  return JSON.parse(data);
}

function writeCustomers(customers: Customer[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(customers, null, 2));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, phone, address, email } = req.body;

    const customers = readCustomers();
    const existingCustomer = customers.find((customer) => customer.email.toLowerCase() === email.toLowerCase());

    if (existingCustomer) {
      let updated = false;
      if (name && existingCustomer.name !== name) {
        existingCustomer.name = name;
        updated = true;
      }
      if (phone && existingCustomer.phone !== phone) {
        existingCustomer.phone = phone;
        updated = true;
      }
      if (address && existingCustomer.address !== address) {
        existingCustomer.address = address;
        updated = true;
      }

      if (updated) {
        writeCustomers(customers);
        return res.status(200).json({ success: true, message: 'Customer updated and submitted', customer: existingCustomer });
      } else {
        return res.status(200).json({ success: true, message: 'No Change', customer: existingCustomer });
      }
    } else {
      const newCustomer = { id: uuidv4(), name, phone, address, email };
      customers.push(newCustomer);
      writeCustomers(customers);
      return res.status(201).json({ success: true, message: 'New customer created and submitted', customer: newCustomer });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
