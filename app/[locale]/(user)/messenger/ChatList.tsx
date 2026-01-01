"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Input,
  ScrollShadow,
  useDisclosure,
} from "@heroui/react";
import CreateChatModal from "./CreateChatModal";
import { Icon } from "@iconify/react";
import { useTranslations } from "next-intl";
import { IChat } from "@/types/Chat";
import { useProfile } from "@/lib/hooks/useProfile";

interface ChatListProps {
  chats: IChat[] | undefined;
  selectedChat: IChat | null;
  onSelectChat: (chat: IChat) => void;
}

export default function ChatList({
  chats,
  selectedChat,
  onSelectChat,
}: ChatListProps) {
  const { data: profile } = useProfile();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const t = useTranslations("Messenger");

  const getChatName = (chat: IChat) => {
    if (chat.type === "GROUP") {
      if (chat.name) return chat.name;

      const members = chat.participants.filter((p) => p.id !== profile?.id);
      const names = members.map(
        (m) => m.fullName.trim().split(" ").pop() || m.fullName
      );

      if (names.length === 0) return t("emptyGroup");
      if (names.length <= 2) return names.join(", ");

      return `${names[0]}, ${names[1]} ${t("others", {
        count: names.length - 2,
      })}`;
    }
    return chat.participants.find((p) => p.id !== profile?.id)?.fullName;
  };

  const getChatAvatar = (chat: IChat) => {
    if (chat.type === "GROUP") {
      return chat.avatar;
    }
    return chat.participants.find((p) => p.id !== profile?.id)?.avatar;
  };

  return (
    <Card className="w-[420px] flex flex-col border-none shrink-0" shadow="sm">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{t("chats")}</h1>
          <Button
            isIconOnly
            radius="full"
            variant="light"
            className="bg-default-100"
            onPress={onOpen}
          >
            <Icon
              icon="solar:pen-new-square-bold"
              className="text-xl text-default-600"
            />
          </Button>
        </div>

        <Input
          placeholder={t("searchMessenger")}
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
          {chats?.map((chat) => (
            <div
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`flex gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedChat?.id === chat.id
                  ? "bg-default-100"
                  : "hover:bg-default-50"
              }`}
            >
              <div className="shrink-0">
                <Badge
                  content=""
                  color="success"
                  shape="circle"
                  placement="bottom-right"
                  className="border-2 border-background ring-0"
                >
                  <Avatar src={getChatAvatar(chat)} size="lg" />
                </Badge>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">{getChatName(chat)}</span>
                </div>
                <div className="flex gap-2 items-center text-sm text-default-500">
                  <span>Ahihi</span>
                  <span className="text-xs shrink-0">• 2m ago</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollShadow>

      <CreateChatModal isOpen={isOpen} onOpenChange={onOpenChange} />
    </Card>
  );
}
