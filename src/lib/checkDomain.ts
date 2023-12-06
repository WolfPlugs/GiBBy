import { Config } from "../types/config.js";
import untypedConfig from "../../config/config.json" assert { type: "json" };

const settings = untypedConfig as Config;

export async function isAllowedDomain(domain: string): Promise<boolean> {
    let out = false;
    if (settings.Domains.some((v) => domain.includes(v))) {
        await fetch(domain)
            .then((r) => {
                out = r.ok;
            })
            .catch((e) => {
                console.log(e);
                out = false;
            });
    } else {
        out = false;
    }
    return out;
}
