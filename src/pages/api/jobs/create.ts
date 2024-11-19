import { NextApiRequest, NextApiResponse } from 'next';
import { getJobs, saveJobs, getAppointments } from '../../../../lib/mockDataCache';
import { Job, JobStatus, JobType, Appointment } from '@/types/customer';

// refreshMockDataIfStale();

// Helper function to parse a date string and return a Date object in EST
function parseDateToEST(dateString: string): Date {
  return new Date(new Date(dateString).toLocaleString('en-US', { timeZone: 'America/New_York' }));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { customer_id, scheduled_start, scheduled_end, job_type, duration, notes } = req.body;

    // Validate request payload
    if (!customer_id || !scheduled_start || !scheduled_end || !job_type || !duration) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const requestedStart = parseDateToEST(scheduled_start);
    const requestedEnd = parseDateToEST(scheduled_end);

    if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid date format' });
    }

    // Fetch current jobs and appointments from storage
    const jobs: Job[] = getJobs();
    const appointments: Appointment[] = getAppointments();

    // Check availability by ensuring no overlap with existing bookings
    const allBookings = [...appointments, ...jobs];
    // Check availability by filtering bookings for the same job type and ensuring no overlap
    const isAvailable = allBookings
      .filter((booking) => booking.jobType === job_type) // Only consider bookings of the same job_type
      .every((booking) => {
        const bookingStart = new Date(booking.scheduled_start).getTime();
        const bookingEnd = new Date(booking.scheduled_end).getTime();
        return bookingStart >= requestedEnd.getTime() || bookingEnd <= requestedStart.getTime();
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
      scheduled_start: requestedStart.toISOString(),
      scheduled_end: requestedEnd.toISOString(),
      duration,
      notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
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
