import { cn } from '@/lib/utils';
import { LabelHTMLAttributes } from 'react';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  required?: boolean;
};

export function Label({ required, children, className, ...props }: LabelProps) {
  return (
    <label className={cn('block text-sm font-medium text-gray-700', className)} {...props}>
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}
