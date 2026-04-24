export enum UserRole {
  ADMIN = 'admin',
  FUNCIONARIO = 'func',
  FINANCEIRO = 'finan',
  GESTOR = 'gest',
  VENDEDOR = 'vend',
}

export const RoleLabels: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.FUNCIONARIO]: 'Funcionário',
  [UserRole.FINANCEIRO]: 'Financeiro',
  [UserRole.GESTOR]: 'Gestor',
  [UserRole.VENDEDOR]: 'Vendedor',
};

export function getRoleLabel(role: string): string {
  return RoleLabels[role as UserRole] || role;
}
