import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiPropertyOptional,
  ApiTags,
} from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { AdminAuthGuard } from '../../../admin-shell/admin-auth.guard';
import { RequirePermission } from '../../../admin-shell/require-permission.decorator';
import { SESSION_REPOSITORY, type SessionRepository } from '../../domain/repositories/session.repository';
import type { Session } from '../../domain/entities/session.entity';

class ListSessionsQuery {
  @ApiPropertyOptional({ description: 'Chỉ lấy session đang active', default: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  onlyActive?: boolean = true;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

class SessionDto {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() userEmail!: string;
  @ApiProperty() userType!: string;
  @ApiProperty() isAdmin!: boolean;
  @ApiProperty() deviceName!: string;
  @ApiProperty() ipAddress!: string;
  @ApiProperty() userAgent!: string;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() lastActiveAt!: Date;
  @ApiProperty() expiresAt!: Date;
  @ApiProperty() createdAt!: Date;
}

function mapSession(s: Session): SessionDto {
  return {
    id: s.id,
    userId: s.userId,
    userEmail: s.userEmail,
    userType: s.userType,
    isAdmin: s.isAdmin,
    deviceName: s.deviceInfo.deviceName,
    ipAddress: s.deviceInfo.ipAddress,
    userAgent: s.deviceInfo.userAgent,
    isActive: s.isActive,
    lastActiveAt: s.lastActiveAt,
    expiresAt: s.expiresAt,
    createdAt: s.createdAt,
  };
}

@ApiTags('Auth Management')
@ApiCookieAuth('access_token')
@Controller('admin/auth')
@UseGuards(AdminAuthGuard)
export class AuthAdminController {
  constructor(
    @Inject(SESSION_REPOSITORY) private readonly sessionRepo: SessionRepository,
  ) {}

  @Get('sessions')
  @RequirePermission('auth', 'read')
  @ApiOperation({ summary: 'Danh sách sessions (tất cả user, phân trang)' })
  async listSessions(@Query() query: ListSessionsQuery) {
    const { data, total } = await this.sessionRepo.findAll({
      onlyActive: query.onlyActive,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    });
    return {
      data: data.map(mapSession),
      total,
      page: query.page ?? 1,
      pageSize: query.pageSize ?? 20,
    };
  }

  @Delete('sessions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermission('auth', 'delete')
  @ApiOperation({ summary: 'Thu hồi bất kỳ session nào (force logout)' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  async revokeSession(@Param('id') id: string): Promise<void> {
    const session = await this.sessionRepo.findById(id);
    if (!session) throw new NotFoundException('Session không tồn tại');
    session.revoke();
    await this.sessionRepo.save(session);
  }
}
