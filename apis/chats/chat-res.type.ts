import { IChat, IMessage } from "@/types/Chat";

export interface ICursorPagination {
  limit: number;
  afterCursor?: string;
  beforeCursor?: string;
  totalRecords: number;
}

export interface IChatsResponse {
  data: IChat[];
  pagination: ICursorPagination;
}

export interface IGetMessagesResponse {
  data: IMessage[];
  pagination: ICursorPagination;
}
