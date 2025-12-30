import { IParticipant } from "@/apis/chats/chats.type";

export interface ChatUI {
  id: string;
  name: string;
  avatar: string;
  type: "PRIVATE" | "GROUP";
  participants: IParticipant[];
  lastMessage?: string;
  lastActive?: string;
  unreadCount?: number;
  isOnline?: boolean;
}
