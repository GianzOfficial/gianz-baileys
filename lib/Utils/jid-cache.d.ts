export interface CachedGroupMetadataOptions {
    ttlMs?: number;
}
export interface CachedGroupMetadata {
    get: (jid: string) => Promise<any | undefined>;
    set: (jid: string, data: any) => void;
    invalidate: (jid: string) => void;
    clear: () => void;
    attach: (sock: any) => any;
}
export declare const makeCachedGroupMetadata: (options?: CachedGroupMetadataOptions) => CachedGroupMetadata;
