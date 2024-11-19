import { NextApiRequest, NextApiResponse } from 'next';
import { Appointment, Job, JobType } from '@/types/customer';
import { getJobs, getAppointments } from '../../../../lib/mockDataCache';
import { DateTime } from 'luxon';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { start, end, job_type } = req.query;

  if (!start || !end || !job_type) {
    return res.status(400).json({ success: false, message: 'Missing required query parameters' });
  }

  // Parse the start and end times into UTC
  const requestedStart = DateTime.fromISO(start as string, { zone: 'America/New_York' }).toUTC();
  const requestedEnd = DateTime.fromISO(end as string, { zone: 'America/New_York' }).toUTC();

  if (!requestedStart.isValid || !requestedEnd.isValid) {
    return res.status(400).json({ success: false, message: 'Invalid date format' });
  }

  const jobType = job_type as JobType;

  // Read appointments and jobs data
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
  for (
    let currentDate = requestedStart.startOf('day');
    currentDate <= requestedEnd.startOf('day');
    currentDate = currentDate.plus({ days: 1 })
  ) {
    const dayKey = currentDate.toISODate(); // Format as YYYY-MM-DD
    unavailableSlotsByDate[dayKey] = [];

    // Generate hourly slots for the day
    for (let hour = workingHoursStart; hour < workingHoursEnd; hour++) {
      const slotStart = currentDate.set({ hour, minute: 0, second: 0 }).toUTC();
      const slotEnd = slotStart.plus({ hours: 1 }); // Slot end is 1 hour after slot start

      // Check if any booking overlaps with the slot
      const isUnavailable = relevantBookings.some((booking) => {
        const bookingStart = DateTime.fromISO(booking.scheduled_start).toUTC();
        const bookingEnd = DateTime.fromISO(booking.scheduled_end).toUTC();

        return bookingStart < slotEnd && bookingEnd > slotStart;
      });

      // If slot is unavailable, add it to the list for the day
      if (isUnavailable) {
        unavailableSlotsByDate[dayKey].push(slotStart.toFormat('HH:mm')); // "HH:mm" format
      }
    }
  }

  // Return the response
  res.status(200).json({
    success: true,
    unavailable_slots: unavailableSlotsByDate,
  });
}
