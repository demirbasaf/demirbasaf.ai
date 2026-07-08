// Work timeline. Concise, one or two sentences per role. Descriptions are
// per-locale; company names are proper nouns (same in both).
import type { Lang } from '../lib/i18n';

export interface TimelineItem {
  years: string;
  org: string;
  url?: string;
  desc: Record<Lang, string>;
}

export const timeline: TimelineItem[] = [
  {
    years: '2024 - now',
    org: 'MoonPay',
    url: 'https://www.moonpay.com/',
    desc: {
      en: 'Payments infrastructure across bank transfers, cards, Apple Pay and more, in Node.js. Systems that process over $1B in transactions a year.',
      tr: 'Node.js ile ödeme altyapısı: banka havaleleri, kartlar, Apple Pay ve daha fazlası. Yılda 1 milyar doların üzerinde işlem hacmi.',
    },
  },
  {
    years: '2022 - 2024',
    org: 'Trendyol',
    url: 'https://www.trendyol.com/',
    desc: {
      en: "Shipping and logistics for one of Turkey's largest e-commerce platforms. Go microservices over gRPC and Kafka, behind 3M+ deliveries a day.",
      tr: "Türkiye'nin en büyük e-ticaret platformlarından birinde kargo ve lojistik. gRPC ve Kafka üzerinde Go mikroservisleri, günde 3 milyondan fazla teslimatın arkasında.",
    },
  },
  {
    years: '2021 - 2022',
    org: 'Adsby',
    url: 'https://adsby.co/',
    desc: {
      en: 'My first job. A fast-paced startup building a digital-ads hub: generate creatives and publish to channels in one place. Vendor integrations, AWS infra and DevOps, in Node.js, TypeScript and GraphQL.',
      tr: 'İlk işim. Reklamları tek merkezden üretip kanallara yayınlayan, hızlı tempolu bir dijital reklam girişimi. Node.js, TypeScript ve GraphQL ile sağlayıcı entegrasyonları, AWS altyapısı ve DevOps.',
    },
  },
];
