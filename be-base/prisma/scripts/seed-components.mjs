/**
 * Seed kanji component breakdown data.
 * Usage: node prisma/scripts/seed-components.mjs
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Component breakdown for each kanji
// Source: standard kanji decomposition (KanjiVG / KRADFILE)
const COMPONENTS = {
  '山': [{ char: '山', meaningVi: 'Núi' }],
  '日': [{ char: '日', meaningVi: 'Mặt trời, ngày' }],
  '水': [{ char: '水', meaningVi: 'Nước' }],
  '生': [{ char: '生', meaningVi: 'Sinh, sống' }],
  '年': [
    { char: '干', meaningVi: 'Khô, can' },
    { char: '人', meaningVi: 'Người' },
  ],
  '学': [
    { char: '爫', meaningVi: 'Móng vuốt (biến thể)' },
    { char: '冖', meaningVi: 'Mái che' },
    { char: '子', meaningVi: 'Trẻ em, con' },
  ],
  '家': [
    { char: '宀', meaningVi: 'Mái nhà' },
    { char: '豕', meaningVi: 'Con lợn' },
  ],
}

async function main() {
  for (const [char, components] of Object.entries(COMPONENTS)) {
    const updated = await prisma.kanji.updateMany({
      where: { char },
      data: { components },
    })
    console.log(`${char} → [${components.map(c => c.char).join(' + ')}] (${updated.count} updated)`)
  }
  console.log('\nDone')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
