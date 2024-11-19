import fs from 'fs';
import path from 'path';
import { generateMockData } from './mockData';
import { Appointment, Job } from '@/types/customer';

const jobsFilePath = path.join(process.cwd(), 'src/data/jobs.json');
const appointmentsFilePath = path.join(process.cwd(), 'src/data/appointments.json');

// Function to read a file and return its data
function readFile<T>(filePath: string): T[] {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return [];
}

// Function to write data to a file
function writeFile<T>(filePath: string, data: T[]) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Get jobs from file or generate new ones if missing
export function getJobs() {
  if (!fs.existsSync(jobsFilePath)) {
    initializeMockDataFiles();
  }
  return readFile(jobsFilePath) as Job[];
}

// Save jobs to file
export function saveJobs(jobs: Job[]) {
  writeFile(jobsFilePath, jobs);
}

export function getAppointments() {
  if (!fs.existsSync(appointmentsFilePath)) {
    initializeMockDataFiles();
  }
  return readFile(appointmentsFilePath) as Appointment[];
}

// Save appointments to file
export function saveAppointments(appointments: Appointment[]) {
  writeFile(appointmentsFilePath, appointments);
}

export function refreshMockDataIfStale() {
  const now = new Date();

  const regenerateIfStale = <T>(
    filePath: string,
    dataGenerator: () => T[],
    isDataStale: (data: T[]) => boolean
  ) => {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      const lastModified = new Date(stats.mtime);
      const existingData = readFile<T>(filePath);

      // Regenerate if the file is older than 7 days or if the data is stale
      if (
        now.getTime() - lastModified.getTime() > 7 * 24 * 60 * 60 * 1000 ||
        isDataStale(existingData)
      ) {
        const newData = dataGenerator();
        writeFile(filePath, newData);
        return newData;
      }
    } else {
      // If the file doesn't exist, generate new data
      const newData = dataGenerator();
      writeFile(filePath, newData);
      return newData;
    }

    return readFile(filePath);
  };

  const isJobsDataStale = (jobs: Job[]) => {
    const now = new Date();
    return jobs.every(
      (job) => new Date(job.scheduled_start).getTime() < now.getTime()
    );
  };

  const isAppointmentsDataStale = (appointments: Appointment[]) => {
    const now = new Date();
    return appointments.every(
      (appointment) =>
        new Date(appointment.scheduled_start).getTime() < now.getTime()
    );
  };

  regenerateIfStale(
    jobsFilePath,
    () => generateMockData().jobs,
    isJobsDataStale
  );
  regenerateIfStale(
    appointmentsFilePath,
    () => generateMockData().appointments,
    isAppointmentsDataStale
  );
}


export function initializeMockDataFiles() {
  const { jobs, appointments } = generateMockData();

  if (!fs.existsSync(jobsFilePath)) {
    writeFile(jobsFilePath, jobs);
  }

  if (!fs.existsSync(appointmentsFilePath)) {
    writeFile(appointmentsFilePath, appointments);
  }
}
