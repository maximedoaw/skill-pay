export interface InitiatePaymentInput {
  amount: number;
  currency: string;
  payerMsisdn: string;
  externalId: string;
  merchantMsisdn: string;
}

export interface InitiatePaymentResult {
  operatorRef: string;
  status: "PENDING";
}

export interface StatusResult {
  status: "PENDING" | "SUCCESSFUL" | "FAILED";
  reason?: string;
}

export interface OperatorAdapter {
  initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  checkStatus(operatorRef: string): Promise<StatusResult>;
}

export class OperatorError extends Error {
  constructor(public code: string, message: string) {
    super(message);
  }
}