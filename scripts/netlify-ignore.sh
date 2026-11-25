#!/bin/sh
# Netlify „ignore” parancs: eldönti, hogy egy push után kell-e új build.
# Kilépési kód: 0 = build kihagyása (nem fogy kredit), 1 = build indul.
#
# Csak akkor hagyjuk ki, ha van korábbi build, az új commit más, és a
# változás egyetlen, az oldalt érintő fájlt sem módosított (pl. csak a
# leírás, a Dependabot-beállítás vagy egy helyi szkript változott).
# A kézzel indított „Trigger deploy” (ugyanaz a commit) mindig lefut.

[ -n "$CACHED_COMMIT_REF" ] && [ "$CACHED_COMMIT_REF" != "$COMMIT_REF" ] || exit 1

git diff --quiet "$CACHED_COMMIT_REF" "$COMMIT_REF" -- \
  src public netlify protected \
  index.html vite.config.js package.json package-lock.json netlify.toml
