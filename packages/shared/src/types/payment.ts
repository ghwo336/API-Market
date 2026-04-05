export enum PaymentStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  EXECUTING = "EXECUTING",
  COMPLETED = "COMPLETED",
  REFUNDED = "REFUNDED",
  FAILED = "FAILED",
}

export interface PaymentRequest {
  id: string;
  apiId: string;
  buyer: string;
  seller: string;
  amount: string;
  onChainPaymentId: number | null;
  status: PaymentStatus;
  txHash: string | null;
  completionTxHash: string | null;
  result: unknown | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PreparePaymentResponse {
  requestId: string;
  apiId: string;
  onChainApiId: number;
  seller: string;
  amount: string;
  contractAddress: string;
}
