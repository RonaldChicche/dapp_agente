import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Refinance - Alternative Credit Scoring",
  description: "Modern alternative credit scoring platform powered by AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} antialiased min-h-screen relative`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-lavender-200/30 via-pearl to-mint-200/20 -z-10 dark:from-lavender-900/20 dark:via-background dark:to-mint-500/10" />
        {children}
      </body>
    </html>
  );
}
