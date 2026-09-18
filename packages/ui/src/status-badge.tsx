import React from 'react';
import { ProjectStatus, JobStatus } from '@captionstudio/types';
import { Badge } from './badge';

export interface StatusBadgeProps {
  status: ProjectStatus | JobStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  switch (status) {
    case ProjectStatus.READY:
    case JobStatus.COMPLETED:
    case 'ACTIVE':
      return <Badge variant="success" className={className}>{status}</Badge>;

    case ProjectStatus.TRANSCRIBING:
    case ProjectStatus.PROCESSING:
    case JobStatus.PROCESSING:
    case 'TRIALING':
      return <Badge variant="brand" className={className}>{status}</Badge>;

    case ProjectStatus.DRAFT:
    case JobStatus.PENDING:
      return <Badge variant="neutral" className={className}>{status}</Badge>;

    case ProjectStatus.FAILED:
    case JobStatus.FAILED:
    case 'SUSPENDED':
      return <Badge variant="error" className={className}>{status}</Badge>;

    case JobStatus.CANCELLED:
    case ProjectStatus.ARCHIVED:
      return <Badge variant="neutral" className={className}>{status}</Badge>;

    default:
      return <Badge variant="neutral" className={className}>{status}</Badge>;
  }
};

