import { Inject, Injectable } from '@nestjs/common';
import type { KanjiRadical } from '../../domain/entities/kanji-radical.entity';
import {
  KANJI_RADICAL_REPOSITORY,
  type IKanjiRadicalRepository,
} from '../../domain/repositories/kanji-radical.repository';

@Injectable()
export class ListKanjiRadicalsUseCase {
  constructor(
    @Inject(KANJI_RADICAL_REPOSITORY)
    private readonly repo: IKanjiRadicalRepository,
  ) {}

  async execute(): Promise<KanjiRadical[]> {
    return this.repo.listAll();
  }
}
