import { SfxImpl } from "../audio/sfx";
import type { Services } from "../core/types";

export function createServices(): Services {
    const sfx = new SfxImpl();
    return { sfx };
}