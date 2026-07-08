// Work timeline. Concise, one or two sentences per role. Descriptions are
// per-locale; company names are proper nouns (same in both).
import type { Lang } from '../lib/i18n';

export interface TimelineItem {
  years: string;
  org: string;
  url?: string;
  logo?: string; // path under /public
  desc: Record<Lang, string>;
}

export const timeline: TimelineItem[] = [
  {
    years: '2024 - now',
    org: 'MoonPay',
    url: 'https://www.moonpay.com/',
    logo: '/logos/moonpay.png',
    desc: {
      en: 'Payments infrastructure across bank transfers, cards, Apple Pay and more, in Node.js. Systems that process over $1B in transactions a year.',
      tr: 'Node.js ile ödeme altyapısı: banka havaleleri, kartlar, Apple Pay ve dahası. Yılda $1B üzeri işlem geçen sistemler.',
    },
  },
  {
    years: '2022 - 2024',
    org: 'Trendyol',
    url: 'https://www.trendyol.com/',
    logo: '/logos/trendyol.png',
    desc: {
      en: "Shipping and logistics for one of Turkey's largest e-commerce platforms. Go microservices over gRPC and Kafka, behind 3M+ deliveries a day.",
      tr: "Türkiye'nin en büyük e-ticaret platformlarından birinde kargo ve lojistik. Günde 3M+ teslimatı sırtlayan, gRPC ve Kafka üzerinde çalışan Go mikroservisleri.",
    },
  },
  {
    years: '2021 - 2022',
    org: 'Adsby',
    url: 'https://adsby.co/',
    logo: '/logos/adsby.png',
    desc: {
      en: 'My first job. A fast-paced startup building a digital-ads hub: generate creatives and publish to channels in one place. Vendor integrations, AWS infra and DevOps, in Node.js, TypeScript and GraphQL.',
      tr: 'İlk işim. Reklam kreatiflerini üretip tek yerden kanallara yayınlayan bir dijital reklam platformu kuran, temposu yüksek bir startup. Node.js, TypeScript ve GraphQL ile sağlayıcı entegrasyonları, AWS altyapısı ve DevOps.',
    },
  },
];
