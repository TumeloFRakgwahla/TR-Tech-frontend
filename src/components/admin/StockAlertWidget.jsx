import { useMemo } from 'react';
import { Card } from '../../components/ui/card';
import { AlertTriangle, TrendingUp } from 'lucide-react';

const THRESHOLD = 10;

const severityConfig = {
  critical: { borderColor: 'border-red-600/30', bgColor: 'bg-red-600/10', iconColor: 'text-red-400', label: 'Critical' },
  warning: { borderColor: 'border-yellow-600/30', bgColor: 'bg-yellow-600/10', iconColor: 'text-yellow-400', label: 'Warning' },
  healthy: { borderColor: 'border-green-600/30', bgColor: 'bg-green-600/10', iconColor: 'text-green-400', label: 'Healthy' },
};

export function StockAlertWidget({ products, threshold = THRESHOLD, onProductClick }) {
  const alerts = useMemo(() => {
    return (products || [])
      .map(product => {
        const stock = Number(product.stock) || 0;
        let severity = 'healthy';
        if (stock === 0) severity = 'critical';
        else if (stock <= 5) severity = 'critical';
        else if (stock <= threshold) severity = 'warning';

        return { ...product, stock, severity, percent: threshold > 0 ? Math.max((stock / threshold) * 100, 0) : 0 };
      })
      .filter(p => p.severity !== 'healthy')
      .sort((a, b) => {
        const order = { critical: 0, warning: 1 };
        return (order[a.severity] || 2) - (order[b.severity] || 2);
      });
  }, [products, threshold]);

  if (alerts.length === 0) {
    return (
      <Card className="p-5 bg-slate-800/80 border-slate-700">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-9 w-9 rounded-xl bg-green-600/20 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-green-400" /></div>
          <p className="text-slate-400 text-xs">Stock Status</p>
        </div>
        <p className="text-2xl font-bold text-green-400">All products are well stocked</p>
      </Card>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {alerts.map((product) => {
        const config = severityConfig[product.severity];
        return (
          <Card
            key={product._id || product.id}
            className={`p-4 border cursor-pointer hover:border-slate-500 transition-colors ${config.borderColor} ${config.bgColor}`}
            onClick={() => onProductClick?.(product)}
          >
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className={`h-5 w-5 ${config.iconColor}`} />
              <div className="min-w-0">
                <p className="font-semibold text-white text-sm truncate">{product.name}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bgColor} ${config.iconColor}`}>{config.label}</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-2">Stock: {product.stock} / {threshold}</p>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${product.severity === 'critical' ? 'bg-red-600' : 'bg-yellow-600'}`}
                style={{ width: `${Math.min(product.percent, 100)}%` }}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
