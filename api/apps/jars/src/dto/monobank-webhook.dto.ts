export class MonobankStatementItem {
  id: string;
  time: number;
  description: string;
  amount: number;
  balance: number;
}

export class MonobankWebhookDto {
  type: string;
  data: {
    account: string;
    statementItem: MonobankStatementItem;
  };
}