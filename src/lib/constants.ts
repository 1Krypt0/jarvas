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
