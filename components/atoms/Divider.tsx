import { cn } from '@/lib/utils';

export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-t border-gray-200 my-4', className)} />;
}
