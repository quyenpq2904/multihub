import http from "../../lib/utils/http";
import {
  IGetChatsRequest,
  IGetMessagesRequest,
  IAddMemberRequest,
} from "./chat-req.type";
import { IChatsResponse, IGetMessagesResponse } from "./chat-res.type";
import { IChat } from "@/types/Chat";

const BaseURL = "chats";

const chatsApi = {
  getChats({ afterCursor, beforeCursor, limit = 20 }: IGetChatsRequest) {
    return http.get<IChatsResponse>(`${BaseURL}`, {
      params: { afterCursor, beforeCursor, limit },
    });
  },

  getMessages({
    conversationId,
    limit = 20,
    afterCursor,
    beforeCursor,
  }: IGetMessagesRequest) {
    return http.get<IGetMessagesResponse>(
      `${BaseURL}/${conversationId}/messages`,
      {
        params: { limit, afterCursor, beforeCursor },
      }
    );
  },

  createConversation(users: string[]) {
    return http.post<IChat>(`${BaseURL}`, { users });
  },

  getConversation(id: string) {
    return http.get<IChat>(`${BaseURL}/${id}`);
  },

  addMember(data: IAddMemberRequest) {
    return http.post(`${BaseURL}/add-member`, data);
  },

  updateConversation(data: FormData) {
    return http.patch(`${BaseURL}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default chatsApi;
