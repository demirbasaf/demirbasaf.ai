// A plain-markdown twin of every entry, for agents and anything else that
// would rather fetch one text file than parse the page. Built from the MDX
// source, so it never drifts: imports go, the site's own components turn into
// markdown with their data tables, and everything else is already markdown.
import { site } from '../config/site';
import { chartStats, chartTable, tableToMarkdown, type ChartTable } from './charts';
import type { Entry } from './entries';

function attr(tag: string, name: string): string | undefined {
  const m = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
  return m?.[1];
}

export function entryToMarkdown(entry: Entry, origin: string): string {
  const url = `${origin}/${entry.slug}/`;
  let body = entry.body;

  // import lines
  body = body.replace(/^import .*$\n?/gm, '');

  // <Fig src=".." alt=".." caption=".." />  ->  figure line + data table
  body = body.replace(/<Fig\s+([^>]*?)\/>/gs, (_, attrs) => {
    const src = attr(attrs, 'src') ?? '';
    const alt = attr(attrs, 'alt') ?? '';
    const caption = attr(attrs, 'caption');
    const table = chartTable(src);
    const parts = [`**Figure.** ${caption ?? alt}`, `_${alt}_`];
    if (table) parts.push('', tableToMarkdown(table));
    return parts.join('\n');
  });

  // <SpecBars>caption</SpecBars>  ->  pick rate per spec as one table per role
  body = body.replace(/<SpecBars>([\s\S]*?)<\/SpecBars>/g, (_, caption) => {
    type Row = { name: string; class: string; share: number };
    const pick = (chartStats('wow-mythic-plus')?.pick_rate ?? {}) as Record<string, Row[]>;
    const table: ChartTable = {
      columns: ['role', 'spec', 'share of runs %'],
      rows: Object.entries(pick).flatMap(([role, rows]) =>
        rows.map((r) => [role, `${r.name} ${r.class}`, Math.round(r.share * 1000) / 10]),
      ),
    };
    return [`**Figure.** ${caption.trim()}`, '', tableToMarkdown(table)].join('\n');
  });

  // stat tiles  ->  bullet list
  body = body.replace(/<div class="tiles">([\s\S]*?)<\/div>\s*<\/div>/g, (_, inner) => {
    const tiles = [...inner.matchAll(/<b>(.*?)<\/b><span>(.*?)<\/span>/g)].map(([, v, l]) => `- **${v}** ${l}`);
    return tiles.join('\n');
  });

  // anything else that is still a tag is dropped
  body = body.replace(/<\/?[a-zA-Z][^>]*>/g, '').replace(/\n{3,}/g, '\n\n').trim();

  return [
    `# ${entry.data.title}`,
    '',
    `${entry.data.summary}`,
    '',
    `By ${site.title}. Published ${entry.data.date.toISOString().slice(0, 10)}. Canonical: ${url}`,
    entry.data.tags.length ? `Tags: ${entry.data.tags.join(', ')}` : '',
    '',
    body,
    '',
  ]
    .filter((l, i, a) => !(l === '' && a[i - 1] === ''))
    .join('\n');
}
