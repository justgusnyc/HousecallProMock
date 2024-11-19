import React, { useEffect, useMemo, useState } from 'react';
import { DateTime } from 'luxon';

type UnavailableSlots = Record<string, string[]>;
type OnSelectSlot = (slot: { date: string; time: string }) => void;

interface JobSchedulerCalendarProps {
  unavailableSlots: UnavailableSlots;
  onSelectSlot: OnSelectSlot;
}

const JobSchedulerCalendar: React.FC<JobSchedulerCalendarProps> = ({
  unavailableSlots,
  onSelectSlot,
}) => {
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  ];

  const preComputedWeekDays = useMemo(() => {
    const today = DateTime.now().setZone('America/New_York').startOf('day');
    return Array.from({ length: 7 }, (_, i) => today.plus({ days: i + 1 }).toISODate()!)
      .filter(Boolean); // Ensure no null values
  }, []);
  

  const [weekDays, setWeekDays] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; time: string } | null>(null);

  useEffect(() => {
    setWeekDays(preComputedWeekDays);
  }, [preComputedWeekDays]);

  const isUnavailable = (date: string, time: string) =>
    unavailableSlots[date]?.includes(time);

  const handleSlotClick = (date: string, time: string) => {
    if (!isUnavailable(date, time)) {
      setSelectedSlot({ date, time });
      onSelectSlot({ date, time }); // Notify parent about the selection
    }
  };

  return (
    <div className="grid grid-cols-8 gap-2">
      {/* Days Header */}
      <div className="col-span-1" />
      {weekDays.map((day) => (
        <div
          key={day}
          className="text-sm font-semibold text-center border-b border-gray-300 pb-1 text-black"
        >
          {DateTime.fromISO(day).toFormat('EEE, MMM d')}
        </div>
      ))}

      {/* Time Slots */}
      {timeSlots.map((time) => (
        <React.Fragment key={time}>
          {/* Time Column */}
          <div className="text-sm text-center font-medium py-1 text-black">{time}</div>
          {weekDays.map((day) => {
            const isSlotUnavailable = isUnavailable(day, time);
            const isSelected = selectedSlot?.date === day && selectedSlot?.time === time;

            return (
              <div
                key={`${day}-${time}`}
                className={`h-12 flex justify-center items-center rounded cursor-pointer ${
                  isSlotUnavailable
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isSelected
                    ? 'bg-blue-800 text-white'
                    : 'bg-blue-100 hover:bg-blue-300 text-blue-800'
                }`}
                onClick={() => handleSlotClick(day, time)}
              >
                {isSlotUnavailable ? 'Booked' : 'Available'}
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default JobSchedulerCalendar;
