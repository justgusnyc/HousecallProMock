import { Job, Appointment, JobType, JobStatus, Customer } from '@/types/customer';
import { DateTime } from 'luxon';

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

// Helper function to generate a random string
function generateRandomString(length: number): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

// Helper function to generate a random phone number
function generateRandomPhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `${areaCode}-${prefix}-${lineNumber}`;
}

// Helper function to generate a random street name
function generateRandomStreetName(): string {
  const streetNames = [
    'Main',
    'Oak',
    'Pine',
    'Maple',
    'Cedar',
    'Elm',
    'Washington',
    'Lake',
    'Hill',
    'Sunset',
  ];
  return streetNames[Math.floor(Math.random() * streetNames.length)];
}

// Function to generate 26 customers with names starting from A to Z
function generateMockCustomers(): Customer[] {
  const customers: Customer[] = [];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Garcia',
    'Miller',
    'Davis',
    'Rodriguez',
    'Martinez',
  ];
  const domains = ['example.com', 'mail.com', 'test.com'];

  for (let i = 0; i < alphabet.length; i++) {
    const letter = alphabet[i];
    const firstName = `${letter}${generateRandomString(4)}`;
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const id = `customer_${i}`;
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`;
    const phone = generateRandomPhoneNumber();
    const address = `${Math.floor(Math.random() * 9999) + 1} ${generateRandomStreetName()} St.`;

    customers.push({
      id,
      name,
      email,
      phone,
      address,
    });
  }
  return customers;
}

// Update the generateMockData function to include customers
export function generateMockData() {
  const today = DateTime.now().setZone('America/New_York');
  const customers = generateMockCustomers();

  const jobs: Job[] = [];
  const appointments: Appointment[] = [];

  for (let i = 1; i <= 7; i++) {
    const currentDay = today.plus({ days: i });

    // Generate 3 jobs per day with random times and assigned employees
    const jobTypes = [JobType.ELECTRICAL, JobType.HVAC, JobType.PLUMBING];
    const usedTimes = new Set<number>(); // Track used hours to avoid overlaps

    for (let j = 0; j < jobTypes.length; j++) {
      const jobType = jobTypes[j];
      const employeeId = getEmployeeForJobType(jobType);

      // Randomize the time slot for the job
      const hour = getRandomTimeWithinDay(usedTimes);

      const scheduledStart = currentDay.set({ hour, minute: 0 }).toUTC().toISO();
      const scheduledEnd = currentDay.set({ hour: hour + 1, minute: 0 }).toUTC().toISO();

      // Randomly select a customer from the generated customers
      const customer = customers[Math.floor(Math.random() * customers.length)];

      // Create job
      const newJob: Job = {
        id: `job_${i}_${j}`,
        customer_id: customer.id,
        jobType,
        status: JobStatus.SCHEDULED,
        scheduled_start: scheduledStart!,
        scheduled_end: scheduledEnd!,
        duration: 60,
        notes: `Mock notes for ${jobType}`,
        assigned_employees: [employeeId],
        created_at: DateTime.now().toUTC().toISO(),
        updated_at: DateTime.now().toUTC().toISO(),
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
        location: customer.address,
        assigned_technician: employeeId,
        status: newJob.status,
        arrival_window_minutes: 10,
      };

      jobs.push(newJob);
      appointments.push(newAppointment);
    }
  }

  return { employees, customers, jobs, appointments };
}
