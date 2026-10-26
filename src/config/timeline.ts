// Work timeline. Concise, one or two sentences per role.
export interface TimelineItem {
  years: string;
  org: string;
  url?: string;
  logo?: string; // path under /public
  desc: string;
}

export const timeline: TimelineItem[] = [
  {
    years: '2024 - now',
    org: 'MoonPay',
    url: 'https://www.moonpay.com/',
    logo: '/logos/moonpay.png',
    desc: "Payments infrastructure in Node.js, behind $1B+ in transactions a year: virtual accounts, card routing across PSPs, and payment methods like Apple Pay, Google Pay, PIX and Cash App.",
  },
  {
    years: '2022 - 2024',
    org: 'Trendyol',
    url: 'https://careers.trendyol.com/trendyol-tech',
    logo: '/logos/trendyol.png',
    desc: "Shipping and logistics for one of Turkey's largest e-commerce platforms. Go microservices over gRPC and Kafka, behind 3M+ deliveries a day.",
  },
  {
    years: '2021 - 2022',
    org: 'Adsby',
    url: 'https://adsby.co/',
    logo: '/logos/adsby.png',
    desc: 'My first job. A fast-paced startup building a digital-ads hub: generate creatives and publish to channels in one place. Vendor integrations, AWS infra and DevOps, in Node.js, TypeScript and GraphQL.',
  },
];
