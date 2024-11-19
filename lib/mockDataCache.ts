// src/lib/mockDataCache.ts

import { generateMockData } from './mockData';
import { Job, Appointment, Customer } from '@/types/customer';

// In-memory storage for mock data
let mockData: {
  jobs: Job[];
  appointments: Appointment[];
  customers: Customer[];
} | null = null;

function initializeMockData() {
  if (!mockData) {
    const { jobs, appointments, customers } = generateMockData();
    mockData = { jobs, appointments, customers };
  }
}

export function getJobs() {
  initializeMockData(); // Ensure data is initialized on cold start
  return mockData?.jobs || [];
}

export function saveJobs(updatedJobs: Job[]) {
  if (!mockData) {
    initializeMockData();
  }
  mockData!.jobs = updatedJobs;
}

export function getAppointments() {
  initializeMockData(); // Ensure data is initialized on cold start
  return mockData?.appointments || [];
}

export function saveAppointments(updatedAppointments: Appointment[]) {
  if (!mockData) {
    initializeMockData();
  }
  mockData!.appointments = updatedAppointments;
}

export function getCustomers() {
  initializeMockData();
  return mockData?.customers || [];
}

export function saveCustomers(updatedCustomers: Customer[]) {
  if (!mockData) {
    initializeMockData();
  }
  mockData!.customers = updatedCustomers;
}
