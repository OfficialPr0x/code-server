declare module 'limiter' {
  export interface RateLimiterOptions {
    tokensPerInterval: number;
    interval: string | number;
    fireImmediately?: boolean;
  }

  export class RateLimiter {
    constructor(options: RateLimiterOptions);
    
    getTokensRemaining(): number;
    tryRemoveTokens(count: number): boolean;
    removeTokens(count: number): Promise<number>;
  }

  export class TokenBucket {
    constructor(bucketSize: number, tokensPerInterval: number, interval: number, parentBucket?: TokenBucket);
    
    removeTokens(count: number, callback: (err: Error | null, remainingTokens: number) => void): void;
    tryRemoveTokens(count: number): boolean;
    getTokensRemaining(): number;
  }
} 