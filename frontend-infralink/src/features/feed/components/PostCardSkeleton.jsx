export default function PostCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 overflow-hidden animate-pulse">
      {/* Header Skeleton */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-gray-50" />
      </div>

      {/* Content Skeleton */}
      <div className="px-4 pb-3 space-y-2">
        <div className="h-4 w-full bg-gray-100 rounded" />
        <div className="h-4 w-5/6 bg-gray-100 rounded" />
        <div className="h-4 w-2/3 bg-gray-100 rounded" />
      </div>

      {/* Media Skeleton */}
      <div className="w-full aspect-video bg-gray-200" />

      {/* Actions Skeleton */}
      <div className="p-2 flex items-center gap-2">
        <div className="flex-1 h-10 bg-gray-50 rounded-xl" />
        <div className="flex-1 h-10 bg-gray-50 rounded-xl" />
        <div className="flex-1 h-10 bg-gray-50 rounded-xl" />
      </div>
    </div>
  );
}
