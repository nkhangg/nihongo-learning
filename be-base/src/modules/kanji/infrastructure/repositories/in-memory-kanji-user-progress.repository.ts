import type {
  KanjiProgressStatus,
  KanjiUserProgress,
} from '../../domain/entities/kanji-user-progress.entity';
import type {
  IKanjiUserProgressRepository,
  KanjiProgressSummary,
} from '../../domain/repositories/kanji-user-progress.repository';
import type { Kanji } from '../../domain/entities/kanji.entity';
import type {
  IKanjiRepository,
} from '../../domain/repositories/kanji.repository';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';
import { JLPT_LEVELS } from '../../domain/value-objects/jlpt-level.vo';

export class InMemoryKanjiUserProgressRepository
  implements IKanjiUserProgressRepository
{
  private readonly store = new Map<string, KanjiUserProgress>();

  constructor(private readonly kanjiRepo: IKanjiRepository) {}

  private key(userId: string, kanjiId: string): string {
    return `${userId}:${kanjiId}`;
  }

  async findByUserAndKanji(
    userId: string,
    kanjiId: string,
  ): Promise<KanjiUserProgress | null> {
    return this.store.get(this.key(userId, kanjiId)) ?? null;
  }

  async findManyByUser(
    userId: string,
    opts?: { status?: KanjiProgressStatus; kanjiIds?: string[] },
  ): Promise<KanjiUserProgress[]> {
    const kanjiIdSet = opts?.kanjiIds ? new Set(opts.kanjiIds) : null;
    return Array.from(this.store.values()).filter(
      (p) =>
        p.userId === userId &&
        (opts?.status ? p.status === opts.status : true) &&
        (kanjiIdSet ? kanjiIdSet.has(p.kanjiId) : true),
    );
  }

  async getSummary(userId: string): Promise<KanjiProgressSummary> {
    const userProgress = await this.findManyByUser(userId);
    const byKanji = new Map(userProgress.map((p) => [p.kanjiId, p]));

    const { data: allKanji } = await this.kanjiRepo.list({
      publishedOnly: true,
      page: 1,
      pageSize: 10000,
    });

    const byLevel = {} as KanjiProgressSummary['byLevel'];
    let total = 0;
    let known = 0;
    let learning = 0;
    for (const level of JLPT_LEVELS) {
      const ofLevel = allKanji.filter((k: Kanji) => k.jlptLevel === level);
      let lKnown = 0;
      let lLearning = 0;
      for (const k of ofLevel) {
        const p = byKanji.get(k.id.value);
        if (p?.status === 'known') lKnown++;
        else if (p?.status === 'learning') lLearning++;
      }
      byLevel[level] = {
        total: ofLevel.length,
        known: lKnown,
        learning: lLearning,
      };
      total += ofLevel.length;
      known += lKnown;
      learning += lLearning;
    }
    return { total, known, learning, unseen: total - known - learning, byLevel };
  }

  async pickLearningKanjiIds(params: {
    userId: string;
    jlptLevel?: JlptLevel;
    limit: number;
  }): Promise<string[]> {
    const candidates = Array.from(this.store.values())
      .filter((p) => p.userId === params.userId && p.status === 'learning')
      .sort((a, b) => {
        const ta = a.lastReviewedAt?.getTime() ?? 0;
        const tb = b.lastReviewedAt?.getTime() ?? 0;
        return ta - tb;
      });

    if (!params.jlptLevel) {
      return candidates.slice(0, params.limit).map((p) => p.kanjiId);
    }

    const result: string[] = [];
    for (const p of candidates) {
      const k = await this.kanjiRepo.findById(p.kanjiId);
      if (k && k.jlptLevel === params.jlptLevel) result.push(p.kanjiId);
      if (result.length >= params.limit) break;
    }
    return result;
  }

  async save(progress: KanjiUserProgress): Promise<void> {
    this.store.set(this.key(progress.userId, progress.kanjiId), progress);
  }
}
