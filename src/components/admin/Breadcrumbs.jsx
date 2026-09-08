import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { PAGE_TITLES } from '../../lib/admin-utils';

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  const crumbs = [{ label: 'Home', path: '/admin', icon: Home }];

  if (segments.length > 0) {
    let current = '';
    segments.forEach((segment) => {
      current += `/${segment}`;
      if (current !== '/admin') {
        const title = PAGE_TITLES[current] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        crumbs.push({ label: title, path: current });
      }
    });
  }

  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm mb-4">
      {crumbs.map((crumb, index) => (
        <span key={crumb.path || index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-4 w-4 text-slate-500" />}
          {index === crumbs.length - 1 ? (
            <span className="text-slate-400 font-medium">{crumb.label}</span>
          ) : (
            <Link
              to={crumb.path}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              {crumb.icon && <crumb.icon className="h-3.5 w-3.5" />}
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}

export function AdminPageHeader({ title, description, action }) {
  return (
    <div className="mb-6">
      <Breadcrumbs />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          {description && <p className="text-sm text-slate-400 mt-1">{description}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
