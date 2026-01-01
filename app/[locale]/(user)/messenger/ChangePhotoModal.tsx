"use client";

import React, { useState, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Image,
} from "@heroui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import chatsApi from "@/apis/chats/chats";
import { useTranslations } from "next-intl";
import { Icon } from "@iconify/react";

interface ChangePhotoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
}

export default function ChangePhotoModal({
  isOpen,
  onOpenChange,
  chatId,
}: ChangePhotoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const t = useTranslations("Messenger");

  const resetState = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const updateChatMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("conversationId", chatId);
      formData.append("avatar", file);
      return chatsApi.updateConversation(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
      onOpenChange(false);
      resetState();
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreview(objectUrl);
    }
  };

  const handleSave = () => {
    if (!file) return;
    updateChatMutation.mutate(file);
  };

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} onClose={handleClose}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("changePhoto")}
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  id="avatar-upload"
                />

                {preview ? (
                  <div className="relative group">
                    <Image
                      src={preview}
                      alt="Preview"
                      width={200}
                      height={200}
                      className="object-cover rounded-full w-[200px] h-[200px]"
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Icon icon="solar:camera-add-bold" className="text-3xl" />
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-[200px] h-[200px] rounded-full bg-default-100 flex flex-col items-center justify-center cursor-pointer hover:bg-default-200 transition-colors border-2 border-dashed border-default-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Icon
                      icon="solar:camera-add-bold"
                      className="text-4xl text-default-400 mb-2"
                    />
                    <span className="text-sm text-default-500">
                      {t("choosePhoto")}
                    </span>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleClose}>
                {t("cancel")}
              </Button>
              <Button
                color="primary"
                onPress={handleSave}
                isLoading={updateChatMutation.isPending}
                isDisabled={!file}
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
