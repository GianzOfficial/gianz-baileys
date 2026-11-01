import type P from 'pino';
export interface CreateLoggerOptions {
    level?: string;
    pretty?: boolean;
}
export declare const createLogger: (options?: CreateLoggerOptions) => P.Logger<never, boolean>;
