export const FREE_MSG_LIMIT = 50;
export const FREE_CREDIT_LIMIT = 1000;

export const STARTER_MSG_LIMIT = 2500;
export const STARTER_CREDIT_LIMIT = 50000;

export const PRO_MSG_LIMIT = 10000;
export const PRO_CREDIT_LIMIT = 125000;

export const ENTERPRISE_MSG_LIMIT = Number.MAX_SAFE_INTEGER;
export const ENTERPRISE_CREDIT_LIMIT = 500000;

export const WARN_USER_LIMIT = 0.9;

export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
export const MAX_UPLOADS = 5;

export const getLimits = (plan: string) => {
  switch (plan) {
    case "free":
      return { fileCredits: FREE_CREDIT_LIMIT, messages: FREE_MSG_LIMIT };
    case "starter":
      return { fileCredits: STARTER_CREDIT_LIMIT, messages: STARTER_MSG_LIMIT };
    case "pro":
      return { fileCredits: PRO_CREDIT_LIMIT, messages: PRO_MSG_LIMIT };
    case "enterprise":
      return {
        fileCredits: ENTERPRISE_CREDIT_LIMIT,
        messages: Number.MAX_SAFE_INTEGER,
      };
    default:
      return { fileCredits: FREE_CREDIT_LIMIT, messages: FREE_MSG_LIMIT };
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
    description: "Perfect to get started",
    price: 0,
    features: [
      { description: "1000 file upload credits" },
      { description: "50 messages" },
    ],
    cta: "Start for Free",
    isPopular: false,
  },
  {
    id: "starter",
    name: "Starter",
    description: "For smaller teams and projects",
    price: 25,
    features: [
      {
        description: "50,000 file upload credits",
        additional: "Additional credits: 0.005€ each",
      },
      {
        description: "2,500 messages",
        additional: "Additional messages: 0.05€ each",
      },
    ],
    cta: "Subscribe",
    isPopular: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "The ideal plan for your scaling business",
    price: 49,
    features: [
      {
        description: "125,000 file upload credits",
        additional: "Additional credits: 0.001€ each",
      },
      {
        description: "10,000 messages",
        additional: "Additional messages: 0.01€ each",
      },
    ],
    cta: "Subscribe",
    isPopular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large teams with advanced usage",
    price: 199,
    features: [
      {
        description: "1,000,000 file upload credits",
        additional: "Additional credits: 0.0001€ each",
      },
      {
        description: "Unlimited messages",
      },
      {
        description: "Dedicated Support",
      },
    ],
    cta: "Subscribe",
    isPopular: false,
  },
];
