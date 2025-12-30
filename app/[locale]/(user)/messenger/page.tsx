"use client";

import { useState } from "react";
import ChatList from "./ChatList";
import ChatDetail from "./ChatDetail";
import { mockChats, mockCurrentUser, mockMessages } from "./mockData";

export default function MessengerPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    mockChats[0]?.id || null
  );

  const selectedChat = mockChats.find((c) => c.id === selectedChatId);

  return (
    <div className="h-[calc(100vh-7.5rem)] w-full bg-background flex gap-4 p-4 overflow-hidden">
      <ChatList
        chats={mockChats}
        selectedChatId={selectedChatId}
        currentUser={mockCurrentUser}
        onSelectChat={setSelectedChatId}
      />
      {selectedChat ? (
        <ChatDetail
          key={selectedChat.id}
          chat={selectedChat}
          currentUser={mockCurrentUser}
          initialMessages={mockMessages[selectedChat.id] || []}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-default-500">
          Select a chat to start messaging
        </div>
      )}
    </div>
  );
}
