import { Customer, Job } from '@/types/customer';
import React, { useState } from 'react';
import { DateTime } from 'luxon';

type JobInfoDisplayProps = {
  bookedJob: Job | null;
  selectedCustomer: Customer | null;
  onJobDeleted: () => void; // Callback to notify parent of deletion
};

const JobInfoDisplay: React.FC<JobInfoDisplayProps> = ({
  bookedJob,
  selectedCustomer,
  onJobDeleted,
}) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false); // Tracks delete confirmation

  const formatDate = (date: string) => {
    // Convert the ISO string to the local timezone (EST for this app)
    return DateTime.fromISO(date, { zone: 'utc' })
      .setZone('America/New_York')
      .toLocaleString(DateTime.DATETIME_MED);
  };

  const handleDeleteJob = async () => {
    if (!bookedJob?.id) return;

    try {
      const res = await fetch(`/api/deleteJobAndAppointment?id=${bookedJob.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete job.');
      }

      onJobDeleted(); // Notify parent to refresh the state
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error('Unknown error:', error);
      }
    } finally {
      setConfirmingDelete(false); // Reset confirmation state
    }
  };

  return (
    <div className="max-w-screen-lg w-full border border-gray-300 rounded-lg shadow-md p-5 space-y-3">
      <h2 className="text-lg font-bold text-black justify-self-center">Booked Job</h2>
      <table className="w-full border-collapse border rounded-lg border-gray-300 text-black">
        <tbody>
          <tr className="border-b">
            <td className="font-semibold px-4 py-2">Job ID:</td>
            <td className="px-4 py-2">{bookedJob?.id}</td>
          </tr>
          <tr className="border-b">
            <td className="font-semibold px-4 py-2">Job Type:</td>
            <td className="px-4 py-2">
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                {bookedJob?.jobType}
              </span>
            </td>
          </tr>
          <tr className="border-b">
            <td className="font-semibold px-4 py-2">Customer:</td>
            <td className="px-4 py-2">{selectedCustomer?.name}</td>
          </tr>
          <tr className="border-b">
            <td className="font-semibold px-4 py-2">Start Time:</td>
            <td className="px-4 py-2">
              {bookedJob?.scheduled_start ? formatDate(bookedJob.scheduled_start) : 'N/A'}
            </td>
          </tr>
          <tr className="border-b">
            <td className="font-semibold px-4 py-2">End Time:</td>
            <td className="px-4 py-2">
              {bookedJob?.scheduled_end ? formatDate(bookedJob.scheduled_end) : 'N/A'}
            </td>
          </tr>
          <tr className="border-b">
            <td className="font-semibold px-4 py-2">Location:</td>
            <td className="px-4 py-2">{selectedCustomer?.address}</td>
          </tr>
          <tr>
            <td className="font-semibold px-4 py-2">Technician:</td>
            <td className="px-4 py-2">{bookedJob?.assigned_employees}</td>
          </tr>
        </tbody>
      </table>

      {/* Delete Button */}
      <div className="flex justify-end align-baseline">
        {confirmingDelete ? (
          <>
            <button
              onClick={() => setConfirmingDelete(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 mr-2"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteJob}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Confirm Delete
            </button>
          </>
        ) : (
          <>
            <span className="text-sm text-gray-300 mr-2 self-center">Made a mistake?</span>
            <button
              onClick={() => setConfirmingDelete(true)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Job
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default JobInfoDisplay;
