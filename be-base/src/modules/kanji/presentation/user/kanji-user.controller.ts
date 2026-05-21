import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GetMyKanjiProgressSummaryUseCase } from '../../application/use-cases/get-my-kanji-progress-summary.use-case';
import { GetMyKanjiDetailUseCase } from '../../application/use-cases/get-my-kanji-detail.use-case';
import { ListMyKanjiUseCase } from '../../application/use-cases/list-my-kanji.use-case';
import { UpdateKanjiStatusUseCase } from '../../application/use-cases/update-kanji-status.use-case';
import { GetMyWritingQueueUseCase } from '../../application/use-cases/get-my-writing-queue.use-case';
import { SubmitWritingAttemptUseCase } from '../../application/use-cases/submit-writing-attempt.use-case';
import { StartKanjiQuizUseCase } from '../../application/use-cases/start-kanji-quiz.use-case';
import { SubmitKanjiQuizAnswerUseCase } from '../../application/use-cases/submit-kanji-quiz-answer.use-case';
import { FinishKanjiQuizUseCase } from '../../application/use-cases/finish-kanji-quiz.use-case';
import type { Kanji } from '../../domain/entities/kanji.entity';
import type { JlptLevel } from '../../domain/value-objects/jlpt-level.vo';

const JLPT_VALUES = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
const PROGRESS_STATUS_VALUES = ['unseen', 'learning', 'known'] as const;
const QUIZ_MODE_VALUES = [
  'recognition',
  'meaningToKanji',
  'writing',
  'mixed',
] as const;
const ANSWER_MODE_VALUES = [
  'recognition',
  'meaningToKanji',
  'writing',
] as const;

// ── DTOs ──────────────────────────────────────────────────────────────────────

class UpdateStatusDto {
  @ApiProperty({ enum: PROGRESS_STATUS_VALUES })
  @IsIn(PROGRESS_STATUS_VALUES as readonly string[])
  status!: (typeof PROGRESS_STATUS_VALUES)[number];
}

class WritingPointDto {
  @ApiProperty({ description: 'Normalized 0..1' }) @IsNumber() @Min(0) @Max(1) x!: number;
  @ApiProperty({ description: 'Normalized 0..1' }) @IsNumber() @Min(0) @Max(1) y!: number;
  @ApiProperty({ description: 'ms since stroke start' }) @IsInt() t!: number;
}

