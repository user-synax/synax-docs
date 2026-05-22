import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "synax-docs",
  description: "Fast collaborative documents",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: "dark",
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
        suppressHydrationWarning
      >
        <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-50 font-sans">
          <TooltipProvider delayDuration={0}>
            {children}
            <Toaster theme="dark" position="bottom-right" closeButton />
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
