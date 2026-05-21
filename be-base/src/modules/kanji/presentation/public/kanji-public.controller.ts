import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiPropertyOptional,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SearchKanjiPublicUseCase } from '../../application/use-cases/search-kanji-public.use-case';
import { GetKanjiPublicUseCase } from '../../application/use-cases/get-kanji-public.use-case';
import { ListKanjiRadicalsUseCase } from '../../application/use-cases/list-kanji-radicals.use-case';
import type { Kanji } from '../../domain/entities/kanji.entity';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';

const JLPT_VALUES = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;

class SearchKanjiQueryDto {
  @ApiPropertyOptional({ enum: JLPT_VALUES })
  @IsOptional() @IsIn(JLPT_VALUES as readonly string[])
  jlptLevel?: JlptLevel;

  @ApiPropertyOptional() @IsOptional() @IsString() radicalId?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  strokesMin?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  strokesMax?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ default: 1 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number;
  @ApiPropertyOptional({ default: 64 })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200)
  limit?: number;
}

function mapKanjiPublic(k: Kanji) {
  return {
    id: k.id.value,
    char: k.char,
    jlptLevel: k.jlptLevel,
    strokes: k.strokes,
    radicalId: k.radicalId,
    radical: k.radical,
    frequency: k.frequency,
    joyoOrder: k.joyoOrder,
    unicode: k.unicode,
    onReadings: k.onReadings,
    kunReadings: k.kunReadings,
    meaningVi: k.meaningVi,
    meaningEn: k.meaningEn,
    strokeOrderSvg: k.strokeOrderSvg,
    components: k.components,
    mnemonicVi: k.mnemonicVi,
    meanings: k.meanings,
    examples: k.examples,
    compounds: k.compounds,
    similar: k.similar,
  };
}

@ApiTags('Kanji (Public)')
@Controller('kanji')
export class KanjiPublicController {
  constructor(
    private readonly searchUC: SearchKanjiPublicUseCase,
    private readonly getUC: GetKanjiPublicUseCase,
    private readonly listRadicalsUC: ListKanjiRadicalsUseCase,
  ) {}

  @Get('radicals')
  @ApiOperation({ summary: 'Danh sách bộ thủ (public)' })
  async listRadicals() {
    const data = await this.listRadicalsUC.execute();
    return {
      success: true,
      data: data.map((r) => ({
        id: r.id.value,
        char: r.char,
        meaningVi: r.meaningVi,
        strokes: r.strokes,
        isPopular: r.isPopular,
      })),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Tìm kiếm kanji đã published' })
  @ApiQuery({ name: 'jlptLevel', required: false, enum: JLPT_VALUES })
  async search(@Query() q: SearchKanjiQueryDto) {
    const page = q.page ?? 1;
    const pageSize = q.limit ?? 64;
    const { data, total } = await this.searchUC.execute({
      jlptLevel: q.jlptLevel,
      radicalId: q.radicalId,
      strokesMin: q.strokesMin,
      strokesMax: q.strokesMax,
      search: q.search,
      page,
      pageSize,
    });
    return {
      success: true,
      data: data.map(mapKanjiPublic),
      meta: {
        totalItems: total,
        currentPage: page,
        itemsPerPage: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết kanji (chỉ published)' })
  @ApiParam({ name: 'id' })
  async getOne(@Param('id') id: string) {
    const r = await this.getUC.execute(id);
    if (!r.ok) throw new NotFoundException(r.error);
    return { success: true, data: mapKanjiPublic(r.value) };
  }
}
