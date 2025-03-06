import { ArrowUpDown, Timer, Workflow } from "lucide-react";

export const FREE_MSG_LIMIT = 30;
export const FREE_PAGE_LIMIT = 100;

export const STARTER_MSG_LIMIT = 2500;
export const STARTER_PAGE_LIMIT = 10000;

export const PRO_MSG_LIMIT = 7500;
export const PRO_PAGE_LIMIT = 25000;

export const ENTERPRISE_PAGE_LIMIT = 100000;
export const ENTERPRISE_MSG_LIMIT = Number.MAX_SAFE_INTEGER;

export const WARN_USER_LIMIT = 0.9;

export const getLimits = (plan: string) => {
  switch (plan) {
    case "free":
      return { pageUploads: FREE_PAGE_LIMIT, messages: FREE_MSG_LIMIT };
    case "starter":
      return { pageUploads: STARTER_PAGE_LIMIT, messages: STARTER_MSG_LIMIT };
    case "pro":
      return { pageUploads: PRO_PAGE_LIMIT, messages: PRO_MSG_LIMIT };
    case "enterprise":
      return {
        pageUploads: ENTERPRISE_PAGE_LIMIT,
        messages: Number.MAX_SAFE_INTEGER,
      };
    default:
      return { pageUploads: FREE_PAGE_LIMIT, messages: FREE_MSG_LIMIT };
  }
};

export type PricingTierDisplay = {
  id: string;
  name: string;
  description: string;
  price: number;
  features: { description: string; additional?: string }[];
  cta: string;
  isPopular: boolean;
};

export const pricingTiers: PricingTierDisplay[] = [
  {
    id: "free",
    name: "Free",
    description: "Perfeito para experimentar e começar",
    price: 0,
    features: [{ description: "100 páginas" }, { description: "30 mensagens" }],
    cta: "Use gratuitamente",
    isPopular: false,
  },
  {
    id: "starter",
    name: "Starter",
    description: "Para equipas e projetos de menor dimensão",
    price: 25,
    features: [
      {
        description: "10,000 páginas",
        additional: "Páginas adicionais: 0.02€ cada",
      },
      {
        description: "2,500 mensagens",
        additional: "Mensagens adicionais: 0.05€ cada",
      },
    ],
    cta: "Subscreva",
    isPopular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "O ideal para a sua empresa em crescimento",
    price: 49,
    features: [
      {
        description: "25,000 páginas",
        additional: "Páginas adicionais: 0.01€ cada",
      },
      {
        description: "7,500 mensagens",
        additional: "Mensagens adicionais: 0.02€ cada",
      },
    ],
    cta: "Subscreva",
    isPopular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Para equipas grandes, com uso avançado",
    price: 199,
    features: [
      {
        description: "100,000 páginas",
        additional: "Páginas adicionais: 0.005€ cada",
      },
      {
        description: "Mensagens ilimitadas",
      },
      {
        description: "Apoio dedicado",
      },
    ],
    cta: "Subscreva Agora",
    isPopular: false,
  },
];

export type Feature = {
  icon: React.ReactNode;
  headline: string;
  description: string;
};

export const features = [
  {
    icon: Timer,
    headline: "Obtenha Respostas",
    description:
      "Navegue na sua documentação mais rapidamente e encontre a informação que procura instantaneamente. Torne minutos de procura em segundos de espera",
  },
  {
    icon: ArrowUpDown,
    headline: "Nativamente Português",
    description:
      "Use um sistema capaz de interpretar documentos em português de Portugal e responder de forma apropriada, citando todas as fontes que usou",
  },
  {
    icon: Workflow,
    headline: "Use intuitivamente",
    description:
      "O Jarvas faz uso de uma interface já comum a todos os que já interagiram com Inteligência Artificial. Não vai ter problemas em adaptar-se a esta nova ferramenta.",
  },
];
