const setTokenToLS = (token: { accessToken: string; refreshToken: string }) => {
  localStorage.setItem("token", JSON.stringify(token));
  window.dispatchEvent(new Event("auth-change"));
};

const getTokenFromLS = (): {
  accessToken: string;
  refreshToken: string;
} | null => {
  return localStorage.getItem("token")
    ? JSON.parse(localStorage.getItem("token") as string)
    : null;
};

const removeTokenFromLS = () => {
  localStorage.removeItem("token");
  window.dispatchEvent(new Event("auth-change"));
};

const authStore = {
  subscribe: (callback: () => void) => {
    window.addEventListener("storage", callback);
    window.addEventListener("auth-change", callback);
    return () => {
      window.removeEventListener("storage", callback);
      window.removeEventListener("auth-change", callback);
    };
  },
  getSnapshot: () => {
    return localStorage.getItem("token");
  },
  getServerSnapshot: () => {
    return null;
  },
};

export { setTokenToLS, getTokenFromLS, removeTokenFromLS, authStore };
