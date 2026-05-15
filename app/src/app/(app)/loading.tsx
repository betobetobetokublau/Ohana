export default function Loading() {
  return (
    <div className="px-5 py-12 md:px-10 max-w-3xl mx-auto animate-in-fade">
      <div className="h-3 w-24 bg-surface-2 rounded mb-3" />
      <div className="h-9 w-3/4 bg-surface-2 rounded mb-3" />
      <div className="h-4 w-1/2 bg-surface-2 rounded mb-8" />
      <div className="space-y-3">
        <div className="h-20 bg-surface-2 rounded-md" />
        <div className="h-20 bg-surface-2 rounded-md" />
        <div className="h-20 bg-surface-2 rounded-md" />
      </div>
    </div>
  );
}
