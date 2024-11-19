import { Job, Appointment, JobType, JobStatus } from '@/types/customer';

// Utility to generate a date string directly in EST
function createDateInEST(year: number, month: number, day: number, hour: number, minute: number): string {
  const date = new Date(Date.UTC(year, month - 1, day, hour, minute)); // Create UTC date
  return date.toISOString().slice(0, 19); // 'YYYY-MM-DDTHH:mm:ss'
}

// Employees mapping for specific job types
const employees = [
  { id: "employee_1", name: "Alice Johnson", job_types: [JobType.ELECTRICAL], contact: "alice@example.com" },
  { id: "employee_2", name: "Bob Smith", job_types: [JobType.HVAC], contact: "bob@example.com" },
  { id: "employee_3", name: "Chris Brown", job_types: [JobType.PLUMBING], contact: "chris@example.com" },
];

function getEmployeeForJobType(jobType: JobType) {
  const employee = employees.find((emp) => emp.job_types.includes(jobType));
  return employee?.id || '';
}

// Generate a random time within the working hours (9 AM to 5 PM)
function getRandomTimeWithinDay(existingTimes: Set<number>, workingHoursStart = 9, workingHoursEnd = 17): number {
  let randomHour;
  do {
    randomHour = Math.floor(Math.random() * (workingHoursEnd - workingHoursStart)) + workingHoursStart;
  } while (existingTimes.has(randomHour)); // Ensure no overlapping times
  existingTimes.add(randomHour);
  return randomHour;
}

// Generate mock data
export function generateMockData() {
  const today = new Date();
  const now = new Date();

  const jobs: Job[] = [];
  const appointments: Appointment[] = [];

  for (let i = 1; i <= 7; i++) {
    const currentDay = new Date(today);
    currentDay.setDate(today.getDate() + i);

    // Generate 3 jobs per day with random times and assigned employees
    const jobTypes = [JobType.ELECTRICAL, JobType.HVAC, JobType.PLUMBING];
    const usedTimes = new Set<number>(); // Track used hours to avoid overlaps

    for (let j = 0; j < jobTypes.length; j++) {
      const jobType = jobTypes[j];
      const employeeId = getEmployeeForJobType(jobType);

      // Randomize the time slot for the job
      const hour = getRandomTimeWithinDay(usedTimes);
      const minute = 0;

      const scheduledStart = createDateInEST(currentDay.getFullYear(), currentDay.getMonth() + 1, currentDay.getDate(), hour, minute);
      const scheduledEnd = createDateInEST(currentDay.getFullYear(), currentDay.getMonth() + 1, currentDay.getDate(), hour + 1, minute);

      // Create job
      const newJob: Job = {
        id: `job_${i}_${j}`,
        customer_id: `customer_${i}_${j}`,
        jobType,
        status: JobStatus.SCHEDULED,
        scheduled_start: scheduledStart,
        scheduled_end: scheduledEnd,
        duration: 60,
        notes: `Mock notes for ${jobType}`,
        assigned_employees: [employeeId],
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      };

      // Create corresponding appointment
      const newAppointment: Appointment = {
        id: `appointment_${i}_${j}`,
        job_id: newJob.id,
        jobType,
        customer_id: newJob.customer_id,
        scheduled_start: newJob.scheduled_start,
        scheduled_end: newJob.scheduled_end,
        duration: newJob.duration,
        location: `Mock location ${i}_${j}`,
        assigned_technician: employeeId,
        status: newJob.status,
        arrival_window_minutes: 10,
      };

      jobs.push(newJob);
      appointments.push(newAppointment);
    }
  }

  return { employees, jobs, appointments };
}
