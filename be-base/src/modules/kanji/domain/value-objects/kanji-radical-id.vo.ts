import { randomUUID } from 'crypto';
import { ValueObject } from '../../../../shared/domain/value-object';

interface KanjiRadicalIdProps {
  value: string;
}

export class KanjiRadicalId extends ValueObject<KanjiRadicalIdProps> {
  static create(): KanjiRadicalId {
    return new KanjiRadicalId({ value: randomUUID() });
  }

  static from(value: string): KanjiRadicalId {
    return new KanjiRadicalId({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
