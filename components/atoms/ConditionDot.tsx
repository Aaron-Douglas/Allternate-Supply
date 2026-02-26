import { cn } from '@/lib/utils';

type ConditionDotProps = {
  grade: 'A' | 'B' | 'C';
  showLabel?: boolean;
  className?: string;
};

const gradeColors = {
  A: 'bg-green-500',
  B: 'bg-amber-500',
  C: 'bg-red-500',
};

const gradeLabels = {
  A: 'Excellent',
  B: 'Good',
  C: 'Fair',
};

export function ConditionDot({ grade, showLabel = false, className }: ConditionDotProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('inline-block h-2.5 w-2.5 rounded-full', gradeColors[grade])} />
      {showLabel && <span className="text-sm text-gray-600">Grade {grade} ({gradeLabels[grade]})</span>}
    </span>
  );
}
