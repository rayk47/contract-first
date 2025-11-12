import { getConfig } from "../env/env-config.js";

const config = getConfig();

export const buildResourceIdentifier = (resourceString: string) => {
    return `${resourceString + config.ID + 'ContractFirst'}`;
}