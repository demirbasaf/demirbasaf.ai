// The numbers behind each chart. Every chart folder under src/charts/ may ship
// a stats.json with a `tables` map keyed by chart file name; Fig.astro and the
// markdown twin of a post both read it from here.
export interface ChartTable {
  columns: string[];
  rows: (string | number)[][];
}

const statsFiles = import.meta.glob('/src/charts/**/stats.json', { import: 'default', eager: true }) as Record<
  string,
  { tables?: Record<string, ChartTable>; [k: string]: unknown }
>;

/** The whole stats.json of a chart folder ('wow-mythic-plus'), or null. */
export function chartStats(folder: string): Record<string, unknown> | null {
  return statsFiles[`/src/charts/${folder}/stats.json`] ?? null;
}

/** Table for a chart given its src path ('wow-mythic-plus/runs-by-level'), or null. */
export function chartTable(src: string): ChartTable | null {
  const slash = src.lastIndexOf('/');
  const folder = src.slice(0, slash);
  const name = src.slice(slash + 1);
  return statsFiles[`/src/charts/${folder}/stats.json`]?.tables?.[name] ?? null;
}

/** GitHub-flavoured markdown rendering of a table. */
export function tableToMarkdown(t: ChartTable): string {
  const esc = (v: string | number) => String(v).replace(/\|/g, '\\|');
  return [
    `| ${t.columns.map(esc).join(' | ')} |`,
    `| ${t.columns.map(() => '---').join(' | ')} |`,
    ...t.rows.map((r) => `| ${r.map(esc).join(' | ')} |`),
  ].join('\n');
}
