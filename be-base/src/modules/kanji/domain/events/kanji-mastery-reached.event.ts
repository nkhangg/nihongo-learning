import { DomainEvent } from '../../../../shared/domain/domain-event';
import type { JlptLevel } from '../value-objects/jlpt-level.vo';

export class KanjiMasteryReachedEvent extends DomainEvent {
  readonly eventName = 'kanji.mastery_reached';

  constructor(
    public readonly userId: string,
    public readonly kanjiId: string,
    public readonly kanjiChar: string,
    public readonly jlptLevel: JlptLevel,
  ) {
    super();
  }
}
