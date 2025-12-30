"use client";

import { loginSchema, LoginSchema } from "@/lib/schemas/auth";
import { Button, Checkbox, Divider, Form, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link as I18nLink } from "@/i18n/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ILoginRequest } from "@/apis/auth/auth-req.type";
import authApi from "@/apis/auth/auth";
import InputControl from "@/components/InputControl";
import InputPasswordControl from "@/components/InputPasswordControl";
import { useTranslations } from "next-intl";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useRouter } from "@/i18n/navigation";

export default function SignInPage() {
  const router = useRouter();
  const t = useTranslations("SignIn");
  const formMethods = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });
  const { login } = useAuth();

  const loginMutaion = useMutation({
    mutationFn: (body: ILoginRequest) => authApi.login(body),
  });

  const onSubmit: SubmitHandler<LoginSchema> = (data) => {
    loginMutaion.mutate(data, {
      onSuccess: (response) => {
        const { accessToken, refreshToken } = response.data;
        login({ accessToken, refreshToken });
        router.push("/");
      },
      onError: (error) => {
        console.log(error);
      },
    });
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="rounded-large flex w-full max-w-sm flex-col gap-4">
        <div className="flex flex-col items-center pb-6">
          <p className="text-xl font-medium">{t("title")}</p>
          <p className="text-small text-default-500">{t("description")}</p>
        </div>
        <Form
          className="flex flex-col gap-3"
          validationBehavior="native"
          onSubmit={formMethods.handleSubmit(onSubmit)}
        >
          <InputControl<LoginSchema>
            register={formMethods.register}
            isRequired
            label={t("emailAddress")}
            name="email"
            placeholder={"example@gmail.com"}
            type="email"
            variant="bordered"
          />
          <InputPasswordControl<LoginSchema>
            register={formMethods.register}
            isRequired
            label={t("password")}
            name="password"
            placeholder={"example123"}
            variant="bordered"
          />
          <div className="flex w-full items-center justify-between px-1 py-2">
            <Checkbox name="remember" size="sm">
              {t("rememberMe")}
            </Checkbox>
            <Link className="text-default-500" href="#" size="sm">
              {t("forgotPassword")}
            </Link>
          </div>
          <Button className="w-full" color="primary" type="submit">
            {t("signIn")}
          </Button>
        </Form>
        <div className="flex items-center gap-4 py-2">
          <Divider className="flex-1" />
          <p className="text-tiny text-default-500 shrink-0">{t("or")}</p>
          <Divider className="flex-1" />
        </div>
        <div className="flex flex-col gap-2">
          <Button
            startContent={<Icon icon="flat-color-icons:google" width={24} />}
            variant="bordered"
          >
            {t("continueWithGoogle")}
          </Button>
          <Button
            startContent={
              <Icon className="text-default-500" icon="fe:github" width={24} />
            }
            variant="bordered"
          >
            {t("continueWithGithub")}
          </Button>
        </div>
        <p className="text-small text-center">
          {t("needToCreateAnAccount")}&nbsp;
          <Link as={I18nLink} href="/sign-up" size="sm">
            {t("signUp")}
          </Link>
        </p>
      </div>
    </div>
  );
}
