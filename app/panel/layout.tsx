import PanelHeader from "../components/layout/panel-header";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PanelHeader />
      {children}
    </>
  );
}
