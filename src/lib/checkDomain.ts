import { Config } from "../types/config.js";
import untypedConfig from "../../config/config.json" with { type: "json" };

const { Domains } = untypedConfig as Config;

export async function isAllowedDomain(domain: string): Promise<boolean> {
    let out = false;
    if (Domains.some((v) => domain.includes(v))) {
        await fetch(domain)
            .then((r) => {
                out = r.ok;
            })
            .catch((error:unknown) => {
                console.warn(error);
                out = false;
            });
    } else {
        out = false;
    }
    return out;
}
