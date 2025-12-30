"use client";

import {
  Accordion,
  AccordionItem,
  Avatar,
  Button,
  Card,
  ScrollShadow,
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { IMessage, IParticipant } from "@/apis/chats/chats.type";
import { IGetMe } from "@/apis/users/users-res.type";
import { ChatUI } from "../message.types";
import { useSocket } from "@/lib/contexts/SocketContext";
import { useEffect, useState, useMemo, useRef } from "react";
import chatsApi from "@/apis/chats/chats";

interface ChatDetailProps {
  chat: ChatUI;
  currentUser: IGetMe | null;
  initialMessages?: IMessage[];
}

export default function ChatDetail({
  chat,
  currentUser,
  initialMessages,
}: ChatDetailProps) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { socket, isConnected } = useSocket();

  const sortedMessages = useMemo(() => {
    return [...messages].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [sortedMessages]);

  useEffect(() => {
    if (!socket) return;
    function onMessage(payload: IMessage) {
      console.log("Received message body:", payload);
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

    if (isConnected) {
      socket.on("message", onMessage);
    }

    return () => {
      socket.off("message", onMessage);
    };
  }, [isConnected, socket]);

  useEffect(() => {
    if (isConnected && chat.id) {
      socket?.emit("joinRoom", chat.id);
    }
    return () => {
      if (isConnected && chat.id) {
        socket?.emit("leaveRoom", chat.id);
      }
    };
  }, [isConnected, chat.id, socket]);

  useEffect(() => {
    if (!chat.id) return;
    if (initialMessages) {
      setMessages(initialMessages);
      return;
    }
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const res = await chatsApi.getMessages(chat.id);
        setMessages(res.data.messages || []);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [chat.id, initialMessages]);

  const handleSendMessage = (content: string) => {
    if (!content.trim() || !currentUser || !chat.id || !socket) return;

    const tempId = `temp_${Date.now()}`;
    const optimisticMessage: IMessage = {
      id: tempId,
      content: content,
      senderId: currentUser.id,
      conversationId: chat.id,
      createdAt: new Date().toISOString(),
      tempId: tempId,
    };

    // Optimistic update
    setMessages((prev) => [...prev, optimisticMessage]);

    // Send to server
    socket.emit("sendMessage", optimisticMessage);

    // Clear input
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputValue);
    }
  };

  const getChatName = () => {
    if (chat.type === "GROUP") return chat.name || "Group Chat";
    if (!currentUser) return chat.name;
    const other = chat.participants.find((p) => p.id !== currentUser.id);
    return other ? other.fullName : "Unknown User";
  };

  const getChatAvatar = () => {
    if (chat.type === "GROUP") return chat.avatar;
    if (!currentUser) return chat.avatar;
    const other = chat.participants.find((p) => p.id !== currentUser.id);
    return other ? other.avatar : "";
  };

  const getTargetMember = (): IParticipant => {
    if (chat.type === "GROUP") {
      return chat.participants[0];
    }
    return (
      chat.participants.find((p) => p.id !== currentUser?.id) ||
      chat.participants[0]
    );
  };

  return (
    <>
      <Card className="flex-1 flex flex-col min-w-0" shadow="sm">
        <div className="h-16 px-4 border-b border-default-200 flex items-center justify-between shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <Avatar src={getChatAvatar()} className="w-10 h-10" />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{getChatName()}</span>
              {chat.isOnline && (
                <span className="text-xs text-default-500">Active now</span>
              )}
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

        <ScrollShadow className="flex-1 p-4">
          <div className="text-center my-4">
            <span className="text-xs text-default-400 font-medium">
              Aug 28, 2024, 10:00 PM
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-4">Loading messages...</div>
          ) : (
            <div className="flex flex-col gap-1">
              {sortedMessages.map((msg, index) => {
                const isMe =
                  msg.senderId === "me" ||
                  (currentUser && msg.senderId === currentUser.id);

                const sender =
                  chat.participants.find((m) => m.id === msg.senderId) ||
                  ({ fullName: "User", avatar: "" } as IParticipant);

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

                    <Tooltip
                      content={msg.createdAt}
                      placement={isMe ? "left" : "right"}
                      className="text-xs"
                    >
                      <div
                        className={`px-4 py-2 text-[15px] leading-relaxed break-words relative transition-all
                                ${
                                  isMe
                                    ? "bg-gradient-to-br from-[#6b42ff] to-[#8d3fff] text-white rounded-3xl"
                                    : "bg-default-100 text-foreground rounded-3xl"
                                }
                                ${
                                  isMe &&
                                  !isFirstInSequence &&
                                  !isLastInSequence
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
                                  !isMe &&
                                  !isFirstInSequence &&
                                  !isLastInSequence
                                    ? "rounded-l-md"
                                    : ""
                                }
                                ${
                                  !isMe &&
                                  isLastInSequence &&
                                  !isFirstInSequence
                                    ? "rounded-tl-md rounded-bl-3xl"
                                    : ""
                                }
                                ${
                                  !isMe &&
                                  isFirstInSequence &&
                                  !isLastInSequence
                                    ? "rounded-bl-md rounded-tl-3xl"
                                    : ""
                                }
                            `}
                      >
                        {msg.content}
                      </div>
                    </Tooltip>

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
          {!isLoading && messages.length > 0 && (
            <div className="text-right text-[10px] text-default-400 pr-2">
              Seen
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
              placeholder="Aa"
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
        <div className="p-6 flex flex-col items-center gap-2">
          <Avatar
            src={getTargetMember().avatar}
            className="w-20 h-20 text-large"
          />
          <div className="text-center">
            <h2 className="font-bold text-lg">{getTargetMember().fullName}</h2>
            {chat.isOnline && (
              <p className="text-xs text-default-500">Active now</p>
            )}
          </div>
          <div className="flex gap-6 mt-2">
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-default-100 flex items-center justify-center hover:bg-default-200 transition-colors">
                <Icon icon="solar:user-circle-bold" className="text-xl" />
              </div>
              <span className="text-[11px] font-medium text-default-600">
                Profile
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-default-100 flex items-center justify-center hover:bg-default-200 transition-colors">
                <Icon icon="solar:bell-off-bold" className="text-xl" />
              </div>
              <span className="text-[11px] font-medium text-default-600">
                Mute
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-default-100 flex items-center justify-center hover:bg-default-200 transition-colors">
                <Icon icon="solar:magnifer-bold" className="text-xl" />
              </div>
              <span className="text-[11px] font-medium text-default-600">
                Search
              </span>
            </div>
          </div>
        </div>

        <div className="px-2">
          <Accordion
            selectionMode="multiple"
            defaultExpandedKeys={["1"]}
            itemClasses={{
              title: "font-semibold text-sm",
              trigger: "py-3",
              content: "pb-3",
            }}
          >
            <AccordionItem key="1" title="Chat Info">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 p-2 hover:bg-default-100 rounded-lg cursor-pointer">
                  <Icon
                    icon="solar:pin-bold"
                    className="text-xl text-default-500"
                  />
                  <span className="text-sm">Pinned Messages</span>
                </div>
              </div>
            </AccordionItem>
            <AccordionItem key="2" title="Customize Chat">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 p-2 hover:bg-default-100 rounded-lg cursor-pointer">
                  <Icon
                    icon="solar:pallete-2-bold"
                    className="text-xl text-primary"
                  />
                  <span className="text-sm">Change Theme</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-default-100 rounded-lg cursor-pointer">
                  <Icon
                    icon="solar:emoji-funny-circle-bold"
                    className="text-xl text-primary"
                  />
                  <span className="text-sm">Change Emoji</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-default-100 rounded-lg cursor-pointer">
                  <Icon
                    icon="solar:text-field-bold"
                    className="text-xl text-default-500"
                  />
                  <span className="text-sm">Edit Nicknames</span>
                </div>
              </div>
            </AccordionItem>
            <AccordionItem key="3" title="Media & Files">
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square rounded-lg bg-default-200 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=200"
                    className="w-full h-full object-cover"
                    alt="media1"
                  />
                </div>
                <div className="aspect-square rounded-lg bg-default-200 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=200"
                    className="w-full h-full object-cover"
                    alt="media2"
                  />
                </div>
                <div className="aspect-square rounded-lg bg-default-200 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1618423691176-1c39b3a276b6?q=80&w=200"
                    className="w-full h-full object-cover"
                    alt="media3"
                  />
                </div>
              </div>
            </AccordionItem>
            <AccordionItem key="4" title="Privacy & Support">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 p-2 hover:bg-default-100 rounded-lg cursor-pointer">
                  <Icon
                    icon="solar:bell-off-bold"
                    className="text-xl text-default-500"
                  />
                  <span className="text-sm">Mute Notifications</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-default-100 rounded-lg cursor-pointer">
                  <Icon
                    icon="solar:shield-warning-bold"
                    className="text-xl text-default-500"
                  />
                  <span className="text-sm">Block User</span>
                </div>
                <div className="flex items-center gap-3 p-2 hover:bg-default-100 rounded-lg cursor-pointer">
                  <Icon
                    icon="solar:danger-triangle-bold"
                    className="text-xl text-danger"
                  />
                  <span className="text-sm text-danger">Report</span>
                </div>
              </div>
            </AccordionItem>
          </Accordion>
        </div>
      </Card>
    </>
  );
}
