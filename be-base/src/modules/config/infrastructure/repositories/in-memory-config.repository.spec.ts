import { InMemoryConfigRepository } from './in-memory-config.repository';
import { AppConfig } from '../../domain/entities/app-config.entity';

const makeConfig = (overrides: Partial<{ key: string; value: unknown; scope: 'public' | 'members' | 'internal'; tags: string[] }> = {}) =>
  AppConfig.create({
    key: overrides.key ?? 'feature.flag',
    value: overrides.value ?? { enabled: true },
    scope: overrides.scope,
    tags: overrides.tags,
  });

describe('InMemoryConfigRepository', () => {
  let repo: InMemoryConfigRepository;

  beforeEach(() => {
    repo = new InMemoryConfigRepository();
  });

  describe('save + findById', () => {
    it('persists and retrieves a config by id', async () => {
      const c = makeConfig();
      await repo.save(c);

      const found = await repo.findById(c.id.value);
      expect(found).not.toBeNull();
      expect(found!.id.value).toBe(c.id.value);
      expect(found!.key.value).toBe('feature.flag');
    });

    it('returns null for unknown id', async () => {
      expect(await repo.findById('nope')).toBeNull();
    });
  });

  describe('findByKey / findByKeys / existsByKey', () => {
    it('finds by exact key', async () => {
      const c = makeConfig({ key: 'system.email' });
      await repo.save(c);

      const found = await repo.findByKey('system.email');
      expect(found?.id.value).toBe(c.id.value);
      expect(await repo.findByKey('system.unknown')).toBeNull();
    });

    it('finds many by keys[]', async () => {
      await repo.save(makeConfig({ key: 'a.b' }));
      await repo.save(makeConfig({ key: 'c.d' }));
      await repo.save(makeConfig({ key: 'e.f' }));

      const found = await repo.findByKeys(['a.b', 'c.d', 'missing']);
      expect(found.map((c) => c.key.value).sort()).toEqual(['a.b', 'c.d']);
    });

    it('reports existsByKey', async () => {
      await repo.save(makeConfig({ key: 'has.this' }));
      expect(await repo.existsByKey('has.this')).toBe(true);
      expect(await repo.existsByKey('not.this')).toBe(false);
    });
  });

  describe('findAll filters', () => {
    beforeEach(async () => {
      await repo.save(makeConfig({ key: 'system.email', scope: 'public', tags: ['system'] }));
      await repo.save(makeConfig({ key: 'system.debug', scope: 'internal', tags: ['system', 'debug'] }));
      await repo.save(makeConfig({ key: 'pages.home', scope: 'public', tags: ['pages'] }));
    });

    it('filters by keyPrefix', async () => {
      const { data, total } = await repo.findAll({ keyPrefix: 'system.' });
      expect(total).toBe(2);
      expect(data.every((c) => c.key.value.startsWith('system.'))).toBe(true);
    });

    it('filters by scope', async () => {
      const { data, total } = await repo.findAll({ scope: 'internal' });
      expect(total).toBe(1);
      expect(data[0].key.value).toBe('system.debug');
    });

    it('filters by tags (any-of)', async () => {
      const { data, total } = await repo.findAll({ tags: ['debug'] });
      expect(total).toBe(1);
      expect(data[0].key.value).toBe('system.debug');
    });

    it('search ignores case', async () => {
      const { data, total } = await repo.findAll({ search: 'HOME' });
      expect(total).toBe(1);
      expect(data[0].key.value).toBe('pages.home');
    });

    it('paginates results', async () => {
      const page1 = await repo.findAll({ page: 1, pageSize: 2 });
      const page2 = await repo.findAll({ page: 2, pageSize: 2 });
      expect(page1.total).toBe(3);
      expect(page1.data).toHaveLength(2);
      expect(page2.data).toHaveLength(1);
    });
  });

  describe('toggle + update via save', () => {
    it('updates an existing record (same id)', async () => {
      const c = makeConfig({ key: 'x.y' });
      await repo.save(c);

      c.toggle();
      await repo.save(c);

      const found = await repo.findById(c.id.value);
      expect(found!.isEnabled).toBe(false);
    });
  });

  describe('delete', () => {
    it('removes by id', async () => {
      const c = makeConfig({ key: 'a.b' });
      await repo.save(c);
      expect(await repo.findById(c.id.value)).not.toBeNull();

      await repo.delete(c.id.value);
      expect(await repo.findById(c.id.value)).toBeNull();
    });
  });
});
