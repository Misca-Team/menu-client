import TopHeaderBusiness from "../components/TopHeaderBusiness";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <TopHeaderBusiness />
      <main>{children}</main>
    </>
  );
}
