import { NextApiRequest, NextApiResponse } from 'next';
import { getJobs, saveJobs, getAppointments } from '../../../../lib/mockDataCache';
import { Job, JobStatus, JobType, Appointment } from '@/types/customer';
import { DateTime } from 'luxon';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { customer_id, scheduled_start, scheduled_end, job_type, duration, notes } = req.body;

    // Validate request payload
    if (!customer_id || !scheduled_start || !scheduled_end || !job_type || !duration) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Parse and convert the start and end times to UTC
    const requestedStart = DateTime.fromISO(scheduled_start, { zone: 'America/New_York' }).toUTC();
    const requestedEnd = DateTime.fromISO(scheduled_end, { zone: 'America/New_York' }).toUTC();

    if (!requestedStart.isValid || !requestedEnd.isValid) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    // Fetch current jobs and appointments from storage
    const jobs: Job[] = getJobs();
    const appointments: Appointment[] = getAppointments();

    // Check availability by ensuring no overlap with existing bookings
    const allBookings = [...appointments, ...jobs];
    const isAvailable = allBookings
      .filter((booking) => booking.jobType === job_type) // Only consider bookings of the same job_type
      .every((booking) => {
        const bookingStart = DateTime.fromISO(booking.scheduled_start).toUTC().toMillis();
        const bookingEnd = DateTime.fromISO(booking.scheduled_end).toUTC().toMillis();
        return bookingStart >= requestedEnd.toMillis() || bookingEnd <= requestedStart.toMillis();
      });

    if (!isAvailable) {
      return res.status(409).json({ success: false, message: 'Time slot is unavailable' });
    }

    // Assign an employee based on the job type
    let employeeId = '';
    switch (job_type) {
      case JobType.ELECTRICAL:
        employeeId = 'employee_1';
        break;
      case JobType.HVAC:
        employeeId = 'employee_2';
        break;
      case JobType.PLUMBING:
        employeeId = 'employee_3';
        break;
      default:
        return res.status(400).json({ success: false, message: 'Invalid job type' });
    }

    // Create the new job object
    const newJob: Job = {
      id: `job_${Date.now()}`,
      customer_id,
      jobType: job_type,
      status: JobStatus.SCHEDULED,
      scheduled_start: requestedStart.toISO(), // Store in ISO format
      scheduled_end: requestedEnd.toISO(),
      duration,
      notes,
      created_at: DateTime.now().toUTC().toISO(),
      updated_at: DateTime.now().toUTC().toISO(),
      assigned_employees: [employeeId],
    };

    // Add the new job to the in-memory cache
    jobs.push(newJob);

    // Persist the updated jobs list to the file system
    saveJobs(jobs);

    res.status(201).json({ success: true, job: newJob });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
