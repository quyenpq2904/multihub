export interface IGetChatsRequest {
  limit?: number;
  afterCursor?: string;
  beforeCursor?: string;
}

export interface IGetMessagesRequest {
  conversationId: string;
  limit?: number;
  afterCursor?: string;
  beforeCursor?: string;
}

export interface IAddMemberRequest {
  conversationId: string;
  memberId: string;
}
