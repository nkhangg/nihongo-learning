import { Injectable } from '@nestjs/common';
import type { AppConfig } from '../../domain/entities/app-config.entity';
import type {
  FindAllConfigsOptions,
  FindAllConfigsResult,
  IConfigRepository,
} from '../../domain/repositories/config.repository';
import { ConfigMapper, type AppConfigRecord } from '../mappers/config.mapper';

@Injectable()
export class InMemoryConfigRepository implements IConfigRepository {
  private readonly store = new Map<string, AppConfigRecord>();

  findById(id: string): Promise<AppConfig | null> {
    const r = this.store.get(id);
    return Promise.resolve(r ? ConfigMapper.toDomain(r) : null);
  }

  findByKey(key: string): Promise<AppConfig | null> {
    for (const r of this.store.values()) {
      if (r.key === key) return Promise.resolve(ConfigMapper.toDomain(r));
    }
    return Promise.resolve(null);
  }

  findByKeys(keys: string[]): Promise<AppConfig[]> {
    const set = new Set(keys);
    const matched: AppConfig[] = [];
    for (const r of this.store.values()) {
      if (set.has(r.key)) matched.push(ConfigMapper.toDomain(r));
    }
    return Promise.resolve(matched);
  }

  findAll(options: FindAllConfigsOptions = {}): Promise<FindAllConfigsResult> {
    let rows = [...this.store.values()];

    if (options.scope !== undefined) {
      rows = rows.filter((r) => r.scope === options.scope);
    }
    if (options.isEnabled !== undefined) {
      rows = rows.filter((r) => r.isEnabled === options.isEnabled);
    }
    if (options.tags && options.tags.length > 0) {
      const wanted = options.tags;
      rows = rows.filter((r) => r.tags.some((t) => wanted.includes(t)));
    }
    if (options.keyPrefix) {
      rows = rows.filter((r) => r.key.startsWith(options.keyPrefix!));
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      rows = rows.filter((r) => r.key.toLowerCase().includes(q));
    }

    const sortBy = options.sortBy ?? 'createdAt';
    const sortDir = options.sortDir ?? 'desc';
    rows.sort((a, b) => {
      const av = a[sortBy as keyof AppConfigRecord];
      const bv = b[sortBy as keyof AppConfigRecord];
      if (av === bv) return 0;
      const cmp = (av as number | string | Date) < (bv as number | string | Date) ? -1 : 1;
      return sortDir === 'asc' ? cmp : -cmp;
    });

    const total = rows.length;
    const page = options.page ?? 1;
    const pageSize = options.pageSize ?? 20;
    const data = rows
      .slice((page - 1) * pageSize, page * pageSize)
      .map((r) => ConfigMapper.toDomain(r));

    return Promise.resolve({ data, total });
  }

  save(config: AppConfig): Promise<void> {
    this.store.set(config.id.value, ConfigMapper.toRecord(config));
    return Promise.resolve();
  }

  delete(id: string): Promise<void> {
    this.store.delete(id);
    return Promise.resolve();
  }

  existsByKey(key: string): Promise<boolean> {
    for (const r of this.store.values()) {
      if (r.key === key) return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }
}
