import { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10 border-b border-border pb-8 space-y-3">
        <div className="h-8 w-48 bg-dwarfs-surface animate-pulse" />
        <div className="h-4 w-64 bg-dwarfs-surface animate-pulse" />
      </div>
      <ProductGridSkeleton count={12} />
    </div>
  );
}
