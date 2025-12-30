"use client";

import {
  Avatar,
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Link,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarProps,
} from "@heroui/react";
import { Link as I18nLink } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import LanguageChanger from "../LanguageChanger";
import dynamic from "next/dynamic";
import { useProfile } from "@/lib/hooks/useProfile";
import { useAuth } from "@/lib/contexts/AuthContext";

const ThemeChanger = dynamic(() => import("../ThemeChanger"), { ssr: false });

export default function NavBar(props: NavbarProps) {
  const t = useTranslations("NavBar");
  const { logout } = useAuth();
  const { data: profile, isLoading } = useProfile();

  return (
    <Navbar {...props} height="60px">
      <NavbarBrand>
        <span className="text-small ml-2 font-medium">ACME</span>
      </NavbarBrand>

      <NavbarContent justify="center">
        <NavbarItem>
          <Link as={I18nLink} href="#" size="sm">
            {t("home")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link as={I18nLink} href="#" size="sm">
            {t("features")}
          </Link>
        </NavbarItem>
        <NavbarItem isActive>
          <Link
            aria-current="page"
            color="foreground"
            as={I18nLink}
            href="#"
            size="sm"
          >
            {t("customers")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link as={I18nLink} href="#" size="sm">
            {t("about")}
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="ml-2 flex! gap- items-center">
          <ThemeChanger />
          <LanguageChanger />
          {!isLoading && profile ? (
            <Dropdown placement="bottom-end">
              <DropdownTrigger>
                <Avatar
                  as="button"
                  className="transition-transform"
                  color="default"
                  name={profile.fullName?.[0] || "U"}
                  size="sm"
                  src={profile.avatar}
                />
              </DropdownTrigger>
              <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                  <p className="font-semibold">{t("signedInAs")}</p>
                  <p className="font-semibold">{profile.email}</p>
                </DropdownItem>

                <DropdownSection title={t("sections.account")}>
                  <DropdownItem key="settings" href="/me/settings">
                    {t("settings")}
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    color="danger"
                    onPress={() => logout()}
                  >
                    {t("logOut")}
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <>
              <Button
                as={I18nLink}
                href="/sign-in"
                className="font-medium"
                variant="solid"
                color="primary"
              >
                {t("login")}
              </Button>
              <Button
                as={I18nLink}
                href="/sign-up"
                className="font-medium"
                variant="solid"
                color="success"
              >
                {t("register")}
              </Button>
            </>
          )}
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
}
