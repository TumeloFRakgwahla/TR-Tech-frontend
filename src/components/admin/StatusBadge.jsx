import { Badge } from '../ui/badge';
import { getStatusConfig } from '../../lib/admin-utils';

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
  lg: 'text-sm px-3 py-1',
};

export function StatusBadge({ status, type = 'order', size = 'md', children }) {
  const config = getStatusConfig(status, type);
  return (
    <Badge
      className={`border-0 font-medium ${SIZE_CLASSES[size]} ${config.color} ${config.textColor}`}
    >
      {children || config.label || status}
    </Badge>
  );
}

export function StatusDot({ status, type = 'order', size = 'sm', showLabel = false }) {
  const config = getStatusConfig(status, type);
  const dotClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`rounded-full ${config.color.replace('text-', 'bg-')} ${dotClasses[size]}`} />
      {showLabel && (
        <span className={`text-${size === 'sm' ? 'xs' : size === 'md' ? 'sm' : 'base'} ${config.textColor}`}>
          {config.label || status}
        </span>
      )}
    </span>
  );
}
