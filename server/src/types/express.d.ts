// Extend Express Request type to include our custom properties
declare namespace Express {
  export interface Request {
    userId?: string;
    user?: {
      id: string;
      email: string;
      role?: string;
    };
  }
}

// Extend Express Response locals for passing data between middleware
declare namespace Express {
  export interface Response {
    locals: {
      startTime?: number;
      requestId?: string;
    };
  }
}