class WritingStrokeDto {
  @ApiProperty({ type: [WritingPointDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => WritingPointDto)
  points!: WritingPointDto[];
}

class SubmitWritingDto {
  @ApiProperty({ type: [WritingStrokeDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => WritingStrokeDto)
  strokes!: WritingStrokeDto[];
  @ApiProperty() @IsInt() @Min(0) durationMs!: number;
}

class StartQuizDto {
  @ApiProperty({ enum: JLPT_VALUES }) @IsIn(JLPT_VALUES as readonly string[])
  jlptLevel!: JlptLevel;
  @ApiProperty({ enum: QUIZ_MODE_VALUES })
  @IsIn(QUIZ_MODE_VALUES as readonly string[])
  mode!: (typeof QUIZ_MODE_VALUES)[number];
  @ApiProperty() @IsInt() @Min(1) @Max(50) questionCount!: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() livesEnabled?: boolean;
}

class SubmitAnswerDto {
  @ApiProperty() @IsString() questionId!: string;
  @ApiProperty() @IsString() kanjiId!: string;
  @ApiProperty({ enum: ANSWER_MODE_VALUES })
  @IsIn(ANSWER_MODE_VALUES as readonly string[])
  mode!: (typeof ANSWER_MODE_VALUES)[number];
  @ApiProperty() @IsBoolean() isCorrect!: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() selectedOptionId?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function userIdFromReq(req: { user?: { userId?: string } }): string {
  const userId = req.user?.userId;
  if (!userId) throw new UnauthorizedException('AUTH_REQUIRED');
  return userId;
}

function mapKanjiLight(k: Kanji) {
  return {
    id: k.id.value,
    char: k.char,
    jlptLevel: k.jlptLevel,
    strokes: k.strokes,
    radicalId: k.radicalId,
    meaningVi: k.meaningVi,
    primaryOn: k.onReadings[0],
    primaryKun: k.kunReadings[0],
  };
}

// ── Controller ────────────────────────────────────────────────────────────────

@ApiTags('Kanji (User)')
@ApiCookieAuth('access_token')
@Controller('me/kanji')
export class KanjiUserController {
  constructor(
    private readonly getSummaryUC: GetMyKanjiProgressSummaryUseCase,
    private readonly getDetailUC: GetMyKanjiDetailUseCase,
    private readonly listMyUC: ListMyKanjiUseCase,
    private readonly updateStatusUC: UpdateKanjiStatusUseCase,
    private readonly getWritingQueueUC: GetMyWritingQueueUseCase,
    private readonly submitWritingUC: SubmitWritingAttemptUseCase,
    private readonly startQuizUC: StartKanjiQuizUseCase,
    private readonly submitAnswerUC: SubmitKanjiQuizAnswerUseCase,
    private readonly finishQuizUC: FinishKanjiQuizUseCase,
  ) {}

  // ── Static routes — BẮT BUỘC trước /:id ──────────────────────────────────

  @Get('progress')
  @ApiOperation({ summary: 'Tổng quan tiến độ kanji của tôi' })
  async getProgress(@Request() req: { user?: { userId?: string } }) {
    const userId = userIdFromReq(req);
    const summary = await this.getSummaryUC.execute(userId);
    return { success: true, data: summary };
  }

  @Get('writing-queue')
  @ApiOperation({ summary: 'Hàng chờ luyện viết — kanji đang learning' })
  @ApiQuery({ name: 'jlptLevel', required: false, enum: JLPT_VALUES })
  @ApiQuery({ name: 'limit', required: false })
  async getWritingQueue(
    @Request() req: { user?: { userId?: string } },
    @Query('jlptLevel') jlptLevel?: JlptLevel,
    @Query('limit') limit?: string,
  ) {
    const userId = userIdFromReq(req);
    const items = await this.getWritingQueueUC.execute({
      userId,
      jlptLevel,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return { success: true, data: items.map(mapKanjiLight) };
  }

  @Post('quiz/start')
  @ApiOperation({ summary: 'Bắt đầu phiên quiz' })
  @ApiBody({ type: StartQuizDto })
  async startQuiz(
    @Request() req: { user?: { userId?: string } },
    @Body() dto: StartQuizDto,
  ) {
    const userId = userIdFromReq(req);
    const r = await this.startQuizUC.execute({ userId, ...dto });
    if (!r.ok) throw new BadRequestException(r.error);
    return { success: true, ...r.value };
  }

  @Post('quiz/:sessionId/answer')
  @ApiOperation({ summary: 'Gửi câu trả lời quiz' })
  @ApiParam({ name: 'sessionId' })
  @ApiBody({ type: SubmitAnswerDto })
  async submitAnswer(
    @Request() req: { user?: { userId?: string } },
    @Param('sessionId') sessionId: string,
    @Body() dto: SubmitAnswerDto,
  ) {
    const userId = userIdFromReq(req);
    const r = await this.submitAnswerUC.execute({
      userId,
      sessionId,
      kanjiId: dto.kanjiId,
      mode: dto.mode,
      isCorrect: dto.isCorrect,
      selectedOptionId: dto.selectedOptionId,
    });
    if (!r.ok) {
      if (r.error === 'SESSION_NOT_FOUND')
        throw new NotFoundException(r.error);
      if (r.error === 'NOT_OWNER') throw new ForbiddenException(r.error);
      throw new BadRequestException(r.error);
    }
    return { success: true, ...r.value };
  }

  @Post('quiz/:sessionId/finish')
  @ApiOperation({ summary: 'Kết thúc phiên quiz và lấy summary' })
  @ApiParam({ name: 'sessionId' })
  async finishQuiz(
    @Request() req: { user?: { userId?: string } },
    @Param('sessionId') sessionId: string,
  ) {
    const userId = userIdFromReq(req);
    const r = await this.finishQuizUC.execute({ userId, sessionId });
    if (!r.ok) {
      if (r.error === 'SESSION_NOT_FOUND')
        throw new NotFoundException(r.error);
      throw new ForbiddenException(r.error);
    }
    return { success: true, data: r.value };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết kanji kèm tiến độ của tôi' })
  @ApiParam({ name: 'id' })
  async getDetail(
    @Request() req: { user?: { userId?: string } },
    @Param('id') id: string,
  ) {
    const userId = userIdFromReq(req);
    const r = await this.getDetailUC.execute(userId, id);
    if (!r.ok) throw new NotFoundException(r.error);
    const { kanji: k, progress } = r.value;
    return {
      success: true,
      data: {
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
        status: progress?.status ?? 'unseen',
        mastery: progress?.mastery ?? 0,
      },
    };
  }

  @Get()
  @ApiOperation({ summary: 'Kanji list kèm user status (cho client browser)' })
  @ApiQuery({ name: 'jlptLevel', required: false, enum: JLPT_VALUES })
  @ApiQuery({ name: 'status', required: false, enum: PROGRESS_STATUS_VALUES })
  async listMy(
    @Request() req: { user?: { userId?: string } },
    @Query('jlptLevel') jlptLevel?: JlptLevel,
    @Query('status') status?: (typeof PROGRESS_STATUS_VALUES)[number],
    @Query('radicalId') radicalId?: string,
    @Query('strokesMin') strokesMinRaw?: string,
    @Query('strokesMax') strokesMaxRaw?: string,
    @Query('search') search?: string,
    @Query('page') pageRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const userId = userIdFromReq(req);
    const page = pageRaw ? parseInt(pageRaw, 10) : 1;
    const pageSize = limitRaw ? parseInt(limitRaw, 10) : 64;
    const { data, total } = await this.listMyUC.execute({
      userId,
      jlptLevel,
      status,
      radicalId,
      strokesMin: strokesMinRaw ? parseInt(strokesMinRaw, 10) : undefined,
      strokesMax: strokesMaxRaw ? parseInt(strokesMaxRaw, 10) : undefined,
      search,
      page,
      pageSize,
    });
    return {
      success: true,
      data: data.map((row) => ({
        ...mapKanjiLight(row.kanji),
        status: row.status,
        mastery: row.mastery,
        lastReviewedAt: row.lastReviewedAt,
      })),
      meta: {
        totalItems: total,
        currentPage: page,
        itemsPerPage: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật status kanji (known/learning/unseen)' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: UpdateStatusDto })
  async updateStatus(
    @Request() req: { user?: { userId?: string } },
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    const userId = userIdFromReq(req);
    const r = await this.updateStatusUC.execute({
      userId,
      kanjiId: id,
      status: dto.status,
    });
    if (!r.ok) throw new NotFoundException(r.error);
    return { success: true };
  }

  @Post(':id/writing-attempt')
  @ApiOperation({ summary: 'Gửi lần luyện viết, trả điểm số' })
  @ApiParam({ name: 'id' })
  @ApiBody({ type: SubmitWritingDto })
  async submitWriting(
    @Request() req: { user?: { userId?: string } },
    @Param('id') id: string,
    @Body() dto: SubmitWritingDto,
  ) {
    const userId = userIdFromReq(req);
    const r = await this.submitWritingUC.execute({
      userId,
      kanjiId: id,
      strokes: dto.strokes,
      durationMs: dto.durationMs,
    });
    if (!r.ok) throw new NotFoundException(r.error);
    return { success: true, data: r.value };
  }
}
