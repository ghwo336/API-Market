export enum AdminActionType {
  APPROVE = "APPROVE",
  REJECT = "REJECT",
  REVOKE = "REVOKE",
}

export interface AdminAction {
  id: string;
  apiId: string;
  action: AdminActionType;
  adminAddress: string;
  reason?: string;
  createdAt: string;
}
