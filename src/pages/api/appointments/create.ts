import { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';
import { getAppointments, refreshMockDataIfStale, saveAppointments } from '../../../../lib/mockDataCache';
import { Appointment, JobStatus, JobType } from '@/types/customer';

refreshMockDataIfStale();

// Helper function to parse a date string and return a Date object in EST
function parseDateToEST(dateString: string): Date {
  return new Date(new Date(dateString).toLocaleString('en-US', { timeZone: 'America/New_York' }));
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { job_id, customer_id, scheduled_start, scheduled_end, location, jobType } = req.body;

    const requestedStart = parseDateToEST(scheduled_start);
    const requestedEnd = parseDateToEST(scheduled_end);

    // Fetch the mock data
    const appointments: Appointment[] = getAppointments();

    // Assign an employee based on job type
    let employeeId = "";
    switch (jobType) {
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

    // Create a new appointment
    const newAppointment: Appointment = {
      id: uuidv4(),
      job_id,
      jobType,
      customer_id,
      scheduled_start: requestedStart.toISOString(),
      scheduled_end: requestedEnd.toISOString(),
      duration: (requestedEnd.getTime() - requestedStart.getTime()) / (1000 * 60), // Duration in minutes
      location,
      assigned_technician: employeeId,
      status: JobStatus.SCHEDULED,
      arrival_window_minutes: 10,
    };

    // Add the new appointment to the in-memory cache
    appointments.push(newAppointment);
    saveAppointments(appointments);

    res.status(201).json({ success: true, appointment: newAppointment });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
