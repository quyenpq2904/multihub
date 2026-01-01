interface IChat {
  id: string;
  name: string;
  avatar: string;
  type: "DIRECT" | "GROUP";
  participants: IParticipant[];
}

interface IParticipant {
  id: string;
  fullName: string;
  avatar: string;
  email: string;
  role: "MEMBER" | "ADMIN";
}

interface IMessage {
  id: string;
  content: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  tempId?: string;
}

export { type IChat, type IParticipant, type IMessage };
