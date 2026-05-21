import { Module, OnModuleInit } from '@nestjs/common';
import type { ClassProvider, ValueProvider } from '@nestjs/common';
import {
  AuthorizationService,
  type SeedRoleDefinition,
} from '../../core/authorization';
import { ADMIN_FEATURE } from '../../core/admin-shell/admin.interface';
import { EventsModule } from '../../core/events';

// Domain symbols
import { KANJI_REPOSITORY } from './domain/repositories/kanji.repository';
import { KANJI_RADICAL_REPOSITORY } from './domain/repositories/kanji-radical.repository';
import { KANJI_USER_PROGRESS_REPOSITORY } from './domain/repositories/kanji-user-progress.repository';
import { KANJI_WRITING_ATTEMPT_REPOSITORY } from './domain/repositories/kanji-writing-attempt.repository';
import { KANJI_QUIZ_SESSION_REPOSITORY } from './domain/repositories/kanji-quiz-session.repository';
import { WRITING_SCORER } from './domain/services/writing-scorer';
import { QUIZ_QUESTION_GENERATOR } from './domain/services/quiz-question-generator';

// Infrastructure
import { PrismaKanjiRepository } from './infrastructure/repositories/prisma-kanji.repository';
import { PrismaKanjiRadicalRepository } from './infrastructure/repositories/prisma-kanji-radical.repository';
import { PrismaKanjiUserProgressRepository } from './infrastructure/repositories/prisma-kanji-user-progress.repository';
import { PrismaKanjiWritingAttemptRepository } from './infrastructure/repositories/prisma-kanji-writing-attempt.repository';
import { PrismaKanjiQuizSessionRepository } from './infrastructure/repositories/prisma-kanji-quiz-session.repository';
import { HeuristicWritingScorer } from './infrastructure/services/heuristic-writing-scorer';
import { RandomQuizQuestionGenerator } from './infrastructure/services/random-quiz-question-generator';

// Application use-cases
import { CreateKanjiUseCase } from './application/use-cases/create-kanji.use-case';
import { UpdateKanjiUseCase } from './application/use-cases/update-kanji.use-case';
import { DeleteKanjiUseCase } from './application/use-cases/delete-kanji.use-case';
import { GetKanjiUseCase } from './application/use-cases/get-kanji.use-case';
import { ListKanjiAdminUseCase } from './application/use-cases/list-kanji-admin.use-case';
import { PublishKanjiUseCase } from './application/use-cases/publish-kanji.use-case';
import { UnpublishKanjiUseCase } from './application/use-cases/unpublish-kanji.use-case';
import { CreateKanjiRadicalUseCase } from './application/use-cases/create-kanji-radical.use-case';
import { UpdateKanjiRadicalUseCase } from './application/use-cases/update-kanji-radical.use-case';
import { DeleteKanjiRadicalUseCase } from './application/use-cases/delete-kanji-radical.use-case';
import { ListKanjiRadicalsUseCase } from './application/use-cases/list-kanji-radicals.use-case';
import { SearchKanjiPublicUseCase } from './application/use-cases/search-kanji-public.use-case';
import { GetKanjiPublicUseCase } from './application/use-cases/get-kanji-public.use-case';
import { GetMyKanjiDetailUseCase } from './application/use-cases/get-my-kanji-detail.use-case';
import { GetMyKanjiProgressSummaryUseCase } from './application/use-cases/get-my-kanji-progress-summary.use-case';
import { ListMyKanjiUseCase } from './application/use-cases/list-my-kanji.use-case';
import { UpdateKanjiStatusUseCase } from './application/use-cases/update-kanji-status.use-case';
import { GetMyWritingQueueUseCase } from './application/use-cases/get-my-writing-queue.use-case';
import { SubmitWritingAttemptUseCase } from './application/use-cases/submit-writing-attempt.use-case';
import { StartKanjiQuizUseCase } from './application/use-cases/start-kanji-quiz.use-case';
import { SubmitKanjiQuizAnswerUseCase } from './application/use-cases/submit-kanji-quiz-answer.use-case';
import { FinishKanjiQuizUseCase } from './application/use-cases/finish-kanji-quiz.use-case';

// Controllers + admin feature
import { KanjiAdminController } from './presentation/admin/kanji-admin.controller';
import { KanjiAdminFeature } from './presentation/admin/kanji-admin.feature';
import { KanjiPublicController } from './presentation/public/kanji-public.controller';
import { KanjiUserController } from './presentation/user/kanji-user.controller';

const KANJI_ROLES: SeedRoleDefinition[] = [
  {
    name: 'kanji-editor',
    subjectType: 'admin',
    description: 'Full CRUD + publish kanji entries and radicals',
    permissions: {
      'kanji-management': ['read', 'create', 'update', 'delete', 'publish'],
    },
  },
  {
    name: 'kanji-viewer',
    subjectType: 'admin',
    description: 'Read-only kanji management',
    permissions: {
      'kanji-management': ['read'],
    },
  },
];

@Module({
  imports: [EventsModule],
  controllers: [
    KanjiAdminController,
    KanjiPublicController,
    KanjiUserController,
  ],
  providers: [
    // Repository bindings
    { provide: KANJI_REPOSITORY, useClass: PrismaKanjiRepository } as ClassProvider,
    {
      provide: KANJI_RADICAL_REPOSITORY,
      useClass: PrismaKanjiRadicalRepository,
    } as ClassProvider,
    {
      provide: KANJI_USER_PROGRESS_REPOSITORY,
      useClass: PrismaKanjiUserProgressRepository,
    } as ClassProvider,
    {
      provide: KANJI_WRITING_ATTEMPT_REPOSITORY,
      useClass: PrismaKanjiWritingAttemptRepository,
    } as ClassProvider,
    {
      provide: KANJI_QUIZ_SESSION_REPOSITORY,
      useClass: PrismaKanjiQuizSessionRepository,
    } as ClassProvider,
    // Domain service bindings
    { provide: WRITING_SCORER, useClass: HeuristicWritingScorer } as ClassProvider,
    {
      provide: QUIZ_QUESTION_GENERATOR,
      useClass: RandomQuizQuestionGenerator,
    } as ClassProvider,
    // Admin feature
    {
      provide: ADMIN_FEATURE,
      useValue: KanjiAdminFeature,
      multi: true,
    } as ValueProvider,
    // Use-cases
    CreateKanjiUseCase,
    UpdateKanjiUseCase,
    DeleteKanjiUseCase,
    GetKanjiUseCase,
    ListKanjiAdminUseCase,
    PublishKanjiUseCase,
    UnpublishKanjiUseCase,
    CreateKanjiRadicalUseCase,
    UpdateKanjiRadicalUseCase,
    DeleteKanjiRadicalUseCase,
    ListKanjiRadicalsUseCase,
    SearchKanjiPublicUseCase,
    GetKanjiPublicUseCase,
    GetMyKanjiDetailUseCase,
    GetMyKanjiProgressSummaryUseCase,
    ListMyKanjiUseCase,
    UpdateKanjiStatusUseCase,
    GetMyWritingQueueUseCase,
    SubmitWritingAttemptUseCase,
    StartKanjiQuizUseCase,
    SubmitKanjiQuizAnswerUseCase,
    FinishKanjiQuizUseCase,
  ],
})
export class KanjiModule implements OnModuleInit {
  constructor(private readonly authorizationService: AuthorizationService) {}

  async onModuleInit(): Promise<void> {
    await this.authorizationService.seedRoles(KANJI_ROLES);
  }
}
