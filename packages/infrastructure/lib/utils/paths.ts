import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const PACKAGE_LOCK_FILE = join(__dirname, '../../../../package-lock.json');
export const PROJECT_ROOT = join(__dirname, '../../../../');
export const BACKEND_LIB = join(PROJECT_ROOT, '/packages/backend/src/lib');