import { EndpointStatus } from '@/types'
import { getStatusColor, getStatusIcon } from '@/lib/comparison'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
    status: EndpointStatus
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <div className={cn(
            "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white",
            getStatusColor(status),
            className
        )}>
            <span>{getStatusIcon(status)}</span>
            <span className="capitalize">{status}</span>
        </div>
    )
}
