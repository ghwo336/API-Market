import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import ClientOnlyProvider from "@/providers/ClientOnlyProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "API Market - Agent API Marketplace",
  description:
    "Discover, buy, and use verified APIs with on-chain payments on Base",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <ClientOnlyProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ClientOnlyProvider>
      </body>
    </html>
  );
}
