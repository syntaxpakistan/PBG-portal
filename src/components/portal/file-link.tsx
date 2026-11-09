import { Eye, Download } from "lucide-react";

const PREVIEWABLE = /\.(pdf|png|jpe?g|gif|webp|txt|csv)$/i;

/** Attachment chip with in-browser preview (previewable types) + download. */
export function FileLink({
  storageKey,
  filename,
  label,
  compact,
}: {
  storageKey: string | null;
  filename: string | null;
  label?: string;
  compact?: boolean;
}) {
  if (!storageKey || !filename) return null;
  const previewable = PREVIEWABLE.test(filename) || PREVIEWABLE.test(storageKey);
  const text = label ?? filename;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5">
        {previewable && (
          <a href={`/api/files/${storageKey}?inline=1`} target="_blank" rel="noopener noreferrer" title={`Preview ${filename}`}
            className="inline-flex items-center gap-1 rounded-md bg-black/10 px-2 py-1 text-[11px] hover:bg-black/20">
            <Eye className="size-3" /> Preview
          </a>
        )}
        <a href={`/api/files/${storageKey}`} title={`Download ${filename}`}
          className="inline-flex items-center gap-1 rounded-md bg-black/10 px-2 py-1 text-[11px] hover:bg-black/20">
          <Download className="size-3" /> Download
        </a>
      </span>
    );
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      {previewable && (
        <a
          href={`/api/files/${storageKey}?inline=1`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-[13px] font-medium text-ink hover:bg-paper-2"
        >
          <Eye className="size-4" /> {text}
        </a>
      )}
      <a
        href={`/api/files/${storageKey}`}
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-[13px] font-medium text-ink hover:bg-paper-2"
      >
        <Download className="size-4" /> {previewable ? "Download" : text}
      </a>
    </span>
  );
}
