/**
 * Seed radicals for existing kanji.
 * Safe to re-run (upsert on char).
 *
 * Usage: node prisma/scripts/seed-radicals.mjs
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Radical definitions + which kanji they belong to
const RADICALS = [
  {
    char: '山',
    meaningVi: 'Núi',
    strokes: 3,
    isPopular: true,
    kanjiChars: ['山'],
  },
  {
    char: '日',
    meaningVi: 'Mặt trời, ngày',
    strokes: 4,
    isPopular: true,
    kanjiChars: ['日'],
  },
  {
    char: '水',
    meaningVi: 'Nước',
    strokes: 4,
    isPopular: true,
    kanjiChars: ['水'],
  },
  {
    char: '生',
    meaningVi: 'Sinh, sống',
    strokes: 5,
    isPopular: false,
    kanjiChars: ['生'],
  },
  {
    char: '干',
    meaningVi: 'Khô, can',
    strokes: 3,
    isPopular: false,
    kanjiChars: ['年'],
  },
  {
    char: '子',
    meaningVi: 'Con, đứa trẻ',
    strokes: 3,
    isPopular: true,
    kanjiChars: ['学'],
  },
  {
    char: '宀',
    meaningVi: 'Mái nhà, căn nhà',
    strokes: 3,
    isPopular: false,
    kanjiChars: ['家'],
  },
]

async function main() {
  for (const { kanjiChars, ...radicalData } of RADICALS) {
    const radical = await prisma.kanjiRadical.upsert({
      where: { char: radicalData.char },
      update: {},
      create: radicalData,
    })

    for (const char of kanjiChars) {
      const updated = await prisma.kanji.updateMany({
        where: { char, radicalId: null },
        data: { radicalId: radical.id },
      })
      const status = updated.count > 0 ? 'linked' : 'already set'
      console.log(`  ${char} → 「${radical.char}」 ${status}`)
    }
  }

  const total = await prisma.kanjiRadical.count()
  const linked = await prisma.kanji.count({ where: { radicalId: { not: null } } })
  console.log(`\nDone: ${total} radicals, ${linked} kanji linked`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
