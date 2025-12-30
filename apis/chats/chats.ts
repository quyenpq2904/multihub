import http from "../../lib/utils/http";
import { IChatResponse, IGetMessagesResponse } from "./chats.type";

const BaseURL = "chats";

const chatsApi = {
  getChats() {
    return http.get<IChatResponse[]>(`${BaseURL}`);
  },

  getMessages(conversationId: string, limit: number = 20, cursor?: string) {
    const params: any = { limit };
    if (cursor) params.cursor = cursor;
    return http.get<IGetMessagesResponse>(
      `${BaseURL}/${conversationId}/messages`,
      { params }
    );
  },
};

export default chatsApi;
