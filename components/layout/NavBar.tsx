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
import { usePathname } from "next/navigation";

const ThemeChanger = dynamic(() => import("../ThemeChanger"), { ssr: false });

export default function NavBar(props: NavbarProps) {
  const t = useTranslations("NavBar");
  const pathname = usePathname();
  const { logout } = useAuth();
  const { data: profile, isLoading } = useProfile();

  const navItems = [
    {
      label: t("home"),
      href: "/",
    },
    {
      label: t("messenger"),
      href: "/messenger",
    },
    {
      label: t("sketchroom"),
      href: "/sketchroom",
    },
  ];

  const checkIsActive = (href: string) => {
    if (href === "/" || href === "#") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <Navbar
      {...props}
      height="70px"
      maxWidth="xl"
      className="border-b border-default-500"
    >
      <NavbarContent justify="center">
        <NavbarBrand>
          <span className="mr-5 font-medium">MULTIHUB</span>
        </NavbarBrand>
        {navItems.map((item) => {
          const isActive = checkIsActive(item.href);
          return (
            <NavbarItem key={item.href}>
              <Link
                as={I18nLink}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`text-foreground hover:text-primary ${
                  isActive ? "font-bold" : ""
                }`}
              >
                {item.label}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="ml-2 flex! gap-3 items-center">
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
