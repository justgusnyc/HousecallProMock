'use client';
import { useEffect, useState } from 'react';
import React from 'react';
import CustomerLookupForm from '@/components/CustomerLookupForm';
import CustomerInfoDisplay from '@/components/CustomerInfoDisplay';
import JobScheduler from '@/components/JobScheduler';
import { Customer, Job } from '@/types/customer';
import { useDebounce } from '@/hooks/useDebounce';
import JobInfoDisplay from '@/components/JobInfoDisplay';
import { useToast } from '@/components/toast/ToastContext';

export default function Home() {
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [jobScheduled, setJobScheduled] = useState(false);
  const [customerSubmitted, setCustomerSubmitted] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{ name?: string; phone?: string; address?: string; email?: string } | null>(null);
  const [bookedJob, setBookedJob] = useState<Job | null>(null);
  const debouncedCustomerInfo = useDebounce(customerInfo, 500);

  const { addToast } = useToast();

  useEffect(() => {
    if (!debouncedCustomerInfo?.email && !debouncedCustomerInfo?.name && !debouncedCustomerInfo?.phone && !debouncedCustomerInfo?.address) {
      setCustomers(null);
      return;
    }
    const fetchCustomerInfo = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/customers/search?email=${debouncedCustomerInfo?.email}&name=${debouncedCustomerInfo?.name}&phone=${debouncedCustomerInfo?.phone}&address=${debouncedCustomerInfo?.address}`);
        const data = await res.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customer info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerInfo();
  }, [debouncedCustomerInfo]);

  const handleScheduleJob = (jobDetails: { date: string; time: string }) => {
    addToast(`Job scheduled for ${jobDetails.date} at ${jobDetails.time}`, 'success');
    setJobScheduled(true);
  };

  const onJobDeleted = () => {
    addToast('Job deleted successfully!', 'success');
    setJobScheduled(false);
    setBookedJob(null);
  };

  return (
    <div className="max-w-screen-md mx-auto py-8 space-y-6">
      <h1 className="text-2xl font-bold text-center text-gray-900">Customer Support Tool</h1>
      <div className="flex w-full space-x-4">
        <div className='w-1/2'>
          <CustomerLookupForm setCustomerInfo={setCustomerInfo} selectedCustomer={selectedCustomer} setCustomerSubmitted={setCustomerSubmitted} setSelectedCustomer={setSelectedCustomer} setJobScheduled={setJobScheduled} setBookedJob={setBookedJob}/>
        </div>
        <div className='w-1/2'>
          <CustomerInfoDisplay customers={customers} setSelectedCustomer={setSelectedCustomer} loading={loading} selectedCustomer={selectedCustomer} />
        </div>
      </div>
      {customerSubmitted && !jobScheduled && <JobScheduler onScheduleJob={handleScheduleJob} selectedCustomer={selectedCustomer} setBookedJob={setBookedJob} />}
      {jobScheduled &&
        <div className="justify-self-center max-w-screen-md w-3/6 transition-all animate-bounce-in">
          <JobInfoDisplay bookedJob={bookedJob} selectedCustomer={selectedCustomer} onJobDeleted={onJobDeleted}/>
        </div>
      }
    </div>
  );
}
