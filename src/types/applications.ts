export type ApplicationStatus =
  | 'Recibida'
  | 'En revisión'
  | 'Entrevista agendada'
  | 'Aceptada'
  | 'Rechazada';

export const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
  'Recibida': 'bg-blue-100 text-blue-700',
  'En revisión': 'bg-yellow-100 text-yellow-700',
  'Entrevista agendada': 'bg-purple-100 text-purple-700',
  'Aceptada': 'bg-green-100 text-green-700',
  'Rechazada': 'bg-red-100 text-red-700',
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  'Recibida': 'Recibida',
  'En revisión': 'En revisión',
  'Entrevista agendada': 'Entrevista agendada',
  'Aceptada': 'Aceptada',
  'Rechazada': 'Rechazada',
};
