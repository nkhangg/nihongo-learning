import { randomUUID } from 'crypto';
import { ValueObject } from '../../../../shared/domain/value-object';

interface KanjiIdProps {
  value: string;
}

export class KanjiId extends ValueObject<KanjiIdProps> {
  static create(): KanjiId {
    return new KanjiId({ value: randomUUID() });
  }

  static from(value: string): KanjiId {
    return new KanjiId({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
