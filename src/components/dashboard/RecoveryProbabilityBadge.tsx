import { cn } from '@/lib/utils';

interface RecoveryProbabilityBadgeProps {
  probability: number;
  showBar?: boolean;
}

export function RecoveryProbabilityBadge({ probability, showBar = true }: RecoveryProbabilityBadgeProps) {
  const percentage = probability * 100;
  
  const getColor = () => {
    if (percentage >= 70) return 'bg-success';
    if (percentage >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  const getBadgeClass = () => {
    if (percentage >= 70) return 'trust-high';
    if (percentage >= 40) return 'trust-medium';
    return 'trust-low';
  };

  return (
    <div className="space-y-1.5">
      <span className={cn('trust-badge', getBadgeClass())}>
        {percentage.toFixed(1)}%
      </span>
      {showBar && (
        <div className="recovery-probability-bar h-1.5 w-24">
          <div
            className={cn('recovery-probability-fill', getColor())}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
    </div>
  );
}