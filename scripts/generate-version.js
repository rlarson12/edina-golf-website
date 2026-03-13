// Runs at build time — writes public/version.json with current build timestamp.
// The app polls this file every 5 minutes and hard-reloads if the version changed,
// guaranteeing updates reach home screen installs even on iOS Safari.
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const version = { buildTime: Date.now() }
writeFileSync(
  resolve(__dirname, '../public/version.json'),
  JSON.stringify(version)
)
console.log(`Version written: ${version.buildTime}`)
