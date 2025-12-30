import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import usersApi from "@/apis/users/users";
import { IUser } from "@/types/User";

export function useProfile() {
  const { tokens } = useAuth();

  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await usersApi.getMe();
      return data as IUser;
    },
    enabled: !!tokens?.accessToken,
    retry: false,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
