import { BaseEntity } from '../../../../shared/domain/base-entity';
import { KanjiId } from '../value-objects/kanji-id.vo';
import type { JlptLevel } from '../value-objects/jlpt-level.vo';

export type KanjiStatus = 'draft' | 'published';
export type KanjiMeaningPos = 'noun' | 'verb' | 'adj' | 'adv' | 'other';

export interface KanjiMeaning {
  index: number;
  pos: KanjiMeaningPos;
  textVi: string;
  jpExample: string | null;
}

export interface KanjiExample {
  // jpHtml MUST be sanitized before reaching this entity (use-case responsibility).
  // Whitelist: <ruby>, <rt>, <em>, <span class="highlight">
  jpHtml: string;
  vi: string;
  source: string | null;
}

export interface KanjiCompound {
  jp: string;
  reading: string;
  meaningVi: string;
}

export interface KanjiSimilarRef {
  similarKanjiId: string;
  reason: string;
}

export interface KanjiRadical {
  char: string;
  meaningVi: string;
  strokes: number;
}

export interface KanjiComponent {
  char: string;
  meaningVi: string;
}

export interface KanjiProps {
  char: string;
  jlptLevel: JlptLevel;
  strokes: number;
  radicalId: string | null;
  radical: KanjiRadical | null;
  frequency: number | null;
  joyoOrder: number | null;
  unicode: string;
  onReadings: string[];
  kunReadings: string[];
  meaningVi: string;
  meaningEn: string;
  strokeOrderSvg: string[];
  components: KanjiComponent[];
  mnemonicVi: string | null;
  status: KanjiStatus;
  meanings: KanjiMeaning[];
  examples: KanjiExample[];
  compounds: KanjiCompound[];
  similar: KanjiSimilarRef[];
  createdAt: Date;
  updatedAt: Date;
}

export class Kanji extends BaseEntity<KanjiId> {
  private props: KanjiProps;

  private constructor(id: KanjiId, props: KanjiProps) {
    super(id);
    this.props = props;
  }

  static create(params: {
    char: string;
    jlptLevel: JlptLevel;
    strokes: number;
    radicalId?: string;
    frequency?: number;
    joyoOrder?: number;
    unicode: string;
    onReadings?: string[];
    kunReadings?: string[];
    meaningVi: string;
    meaningEn: string;
    strokeOrderSvg?: string[];
    mnemonicVi?: string;
    status?: KanjiStatus;
    meanings?: KanjiMeaning[];
    examples?: KanjiExample[];
    compounds?: KanjiCompound[];
    components?: KanjiComponent[];
    similar?: KanjiSimilarRef[];
  }): Kanji {
    const now = new Date();
    return new Kanji(KanjiId.create(), {
      char: params.char,
      jlptLevel: params.jlptLevel,
      strokes: params.strokes,
      radicalId: params.radicalId ?? null,
      radical: null,
      frequency: params.frequency ?? null,
      joyoOrder: params.joyoOrder ?? null,
      unicode: params.unicode,
      onReadings: params.onReadings ?? [],
      kunReadings: params.kunReadings ?? [],
      meaningVi: params.meaningVi,
      meaningEn: params.meaningEn,
      strokeOrderSvg: params.strokeOrderSvg ?? [],
      components: params.components ?? [],
      mnemonicVi: params.mnemonicVi ?? null,
      status: params.status ?? 'draft',
      meanings: params.meanings ?? [],
      examples: params.examples ?? [],
      compounds: params.compounds ?? [],
      similar: params.similar ?? [],
      createdAt: now,
      updatedAt: now,
    });
  }

  static reconstitute(id: string, props: KanjiProps): Kanji {
    return new Kanji(KanjiId.from(id), props);
  }

  update(params: {
    char?: string;
    jlptLevel?: JlptLevel;
    strokes?: number;
    radicalId?: string | null;
    frequency?: number | null;
    joyoOrder?: number | null;
    unicode?: string;
    onReadings?: string[];
    kunReadings?: string[];
    meaningVi?: string;
    meaningEn?: string;
    strokeOrderSvg?: string[];
    mnemonicVi?: string | null;
  }): void {
    const p = this.props;
    if (params.char !== undefined) p.char = params.char;
    if (params.jlptLevel !== undefined) p.jlptLevel = params.jlptLevel;
    if (params.strokes !== undefined) p.strokes = params.strokes;
    if (params.radicalId !== undefined) p.radicalId = params.radicalId;
    if (params.frequency !== undefined) p.frequency = params.frequency;
    if (params.joyoOrder !== undefined) p.joyoOrder = params.joyoOrder;
    if (params.unicode !== undefined) p.unicode = params.unicode;
    if (params.onReadings !== undefined) p.onReadings = params.onReadings;
    if (params.kunReadings !== undefined) p.kunReadings = params.kunReadings;
    if (params.meaningVi !== undefined) p.meaningVi = params.meaningVi;
    if (params.meaningEn !== undefined) p.meaningEn = params.meaningEn;
    if (params.strokeOrderSvg !== undefined)
      p.strokeOrderSvg = params.strokeOrderSvg;
    if (params.mnemonicVi !== undefined) p.mnemonicVi = params.mnemonicVi;
    p.updatedAt = new Date();
  }

  replaceMeanings(meanings: KanjiMeaning[]): void {
    this.props.meanings = meanings;
    this.props.updatedAt = new Date();
  }

  replaceExamples(examples: KanjiExample[]): void {
    this.props.examples = examples;
    this.props.updatedAt = new Date();
  }

  replaceCompounds(compounds: KanjiCompound[]): void {
    this.props.compounds = compounds;
    this.props.updatedAt = new Date();
  }

  replaceComponents(components: KanjiComponent[]): void {
    this.props.components = components;
    this.props.updatedAt = new Date();
  }

  replaceSimilar(similar: KanjiSimilarRef[]): void {
    this.props.similar = similar;
    this.props.updatedAt = new Date();
  }

  publish(): void {
    this.props.status = 'published';
    this.props.updatedAt = new Date();
  }

  unpublish(): void {
    this.props.status = 'draft';
    this.props.updatedAt = new Date();
  }

  get char(): string {
    return this.props.char;
  }
  get jlptLevel(): JlptLevel {
    return this.props.jlptLevel;
  }
  get strokes(): number {
    return this.props.strokes;
  }
  get radicalId(): string | null {
    return this.props.radicalId;
  }
  get radical(): KanjiRadical | null {
    return this.props.radical;
  }
  get frequency(): number | null {
    return this.props.frequency;
  }
  get joyoOrder(): number | null {
    return this.props.joyoOrder;
  }
  get unicode(): string {
    return this.props.unicode;
  }
  get onReadings(): string[] {
    return this.props.onReadings;
  }
  get kunReadings(): string[] {
    return this.props.kunReadings;
  }
  get meaningVi(): string {
    return this.props.meaningVi;
  }
  get meaningEn(): string {
    return this.props.meaningEn;
  }
  get strokeOrderSvg(): string[] {
    return this.props.strokeOrderSvg;
  }
  get components(): KanjiComponent[] {
    return this.props.components;
  }
  get mnemonicVi(): string | null {
    return this.props.mnemonicVi;
  }
  get status(): KanjiStatus {
    return this.props.status;
  }
  get isPublished(): boolean {
    return this.props.status === 'published';
  }
  get meanings(): KanjiMeaning[] {
    return this.props.meanings;
  }
  get examples(): KanjiExample[] {
    return this.props.examples;
  }
  get compounds(): KanjiCompound[] {
    return this.props.compounds;
  }
  get similar(): KanjiSimilarRef[] {
    return this.props.similar;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
}
