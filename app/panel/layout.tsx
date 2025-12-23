import React, { PropsWithChildren } from "react";
import PanelHeader from "../components/PanelHeader";
import FormCreateCategory from "../components/FormCreateCategory";

export default function Layout({ children } : PropsWithChildren) {
  return (
    <>
      <PanelHeader />
      <FormCreateCategory />
      {children}
    </>
  );
}