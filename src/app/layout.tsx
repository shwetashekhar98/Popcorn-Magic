import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ConvexClientProvider } from "@/components/convex-client-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import { UserSync } from "@/components/user-sync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Popcorn Magic",
    template: "%s | Popcorn Magic",
  },
  description: "Discover, browse, and review movies & TV shows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ConvexClientProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <UserSync />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster />
          </ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
