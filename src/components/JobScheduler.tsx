import { Customer, Job, JobType } from '@/types/customer';
import { useEffect, useState } from 'react';
import { useToast } from './toast/ToastContext';
import JobSchedulerCalendar from './JobSchedulerCalendar';

interface JobSchedulerProps {
  onScheduleJob: (jobDetails: { date: string; time: string }) => void;
  selectedCustomer: Customer | null;
  setBookedJob: (job: Job | null) => void;
}

export default function JobScheduler({
  onScheduleJob,
  selectedCustomer,
  setBookedJob,
}: JobSchedulerProps) {
  const [jobType, setJobType] = useState<JobType | null>(null);
  const [notes, setNotes] = useState('');
  const [unavailableSlots, setUnavailableSlots] = useState<Record<string, string[]>>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();



  const checkAvailability = async () => {
    const today = new Date();
    const startOfRange = new Date(today);
    startOfRange.setDate(today.getDate() + 1);

    const endOfRange = new Date(today);
    endOfRange.setDate(today.getDate() + 8);

    try {
      const res = await fetch(
        `/api/appointments/availability?start=${startOfRange.toISOString()}&end=${endOfRange.toISOString()}&job_type=${jobType}`
      );

      const data = await res.json();
      if (data.success) {
        setUnavailableSlots(data.unavailable_slots || {});
      } else {
        console.error("API Error:", data.message);
      }
    } catch (err) {
      console.error("Error fetching availability:", err);
    }
  };

  useEffect(() => {
    if (jobType) {
      checkAvailability();
    }
  }, [jobType]);

  const createJobAndAppointment = async () => {
    if (selectedDate && selectedTime && jobType && selectedCustomer) {
      const startDateTime = new Date(`${selectedDate}T${selectedTime}`);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(startDateTime.getHours() + 1);

      try {
        const jobRes = await fetch('/api/jobs/create', {
          method: 'POST',
          body: JSON.stringify({
            customer_id: selectedCustomer.id,
            scheduled_start: startDateTime.toISOString(),
            scheduled_end: endDateTime.toISOString(),
            job_type: jobType,
            duration: 60,
            notes,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const jobData = await jobRes.json();
        setBookedJob(jobData.job);

        if (jobData && jobData.job) {
          await fetch('/api/appointments/create', {
            method: 'POST',
            body: JSON.stringify({
              job_id: jobData.job.id,
              customer_id: selectedCustomer.id,
              scheduled_start: startDateTime.toISOString(),
              scheduled_end: endDateTime.toISOString(),
              location: selectedCustomer.address,
              jobType,
            }),
            headers: {
              'Content-Type': 'application/json',
            },
          });

          // const appointmentData = await appointmentRes.json();
          onScheduleJob({ date: selectedDate, time: selectedTime });
        } else {
          addToast("Unable to schedule job.", 'error');
        }
      } catch (err) {
        console.error("Error scheduling job:", err);
      }
    }
  };

  const handleSlotSelect = ({ date, time }: { date: string; time: string }) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createJobAndAppointment();
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-6">
      {/* Job Type Selector */}
      <select
        value={jobType || ''}
        onChange={(e) => setJobType(e.target.value as JobType)}
        className="w-full px-4 py-2 border border-gray-400 rounded text-gray-600"
      >
        <option value="">Select Job Type</option>
        <option value={JobType.ELECTRICAL}>Electrical Repair</option>
        <option value={JobType.HVAC}>HVAC Inspection</option>
        <option value={JobType.PLUMBING}>Plumbing Maintenance</option>
      </select>

      {/* Calendar Component */}
      {jobType && (
        <JobSchedulerCalendar
          unavailableSlots={unavailableSlots}
          onSelectSlot={handleSlotSelect}
        />
      )}

      {/* Notes Field */}
      <textarea
        placeholder="Notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full px-4 py-2 border border-gray-400 rounded text-gray-600"
      />

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-blue-400 text-white py-2 rounded hover:bg-blue-500"
      >
        {loading ? (
          <div className="w-4 h-4 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        ) : (
          'Schedule Job'
        )}
      </button>
    </form>
  );
}
