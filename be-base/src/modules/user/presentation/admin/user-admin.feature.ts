import type { AdminFeature } from '../../../../core/admin-shell/admin.interface';
import { UserAdminController } from './user-admin.controller';

export const UserAdminFeature: AdminFeature = {
  resource: 'user-management',
  controller: UserAdminController,
  permissions: ['read', 'create', 'update', 'delete'],
  menu: {
    label: 'User Management',
    icon: 'users',
    order: 2,
  },
};
