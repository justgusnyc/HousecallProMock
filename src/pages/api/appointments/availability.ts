import { NextApiRequest, NextApiResponse } from 'next';
import { Appointment, Job, JobType } from '@/types/customer';
import { getJobs, getAppointments } from '../../../../lib/mockDataCache';

// Ensure mock data is up to date
// refreshMockDataIfStale();

// Helper function to parse a date string and return a Date object in EST by subtracting 5 hours
function parseDateToEST(dateString: string): Date {
  const date = new Date(dateString);
  date.setHours(date.getHours() - 5); // Adjust to EST
  return date;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { start, end, job_type } = req.query;

  if (!start || !end || !job_type) {
    return res.status(400).json({ success: false, message: 'Missing required query parameters' });
  }

  const requestedStart = parseDateToEST(start as string);
  const requestedEnd = parseDateToEST(end as string);
  const jobType = job_type as JobType;

  if (isNaN(requestedStart.getTime()) || isNaN(requestedEnd.getTime())) {
    return res.status(400).json({ success: false, message: 'Invalid date format' });
  }

  // // Read appointments and jobs data
  const appointments: Appointment[] = getAppointments();
  const jobs: Job[] = getJobs();

  // Filter bookings by the requested job type
  const relevantBookings = [...appointments, ...jobs].filter(
    (booking) => booking.jobType === jobType
  );

  // Initialize an object to hold unavailable slots by date
  const unavailableSlotsByDate: Record<string, string[]> = {};
  const workingHoursStart = 9;
  const workingHoursEnd = 18;

  // Loop through each day in the specified range
  for (let date = new Date(requestedStart); date <= requestedEnd; date.setDate(date.getDate() + 1)) {
    const day = parseDateToEST(date.toISOString());
    const dayKey = day.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    unavailableSlotsByDate[dayKey] = [];

    // Generate hourly slots for the day
    for (let hour = workingHoursStart; hour < workingHoursEnd; hour++) {
      const slotStart = new Date(day);
      slotStart.setHours(hour, 0, 0, 0);
      slotStart.setHours(slotStart.getHours() - 5); // Adjust slotStart to EST

      const slotEnd = new Date(slotStart);
      slotEnd.setHours(slotEnd.getHours() + 1); // Slot end is 1 hour after slot start

      // Check if any booking overlaps with the slot
      const isUnavailable = relevantBookings.some((booking) => {
        const bookingStart = parseDateToEST(booking.scheduled_start);
        const bookingEnd = parseDateToEST(booking.scheduled_end);

        return bookingStart < slotEnd && bookingEnd > slotStart;
      });

      // If slot is unavailable, add it to the list for the day
      if (isUnavailable) {
        unavailableSlotsByDate[dayKey].push(slotStart.toISOString().slice(11, 16)); // "HH:mm" format
      }
    }
  }

  // Return the response
  res.status(200).json({
    success: true,
    unavailable_slots: unavailableSlotsByDate,
  });
}
