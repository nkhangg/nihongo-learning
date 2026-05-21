/**
 * Seed a handful of N5 kanji for development/testing.
 * Safe to re-run (upsert on char).
 *
 * Usage: node prisma/scripts/seed-n5-kanji.mjs
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const N5_KANJI = [
  {
    char: '山',
    strokes: 3,
    unicode: 'U+5C71',
    onReadings: ['サン', 'セン'],
    kunReadings: ['やま'],
    meaningVi: 'Núi',
    meaningEn: 'mountain',
    frequency: 188,
    joyoOrder: 36,
    meanings: [{ index: 1, pos: 'Danh từ', textVi: 'Núi' }],
  },
  {
    char: '日',
    strokes: 4,
    unicode: 'U+65E5',
    onReadings: ['ニチ', 'ジツ'],
    kunReadings: ['ひ', '-び', '-か'],
    meaningVi: 'Ngày, Mặt trời, Nhật Bản',
    meaningEn: 'day, sun, Japan',
    frequency: 1,
    joyoOrder: 6,
    meanings: [
      { index: 1, pos: 'Danh từ', textVi: 'Ngày, mặt trời' },
      { index: 2, pos: 'Danh từ', textVi: 'Nhật Bản (trong các từ ghép)' },
    ],
  },
  {
    char: '水',
    strokes: 4,
    unicode: 'U+6C34',
    onReadings: ['スイ'],
    kunReadings: ['みず', 'みな-'],
    meaningVi: 'Nước',
    meaningEn: 'water',
    frequency: 93,
    joyoOrder: 19,
    meanings: [{ index: 1, pos: 'Danh từ', textVi: 'Nước' }],
  },
  {
    char: '生',
    strokes: 5,
    unicode: 'U+751F',
    onReadings: ['セイ', 'ショウ'],
    kunReadings: ['い-きる', 'う-まれる', 'なま'],
    meaningVi: 'Sinh sống, tươi sống',
    meaningEn: 'life, living, raw',
    frequency: 29,
    joyoOrder: 12,
    meanings: [
      { index: 1, pos: 'Danh từ', textVi: 'Sự sống, cuộc sống' },
      { index: 2, pos: 'Tính từ', textVi: 'Sống, tươi sống (chưa nấu)' },
    ],
  },
  {
    char: '年',
    strokes: 6,
    unicode: 'U+5E74',
    onReadings: ['ネン'],
    kunReadings: ['とし'],
    meaningVi: 'Năm (thời gian)',
    meaningEn: 'year',
    frequency: 10,
    joyoOrder: 18,
    meanings: [{ index: 1, pos: 'Danh từ', textVi: 'Năm (đơn vị thời gian)' }],
  },
  {
    char: '学',
    strokes: 8,
    unicode: 'U+5B66',
    onReadings: ['ガク'],
    kunReadings: ['まな-ぶ'],
    meaningVi: 'Học, nghiên cứu',
    meaningEn: 'study, learning',
    frequency: 54,
    joyoOrder: 31,
    meanings: [{ index: 1, pos: 'Động từ', textVi: 'Học, nghiên cứu' }],
  },
]

async function main() {
  for (const k of N5_KANJI) {
    const { meanings, ...base } = k
    const kanji = await prisma.kanji.upsert({
      where: { char: base.char },
      update: {},
      create: {
        ...base,
        jlptLevel: 'N5',
        status: 'PUBLISHED',
        meanings: {
          create: meanings.map((m) => ({
            index: m.index,
            pos: m.pos,
            textVi: m.textVi,
          })),
        },
      },
    })
    console.log(`[OK] ${kanji.char} — id: ${kanji.id}`)
  }
  console.log(`\nSeeded ${N5_KANJI.length} kanji`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
