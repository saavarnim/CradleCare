import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US'; // NEW: Import the locale using ESM
import 'react-big-calendar/lib/css/react-big-calendar.css';

// UPDATED: Use the imported 'enUS' object
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const AppointmentCalendar = ({ appointments }) => {
  // The events mapping logic remains the same
  const events = appointments.map(apt => ({
    title: apt.title,
    start: new Date(apt.appointment_date),
    end: new Date(apt.appointment_date),
    allDay: true,
  }));

  return (
    <div style={{ height: '500px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
      />
    </div>
  );
};

export default AppointmentCalendar;