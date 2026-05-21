import type { AdminFeature } from '../../../../core/admin-shell/admin.interface';
import { KanjiAdminController } from './kanji-admin.controller';

export const KanjiAdminFeature: AdminFeature = {
  resource: 'kanji-management',
  controller: KanjiAdminController,
  permissions: ['read', 'create', 'update', 'delete', 'publish'],
  menu: {
    label: 'Kanji',
    icon: 'book-text',
    order: 10,
  },
};
