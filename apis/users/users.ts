import http from "../../lib/utils/http";
import { IGetMe } from "./users-res.type";

const BaseURL = "users";

const usersApi = {
  getMe() {
    return http.get<IGetMe>(`${BaseURL}/me`);
  },
};

export default usersApi;
