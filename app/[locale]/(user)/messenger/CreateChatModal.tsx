"use client";

import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Avatar,
  Spinner,
  Chip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import usersApi from "@/apis/users/users";
import chatsApi from "@/apis/chats/chats";
import { IUser } from "@/types/User";
import { IChat } from "@/types/Chat";
import { useDebounce } from "use-debounce";
import { useTranslations } from "next-intl";

interface CreateChatModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateChatModal({
  isOpen,
  onOpenChange,
}: CreateChatModalProps) {
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<IUser[]>([]);
  const [debouncedSearch] = useDebounce(search, 500);
  const queryClient = useQueryClient();
  const t = useTranslations("Messenger");

  // Reset search when modal opens/closes
  // actually...

  const { data: users, isLoading: isSearching } = useQuery({
    queryKey: ["users", "search", debouncedSearch],
    queryFn: () => usersApi.searchUsers(debouncedSearch),
    enabled: !!debouncedSearch,
    select: (res) => res.data.data,
  });

  const createChatMutation = useMutation({
    mutationFn: (userIds: string[]) => chatsApi.createConversation(userIds),
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      onOpenChange(false);
      setSearch("");
      setSelectedUsers([]);
    },
  });

  const handleUserClick = (user: IUser) => {
    const isSelected = selectedUsers.some((u) => u.id === user.id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateChat = () => {
    if (selectedUsers.length === 0) return;
    createChatMutation.mutate(selectedUsers.map((u) => u.id));
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("newMessage")}
            </ModalHeader>
            <ModalBody>
              <Input
                autoFocus
                placeholder={t("toNameOrEmail")}
                startContent={
                  <Icon
                    icon="solar:magnifer-linear"
                    className="text-default-400"
                  />
                }
                value={search}
                onValueChange={setSearch}
                variant="bordered"
                radius="lg"
                classNames={{
                  inputWrapper: "h-12",
                }}
              />

              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <Chip
                      key={user.id}
                      onClose={() => handleUserClick(user)}
                      variant="flat"
                      avatar={
                        <Avatar
                          name={user.fullName}
                          src={user.avatar}
                          size="sm"
                        />
                      }
                    >
                      {user.fullName}
                    </Chip>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-2 min-h-[300px] max-h-[400px] overflow-y-auto mt-2">
                {isSearching ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="md" />
                  </div>
                ) : users && users.length > 0 ? (
                  users.map((user: IUser) => {
                    const isSelected = selectedUsers.some(
                      (u) => u.id === user.id
                    );
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected ? "bg-primary-50" : "hover:bg-default-100"
                        }`}
                        onClick={() => handleUserClick(user)}
                      >
                        <Avatar src={user.avatar} name={user.fullName} />
                        <div className="flex flex-col">
                          <span className="font-medium text-small">
                            {user.fullName}
                          </span>
                          <span className="text-tiny text-default-400">
                            {user.email}
                          </span>
                        </div>
                        {isSelected && (
                          <Icon
                            icon="solar:check-circle-bold"
                            className="text-primary text-xl ml-auto"
                          />
                        )}
                      </div>
                    );
                  })
                ) : debouncedSearch ? (
                  <div className="text-center text-default-400 py-4">
                    {t("noUsersFound")}
                  </div>
                ) : (
                  <div className="text-center text-default-400 py-4">
                    {t("typeToSearch")}
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                {t("cancel")}
              </Button>
              <Button
                color="primary"
                onPress={handleCreateChat}
                isLoading={createChatMutation.isPending}
                isDisabled={selectedUsers.length === 0}
              >
                {t("createChat")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
