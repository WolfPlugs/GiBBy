import { Config } from '../types/config.js';
import untypedConfig from '../../config/config.json' assert { type: 'json' };

const settings = untypedConfig as Config;

export async function isAllowedDomain(domain: string): Promise<boolean> {
    if (settings.Domains.some((v) => domain.includes(v))) {
        await fetch(domain)
            .then((r) => {
                if (r.ok) {
                    return true;
                } else {
                    return false;
                }
            })
            .catch((e) => {
                console.log(e);
                return false;
            });
    } else {
        return false;
    }
    return false; // we shouldn't get here, but if we do, fail.
}
