export declare const toJid: (numberOrJid: string) => string;
export declare const resolvePNJid: (sock: any, jid: string) => Promise<string>;
export declare const resolvePNJids: (sock: any, jids?: string[]) => Promise<string[]>;
export declare const resolveLidJid: (sock: any, jid: string) => Promise<string>;
