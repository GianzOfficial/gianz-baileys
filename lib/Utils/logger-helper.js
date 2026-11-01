import P from 'pino';

/**
 * Bikin pino logger dengan default yang enak buat bot, tanpa perlu setup
 * manual tiap bikin project baru.
 *
 * Contoh:
 *   import makeWASocket, { createLogger } from "xobe-baileys"
 *
 *   const logger = createLogger({ level: "warn" }) // default: "silent"
 *   const sock = makeWASocket({ auth: state, logger })
 */
export const createLogger = ({ level = 'silent', pretty = false } = {}) => {
    const base = P({
        level,
        timestamp: () => `,"time":"${new Date().toISOString()}"`,
    });
    if (!pretty) return base;
    // Mode "pretty" sederhana tanpa dependency tambahan (pino-pretty):
    // bungkus method utama biar nulis satu baris ringkas ke console.
    const wrap = (fn, label) => (obj, msg) => {
        const extra = typeof obj === 'string' ? obj : (msg || '');
        const time = new Date().toISOString().split('T')[1].replace('Z', '');
        // eslint-disable-next-line no-console
        console[fn === 'error' ? 'error' : 'log'](`[${time}] ${label} ${extra}`);
    };
    return {
        ...base,
        trace: wrap('log', 'TRACE'),
        debug: wrap('log', 'DEBUG'),
        info: wrap('log', 'INFO '),
        warn: wrap('log', 'WARN '),
        error: wrap('error', 'ERROR'),
        child: () => createLogger({ level, pretty }),
    };
};
