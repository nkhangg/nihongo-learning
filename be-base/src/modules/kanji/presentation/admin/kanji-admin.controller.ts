import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  Paginate,
  type PaginateQuery,
  ApiPaginationQuery,
  FilterOperator,
} from 'nestjs-paginate';
import { AdminAuthGuard } from '../../../../core/admin-shell/admin-auth.guard';
import { RequirePermission } from '../../../../core/admin-shell/require-permission.decorator';
import {
  parsePage,
  filterStr,
  buildPaginated,
} from '../../../../shared/application/paginate';
import { CreateKanjiUseCase } from '../../application/use-cases/create-kanji.use-case';
import { UpdateKanjiUseCase } from '../../application/use-cases/update-kanji.use-case';
import { DeleteKanjiUseCase } from '../../application/use-cases/delete-kanji.use-case';
import { GetKanjiUseCase } from '../../application/use-cases/get-kanji.use-case';
import { ListKanjiAdminUseCase } from '../../application/use-cases/list-kanji-admin.use-case';
import { PublishKanjiUseCase } from '../../application/use-cases/publish-kanji.use-case';
import { UnpublishKanjiUseCase } from '../../application/use-cases/unpublish-kanji.use-case';
import { CreateKanjiRadicalUseCase } from '../../application/use-cases/create-kanji-radical.use-case';
import { UpdateKanjiRadicalUseCase } from '../../application/use-cases/update-kanji-radical.use-case';
import { DeleteKanjiRadicalUseCase } from '../../application/use-cases/delete-kanji-radical.use-case';
import { ListKanjiRadicalsUseCase } from '../../application/use-cases/list-kanji-radicals.use-case';
import type { Kanji } from '../../domain/entities/kanji.entity';
import type { KanjiRadical } from '../../domain/entities/kanji-radical.entity';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';
import { isJlptLevel } from '../../domain/value-objects/jlpt-level.vo';

// ── DTOs ──────────────────────────────────────────────────────────────────────

const POS_VALUES = ['noun', 'verb', 'adj', 'adv', 'other'] as const;
const JLPT_VALUES = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
const STATUS_VALUES = ['draft', 'published'] as const;

class KanjiMeaningDto {
  @ApiProperty() @IsInt() index!: number;
  @ApiProperty({ enum: POS_VALUES }) @IsIn(POS_VALUES as readonly string[])
  pos!: (typeof POS_VALUES)[number];
  @ApiProperty() @IsString() @MinLength(1) textVi!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() jpExample?: string | null;
}

class KanjiExampleDto {
  @ApiProperty({
    description:
      'Sanitized HTML. Allowed tags: <ruby>, <rt>, <em>, <span class="highlight">. Everything else stripped on save.',
  })
  @IsString()
  jpHtml!: string;
  @ApiProperty() @IsString() vi!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() source?: string | null;
}

class KanjiCompoundDto {
  @ApiProperty() @IsString() jp!: string;
  @ApiProperty() @IsString() reading!: string;
  @ApiProperty() @IsString() meaningVi!: string;
}

class KanjiSimilarDto {
  @ApiProperty() @IsString() similarKanjiId!: string;
  @ApiProperty() @IsString() reason!: string;
}

class KanjiComponentDto {
  @ApiProperty() @IsString() @MinLength(1) char!: string;
  @ApiProperty() @IsString() meaningVi!: string;
}

