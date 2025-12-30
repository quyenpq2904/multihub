export interface IParticipant {
  id: string;
  fullName: string;
  avatar: string;
  role: string;
}

export interface IChatResponse {
  id: string;
  name: string;
  avatar: string;
  type: "PRIVATE" | "GROUP";
  participants: IParticipant[];
  lastMessage?: string;
  lastActive?: string;
  unreadCount?: number;
}

export interface IMessage {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  tempId?: string;
}

export interface IGetMessagesResponse {
  messages: IMessage[];
  nextCursor?: string;
}
