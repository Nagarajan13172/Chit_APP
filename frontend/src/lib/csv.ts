/** Escape a single CSV cell (wraps in quotes when needed). */
function cell(value: unknown): string {
  const str = value == null ? "" : String(value);
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
}

/**
 * Build a CSV from header labels + rows and trigger a browser download.
 * Each row is an array aligned to `headers`.
 */
export function downloadCsv(filename: string, headers: string[], rows: Array<Array<unknown>>): void {
  const lines = [headers.map(cell).join(","), ...rows.map((r) => r.map(cell).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