class CreateKanjiDto {
  @ApiProperty() @IsString() @MinLength(1) char!: string;
  @ApiProperty({ enum: JLPT_VALUES }) @IsIn(JLPT_VALUES as readonly string[])
  jlptLevel!: JlptLevel;
  @ApiProperty() @IsInt() @Min(1) @Max(64) strokes!: number;
  @ApiPropertyOptional() @IsOptional() @IsString() radicalId?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() frequency?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() joyoOrder?: number;
  @ApiProperty() @IsString() unicode!: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  onReadings?: string[];
  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  kunReadings?: string[];
  @ApiProperty() @IsString() meaningVi!: string;
  @ApiProperty() @IsString() meaningEn!: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  strokeOrderSvg?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() mnemonicVi?: string;
  @ApiPropertyOptional({ enum: STATUS_VALUES })
  @IsOptional() @IsIn(STATUS_VALUES as readonly string[])
  status?: (typeof STATUS_VALUES)[number];
  @ApiPropertyOptional({ type: [KanjiMeaningDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => KanjiMeaningDto)
  meanings?: KanjiMeaningDto[];
  @ApiPropertyOptional({ type: [KanjiExampleDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => KanjiExampleDto)
  examples?: KanjiExampleDto[];
  @ApiPropertyOptional({ type: [KanjiCompoundDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => KanjiCompoundDto)
  compounds?: KanjiCompoundDto[];
  @ApiPropertyOptional({ type: [KanjiComponentDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => KanjiComponentDto)
  components?: KanjiComponentDto[];
  @ApiPropertyOptional({ type: [KanjiSimilarDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => KanjiSimilarDto)
  similar?: KanjiSimilarDto[];
}

class UpdateKanjiDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) char?: string;
  @ApiPropertyOptional({ enum: JLPT_VALUES })
  @IsOptional() @IsIn(JLPT_VALUES as readonly string[])
  jlptLevel?: JlptLevel;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) @Max(64) strokes?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() radicalId?: string | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() frequency?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsInt() joyoOrder?: number | null;
  @ApiPropertyOptional() @IsOptional() @IsString() unicode?: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  onReadings?: string[];
  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  kunReadings?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() meaningVi?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() meaningEn?: string;
  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  strokeOrderSvg?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() mnemonicVi?: string | null;
  @ApiPropertyOptional({ type: [KanjiMeaningDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => KanjiMeaningDto)
  meanings?: KanjiMeaningDto[];
  @ApiPropertyOptional({ type: [KanjiExampleDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => KanjiExampleDto)
  examples?: KanjiExampleDto[];
  @ApiPropertyOptional({ type: [KanjiCompoundDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => KanjiCompoundDto)
  compounds?: KanjiCompoundDto[];
  @ApiPropertyOptional({ type: [KanjiComponentDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => KanjiComponentDto)
  components?: KanjiComponentDto[];
  @ApiPropertyOptional({ type: [KanjiSimilarDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => KanjiSimilarDto)
  similar?: KanjiSimilarDto[];
}

class CreateRadicalDto {
  @ApiProperty() @IsString() @MinLength(1) char!: string;
  @ApiProperty() @IsString() meaningVi!: string;
  @ApiProperty() @IsInt() @Min(1) strokes!: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPopular?: boolean;
}

class UpdateRadicalDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(1) char?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() meaningVi?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) strokes?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isPopular?: boolean;
}

// ── Pagination ────────────────────────────────────────────────────────────────

const ADMIN_PAGINATE_CONFIG = {
  sortableColumns: ['jlptLevel', 'strokes', 'char', 'createdAt'],
  searchableColumns: ['char', 'meaningVi', 'meaningEn'],
  filterableColumns: {
    jlptLevel: [FilterOperator.EQ],
    status: [FilterOperator.EQ],
    radicalId: [FilterOperator.EQ],
  },
  defaultLimit: 20,
  maxLimit: 100,
};

// ── Mappers ───────────────────────────────────────────────────────────────────

function mapKanji(k: Kanji) {
  return {
    id: k.id.value,
    char: k.char,
    jlptLevel: k.jlptLevel,
    strokes: k.strokes,
    radicalId: k.radicalId,
    frequency: k.frequency,
    joyoOrder: k.joyoOrder,
    unicode: k.unicode,
    onReadings: k.onReadings,
    kunReadings: k.kunReadings,
    meaningVi: k.meaningVi,
    meaningEn: k.meaningEn,
    strokeOrderSvg: k.strokeOrderSvg,
    mnemonicVi: k.mnemonicVi,
    status: k.status,
    meanings: k.meanings,
    examples: k.examples,
    compounds: k.compounds,
    components: k.components,
    similar: k.similar,
    createdAt: k.createdAt,
    updatedAt: k.updatedAt,
  };
}

function normalizeMeanings(
  list?: KanjiMeaningDto[],
): { index: number; pos: 'noun' | 'verb' | 'adj' | 'adv' | 'other'; textVi: string; jpExample: string | null }[] | undefined {
  return list?.map((m) => ({
    index: m.index,
    pos: m.pos,
    textVi: m.textVi,
    jpExample: m.jpExample ?? null,
  }));
}

function normalizeExamples(
  list?: KanjiExampleDto[],
): { jpHtml: string; vi: string; source: string | null }[] | undefined {
  return list?.map((e) => ({
    jpHtml: e.jpHtml,
    vi: e.vi,
    source: e.source ?? null,
  }));
}

function mapRadical(r: KanjiRadical) {
  return {
    id: r.id.value,
    char: r.char,
    meaningVi: r.meaningVi,
    strokes: r.strokes,
    isPopular: r.isPopular,
  };
}

// ── Controller ────────────────────────────────────────────────────────────────

@ApiTags('Kanji Management')
@ApiCookieAuth('access_token')
@Controller('admin/kanji')
@UseGuards(AdminAuthGuard)
export class KanjiAdminController {
  constructor(
    private readonly createUC: CreateKanjiUseCase,
    private readonly updateUC: UpdateKanjiUseCase,
    private readonly deleteUC: DeleteKanjiUseCase,
    private readonly getUC: GetKanjiUseCase,
    private readonly listUC: ListKanjiAdminUseCase,
    private readonly publishUC: PublishKanjiUseCase,
    private readonly unpublishUC: UnpublishKanjiUseCase,
    private readonly createRadicalUC: CreateKanjiRadicalUseCase,
    private readonly updateRadicalUC: UpdateKanjiRadicalUseCase,
    private readonly deleteRadicalUC: DeleteKanjiRadicalUseCase,
    private readonly listRadicalsUC: ListKanjiRadicalsUseCase,
  ) {}

  // ── Radicals (static routes — BẮT BUỘC trước /:id) ────────────────────────

  @Get('radicals')
  @RequirePermission('kanji-management', 'read')
  @ApiOperation({ summary: 'Danh sách bộ thủ' })
  async listRadicals() {
    const data = await this.listRadicalsUC.execute();
    return { success: true, data: data.map(mapRadical) };
  }

  @Post('radicals')
  @RequirePermission('kanji-management', 'create')
  @ApiOperation({ summary: 'Tạo bộ thủ' })
  @ApiBody({ type: CreateRadicalDto })
  async createRadical(@Body() dto: CreateRadicalDto) {
    const r = await this.createRadicalUC.execute(dto);
    if (!r.ok) throw new BadRequestException(r.error);
    return { success: true, radicalId: r.value.radicalId };
  }

  @Patch('radicals/:id')
  @RequirePermission('kanji-management', 'update')
  @ApiOperation({ summary: 'Cập nhật bộ thủ' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateRadicalDto })
  async updateRadical(@Param('id') id: string, @Body() dto: UpdateRadicalDto) {
    const r = await this.updateRadicalUC.execute({ id, ...dto });
    if (!r.ok) throw new NotFoundException(r.error);
    return { success: true };
  }

  @Delete('radicals/:id')
  @HttpCode(200)
  @RequirePermission('kanji-management', 'delete')
  @ApiOperation({ summary: 'Xóa bộ thủ' })
  @ApiParam({ name: 'id' })
  async deleteRadical(@Param('id') id: string) {
    const r = await this.deleteRadicalUC.execute(id);
    if (!r.ok) throw new NotFoundException(r.error);
    return { success: true };
  }

  // ── Kanji entries ─────────────────────────────────────────────────────────

  @Get()
  @RequirePermission('kanji-management', 'read')
  @ApiOperation({ summary: 'Danh sách kanji (filter, search, paginate)' })
  @ApiPaginationQuery(ADMIN_PAGINATE_CONFIG)
  async list(@Paginate() query: PaginateQuery) {
    const { page, limit, search, filter } = parsePage(
      query,
      ADMIN_PAGINATE_CONFIG,
    );
    const levelRaw = filterStr(filter, 'jlptLevel');
    const statusRaw = filterStr(filter, 'status');
    const radicalIdRaw = filterStr(filter, 'radicalId');

    const { data, total } = await this.listUC.execute({
      jlptLevel: levelRaw && isJlptLevel(levelRaw) ? levelRaw : undefined,
      status:
        statusRaw === 'draft' || statusRaw === 'published'
          ? statusRaw
          : undefined,
      radicalId: radicalIdRaw ?? undefined,
      search,
      page,
      pageSize: limit,
    });
    return buildPaginated(data.map(mapKanji), total, query, ADMIN_PAGINATE_CONFIG);
  }

  @Post()
  @RequirePermission('kanji-management', 'create')
  @ApiOperation({ summary: 'Tạo kanji mới' })
  @ApiBody({ type: CreateKanjiDto })
  async create(@Body() dto: CreateKanjiDto) {
    const r = await this.createUC.execute({
      ...dto,
      meanings: normalizeMeanings(dto.meanings),
      examples: normalizeExamples(dto.examples),
    });
    if (!r.ok) throw new BadRequestException(r.error);
    return { success: true, kanjiId: r.value.kanjiId };
  }

  @Get(':id')
  @RequirePermission('kanji-management', 'read')
  @ApiOperation({ summary: 'Chi tiết kanji' })
  @ApiParam({ name: 'id' })
  async getOne(@Param('id') id: string) {
    const r = await this.getUC.execute(id);
    if (!r.ok) throw new NotFoundException(r.error);
    return { success: true, data: mapKanji(r.value) };
  }

  @Patch(':id')
  @RequirePermission('kanji-management', 'update')
  @ApiOperation({ summary: 'Cập nhật kanji' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateKanjiDto })
  async update(@Param('id') id: string, @Body() dto: UpdateKanjiDto) {
    const r = await this.updateUC.execute({
      id,
      ...dto,
      meanings: normalizeMeanings(dto.meanings),
      examples: normalizeExamples(dto.examples),
    });
    if (!r.ok) {
      if (r.error === 'NOT_FOUND') throw new NotFoundException(r.error);
      throw new BadRequestException(r.error);
    }
    return { success: true };
  }

  @Delete(':id')
  @HttpCode(200)
  @RequirePermission('kanji-management', 'delete')
  @ApiOperation({ summary: 'Xóa kanji' })
  @ApiParam({ name: 'id' })
  async delete(@Param('id') id: string) {
    const r = await this.deleteUC.execute(id);
    if (!r.ok) throw new NotFoundException(r.error);
    return { success: true };
  }

  @Post(':id/publish')
  @HttpCode(200)
  @RequirePermission('kanji-management', 'publish')
  @ApiOperation({ summary: 'Xuất bản kanji' })
  @ApiParam({ name: 'id' })
  async publish(@Param('id') id: string) {
    const r = await this.publishUC.execute(id);
    if (!r.ok) throw new NotFoundException(r.error);
    return { success: true };
  }

  @Post(':id/unpublish')
  @HttpCode(200)
  @RequirePermission('kanji-management', 'publish')
  @ApiOperation({ summary: 'Hủy xuất bản kanji' })
  @ApiParam({ name: 'id' })
  async unpublish(@Param('id') id: string) {
    const r = await this.unpublishUC.execute(id);
    if (!r.ok) throw new NotFoundException(r.error);
    return { success: true };
  }
}
