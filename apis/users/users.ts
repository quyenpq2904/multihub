import http from "../../lib/utils/http";
import { IGetMe, ISearchUsersResponse } from "./users-res.type";

const BaseURL = "users";

const usersApi = {
  getMe() {
    return http.get<IGetMe>(`${BaseURL}/me`);
  },
  searchUsers(q: string) {
    return http.get<ISearchUsersResponse>(`${BaseURL}`, {
      params: { q },
    });
  },
};

export default usersApi;
