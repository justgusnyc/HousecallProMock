import { NextApiRequest, NextApiResponse } from 'next';
import { Appointment, Job, JobType } from '@/types/customer';
import { getJobs, getAppointments } from '../../../../lib/mockDataCache';
import { DateTime } from 'luxon';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { start, end, job_type } = req.query;

  if (!start || !end || !job_type) {
    return res.status(400).json({ success: false, message: 'Missing required query parameters' });
  }

  // Parse start and end times with the correct time zone
  const requestedStart = DateTime.fromISO(start as string, { setZone: true });
  const requestedEnd = DateTime.fromISO(end as string, { setZone: true });

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
    const dayKey = currentDate.toISODate(); // 'YYYY-MM-DD' in the user's time zone
    unavailableSlotsByDate[dayKey] = [];

    // Generate hourly slots for the day
    for (let hour = workingHoursStart; hour < workingHoursEnd; hour++) {
      const slotStart = currentDate.set({ hour, minute: 0, second: 0 });
      const slotEnd = slotStart.plus({ hours: 1 });

      // Convert slot times to UTC for comparison
      const slotStartUTC = slotStart.toUTC();
      const slotEndUTC = slotEnd.toUTC();

      // Check if any booking overlaps with the slot
      const isUnavailable = relevantBookings.some((booking) => {
        const bookingStartUTC = DateTime.fromISO(booking.scheduled_start).toUTC();
        const bookingEndUTC = DateTime.fromISO(booking.scheduled_end).toUTC();

        return bookingStartUTC < slotEndUTC && bookingEndUTC > slotStartUTC;
      });

      // If slot is unavailable, add it to the list for the day
      if (isUnavailable) {
        unavailableSlotsByDate[dayKey].push(slotStart.toFormat('HH:mm')); // Time in user's time zone
      }
    }
  }

  // Return the response
  res.status(200).json({
    success: true,
    unavailable_slots: unavailableSlotsByDate,
  });
}
