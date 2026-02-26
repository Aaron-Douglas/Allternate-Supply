export function toCSV(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(',');
  const body = rows
    .map((row) =>
      columns
        .map((col) => {
          const val = row[col] ?? '';
          const str = String(val).replace(/"/g, '""');
          return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
        })
        .join(',')
    )
    .join('\n');
  return `${header}\n${body}`;
}
