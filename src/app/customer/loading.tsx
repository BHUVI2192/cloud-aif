export default function Loading() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-7 w-48 bg-slate-100 rounded-lg"></div>
      
      {/* Cards Skeleton */}
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 bg-slate-50/50 border border-[#f1f5f9] rounded-2xl p-6 space-y-3.5">
            <div className="h-3.5 w-24 bg-slate-100 rounded-md"></div>
            <div className="h-5 w-2/3 bg-slate-100 rounded-md"></div>
            <div className="h-3.5 w-1/2 bg-slate-100 rounded-md"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
