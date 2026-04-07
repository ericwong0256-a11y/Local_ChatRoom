import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// Always load <repo>/backend/.env regardless of where the process was started.
const here = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(here, '..', '.env')
config({ path: envPath })
