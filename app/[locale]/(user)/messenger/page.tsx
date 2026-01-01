"use client";

import { useState, useMemo } from "react";
import ChatList from "./ChatList";
import ChatDetail from "./ChatDetail";
import chatsApi from "@/apis/chats/chats";
import { useQuery } from "@tanstack/react-query";
import { IChat } from "@/types/Chat";
import { useTranslations } from "next-intl";

export default function MessengerPage() {
  const { data: chatsData } = useQuery({
    queryKey: ["chats"],
    queryFn: () => chatsApi.getChats({}),
  });

  const t = useTranslations("Messenger");

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  const selectedChat = useMemo(() => {
    if (selectedChatId) {
      return (
        chatsData?.data?.data?.find((c) => c.id === selectedChatId) || null
      );
    }
    return chatsData?.data?.data?.[0] || null;
  }, [chatsData, selectedChatId]);

  const handleSelectChat = (chat: IChat) => {
    setSelectedChatId(chat.id);
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] w-full bg-background flex gap-4 p-4 overflow-hidden">
      <ChatList
        chats={chatsData?.data?.data}
        selectedChat={selectedChat}
        onSelectChat={handleSelectChat}
      />
      {selectedChat ? (
        <ChatDetail key={selectedChat.id} chat={selectedChat} />
      ) : (
        <div className="flex-1 flex items-center justify-center text-default-500">
          {t("selectChatToStart")}
        </div>
      )}
    </div>
  );
}
