import { config as dotenv } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv({ path: join(__dirname, '../../.env') });

export type ConfigProps = {
    ID: string
    REGION: string;
    DOMAIN_NAME: string;
    SUBDOMAIN_NAME: string;
    FQDN: string;
    ACCOUNT: string;
};

export const getConfig = (): ConfigProps => {
    const id = process.env.ID;
    const domainName = process.env.DOMAIN_NAME;
    const subdomainName = process.env.SUBDOMAIN_NAME;
    const account = process.env.ACCOUNT;

    if (!id) {
        throw new Error(`ENV Variable ID is required`);
    }

    if (!domainName) {
        throw new Error(`ENV Variable DOMAIN_NAME is required`);
    }

    if (!account) {
        throw new Error(`ENV Variable ACCOUNT is required`);
    }

    if (!subdomainName) {
        throw new Error(`ENV Variable SUBDOMAIN_NAME is required`);
    }

    return {
        ID: id,
        REGION: process.env.REGION || "us-east-1",
        DOMAIN_NAME: domainName,
        SUBDOMAIN_NAME: subdomainName,
        FQDN: subdomainName + '.' + domainName,
        ACCOUNT: account
    }
}