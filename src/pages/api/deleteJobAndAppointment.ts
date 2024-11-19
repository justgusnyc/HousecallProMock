import { NextApiRequest, NextApiResponse } from 'next';
import { getJobs, getAppointments, saveJobs, saveAppointments } from '../../../lib/mockDataCache';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }

    const jobs = getJobs();
    const appointments = getAppointments();

    // Find and remove the job
    const jobIndex = jobs.findIndex((job) => job.id === id);
    if (jobIndex === -1) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    jobs.splice(jobIndex, 1);

    // Find and remove the corresponding appointment(s)
    const updatedAppointments = appointments.filter((appt) => appt.job_id !== id);

    // Save changes to both jobs and appointments
    saveJobs(jobs);
    saveAppointments(updatedAppointments);

    return res.status(200).json({ success: true, message: 'Job and corresponding appointment deleted successfully' });
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
