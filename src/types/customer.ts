export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  email: string;
}

export enum JobType {
  ELECTRICAL = "Electrical Repair",
  HVAC = "HVAC Inspection",
  PLUMBING = "Plumbing Maintenance",
}

export enum JobStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  CANCELED = "canceled",
}

export interface Employee {
  id: string;
  name: string;
  job_types: JobType[];
  contact: string;
}

export interface Job {
  id: string;
  customer_id: string;
  jobType: JobType;
  status: JobStatus;
  scheduled_start: string;
  scheduled_end: string;
  duration: number;
  notes?: string;
  assigned_employees: string[]; // Array of employee IDs
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  job_id: string;
  customer_id: string;
  jobType: JobType;
  scheduled_start: string;
  scheduled_end: string;
  duration: number;
  location: string;
  assigned_technician: string; // Employee ID
  status: JobStatus;
  arrival_window_minutes: number;
  updated_at?: string;
}
