import { useState, useEffect, useMemo } from 'react';
import { Search, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { usersAPI } from '../../services/api';
import { Skeleton } from '../../components/Skeleton';
import { cn } from '../../lib/utils';
import { Breadcrumbs } from '../../components/admin/Breadcrumbs';
import { AdminErrorState } from '../../components/admin/AdminEmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Input } from '../../components/ui/input';

const STATUS_FILTERS = [
  { value: 'all', label: 'All Status Codes' },
  { value: '200', label: '200' },
  { value: '201', label: '201' },
  { value: '400', label: '400' },
  { value: '401', label: '401' },
  { value: '403', label: '403' },
  { value: '404', label: '404' },
  { value: '500', label: '500' },
];

const ROLE_OPTIONS = ['all', 'admin', 'manager', 'staff', 'customer'];

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionFilter, setActionFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await usersAPI.getActivityLogs({
        page: params.page || 1,
        limit: 50,
        ...(params.action && params.action !== 'all' ? { action: params.action } : {}),
        ...(params.userRole && params.userRole !== 'all' ? { userRole: params.userRole } : {}),
        ...(params.statusCode && params.statusCode !== 'all' ? { statusCode: params.statusCode } : {}),
      });
      setLogs(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      setError(err.message || 'Failed to load audit logs');
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs({
      action: actionFilter,
      userRole: roleFilter,
      statusCode: statusFilter,
      page,
    });
  }, [page, actionFilter, roleFilter, statusFilter]);

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter((log) =>
      (log.action || '').toLowerCase().includes(q) ||
      (log.method || '').toLowerCase().includes(q) ||
      (log.endpoint || '').toLowerCase().includes(q) ||
      (log.userEmail || '').toLowerCase().includes(q) ||
      (log.ipAddress || '').toLowerCase().includes(q) ||
      (log.resource || '').toLowerCase().includes(q)
    );
  }, [logs, searchQuery]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('en-ZA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionLabel = (action) => {
    return action || 'N/A';
  };

  const getActionColor = (action) => {
    if (!action) return 'admin-badge-neutral';
    const a = action.toUpperCase();
    if (a === 'POST' || a.includes('CREATED')) return 'admin-badge-success';
    if (a === 'DELETE' || a.includes('DELETED')) return 'admin-badge-danger';
    if (a === 'PUT' || a === 'PATCH' || a.includes('UPDATED')) return 'admin-badge-info';
    if (a === 'GET' || a.includes('LOGIN')) return 'admin-badge-blue';
    return 'admin-badge-neutral';
  };

  const getStatusColor = (statusCode) => {
    if (!statusCode) return 'admin-badge-neutral';
    if (statusCode >= 200 && statusCode < 300) return 'admin-badge-success';
    if (statusCode >= 300 && statusCode < 400) return 'admin-badge-info';
    if (statusCode >= 400 && statusCode < 500) return 'admin-badge-warning';
    return 'admin-badge-danger';
  };

  const resetFilters = () => {
    setActionFilter('all');
    setRoleFilter('all');
    setStatusFilter('all');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <Breadcrumbs />
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-sm mt-1" style={{ color: 'rgb(var(--tr-text-muted))' }}>
            Monitor all user activity and system events
          </p>
        </div>
      </div>

      <div className="admin-section-card">
        <div className="admin-section-header">
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="admin-input w-[180px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent className="admin-section-card" style={{ border: '1px solid rgb(var(--tr-border))' }}>
                <SelectItem value="all">All Actions</SelectItem>
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((action) => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="admin-input w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent className="admin-section-card" style={{ border: '1px solid rgb(var(--tr-border))' }}>
                {ROLE_OPTIONS.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role === 'all' ? 'All Roles' : role.charAt(0).toUpperCase() + role.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="admin-input w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="admin-section-card" style={{ border: '1px solid rgb(var(--tr-border))' }}>
                {STATUS_FILTERS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(var(--tr-text-muted))' }} />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-header-search pl-9"
              />
            </div>

            {(actionFilter !== 'all' || roleFilter !== 'all' || statusFilter !== 'all' || searchQuery) && (
              <button
                onClick={resetFilters}
                className="admin-nav-item admin-nav-item-inactive text-xs"
                style={{ padding: '0.375rem 0.75rem' }}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        <div className="admin-section-body" style={{ paddingTop: 0 }}>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <AdminErrorState error={error} onRetry={() => fetchLogs({ action: actionFilter, userRole: roleFilter, statusCode: statusFilter, page })} />
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'rgb(var(--tr-text-muted))' }}>
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No audit logs found</p>
              <p className="text-xs mt-1">Logs will appear here as activity occurs</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Endpoint</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>IP Address</th>
                    <th style={{ textAlign: 'right' }}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log._id || log.id}>
                      <td style={{ color: 'rgb(var(--tr-text-secondary))', whiteSpace: 'nowrap' }}>
                        {formatTimestamp(log.createdAt)}
                      </td>
                      <td>
                        <span className={cn('admin-badge', getActionColor(log.action))}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td style={{ color: 'rgb(var(--tr-text-secondary))', fontFamily: 'monospace', fontSize: '0.8125rem' }}>
                        {log.method} {log.endpoint || '/'}
                      </td>
                      <td style={{ color: 'rgb(var(--tr-text-secondary))' }}>
                        {log.userEmail || <span style={{ opacity: 0.5 }}>— anonymous —</span>}
                      </td>
                      <td>
                        {log.userRole ? (
                          <span className="admin-badge admin-badge-blue">
                            {log.userRole}
                          </span>
                        ) : (
                          <span style={{ color: 'rgb(var(--tr-text-muted))' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span className={cn('admin-badge', getStatusColor(log.statusCode))}>
                          {log.statusCode || '—'}
                        </span>
                      </td>
                      <td style={{ color: 'rgb(var(--tr-text-muted))' }}>{log.ipAddress || '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        {log.changes || log.metadata ? (
                          <DetailsPopover log={log} />
                        ) : (
                          <span style={{ color: 'rgb(var(--tr-text-muted))' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredLogs.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm" style={{ color: 'rgb(var(--tr-text-muted))' }}>
                Showing page {page} of {totalPages} ({total} total entries)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1 || isLoading}
                  className="admin-nav-item admin-nav-item-inactive"
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages || isLoading}
                  className="admin-nav-item admin-nav-item-inactive"
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailsPopover({ log }) {
  const { changes, metadata } = log;

  const content = [];
  if (changes) {
    content.push({ label: 'Body', value: changes });
  }
  if (metadata) {
    if (metadata.query && Object.keys(metadata.query || {}).length > 0) {
      content.push({ label: 'Query', value: metadata.query });
    }
    if (metadata.params && Object.keys(metadata.params || {}).length > 0) {
      content.push({ label: 'Params', value: metadata.params });
    }
  }

  if (content.length === 0) return <span style={{ color: 'rgb(var(--tr-text-muted))' }}>—</span>;

  const truncated = content.map(c => `${c.label}: ${JSON.stringify(c.value)}`).join(' | ');

  return (
    <span
      className="truncate block max-w-[12rem] cursor-help"
      style={{ color: 'rgb(var(--tr-text-secondary))', fontSize: '0.75rem' }}
      title={truncated}
    >
      {truncated.length > 60 ? truncated.slice(0, 60) + '…' : truncated}
    </span>
  );
}
