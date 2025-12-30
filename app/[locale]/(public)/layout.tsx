import NavBar from "@/components/layout/NavBar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
