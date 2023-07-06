import { Config } from '../types/config.js';
import untypedConfig from '../../config/config.json' assert { type: 'json' };

const settings = untypedConfig as Config;

export function isAllowedDomain(domain: string): boolean {
    return settings.Domains.some((v) => domain.includes(v));
}
