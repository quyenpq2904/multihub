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

export interface IRemoveMemberRequest {
  conversationId: string;
  memberId: string;
}

export interface IMuteConversationRequest {
  conversationId: string;
  duration: string;
}
