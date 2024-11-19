import { NextApiRequest, NextApiResponse } from 'next';
import { getJobs, getAppointments, saveJobs, saveAppointments } from '../../../lib/mockDataCache';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query;
    const { scheduled_start, scheduled_end, status, notes } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }

    const jobs = getJobs();
    const appointments = getAppointments();

    // Find the job to update
    const jobIndex = jobs.findIndex((job) => job.id === id);
    if (jobIndex === -1) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Update the job fields
    const updatedJob = { ...jobs[jobIndex] };
    if (scheduled_start) updatedJob.scheduled_start = scheduled_start;
    if (scheduled_end) updatedJob.scheduled_end = scheduled_end;
    if (status) updatedJob.status = status;
    if (notes) updatedJob.notes = notes;
    updatedJob.updated_at = new Date().toISOString();

    // Replace the job in the list
    jobs[jobIndex] = updatedJob;

    // Find the corresponding appointment and update it
    const appointmentIndex = appointments.findIndex((appt) => appt.job_id === id);
    if (appointmentIndex !== -1) {
      const updatedAppointment = { ...appointments[appointmentIndex] };
      if (scheduled_start) updatedAppointment.scheduled_start = scheduled_start;
      if (scheduled_end) updatedAppointment.scheduled_end = scheduled_end;
      updatedAppointment.updated_at = new Date().toISOString();

      // Replace the appointment in the list
      appointments[appointmentIndex] = updatedAppointment;
    }

    // Save changes to both jobs and appointments
    saveJobs(jobs);
    saveAppointments(appointments);

    return res.status(200).json({ success: true, job: updatedJob });
  } else {
    res.setHeader('Allow', ['PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
