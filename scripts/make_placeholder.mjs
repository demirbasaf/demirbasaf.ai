// ---------------------------------------------------------------------------
// Generates the DUMMY example model artifact so the site has a working demo
// before any real model exists. It trains a character-level *bigram* by counting
// letter pairs in a small embedded name list, no PyTorch, no deps, runs in plain
// Node:  `npm run placeholder`.
//
// This is a throwaway scaffold. Real projects get their own artifact (via
// scripts/export_model.py) and their own /public/models/<name>/ folder.
// ---------------------------------------------------------------------------
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'models', 'example-charlm');

// A small sample of Turkish first names (lowercased, ASCII-folded for the demo).
const NAMES = `ali,veli,ayse,fatma,mehmet,mustafa,ahmet,emine,hatice,zeynep,elif,
merve,busra,esra,seda,gizem,damla,ceren,ipek,derya,pinar,sibel,gamze,tugce,
burcu,ozge,melis,selin,ecrin,defne,azra,eda,irem,nur,sena,yagmur,ela,mira,
kerem,emir,arda,baris,burak,can,cem,deniz,ege,eren,furkan,hakan,kaan,levent,
metin,onur,ozan,serkan,tarik,umut,volkan,yusuf,berk,bora,cagri,doruk,efe,
enes,ferhat,gokhan,halil,ismail,kadir,murat,okan,polat,recep,sefa,taner,ufuk,
yavuz,alper,batuhan,berkay,cihan,emre,gurkan,hasan,ibrahim,kagan,mert,nuri,
orhan,ramazan,sinan,tuncay,yalcin,aylin,belma,cansu,dilara,ebru,feride,gul,
handan,ilknur,kubra,leyla,melike,nazli,oya,rabia,sevgi,tuba,ulku,yasemin,
zehra,asli,betul,cigdem,duygu,eylul,fadime,gonca,hande,inci,kader,lale,
meltem,nesrin,pelin,rana,serap,tulay,umran,vildan`
  .replace(/\s+/g, '')
  .split(',')
  .filter(Boolean);

// vocab: '.' boundary token first (index 0), then the sorted unique letters.
const chars = new Set();
for (const n of NAMES) for (const ch of n) chars.add(ch);
const vocab = ['.', ...[...chars].sort()];
const stoi = new Map(vocab.map((c, i) => [c, i]));
const V = vocab.length;

// Count bigrams with add-one (Laplace) smoothing so no transition is impossible.
const counts = Array.from({ length: V }, () => new Array(V).fill(1));
for (const name of NAMES) {
  const seq = ['.', ...name, '.'];
  for (let i = 0; i < seq.length - 1; i++) {
    counts[stoi.get(seq[i])][stoi.get(seq[i + 1])]++;
  }
}

// Store logits = log(probability). At inference the js backend applies softmax,
// so log-probs recover the exact bigram distribution.
const W = new Array(V * V);
for (let i = 0; i < V; i++) {
  const row = counts[i];
  const total = row.reduce((a, b) => a + b, 0);
  for (let j = 0; j < V; j++) W[i * V + j] = Math.log(row[j] / total);
}

const meta = {
  name: 'example-charlm',
  title: 'Example demo',
  description: 'Placeholder character-level model, wired end to end to show live in-browser inference.',
  backend: 'js',
  arch: 'bigram',
  vocab,
  block_size: 1,
  sampling: { temperature: 0.9, max_new_tokens: 16, top_k: null },
};
const weights = { format: 'flat', params: { W: { shape: [V, V], data: W } } };

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'meta.json'), JSON.stringify(meta, null, 2));
writeFileSync(join(OUT, 'weights.json'), JSON.stringify(weights));
console.log(`✓ placeholder written to ${OUT}`);
console.log(`  names=${NAMES.length}  vocab=${V}  params=${V * V}`);
