export default function Loading() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-paper">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-line border-t-navy" />
        <p className="text-[13px] text-muted">Loading…</p>
      </div>
    </main>
  );
}
