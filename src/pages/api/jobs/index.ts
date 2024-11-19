// /api/jobs/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { Job } from '@/types/customer';


const jobsFilePath = path.join(process.cwd(), 'src', 'data', 'jobs.json');

function readJobs(): Job[] {
  const data = fs.readFileSync(jobsFilePath, 'utf8');
  return JSON.parse(data);
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { customer_id } = req.query;
  const jobs = readJobs();

  if (customer_id) {
    const customerJobs = jobs.filter(job => job.customer_id === customer_id);
    return res.status(200).json(customerJobs);
  }

  res.status(200).json(jobs);
}
