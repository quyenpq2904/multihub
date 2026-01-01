"use client";

import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import chatsApi from "@/apis/chats/chats";
import { useTranslations } from "next-intl";

interface RenameChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
  currentName: string;
}

export default function RenameChatModal({
  isOpen,
  onOpenChange,
  chatId,
  currentName,
}: RenameChatModalProps) {
  const [name, setName] = useState(currentName);
  const queryClient = useQueryClient();
  const t = useTranslations("Messenger");

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const updateChatMutation = useMutation({
    mutationFn: (newName: string) => {
      const formData = new FormData();
      formData.append("conversationId", chatId);
      formData.append("name", newName);
      return chatsApi.updateConversation(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
      onOpenChange(false);
    },
  });

  const handleSave = () => {
    if (!name.trim()) return;
    updateChatMutation.mutate(name);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("changeChatName")}
            </ModalHeader>
            <ModalBody>
              <Input
                autoFocus
                label={t("chatName")}
                placeholder={t("typeChatName")}
                variant="bordered"
                value={name}
                onValueChange={setName}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                {t("cancel")}
              </Button>
              <Button
                color="primary"
                onPress={handleSave}
                isLoading={updateChatMutation.isPending}
                isDisabled={!name.trim() || name === currentName}
              >
                {t("save")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
