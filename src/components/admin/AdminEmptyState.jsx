import { Package, Search, Users, ShoppingCart, FileText, AlertCircle } from 'lucide-react';

const ICON_MAP = {
  product: Package,
  search: Search,
  customer: Users,
  order: ShoppingCart,
  default: FileText,
  alert: AlertCircle,
};

export function AdminEmptyState({
  icon: Icon = null,
  iconType = 'default',
  title = 'No items found',
  description = 'Get started by creating your first item.',
  action = null,
  className = '',
}) {
  const ResolvedIcon = Icon || ICON_MAP[iconType] || ICON_MAP.default;
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <div className="w-16 h-16 rounded-full bg-slate-700/50 flex items-center justify-center mb-4">
        <ResolvedIcon className="h-7 w-7 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function AdminErrorState({ error, onRetry, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-red-600/10 flex items-center justify-center mb-4">
        <AlertCircle className="h-6 w-6 text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-1">Something went wrong</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-4">{error || 'Failed to load data'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          Retry
        </button>
      )}
    </div>
  );
}
