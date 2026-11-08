export function SkeletonCard() {
  return (
    <div className="bg-surface border border-divider rounded-xl h-60 animate-pulse flex flex-col">
      <div className="h-32 bg-app border-b border-divider" />
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="h-4 bg-app rounded w-3/4" />
          <div className="h-3 bg-app rounded w-1/2" />
        </div>
        <div className="flex justify-between items-end mt-4">
          <div className="h-6 w-12 bg-app rounded-full" />
          <div className="h-4 w-4 bg-app rounded" />
        </div>
      </div>
    </div>
  );
}