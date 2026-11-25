// npm run jelszo -- <terület>
//   terület: language-9b | language-9d | arttherapy | ux | teacher
// Rejtetten bekéri az új jelszót (gépelés közben csak pöttyök látszanak),
// a scrypt-hash-ét a .env-be írja (PASS_HASH_<TERÜLET>), és kiírja, mit kell
// a Netlify-on beállítani. Maga a jelszó sehol nem tárolódik.
import { loadEnv, setEnv } from './env.mjs'
import { hashPassword, hashEnv, AREAS } from '../netlify/lib/security.mjs'

const MIN_LENGTH = 6
const LABELS = { 'language-9b': 'Nyelvoktatás – NYEK9B', 'language-9d': 'Nyelvoktatás – NYEK9D', arttherapy: 'Antalfai művészetterápia', ux: 'UX/UI design', teacher: 'Osztályterem (tanári)' }

loadEnv()
const area = process.argv[2]

if (!AREAS.includes(area)) {
  console.error(`Használat: npm run jelszo -- <${AREAS.join('|')}>`)
  process.exit(1)
}

// Nem interaktív bemenet (pl. átirányítás): az összes sort egyszer olvassuk be
let pipedLines = null
async function nextPipedLine() {
  if (!pipedLines) {
    let data = ''
    process.stdin.setEncoding('utf8')
    for await (const c of process.stdin) data += c
    pipedLines = data.split(/\r?\n/)
  }
  return pipedLines.shift() ?? ''
}

// Windowson az Enter „\r\n” párt küld: a \r zárja a sort, az utána jövő \n-t
// figyelmen kívül hagyjuk (különben a következő kérdés üres választ kapna).
let lastWasCR = false

// Rejtett bevitel: karakterenként olvasunk, a képernyőre csak „•” kerül.
function askHidden(question) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process
    stdout.write(question)
    if (!stdin.isTTY) {
      nextPipedLine().then((line) => { stdout.write('\n'); resolve(line) })
      return
    }
    let value = ''
    stdin.setRawMode(true)
    stdin.setEncoding('utf8')
    stdin.resume()
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\n' && lastWasCR) { lastWasCR = false; continue }
        lastWasCR = ch === '\r'
        if (ch === '\r' || ch === '\n') {
          stdin.setRawMode(false)
          stdin.pause()
          stdin.off('data', onData)
          stdout.write('\n')
          resolve(value)
          return
        }
        if (ch === '\u0003') { // Ctrl+C
          stdin.setRawMode(false)
          stdout.write('\nMegszakítva.\n')
          process.exit(130)
        }
        if (ch === '\u0008' || ch === '\u007f') { // Backspace
          if (value.length) {
            value = value.slice(0, -1)
            stdout.write('\b \b')
          }
          continue
        }
        if (ch < ' ') continue // egyéb vezérlőkarakter
        value += ch
        stdout.write('•')
      }
    }
    stdin.on('data', onData)
  })
}

console.log(`${LABELS[area]} – új jelszó beállítása`)
const password = await askHidden('Új jelszó: ')
if (password.trim().length < MIN_LENGTH) {
  console.error(`Legalább ${MIN_LENGTH} karakter legyen. Futtasd újra a parancsot.`)
  process.exit(1)
}
const again = await askHidden('Még egyszer: ')
if (again !== password) {
  console.error('A két jelszó nem egyezik. Futtasd újra a parancsot.')
  process.exit(1)
}

const key = hashEnv(area)
setEnv(key, hashPassword(password))
console.log(`Kész: ${key} beírva a .env-be.`)
console.log('Élesítéshez ugyanezt az értéket másold be a Netlify-on: Project configuration → Environment variables.')
