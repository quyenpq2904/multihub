import { ChatUI } from "../message.types";
import { IGetMe } from "@/apis/users/users-res.type";
import { IMessage } from "@/apis/chats/chats.type";

export const mockCurrentUser: IGetMe = {
  id: "user_me",
  email: "me@example.com",
  fullName: "My Account",
  avatar: "https://i.pravatar.cc/150?u=me",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockChats: ChatUI[] = [
  {
    id: "chat_1",
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?u=1",
    type: "PRIVATE",
    participants: [
      {
        id: "user_1",
        fullName: "John Doe",
        avatar: "https://i.pravatar.cc/150?u=1",
        role: "MEMBER",
      },
      {
        id: "user_me",
        fullName: "My Account",
        avatar: "https://i.pravatar.cc/150?u=me",
        role: "MEMBER",
      },
    ],
    lastMessage: "Hey, how are you?",
    lastActive: "2m",
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "chat_2",
    name: "Project Team",
    avatar: "https://i.pravatar.cc/150?u=team",
    type: "GROUP",
    participants: [
      {
        id: "user_1",
        fullName: "John Doe",
        avatar: "https://i.pravatar.cc/150?u=1",
        role: "ADMIN",
      },
      {
        id: "user_2",
        fullName: "Jane Smith",
        avatar: "https://i.pravatar.cc/150?u=2",
        role: "MEMBER",
      },
      {
        id: "user_me",
        fullName: "My Account",
        avatar: "https://i.pravatar.cc/150?u=me",
        role: "MEMBER",
      },
    ],
    lastMessage: "Meeting at 10 AM",
    lastActive: "1h",
    unreadCount: 0,
    isOnline: false,
  },
];

export const mockMessages: Record<string, IMessage[]> = {
  chat_1: [
    {
      id: "msg_1",
      content: "Hello!",
      senderId: "user_1",
      conversationId: "chat_1",
      createdAt: new Date(Date.now() - 1000000).toISOString(),
    },
    {
      id: "msg_2",
      content: "Hi John, what's up?",
      senderId: "user_me",
      conversationId: "chat_1",
      createdAt: new Date(Date.now() - 900000).toISOString(),
    },
    {
      id: "msg_3",
      content: "Just checking in.",
      senderId: "user_1",
      conversationId: "chat_1",
      createdAt: new Date(Date.now() - 800000).toISOString(),
    },
    {
      id: "msg_4",
      content: "Hey, how are you?",
      senderId: "user_1",
      conversationId: "chat_1",
      createdAt: new Date(Date.now() - 60000).toISOString(),
    },
  ],
  chat_2: [
    {
      id: "msg_team_1",
      content: "Guys, we have a deadline.",
      senderId: "user_2",
      conversationId: "chat_2",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "msg_team_2",
      content: "I know, working on it.",
      senderId: "user_me",
      conversationId: "chat_2",
      createdAt: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      id: "msg_team_3",
      content: "Meeting at 10 AM",
      senderId: "user_1",
      conversationId: "chat_2",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
};
