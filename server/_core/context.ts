import { Request, Response } from 'express';

/**
 * User context type
 */
export interface User {
  id: number;
  openId: string;
  email: string;
  name?: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

/**
 * tRPC context
 */
export interface Context {
  user?: User;
  req: Request;
  res: Response;
}

/**
 * Create tRPC context
 */
export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<Context> {
  // Get user from session if authenticated
  const user = (req as any).user as User | undefined;

  return {
    user,
    req,
    res,
  };
}
