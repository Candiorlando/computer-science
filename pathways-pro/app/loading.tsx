export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-20 space-y-6 animate-pulse">
      <div className="h-4 w-40 bg-ink/10 rounded" />
      <div className="h-10 w-96 max-w-full bg-ink/10 rounded" />
      <div className="h-4 w-full max-w-2xl bg-ink/10 rounded" />
      <div className="h-4 w-full max-w-xl bg-ink/10 rounded" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 bg-ink/5 border border-ink/10 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
