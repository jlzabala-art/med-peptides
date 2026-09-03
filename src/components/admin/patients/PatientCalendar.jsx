import React, { useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import styles from './PatientCalendar.module.css';
import { useFirestoreCollection } from '../../../hooks/data/useFirestoreCollection';
import { appointmentRepository } from '../../../repositories/appointmentRepository';
import UniversalFormDrawer from '../../shared/UniversalFormDrawer';
import notifier from '../../../services/NotificationService';
import { logger } from '../../../utils/logger';

export default function PatientCalendar({ patient, prescriptions = [], orders = [] }) {
  const [isAppointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: appointments, isLoading: loadingAppointments } = useFirestoreCollection('appointments', {
    whereConditions: [['patientId', '==', patient.id]],
  });

  const appointmentSchema = [
    { name: 'title', label: 'Appointment Title', type: 'text', required: true },
    { name: 'date', label: 'Date', type: 'date', required: true },
    { name: 'notes', label: 'Notes', type: 'text' },
    { name: 'type', label: 'Type', type: 'select', required: true, options: [
      { value: 'checkin', label: 'Check-in' },
      { value: 'consultation', label: 'Consultation' },
      { value: 'bloodwork', label: 'Bloodwork' },
    ] }
  ];

  const handleCreateAppointment = async (formData) => {
    try {
      // Ensure date is properly parsed
      const apptDate = new Date(formData.date);
      await appointmentRepository.createAppointment({
        ...formData,
        patientId: patient.id,
        patientName: patient.name,
        date: apptDate,
        status: 'scheduled',
      });
      notifier.success('Appointment created successfully');
      setAppointmentModalOpen(false);
    } catch (err) {
      notifier.error('Failed to create appointment');
      logger.error('Failed to create appointment in PatientCalendar', { error: err.message });
      throw err;
    }
  };


  // Aggregate events from prescriptions, orders, and appointments
  const events = useMemo(() => {
    const evts = [];

    // 1. Prescriptions
    prescriptions.forEach((rx) => {
      if (rx.createdAt) {
        const date = rx.createdAt.toDate ? rx.createdAt.toDate() : new Date(rx.createdAt);
        evts.push({
          id: `rx_${rx.id}`,
          title: `Rx: ${rx.protocolName || 'Prescription'}`,
          start: date,
          backgroundColor: '#0ea5e9', // Light blue
          borderColor: '#0284c7',
          textColor: '#ffffff',
          extendedProps: {
            type: 'prescription',
            data: rx
          }
        });
      }
    });

    // 2. Orders
    orders.forEach((order) => {
      if (order.createdAt) {
        const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        evts.push({
          id: `ord_${order.id}`,
          title: `Order: $${order.total || 0}`,
          start: date,
          backgroundColor: '#10b981', // Emerald green
          borderColor: '#059669',
          textColor: '#ffffff',
          extendedProps: {
            type: 'order',
            data: order
          }
        });
      }
    });

    // 3. Appointments
    if (appointments) {
      appointments.forEach((appt) => {
        if (appt.date) {
          const d = appt.date.toDate ? appt.date.toDate() : new Date(appt.date);
          evts.push({
            id: `appt_${appt.id}`,
            title: `Appt: ${appt.title}`,
            start: d,
            backgroundColor: '#8b5cf6', // Violet
            borderColor: '#7c3aed',
            textColor: '#ffffff',
            extendedProps: {
              type: 'appointment',
              data: appt
            }
          });
        }
      });
    }

    // 4. Simulated Check-ins or upcoming events
    if (prescriptions.length > 0 && prescriptions[0].createdAt) {
      const rxDate = prescriptions[0].createdAt.toDate ? prescriptions[0].createdAt.toDate() : new Date(prescriptions[0].createdAt);
      const checkInDate = new Date(rxDate);
      checkInDate.setDate(checkInDate.getDate() + 28); // 4 weeks later

      if (checkInDate > new Date()) {
         evts.push({
          id: `checkin_suggested`,
          title: `Suggested Check-in`,
          start: checkInDate,
          backgroundColor: '#f59e0b', // Amber
          borderColor: '#d97706',
          textColor: '#ffffff',
          extendedProps: {
            type: 'checkin'
          }
        });
      }
    }

    return evts;
  }, [prescriptions, orders, appointments]);

  return (
    <div className={styles.calendarWrapper}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 700 }}>
          Patient Interactions
        </h3>
        <button 
          onClick={() => {
            setSelectedDate(new Date());
            setAppointmentModalOpen(true);
          }}
          style={{
            padding: '0.5rem 1rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.85rem'
          }}
        >
          + New Appointment
        </button>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin, listPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,listMonth'
        }}
        events={events}
        height="auto"
        selectable={true}
        select={(info) => {
          setSelectedDate(new Date(info.startStr));
          setAppointmentModalOpen(true);
        }}
        eventClick={(info) => {
          const type = info.event.extendedProps.type;
          alert(`Event type: ${type}\nTitle: ${info.event.title}`);
        }}
      />

      <UniversalFormDrawer
        isOpen={isAppointmentModalOpen}
        onClose={() => setAppointmentModalOpen(false)}
        schema={appointmentSchema}
        initialData={{ date: selectedDate.toISOString().split('T')[0] }}
        onSubmit={handleCreateAppointment}
        title="Schedule Appointment"
        submitLabel="Create Appointment"
      />
    </div>
  );
}
