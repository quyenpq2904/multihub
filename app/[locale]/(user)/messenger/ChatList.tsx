"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  ScrollShadow,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { ChatUI } from "../message.types";
import { IGetMe } from "@/apis/users/users-res.type";

interface ChatListProps {
  chats: ChatUI[];
  selectedChatId: string | null;
  currentUser: IGetMe | null;
  onSelectChat: (id: string) => void;
}

export default function ChatList({
  chats,
  selectedChatId,
  currentUser,
  onSelectChat,
}: ChatListProps) {
  const getChatName = (chat: ChatUI) => {
    if (chat.type === "GROUP") return chat.name || "Group Chat";
    if (!currentUser) return chat.name;
    const other = chat.participants.find((p) => p.id !== currentUser.id);
    return other ? other.fullName : "Unknown User";
  };

  const getChatAvatar = (chat: ChatUI) => {
    if (chat.type === "GROUP") return chat.avatar;
    if (!currentUser) return chat.avatar;
    const other = chat.participants.find((p) => p.id !== currentUser.id);
    return other ? other.avatar : "";
  };

  const renderListAvatar = (chat: ChatUI) => {
    const avatarUrl = getChatAvatar(chat);

    if (chat.name === "System Notifications") {
      return (
        <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center text-warning">
          <Icon icon="solar:bell-bing-bold" className="text-2xl" />
        </div>
      );
    }

    if (chat.type === "GROUP") {
      return (
        <Badge
          content=""
          color="success"
          shape="circle"
          placement="bottom-right"
          isInvisible={!chat.isOnline}
          className="border-2 border-background ring-0"
        >
          <Avatar
            src={avatarUrl}
            size="lg"
            className="rounded-full"
            fallback={
              <Icon
                icon="solar:users-group-rounded-bold"
                className="text-2xl"
              />
            }
          />
        </Badge>
      );
    }

    return (
      <Badge
        content=""
        color="success"
        shape="circle"
        placement="bottom-right"
        isInvisible={!chat.isOnline}
        className="border-2 border-background ring-0"
      >
        <Avatar src={avatarUrl} size="lg" />
      </Badge>
    );
  };

  return (
    <Card className="w-[420px] flex flex-col border-none shrink-0" shadow="sm">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Chats</h1>
          <Button
            isIconOnly
            radius="full"
            variant="light"
            className="bg-default-100"
          >
            <Icon
              icon="solar:pen-new-square-bold"
              className="text-xl text-default-600"
            />
          </Button>
        </div>

        <Input
          placeholder="Search Messenger"
          radius="full"
          classNames={{
            inputWrapper:
              "bg-default-100 hover:bg-default-200 transition-colors h-10",
            input: "text-base",
          }}
          startContent={
            <Icon
              icon="solar:magnifer-linear"
              className="text-default-500 text-lg"
            />
          }
        />
      </div>

      <ScrollShadow className="flex-1 w-full">
        <div className="px-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedChatId === chat.id
                  ? "bg-default-100"
                  : "hover:bg-default-50"
              }`}
            >
              <div className="shrink-0">{renderListAvatar(chat)}</div>

              <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                <div className="flex justify-between items-baseline">
                  <span
                    className={`font-medium truncate ${
                      (chat.unreadCount || 0) > 0
                        ? "text-foreground"
                        : "text-foreground/90"
                    }`}
                  >
                    {getChatName(chat)}
                  </span>
                </div>
                <div className="flex gap-2 items-center text-sm text-default-500">
                  <span
                    className={`truncate max-w-[180px] ${
                      (chat.unreadCount || 0) > 0
                        ? "font-bold text-foreground"
                        : ""
                    }`}
                  >
                    {chat.lastMessage}
                  </span>
                  <span className="text-xs shrink-0">• {chat.lastActive}</span>
                </div>
              </div>

              {(chat.unreadCount || 0) > 0 && (
                <div className="shrink-0 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollShadow>
    </Card>
  );
}
