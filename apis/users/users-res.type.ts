import { IUser } from "@/types/User";
import { ICursorPagination } from "../chats/chat-res.type";

export interface IGetMe {
  data: IUser; // Assuming generic structure wrapper or direct
}

export interface ISearchUsersResponse {
  data: IUser[];
  pagination: ICursorPagination;
}
