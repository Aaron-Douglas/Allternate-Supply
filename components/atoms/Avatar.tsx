import { cn } from '@/lib/utils';

type AvatarProps = {
  initials?: string;
  src?: string;
  className?: string;
};

export function Avatar({ initials, src, className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={cn('h-8 w-8 rounded-full object-cover', className)}
      />
    );
  }
  return (
    <span className={cn('inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-semibold', className)}>
      {initials || '?'}
    </span>
  );
}
