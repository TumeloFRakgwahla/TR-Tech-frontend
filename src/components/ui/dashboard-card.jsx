import * as React from "react"
import { cn } from "../../lib/utils"

const KPICard = React.forwardRef(({ className, title, value, change, icon: Icon, color = "text-blue-400", bgColor = "bg-blue-600/20", size = "md", ...props }, ref) => {
  const sizeClasses = size === "lg" ? "p-6" : size === "sm" ? "p-4" : "p-5";
  const iconSizeClasses = size === "lg" ? "h-12 w-12" : size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const iconInnerClasses = size === "lg" ? "h-6 w-6" : size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const titleClasses = size === "lg" ? "text-sm" : "text-xs";
  const valueClasses = size === "lg" ? "text-3xl" : size === "sm" ? "text-xl" : "text-2xl";

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border bg-slate-800 border-slate-700 transition-all duration-200 hover:shadow-lg hover:border-slate-600",
        sizeClasses,
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn("rounded-lg flex items-center justify-center flex-shrink-0", bgColor, iconSizeClasses)}>
          {Icon && <Icon className={cn(iconInnerClasses, color)} />}
        </div>
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 font-semibold", titleClasses, Number(change) >= 0 ? "text-green-400" : "text-red-400")}>
            <span>{Number(change) >= 0 ? '▲' : '▼'}</span>
            <span>{Math.abs(Number(change))}%</span>
          </div>
        )}
      </div>
      <p className={cn("text-slate-400 mb-1", titleClasses)}>{title}</p>
      <p className={cn("font-bold text-white tracking-tight", valueClasses)}>{value}</p>
    </div>
  )
})
KPICard.displayName = "KPICard"

const SectionCard = React.forwardRef(({ className, title, description, action, children, headerClassName, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("rounded-xl border bg-slate-800 border-slate-700", className)}
      {...props}
    >
      <div className={cn("flex items-start sm:items-center justify-between gap-4 p-5 pb-4 flex-col sm:flex-row", headerClassName)}>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          {description && <p className="text-sm text-slate-400 mt-0.5 truncate">{description}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  )
})
SectionCard.displayName = "SectionCard"

const AlertCard = React.forwardRef(({ className, title, icon: Icon, iconColor = "text-yellow-400", borderColor = "border-yellow-600/30", bgColor = "bg-yellow-600/10", children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("rounded-xl border p-5", borderColor, bgColor, className)}
      {...props}
    >
      <div className="flex items-center gap-3 mb-3">
        {Icon && <Icon className={cn("h-5 w-5", iconColor)} />}
        <h3 className="font-semibold text-white">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  )
})
AlertCard.displayName = "AlertCard"

export { KPICard, SectionCard, AlertCard }
