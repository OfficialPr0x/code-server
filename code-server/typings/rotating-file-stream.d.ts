declare module 'rotating-file-stream' {
  import { Writable } from 'stream';
  
  export interface RotatingFileStreamOptions {
    path?: string;
    size?: string;
    interval?: string;
    maxFiles?: number;
    compress?: boolean | string | Function;
    maxSize?: string;
    history?: string;
    immutable?: boolean;
    initialRotation?: boolean;
    mode?: number;
    rotate?: boolean;
  }
  
  export type RotatingFileStream = Writable & {
    end(cb?: () => void): void;
    end(chunk: any, cb?: () => void): void;
    end(chunk: any, encoding?: string, cb?: () => void): void;
  };
  
  export default function createStream(
    filename: string | Function,
    options?: RotatingFileStreamOptions
  ): RotatingFileStream;
  
  export function createStream(
    filename: string | Function,
    options?: RotatingFileStreamOptions
  ): RotatingFileStream;
} 