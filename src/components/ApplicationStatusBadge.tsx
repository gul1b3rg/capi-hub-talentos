import { memo } from 'react';
import { APPLICATION_STATUS_COLORS, type ApplicationStatus } from '../types/applications';

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

const ApplicationStatusBadge = memo(({ status }: ApplicationStatusBadgeProps) => (
  <span
    className={`inline-flex rounded-full px-4 py-1 text-sm font-semibold ${APPLICATION_STATUS_COLORS[status]}`}
  >
    {status}
  </span>
));

ApplicationStatusBadge.displayName = 'ApplicationStatusBadge';

export default ApplicationStatusBadge;
