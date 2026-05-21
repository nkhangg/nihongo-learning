import { Injectable } from '@nestjs/common';
import { Prisma, JlptLevel as PrismaJlptLevel, KanjiStatus as PrismaKanjiStatus } from '@prisma/client';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import type { Kanji } from '../../domain/entities/kanji.entity';
import type {
  IKanjiRepository,
  ListKanjiOptions,
} from '../../domain/repositories/kanji.repository';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';
import {
  KanjiMapper,
  jlptLevelToPrisma,
  kanjiStatusToPrisma,
} from '../mappers/kanji.mapper';

const KANJI_INCLUDE = {
  radical: true,
  meanings: true,
  examples: true,
  compounds: true,
  similarFrom: true,
};

@Injectable()
export class PrismaKanjiRepository implements IKanjiRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Kanji | null> {
    const r = await this.prisma.kanji.findUnique({
      where: { id },
      include: KANJI_INCLUDE,
    });
    return r ? KanjiMapper.toDomain(r) : null;
  }

  async findByChar(char: string): Promise<Kanji | null> {
    const r = await this.prisma.kanji.findUnique({
      where: { char },
      include: KANJI_INCLUDE,
    });
    return r ? KanjiMapper.toDomain(r) : null;
  }

  async findManyByIds(ids: string[]): Promise<Kanji[]> {
    if (ids.length === 0) return [];
    const rows = await this.prisma.kanji.findMany({
      where: { id: { in: ids } },
      include: KANJI_INCLUDE,
    });
    return rows.map(KanjiMapper.toDomain);
  }

  async list(
    opts: ListKanjiOptions,
  ): Promise<{ data: Kanji[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (opts.publishedOnly) where['status'] = 'PUBLISHED';
    else if (opts.status) where['status'] = kanjiStatusToPrisma(opts.status);
    if (opts.jlptLevel) where['jlptLevel'] = jlptLevelToPrisma(opts.jlptLevel);
    if (opts.radicalId) where['radicalId'] = opts.radicalId;
    if (opts.strokesMin !== undefined || opts.strokesMax !== undefined) {
      const range: Record<string, number> = {};
      if (opts.strokesMin !== undefined) range['gte'] = opts.strokesMin;
      if (opts.strokesMax !== undefined) range['lte'] = opts.strokesMax;
      where['strokes'] = range;
    }
    if (opts.search) {
      where['OR'] = [
        { char: { contains: opts.search } },
        { meaningVi: { contains: opts.search, mode: 'insensitive' } },
        { meaningEn: { contains: opts.search, mode: 'insensitive' } },
      ];
    }

    const skip = (opts.page - 1) * opts.pageSize;
    const [rows, total] = await Promise.all([
      this.prisma.kanji.findMany({
        where,
        skip,
        take: opts.pageSize,
        include: KANJI_INCLUDE,
        orderBy: [{ jlptLevel: 'asc' }, { strokes: 'asc' }, { char: 'asc' }],
      }),
      this.prisma.kanji.count({ where }),
    ]);
    return { data: rows.map(KanjiMapper.toDomain), total };
  }

  async pickRandomPublished(params: {
    jlptLevel: JlptLevel;
    count: number;
    excludeIds?: string[];
  }): Promise<Kanji[]> {
    // Postgres ORDER BY random() — fine for small N (quiz pools).
    const excludeFilter =
      params.excludeIds && params.excludeIds.length > 0
        ? Prisma.sql`AND id NOT IN (${Prisma.join(params.excludeIds)})`
        : Prisma.empty;
    const ids = await this.prisma.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`SELECT id FROM "kanjis" WHERE "status" = 'PUBLISHED' AND "jlptLevel" = ${params.jlptLevel}::"JlptLevel" ${excludeFilter} ORDER BY random() LIMIT ${params.count}`,
    );
    if (ids.length === 0) return [];
    return this.findManyByIds(ids.map((r) => r.id));
  }

  async save(kanji: Kanji): Promise<void> {
    const meaningsCreate = KanjiMapper.meaningsToCreate(kanji);
    const examplesCreate = KanjiMapper.examplesToCreate(kanji);
    const compoundsCreate = KanjiMapper.compoundsToCreate(kanji);
    const similarCreate = KanjiMapper.similarToCreate(kanji);

    const baseData = {
      char: kanji.char,
      jlptLevel: jlptLevelToPrisma(kanji.jlptLevel) as PrismaJlptLevel,
      strokes: kanji.strokes,
      radicalId: kanji.radicalId,
      frequency: kanji.frequency,
      joyoOrder: kanji.joyoOrder,
      unicode: kanji.unicode,
      onReadings: kanji.onReadings,
      kunReadings: kanji.kunReadings,
      meaningVi: kanji.meaningVi,
      meaningEn: kanji.meaningEn,
      strokeOrderSvg: kanji.strokeOrderSvg,
      mnemonicVi: kanji.mnemonicVi,
      status: kanjiStatusToPrisma(kanji.status) as PrismaKanjiStatus,
    };

    // Aggregate save: wipe nested children and re-create. Works because
    // domain entity replaces these collections wholesale via replaceX methods.
    await this.prisma.$transaction(async (tx) => {
      const exists = await tx.kanji.findUnique({
        where: { id: kanji.id.value },
        select: { id: true },
      });
      if (exists) {
        await Promise.all([
          tx.kanjiMeaning.deleteMany({ where: { kanjiId: kanji.id.value } }),
          tx.kanjiExample.deleteMany({ where: { kanjiId: kanji.id.value } }),
          tx.kanjiCompound.deleteMany({ where: { kanjiId: kanji.id.value } }),
          tx.kanjiSimilar.deleteMany({ where: { kanjiId: kanji.id.value } }),
        ]);
        await tx.kanji.update({
          where: { id: kanji.id.value },
          data: {
            ...baseData,
            meanings: { create: meaningsCreate },
            examples: { create: examplesCreate },
            compounds: { create: compoundsCreate },
            similarFrom: { create: similarCreate },
          },
        });
      } else {
        await tx.kanji.create({
          data: {
            id: kanji.id.value,
            ...baseData,
            createdAt: kanji.createdAt,
            updatedAt: kanji.updatedAt,
            meanings: { create: meaningsCreate },
            examples: { create: examplesCreate },
            compounds: { create: compoundsCreate },
            similarFrom: { create: similarCreate },
          },
        });
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.kanji.delete({ where: { id } });
  }
}
