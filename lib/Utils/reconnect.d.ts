export interface WithReconnectOptions {
    baseMs?: number;
    maxMs?: number;
    factor?: number;
}
export interface Reconnector {
    reset: () => void;
    schedule: () => number;
    readonly attempt: number;
}
export declare const withReconnect: (startFn: () => void, options?: WithReconnectOptions) => Reconnector;
