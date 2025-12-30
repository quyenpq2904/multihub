import NavBar from "@/components/layout/NavBar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen xl:flex">
      <div className={`flex-1 transition-all duration-300 ease-in-out`}>
        <NavBar />
        <div className="p-4 mx-auto md:p-6">{children}</div>
      </div>
    </div>
  );
}
