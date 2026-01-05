import { cn } from '@/lib/utils';

interface TrustScoreBarProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function TrustScoreBar({ score, showLabel = true, size = 'md' }: TrustScoreBarProps) {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-success';
    if (score >= 70) return 'bg-warning';
    return 'bg-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'High';
    if (score >= 70) return 'Medium';
    return 'Low';
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      <div className={cn('recovery-probability-bar', heights[size])}>
        <div
          className={cn('recovery-probability-fill', getScoreColor(score))}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      {showLabel && (
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Trust Score</span>
          <span
            className={cn(
              'trust-badge',
              score >= 85 ? 'trust-high' : score >= 70 ? 'trust-medium' : 'trust-low'
            )}
          >
            {score.toFixed(1)}% - {getScoreLabel(score)}
          </span>
        </div>
      )}
    </div>
  );
}