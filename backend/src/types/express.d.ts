import type { RequestUser } from "@/types/api.types";

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export {};