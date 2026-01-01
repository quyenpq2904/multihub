"use client";

import { signUpSchema, SignUpSchema } from "@/lib/schemas/auth";
import { Button, Checkbox, Divider, Form, Link } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Link as I18nLink, useRouter } from "@/i18n/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ISignUpRequest } from "@/apis/auth/auth-req.type";
import authApi from "@/apis/auth/auth";
import InputControl from "@/components/InputControl";
import InputPasswordControl from "@/components/InputPasswordControl";
import { useTranslations } from "next-intl";

export default function SignUpPage() {
  const router = useRouter();
  const t = useTranslations("SignUp");
  const formMethods = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      terms: true,
    },
  });

  const signUpMutation = useMutation({
    mutationFn: (body: ISignUpRequest) => authApi.signUp(body),
  });

  const onSubmit: SubmitHandler<SignUpSchema> = (data) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, terms, ...reqData } = data;
    signUpMutation.mutate(reqData, {
      onSuccess: () => {
        router.push("/sign-in");
      },
      onError: (error) => {
        console.error(error);
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
          <InputControl<SignUpSchema>
            register={formMethods.register}
            isRequired
            label={t("fullName")}
            name="fullName"
            placeholder="John Doe"
            type="text"
            variant="bordered"
            isInvalid={!!formMethods.formState.errors.fullName}
            errorMessage={formMethods.formState.errors.fullName?.message}
          />
          <InputControl<SignUpSchema>
            register={formMethods.register}
            isRequired
            label={t("emailAddress")}
            name="email"
            placeholder="example@gmail.com"
            type="email"
            variant="bordered"
            isInvalid={!!formMethods.formState.errors.email}
            errorMessage={formMethods.formState.errors.email?.message}
          />
          <InputPasswordControl<SignUpSchema>
            register={formMethods.register}
            isRequired
            label={t("password")}
            name="password"
            placeholder="********"
            variant="bordered"
            isInvalid={!!formMethods.formState.errors.password}
            errorMessage={formMethods.formState.errors.password?.message}
          />
          <InputPasswordControl<SignUpSchema>
            register={formMethods.register}
            isRequired
            label={t("confirmPassword")}
            name="confirmPassword"
            placeholder="********"
            variant="bordered"
            isInvalid={!!formMethods.formState.errors.confirmPassword}
            errorMessage={formMethods.formState.errors.confirmPassword?.message}
          />
          <Checkbox
            isRequired
            className="py-4"
            size="sm"
            {...formMethods.register("terms")}
            isInvalid={!!formMethods.formState.errors.terms}
          >
            {t("terms")}
            &nbsp;
            <Link className="relative z-1" href="#" size="sm">
              {t("termsLink")}
            </Link>
            &nbsp;{t("and")}&nbsp;
            <Link className="relative z-1" href="#" size="sm">
              {t("privacyPolicy")}
            </Link>
          </Checkbox>
          <Button
            className="w-full"
            color="primary"
            type="submit"
            isLoading={signUpMutation.isPending}
          >
            {t("signUp")}
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
          {t("alreadyHaveAccount")}&nbsp;
          <Link as={I18nLink} href="/sign-in" size="sm">
            {t("logIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
