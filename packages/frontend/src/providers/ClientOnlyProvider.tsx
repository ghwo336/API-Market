"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";

const Web3Provider = dynamic(() => import("./Web3Provider"), { ssr: false });

export default function ClientOnlyProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <Web3Provider>{children}</Web3Provider>
    </ThemeProvider>
  );
}
