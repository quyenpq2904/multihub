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
import { useDebounce } from "use-debounce";
import { useTranslations } from "next-intl";

interface AddMemberModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  chatId: string;
}

export default function AddMemberModal({
  isOpen,
  onOpenChange,
  chatId,
}: AddMemberModalProps) {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [debouncedSearch] = useDebounce(search, 500);
  const queryClient = useQueryClient();
  const t = useTranslations("Messenger");

  const { data: users, isLoading: isSearching } = useQuery({
    queryKey: ["users", "search", debouncedSearch],
    queryFn: () => usersApi.searchUsers(debouncedSearch),
    enabled: !!debouncedSearch,
    select: (res) => res.data.data,
  });

  const addMemberMutation = useMutation({
    mutationFn: (memberId: string) =>
      chatsApi.addMember({ conversationId: chatId, memberId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      // Invalidate specific chat query as well to update details immediately
      queryClient.invalidateQueries({ queryKey: ["chat", chatId] });
      onOpenChange(false);
      setSearch("");
      setSelectedUser(null);
    },
  });

  const handleUserClick = (user: IUser) => {
    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
    } else {
      setSelectedUser(user);
    }
  };

  const handleAddMember = () => {
    if (!selectedUser) return;
    addMemberMutation.mutate(selectedUser.id);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {t("addMember")}
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

              {selectedUser && (
                <div className="flex flex-wrap gap-2">
                  <Chip
                    key={selectedUser.id}
                    onClose={() => setSelectedUser(null)}
                    variant="flat"
                    avatar={
                      <Avatar
                        name={selectedUser.fullName}
                        src={selectedUser.avatar}
                        size="sm"
                      />
                    }
                  >
                    {selectedUser.fullName}
                  </Chip>
                </div>
              )}

              <div className="flex flex-col gap-2 min-h-[300px] max-h-[400px] overflow-y-auto mt-2">
                {isSearching ? (
                  <div className="flex justify-center py-4">
                    <Spinner size="md" />
                  </div>
                ) : users && users.length > 0 ? (
                  users.map((user: IUser) => {
                    const isSelected = selectedUser?.id === user.id;
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
                onPress={handleAddMember}
                isLoading={addMemberMutation.isPending}
                isDisabled={!selectedUser}
              >
                {t("add")}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
