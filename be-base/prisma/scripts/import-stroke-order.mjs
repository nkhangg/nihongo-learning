/**
 * Import stroke order SVG data from KanjiVG (https://kanjivg.tagaini.net)
 * License: CC BY-SA 3.0 — https://creativecommons.org/licenses/by-sa/3.0/
 *
 * Usage: node prisma/scripts/import-stroke-order.mjs [--dry-run] [--char 家]
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const KANJIVG_BASE = 'https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji'
const VIEWBOX = '0 0 109 109'

// Color scheme: completed strokes light gray, active stroke dark
const COLOR_DONE = '#C8C8C8'
const COLOR_ACTIVE = '#1A1A1A'
const STROKE_STYLE = 'fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round'

function charToCodepoint(char) {
  return char.codePointAt(0).toString(16).padStart(5, '0')
}

async function fetchKanjiVgSvg(codepoint) {
  const url = `${KANJIVG_BASE}/${codepoint}.svg`
  const res = await fetch(url)
  if (!res.ok) return null
  return res.text()
}

/**
 * Extract stroke <path d="..."> in order s1, s2, s3...
 * Returns array of path 'd' attribute values.
 */
function extractStrokePaths(svgContent) {
  // Match all stroke paths: id="kvg:XXXXX-sN" ... d="..."
  // Paths appear in document order which matches stroke order
  const strokeSection = svgContent.match(
    /<g id="kvg:StrokePaths_[^"]*"[^>]*>([\s\S]*?)<g id="kvg:StrokeNumbers_/
  )
  if (!strokeSection) return []

  const paths = []
  const pathRe = /id="kvg:[0-9a-f]+-s(\d+)"[^>]*d="([^"]+)"/g
  let m
  while ((m = pathRe.exec(strokeSection[1])) !== null) {
    const strokeIndex = parseInt(m[1], 10)
    paths[strokeIndex - 1] = m[2]
  }

  // Filter out undefined slots (shouldn't happen but be safe)
  return paths.filter(Boolean)
}

/**
 * Build a minimal SVG showing strokes 1..upToStroke.
 * The latest stroke is dark, previous strokes are light gray.
 */
function buildStrokeSvg(allPaths, upToStroke) {
  const pathEls = allPaths.slice(0, upToStroke).map((d, i) => {
    const isActive = i === upToStroke - 1
    const color = isActive ? COLOR_ACTIVE : COLOR_DONE
    return `<path d="${d}" stroke="${color}"/>`
  })

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" style="${STROKE_STYLE}">`,
    ...pathEls,
    '</svg>',
  ].join('')
}

async function processKanji(kanji, dryRun) {
  const unicode = kanji.unicode.replace(/^U\+/i, '').toLowerCase()
  const codepoint = unicode.padStart(5, '0')

  const svgContent = await fetchKanjiVgSvg(codepoint)
  if (!svgContent) {
    console.warn(`  [SKIP] ${kanji.char} — no KanjiVG data for ${codepoint}`)
    return false
  }

  const paths = extractStrokePaths(svgContent)
  if (paths.length === 0) {
    console.warn(`  [SKIP] ${kanji.char} — could not parse stroke paths`)
    return false
  }

  const strokeOrderSvg = paths.map((_, i) => buildStrokeSvg(paths, i + 1))

  if (dryRun) {
    console.log(
      `  [DRY] ${kanji.char} — ${paths.length} strokes, SVG[0] length: ${strokeOrderSvg[0].length}`
    )
    return true
  }

  await prisma.kanji.update({
    where: { id: kanji.id },
    data: { strokeOrderSvg },
  })

  console.log(`  [OK]  ${kanji.char} — ${paths.length} strokes imported`)
  return true
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const charFilter = args.includes('--char') ? args[args.indexOf('--char') + 1] : null

  let kanjis = await prisma.kanji.findMany({
    where: charFilter ? { char: charFilter } : {},
    select: { id: true, char: true, unicode: true, strokes: true, strokeOrderSvg: true },
    orderBy: { jlptLevel: 'asc' },
  })

  if (!charFilter) {
    kanjis = kanjis.filter((k) => k.strokeOrderSvg.length === 0)
  }

  console.log(`Found ${kanjis.length} kanji to process${dryRun ? ' (dry run)' : ''}`)

  let ok = 0
  let skip = 0

  for (const kanji of kanjis) {
    const success = await processKanji(kanji, dryRun)
    if (success) ok++
    else skip++

    // Polite delay to avoid GitHub rate limits
    if (kanjis.length > 1) await new Promise((r) => setTimeout(r, 150))
  }

  console.log(`\nDone: ${ok} imported, ${skip} skipped`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
