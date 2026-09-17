import { copyFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const source = resolve(here, '../../focus-app/public/icon-192.png')
const target = resolve(here, '../public/focus-icon.png')

await mkdir(dirname(target), { recursive: true })
await copyFile(source, target)
