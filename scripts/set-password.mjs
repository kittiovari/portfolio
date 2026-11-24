// npm run jelszo -- <terület> [jelszó]
//   terület: language | arttherapy | ux
// Jelszó nélkül rejtetten bekéri. A jelszó scrypt-hash-ét a .env-be írja
// (PASS_HASH_<TERÜLET>), és kiírja, mit kell a Netlify-on beállítani.
// Maga a jelszó sehol nem tárolódik.
import readline from 'node:readline'
import { loadEnv, setEnv } from './env.mjs'
import { hashPassword, AREAS } from '../netlify/lib/security.mjs'

loadEnv()
const [area, given] = process.argv.slice(2)

if (!AREAS.includes(area)) {
  console.error(`Használat: npm run jelszo -- <${AREAS.join('|')}> [jelszó]`)
  process.exit(1)
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl._writeToOutput = (s) => { if (s.includes(question)) rl.output.write(s) }
    rl.question(question, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer) })
  })
}

const password = given ?? (await askHidden('Új jelszó: '))
if (password.trim().length < 12) {
  console.error('Legalább 12 karakter legyen (javasolt: 4 véletlen szó + szám).')
  process.exit(1)
}

const key = `PASS_HASH_${area.toUpperCase()}`
setEnv(key, hashPassword(password))
console.log(`Kész: ${key} beírva a .env-be.`)
console.log('Élesítéshez ugyanezt az értéket másold be a Netlify-on: Site configuration → Environment variables.')
