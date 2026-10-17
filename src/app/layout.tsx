import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "Buywise — Your Smart Shopping Partner",
  description: "A modern e-commerce store with an integrated Buywise AI that helps you discover, compare, budget and decide — like a trusted friend.",
  keywords: ["ecommerce", "AI shopping", "smart cart", "deals", "online store"],
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground font-sans">
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
