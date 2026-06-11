export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-dwarfs-surface rounded-sm" />
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-dwarfs-surface rounded w-3/4" />
        <div className="h-3 bg-dwarfs-surface rounded w-1/4" />
        <div className="h-4 bg-dwarfs-surface rounded w-1/2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
