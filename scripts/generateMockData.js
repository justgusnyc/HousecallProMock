// const fs = require('fs');
// const path = require('path');

// // Define enums for JobType and JobStatus
// const JobType = {
//   ELECTRICAL: "Electrical Repair",
//   HVAC: "HVAC Inspection",
//   PLUMBING: "Plumbing Maintenance",
// };

// const JobStatus = {
//   SCHEDULED: "scheduled",
//   COMPLETED: "completed",
//   CANCELED: "canceled",
// };

// // Utility to generate a date string directly in EST (Eastern Standard Time)
// function createDateInEST(year, month, day, hour, minute) {
//   const date = new Date(Date.UTC(year, month - 1, day, hour, minute)); // Directly adjust to EST by adding 5 hours
//   return date.toISOString().slice(0, 19); // Returns 'YYYY-MM-DDTHH:mm:ss' format
// }

// // Function to generate dates dynamically starting from tomorrow
// function generateDates() {
//   const today = new Date();
  
//   const tomorrow = new Date(today);
//   tomorrow.setDate(today.getDate() + 1);

//   const twoDaysFromNow = new Date(tomorrow);
//   twoDaysFromNow.setDate(tomorrow.getDate() + 1);

//   const threeDaysFromNow = new Date(twoDaysFromNow);
//   threeDaysFromNow.setDate(twoDaysFromNow.getDate() + 1);

//   return {
//     tomorrow,
//     tomorrowAt10AM: createDateInEST(tomorrow.getFullYear(), tomorrow.getMonth() + 1, tomorrow.getDate(), 10, 0),
//     tomorrowAt11AM: createDateInEST(tomorrow.getFullYear(), tomorrow.getMonth() + 1, tomorrow.getDate(), 11, 0),
//     twoDaysFromNow,
//     twoDaysFromNowAt2PM: createDateInEST(twoDaysFromNow.getFullYear(), twoDaysFromNow.getMonth() + 1, twoDaysFromNow.getDate(), 14, 0),
//     threeDaysFromNowAt9AM: createDateInEST(threeDaysFromNow.getFullYear(), threeDaysFromNow.getMonth() + 1, threeDaysFromNow.getDate(), 9, 0),
//   };
// }

// // Function to write data to a file, always overwriting
// function writeFile(filePath, data) {
//   fs.writeFileSync(filePath, data);
// }

// // Generate mock job, appointment, and employee data
// function createMockData() {
//   const dates = generateDates();
//   const now = new Date();

//   const employees = [
//     { id: "employee_1", name: "Alice Johnson", job_types: [JobType.ELECTRICAL], contact: "alice@example.com" },
//     { id: "employee_2", name: "Bob Smith", job_types: [JobType.HVAC], contact: "bob@example.com" },
//     { id: "employee_3", name: "Chris Brown", job_types: [JobType.PLUMBING], contact: "chris@example.com" },
//   ];

//   const jobs = [
//     {
//       id: "job_1",
//       customer_id: "4e87cc6e-4aca-4464-8840-a9284d125955",
//       jobType: JobType.ELECTRICAL,
//       status: JobStatus.SCHEDULED,
//       scheduled_start: dates.tomorrowAt10AM,
//       scheduled_end: dates.tomorrowAt11AM,
//       duration: 60,
//       notes: "Repair faulty wiring in the living room",
//       assigned_employees: ["employee_1"],
//       created_at: createDateInEST(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes()),
//       updated_at: createDateInEST(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes())
//     },
//     {
//       id: "job_2",
//       customer_id: "d38a4292-cf23-46a5-803d-4119d595cd06",
//       jobType: JobType.HVAC,
//       status: JobStatus.SCHEDULED,
//       scheduled_start: dates.twoDaysFromNowAt2PM,
//       scheduled_end: createDateInEST(dates.twoDaysFromNow.getFullYear(), dates.twoDaysFromNow.getMonth() + 1, dates.twoDaysFromNow.getDate(), 15, 0),
//       duration: 60,
//       notes: "Check all HVAC units for maintenance needs",
//       assigned_employees: ["employee_2"],
//       created_at: createDateInEST(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes()),
//       updated_at: createDateInEST(now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes())
//     }
//   ];

//   const appointments = [
//     {
//       id: "appointment_1",
//       job_id: "job_1",
//       jobType: JobType.ELECTRICAL,
//       customer_id: "4e87cc6e-4aca-4464-8840-a9284d125955",
//       scheduled_start: dates.tomorrowAt10AM,
//       scheduled_end: dates.tomorrowAt11AM,
//       duration: 60,
//       location: "123 Test Ln.",
//       assigned_technician: "employee_1",
//       status: JobStatus.SCHEDULED,
//       arrival_window_minutes: 10
//     },
//     {
//       id: "appointment_2",
//       job_id: "job_2",
//       jobType: JobType.HVAC,
//       customer_id: "d38a4292-cf23-46a5-803d-4119d595cd06",
//       scheduled_start: dates.twoDaysFromNowAt2PM,
//       scheduled_end: createDateInEST(dates.twoDaysFromNow.getFullYear(), dates.twoDaysFromNow.getMonth() + 1, dates.twoDaysFromNow.getDate(), 15, 0),
//       duration: 60,
//       location: "321 Test Ln.",
//       assigned_technician: "employee_2",
//       status: JobStatus.SCHEDULED,
//       arrival_window_minutes: 10
//     }
//   ];

//   const employeesFilePath = path.join(__dirname, '../src/data/employees.json');
//   const jobsFilePath = path.join(__dirname, '../src/data/jobs.json');
//   const appointmentsFilePath = path.join(__dirname, '../src/data/appointments.json');

//   writeFile(employeesFilePath, JSON.stringify(employees, null, 2));
//   writeFile(jobsFilePath, JSON.stringify(jobs, null, 2));
//   writeFile(appointmentsFilePath, JSON.stringify(appointments, null, 2));
// }

// // Run the script to create mock data
// createMockData();
