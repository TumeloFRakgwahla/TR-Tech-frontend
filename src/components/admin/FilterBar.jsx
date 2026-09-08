import { Input } from '../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Search } from 'lucide-react';

export function FilterBar({ filters, values, onChange }) {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search..."
          value={values.text || ''}
          onChange={(e) => onChange({ ...values, text: e.target.value })}
          className="pl-10 bg-slate-700 border-slate-600 text-white"
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={values[filter.key] || filter.defaultValue}
            onValueChange={(val) => onChange({ ...values, [filter.key]: val })}
          >
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white w-full sm:w-40">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600">
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-white">{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
    </div>
  );
}
