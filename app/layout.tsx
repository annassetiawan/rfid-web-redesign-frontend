import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/shared/toast-provider";

export const metadata: Metadata = {
  title: "RFID Admin Dashboard",
  description: "Frontend redesign baseline for RFID web admin dashboard."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
