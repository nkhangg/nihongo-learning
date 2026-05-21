import type { AdminFeature } from '../../../admin-shell/admin.interface';
import { AuthAdminController } from './auth-admin.controller';

export const AuthAdminFeature: AdminFeature = {
  resource: 'auth',
  controller: AuthAdminController,
  permissions: ['read', 'delete'],
  menu: { label: 'Sessions', icon: 'shield', order: 99 },
};
