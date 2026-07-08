// Education, shown below the work timeline. Descriptions are per-locale.
// The advisor name renders as a link, so the description is split around it.
import type { Lang } from '../lib/i18n';

export interface Publication {
  title: string;
  url: string;
}

export interface EducationItem {
  years: string;
  org: string;
  url?: string;
  descPre: Record<Lang, string>;
  advisor?: { name: string; url: string };
  descPost: Record<Lang, string>;
  publications?: Publication[];
}

export const education: EducationItem[] = [
  {
    years: '2016 - 2020',
    org: 'Yaşar University',
    url: 'https://www.yasar.edu.tr/',
    descPre: {
      en: 'BSc in Electrical Engineering, İzmir. Thesis on network prediction with neural networks, advised by ',
      tr: 'Elektrik Mühendisliği lisansı, İzmir. Sinir ağlarıyla ağ tahmini üzerine tez; danışman ',
    },
    advisor: {
      name: 'Prof. Volkan Rodoplu',
      url: 'https://www.researchgate.net/scientific-contributions/Volkan-Rodoplu-2166823613',
    },
    descPost: {
      en: ' (Stanford PhD).',
      tr: ' (Stanford doktoralı).',
    },
    // Co-authored with Prof. Rodoplu. Newest first.
    publications: [
      {
        // 2022 conference paper.
        title:
          'Network Failure and Anomaly Prediction to Achieve Quality of Service on Software-Defined Networks',
        url: 'https://www.researchgate.net/publication/365100890_Network_Failure_and_Anomaly_Prediction_to_Achieve_Quality_of_Service_QoS_on_Software-Defined_Networks',
      },
      {
        // 2021 conference paper.
        title:
          'LEAN: A Multi-Cell Smart City Simulator for the Massive Internet of Things Medium Access Control Layer',
        url: 'https://www.researchgate.net/publication/356364253_LEAN_A_Multi-Cell_Smart_City_Simulator_for_the_Massive_Internet_of_Things_Medium_Access_Control_Layer',
      },
    ],
  },
];
