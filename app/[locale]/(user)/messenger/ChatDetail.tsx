"use client";

import {
  Avatar,
  Button,
  Card,
  ScrollShadow,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useSocket } from "@/lib/contexts/SocketContext";
import { useEffect, useState, useRef, useMemo } from "react";
import { IChat, IMessage } from "@/types/Chat";
import { useProfile } from "@/lib/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import chatsApi from "@/apis/chats/chats";
import { useTranslations } from "next-intl";
import { useDisclosure } from "@heroui/react";
import AddMemberModal from "./AddMemberModal";
import RenameChatModal from "./RenameChatModal";
import ChangePhotoModal from "./ChangePhotoModal";

interface ChatDetailProps {
  chat: IChat;
}

export default function ChatDetail({ chat }: ChatDetailProps) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const { data: profile } = useProfile();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("Messenger");

  const { socket, isConnected } = useSocket();

  const { data: messagesData, isLoading: isQueryLoading } = useQuery({
    queryKey: ["messages", chat.id],
    queryFn: () => chatsApi.getMessages({ conversationId: chat.id }),
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isRenameOpen,
    onOpen: onRenameOpen,
    onOpenChange: onRenameOpenChange,
  } = useDisclosure();
  const {
    isOpen: isPhotoOpen,
    onOpen: onPhotoOpen,
    onOpenChange: onPhotoOpenChange,
  } = useDisclosure();

  useEffect(() => {
    if (messagesData?.data.data && messages.length === 0) {
      setMessages(messagesData.data.data);
    }
  }, [messagesData, messages.length]);

  const loadMoreMessages = async () => {
    if (isLoadingMore || !messages.length) return;

    setIsLoadingMore(true);
    const firstMessageId = messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0]?.id;

    try {
      const res = await chatsApi.getMessages({
        conversationId: chat.id,
        beforeCursor: firstMessageId,
        limit: 20,
      });

      if (res.data.data.length > 0) {
        // Capture scroll height before update
        if (scrollContainerRef.current) {
          prevScrollHeightRef.current = scrollContainerRef.current.scrollHeight;
        }

        setMessages((prev) => {
          const newMsgs = res.data.data.filter(
            (newMsg) => !prev.some((p) => p.id === newMsg.id)
          );
          return [...newMsgs, ...prev];
        });
      }
    } catch (error) {
      console.error("Failed to load more messages", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const { scrollTop } = e.currentTarget;
    if (scrollTop === 0 && !isLoadingMore) {
      loadMoreMessages();
    }
  };

  useEffect(() => {
    if (
      !isLoadingMore &&
      prevScrollHeightRef.current > 0 &&
      scrollContainerRef.current
    ) {
      const newScrollHeight = scrollContainerRef.current.scrollHeight;
      const diff = newScrollHeight - prevScrollHeightRef.current;
      scrollContainerRef.current.scrollTop = diff;
      prevScrollHeightRef.current = 0;
    }
  }, [messages, isLoadingMore]);

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "web" in window ? "auto" : "smooth",
    });
  };

  const lastMessageId = sortedMessages[sortedMessages.length - 1]?.id;
  useEffect(() => {
    if (messages.length > 0 && !prevScrollHeightRef.current) {
      scrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMessageId]);
  // removed sortedMessages dependency to prevent auto-scrolling when loading old history

  useEffect(() => {
    function onMessage(payload: IMessage) {
      setMessages((prev) => {
        if (payload.tempId) {
          const tempIndex = prev.findIndex((msg) => msg.id === payload.tempId);
          if (tempIndex !== -1) {
            const newMessages = [...prev];
            newMessages[tempIndex] = payload;
            return newMessages;
          }
        }

        if (prev.some((msg) => msg.id === payload.id)) return prev;

        return [...prev, payload];
      });
    }

    if (isConnected && chat.id) {
      socket?.emit("join-room", chat.id);
      socket?.on("message", onMessage);
    }
    return () => {
      if (isConnected && chat.id) {
        socket?.emit("leave-room", chat.id);
        socket?.off("message", onMessage);
      }
    };
  }, [isConnected, chat.id, socket]);

  const handleSendMessage = (content: string) => {
    if (!content.trim() || !profile || !chat.id || !socket) return;

    const tempId = `temp_${Date.now()}`;
    const optimisticMessage: IMessage = {
      id: tempId,
      content: content,
      senderId: profile.id,
      conversationId: chat.id,
      createdAt: new Date().toISOString(),
      tempId: tempId,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    socket.emit("send-message", optimisticMessage);

    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

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
    <>
      <Card className="flex-1 flex flex-col min-w-0" shadow="sm">
        <div className="h-16 px-4 border-b border-default-200 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <Avatar src={getChatAvatar(chat)} className="w-10 h-10" />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{getChatName(chat)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-primary">
            <Button
              isIconOnly
              variant="light"
              radius="full"
              className="text-primary hover:bg-primary/10"
            >
              <Icon icon="solar:phone-bold" className="text-xl" />
            </Button>
            <Button
              isIconOnly
              variant="light"
              radius="full"
              className="text-primary hover:bg-primary/10"
            >
              <Icon icon="solar:videocamera-record-bold" className="text-xl" />
            </Button>
            <Button
              isIconOnly
              variant="light"
              radius="full"
              className="text-primary hover:bg-primary/10"
            >
              <Icon icon="solar:info-circle-bold" className="text-xl" />
            </Button>
          </div>
        </div>

        <ScrollShadow
          className="flex-1 p-4"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <div className="text-center my-4">
            {/* <span className="text-xs text-default-400 font-medium">
              Aug 28, 2024, 10:00 PM
            </span> */}
          </div>

          {isLoadingMore && (
            <div className="flex justify-center p-2 text-xs text-default-400">
              {t("loadingHistory")}
            </div>
          )}

          {isQueryLoading && messages.length === 0 ? (
            <div className="flex justify-center p-4">
              {t("loadingMessages")}
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {sortedMessages.map((msg, index) => {
                const isMe =
                  msg.senderId === "me" ||
                  (profile && msg.senderId === profile.id);

                const sender = chat.participants.find(
                  (m) => m.id === msg.senderId
                ) || { fullName: "User", avatar: "" };

                const nextMsg = sortedMessages[index + 1];
                const isLastInSequence =
                  !nextMsg || nextMsg.senderId !== msg.senderId;
                const isFirstInSequence =
                  index === 0 ||
                  sortedMessages[index - 1].senderId !== msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={`flex group gap-2 items-end max-w-[80%] ${
                      isMe ? "self-end flex-row-reverse" : "self-start"
                    } ${isLastInSequence ? "mb-4" : "mb-0.5"}`}
                  >
                    {!isMe && (
                      <div className="w-8 shrink-0">
                        {isLastInSequence && (
                          <Avatar src={sender.avatar} className="w-7 h-7" />
                        )}
                      </div>
                    )}

                    <div
                      className={`px-4 py-2 text-[15px] leading-relaxed break-words relative transition-all
                              ${
                                isMe
                                  ? "bg-gradient-to-br from-[#6b42ff] to-[#8d3fff] text-white rounded-3xl"
                                  : "bg-default-100 text-foreground rounded-3xl"
                              }
                              ${
                                isMe && !isFirstInSequence && !isLastInSequence
                                  ? "rounded-r-md"
                                  : ""
                              }
                              ${
                                isMe && isLastInSequence && !isFirstInSequence
                                  ? "rounded-tr-md rounded-br-3xl"
                                  : ""
                              }
                              ${
                                isMe && isFirstInSequence && !isLastInSequence
                                  ? "rounded-br-md rounded-tr-3xl"
                                  : ""
                              }
                              
                              ${
                                !isMe && !isFirstInSequence && !isLastInSequence
                                  ? "rounded-l-md"
                                  : ""
                              }
                              ${
                                !isMe && isLastInSequence && !isFirstInSequence
                                  ? "rounded-tl-md rounded-bl-3xl"
                                  : ""
                              }
                              ${
                                !isMe && isFirstInSequence && !isLastInSequence
                                  ? "rounded-bl-md rounded-tl-3xl"
                                  : ""
                              }
                          `}
                    >
                      {msg.content}
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icon
                        icon="solar:smile-circle-linear"
                        className="text-default-400 cursor-pointer hover:text-default-600"
                      />
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollShadow>

        <div className="p-3 bg-background flex items-end gap-2 shrink-0">
          <div className="flex gap-1 mb-2">
            <Button isIconOnly variant="light" className="text-primary">
              <Icon icon="solar:add-circle-bold" className="text-2xl" />
            </Button>
            <Button isIconOnly variant="light" className="text-primary">
              <Icon icon="solar:gallery-bold" className="text-2xl" />
            </Button>
            <Button isIconOnly variant="light" className="text-primary">
              <Icon
                icon="solar:sticker-smile-circle-bold"
                className="text-2xl"
              />
            </Button>
            <Button isIconOnly variant="light" className="text-primary">
              <Icon icon="solar:file-text-bold" className="text-2xl" />
            </Button>
          </div>

          <div className="flex-1 bg-default-100 rounded-3xl flex items-center px-4 py-2 min-h-[44px]">
            <input
              className="flex-1 bg-transparent border-none outline-none text-base text-foreground placeholder-default-500"
              placeholder={t("typeMessagePlaceholder")}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Icon
              icon="solar:smile-circle-linear"
              className="text-2xl text-default-500 cursor-pointer hover:text-default-700"
            />
          </div>

          <Button isIconOnly variant="light" className="text-primary mb-1">
            <Icon icon="solar:like-bold" className="text-2xl" />
          </Button>
        </div>
      </Card>

      <Card
        className="w-[400px] border-none shrink-0 hidden lg:flex flex-col overflow-y-auto"
        shadow="sm"
      >
        <div className="p-6 flex flex-col items-center gap-2 border-b border-default-100">
          <Avatar src={getChatAvatar(chat)} className="w-20 h-20 text-large" />
          <div className="text-center">
            <h2 className="font-bold text-lg">{getChatName(chat)}</h2>
          </div>
        </div>

        {chat.type === "GROUP" && (
          <div className="p-4 flex flex-col gap-4">
            <Accordion
              selectionMode="multiple"
              defaultExpandedKeys={["customize", "members"]}
            >
              <AccordionItem
                key="customize"
                aria-label={t("customizeChat")}
                title={t("customizeChat")}
                classNames={{
                  title: "font-semibold text-small text-default-600",
                  content: "pt-0",
                }}
              >
                <div className="flex flex-col gap-2">
                  <div
                    className="flex items-center gap-3 p-2 hover:bg-default-100 rounded-lg cursor-pointer transition-colors"
                    onClick={onRenameOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-default-200 flex items-center justify-center shrink-0">
                      <Icon
                        icon="solar:pen-bold"
                        className="text-lg text-default-600"
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {t("changeChatName")}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-3 p-2 hover:bg-default-100 rounded-lg cursor-pointer transition-colors"
                    onClick={onPhotoOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-default-200 flex items-center justify-center shrink-0">
                      <Icon
                        icon="solar:gallery-bold"
                        className="text-lg text-default-600"
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {t("changePhoto")}
                    </span>
                  </div>
                </div>
              </AccordionItem>
              <AccordionItem
                key="members"
                aria-label={t("chatMembers")}
                title={t("chatMembers")}
                classNames={{
                  title: "font-semibold text-small text-default-600",
                  content: "pt-0",
                }}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-2">
                    {chat.participants.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 py-2"
                      >
                        <Avatar src={member.avatar} name={member.fullName} />
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">
                            {member.fullName}
                          </span>
                          {member.id !== profile?.id && (
                            <span className="text-xs text-default-400 truncate">
                              {member.email}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    className="justify-start px-0 data-[hover=true]:bg-transparent"
                    variant="light"
                    onPress={onOpen}
                    startContent={
                      <div className="w-10 h-10 rounded-full bg-default-100 flex items-center justify-center">
                        <Icon icon="solar:user-plus-bold" className="text-xl" />
                      </div>
                    }
                  >
                    {t("addPeople")}
                  </Button>
                </div>
              </AccordionItem>
            </Accordion>
          </div>
        )}
      </Card>

      <AddMemberModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        chatId={chat.id}
      />

      <RenameChatModal
        isOpen={isRenameOpen}
        onOpenChange={onRenameOpenChange}
        chatId={chat.id}
        currentName={chat.name || ""}
      />

      <ChangePhotoModal
        isOpen={isPhotoOpen}
        onOpenChange={onPhotoOpenChange}
        chatId={chat.id}
      />
    </>
  );
}
