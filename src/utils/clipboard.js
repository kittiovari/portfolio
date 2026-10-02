// Vágólapra másolás tartalékmegoldással.
// A Clipboard API csak biztonságos kontextusban és engedéllyel működik,
// ezért ha elbukik, egy rejtett textarea + execCommand veszi át.
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // továbbmegyünk a tartalékra
  }

  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  } catch {
    return false
  }
}
