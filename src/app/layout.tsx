import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Inter, Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const trebuchet = localFont({
  src: "./fonts/trebuchet.ttf",
  variable: "--font-trebuchet",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s - shoptech online store",
    default: "shoptech online store",
  },
  description:
    "Shoptech online store. Your one-stop shop for all your shopping needs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className={`${trebuchet.variable} h-full antialiased`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
