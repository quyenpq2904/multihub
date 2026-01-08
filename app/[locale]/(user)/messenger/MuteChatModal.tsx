"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  RadioGroup,
  Radio,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import chatsApi from "@/apis/chats/chats";
import { useTranslations } from "next-intl";

interface MuteChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
}

export default function MuteChatModal({
  isOpen,
  onOpenChange,
  chatId,
}: MuteChatModalProps) {
  const [duration, setDuration] = useState("15m");
  // const queryClient = useQueryClient();
  const t = useTranslations("Messenger");

  const muteChatMutation = useMutation({
    mutationFn: (duration: string) => {
      return chatsApi.muteConversation({ conversationId: chatId, duration });
    },
    onSuccess: () => {
      // Invalidate chat queries if necessary, or just close
      // queryClient.invalidateQueries({ queryKey: ["chats"] });
      onOpenChange(false);
    },
  });

  const handleMute = () => {
    muteChatMutation.mutate(duration);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 text-center">
              {t("muteChatDesc")}
            </ModalHeader>
            <ModalBody>
              <RadioGroup
                value={duration}
                onValueChange={setDuration}
                color="primary"
              >
                <Radio value="15m">{t("for15Minutes")}</Radio>
                <Radio value="1h">{t("for1Hour")}</Radio>
                <Radio value="8h">{t("for8Hours")}</Radio>
                <Radio value="24h">{t("for24Hours")}</Radio>
                <Radio value="until_active">{t("untilITurnItBackOn")}</Radio>
              </RadioGroup>
              <p className="text-small text-default-500 mt-2">
                {t("muteDescription")}
              </p>
            </ModalBody>
            <ModalFooter>
              <Button
                className="w-full bg-default-100 font-medium"
                radius="sm"
                onPress={onClose}
              >
                {t("cancel")}
              </Button>
              <Button
                className="w-full font-medium"
                color="primary"
                radius="sm"
                onPress={handleMute}
                isLoading={muteChatMutation.isPending}
              >
                {t("mute")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
