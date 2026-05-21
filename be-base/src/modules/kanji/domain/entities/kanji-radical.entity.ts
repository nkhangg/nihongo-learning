import { BaseEntity } from '../../../../shared/domain/base-entity';
import { KanjiRadicalId } from '../value-objects/kanji-radical-id.vo';

export interface KanjiRadicalProps {
  char: string;
  meaningVi: string;
  strokes: number;
  isPopular: boolean;
}

export class KanjiRadical extends BaseEntity<KanjiRadicalId> {
  private props: KanjiRadicalProps;

  private constructor(id: KanjiRadicalId, props: KanjiRadicalProps) {
    super(id);
    this.props = props;
  }

  static create(params: {
    char: string;
    meaningVi: string;
    strokes: number;
    isPopular?: boolean;
  }): KanjiRadical {
    return new KanjiRadical(KanjiRadicalId.create(), {
      char: params.char,
      meaningVi: params.meaningVi,
      strokes: params.strokes,
      isPopular: params.isPopular ?? false,
    });
  }

  static reconstitute(id: string, props: KanjiRadicalProps): KanjiRadical {
    return new KanjiRadical(KanjiRadicalId.from(id), props);
  }

  update(params: Partial<KanjiRadicalProps>): void {
    if (params.char !== undefined) this.props.char = params.char;
    if (params.meaningVi !== undefined) this.props.meaningVi = params.meaningVi;
    if (params.strokes !== undefined) this.props.strokes = params.strokes;
    if (params.isPopular !== undefined) this.props.isPopular = params.isPopular;
  }

  get char(): string {
    return this.props.char;
  }
  get meaningVi(): string {
    return this.props.meaningVi;
  }
  get strokes(): number {
    return this.props.strokes;
  }
  get isPopular(): boolean {
    return this.props.isPopular;
  }
}
