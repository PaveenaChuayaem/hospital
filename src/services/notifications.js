import { NotificationAPI } from './api';

export function scheduleLocalReminders(appointment) {
  const to = appointment.patientName;
  const when = new Date(appointment.slotISO);
  const subject = `Appointment Reminder: ${when.toLocaleString()}`;
  const body = `You have an appointment with doctor ${appointment.doctorId} at ${when.toLocaleString()}.`;
  NotificationAPI.sendEmailReminder({ to, subject, body });
  NotificationAPI.sendSMSReminder({ to, body });
}





