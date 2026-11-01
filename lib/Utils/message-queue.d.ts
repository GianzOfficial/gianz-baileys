export interface MessageQueueOptions {
    delayMs?: number;
    maxPerMinute?: number;
}
export interface MessageQueue {
    sendMessage: (jid: string, content: any, options?: any) => Promise<any>;
    readonly pending: number;
}
export declare const makeMessageQueue: (sock: any, options?: MessageQueueOptions) => MessageQueue;
