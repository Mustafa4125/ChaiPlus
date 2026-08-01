import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-white/10 dark:via-white/5 dark:to-white/10 bg-[length:200%_100%] animate-shimmer',
        className,
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-3xl overflow-hidden bg-white dark:bg-[#22262e] shadow-soft">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-14 w-14 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}
