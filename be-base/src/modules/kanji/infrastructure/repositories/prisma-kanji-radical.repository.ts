import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import type { KanjiRadical } from '../../domain/entities/kanji-radical.entity';
import type { IKanjiRadicalRepository } from '../../domain/repositories/kanji-radical.repository';
import { KanjiRadicalMapper } from '../mappers/kanji-radical.mapper';

@Injectable()
export class PrismaKanjiRadicalRepository implements IKanjiRadicalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<KanjiRadical | null> {
    const r = await this.prisma.kanjiRadical.findUnique({ where: { id } });
    return r ? KanjiRadicalMapper.toDomain(r) : null;
  }

  async findByChar(char: string): Promise<KanjiRadical | null> {
    const r = await this.prisma.kanjiRadical.findUnique({ where: { char } });
    return r ? KanjiRadicalMapper.toDomain(r) : null;
  }

  async listAll(): Promise<KanjiRadical[]> {
    const rows = await this.prisma.kanjiRadical.findMany({
      orderBy: [{ isPopular: 'desc' }, { strokes: 'asc' }, { char: 'asc' }],
    });
    return rows.map(KanjiRadicalMapper.toDomain);
  }

  async save(radical: KanjiRadical): Promise<void> {
    const data = KanjiRadicalMapper.toPrisma(radical);
    await this.prisma.kanjiRadical.upsert({
      where: { id: radical.id.value },
      create: { id: radical.id.value, ...data },
      update: data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.kanjiRadical.delete({ where: { id } });
  }
}
