import { Injectable } from '@nestjs/common';
import { Session } from '../../domain/entities/session.entity';
import { SessionRepository } from '../../domain/repositories/session.repository';
import { SessionMapper, SessionRecord } from '../mappers/session.mapper';

@Injectable()
export class InMemorySessionRepository implements SessionRepository {
  private store = new Map<string, SessionRecord>();

  findById(id: string): Promise<Session | null> {
    const r = this.store.get(id);
    return Promise.resolve(r ? SessionMapper.toDomain(r) : null);
  }

  findByUserId(userId: string, onlyActive?: boolean): Promise<Session[]> {
    const result = [...this.store.values()]
      .filter((r) => r.userId === userId && (onlyActive === undefined || r.isActive === onlyActive))
      .map((r) => SessionMapper.toDomain(r));
    return Promise.resolve(result);
  }

  findAll(options: { onlyActive?: boolean; page: number; pageSize: number }): Promise<{ data: Session[]; total: number }> {
    const all = [...this.store.values()].filter(
      (r) => options.onlyActive === undefined || r.isActive === options.onlyActive,
    );
    const total = all.length;
    const data = all
      .slice((options.page - 1) * options.pageSize, options.page * options.pageSize)
      .map((r) => SessionMapper.toDomain(r));
    return Promise.resolve({ data, total });
  }

  save(session: Session): Promise<void> {
    this.store.set(session.id, SessionMapper.toPrisma(session));
    return Promise.resolve();
  }
}
