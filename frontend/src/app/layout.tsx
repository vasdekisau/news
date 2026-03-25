import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { PasswordGate } from "@/components/password-gate";

export const metadata: Metadata = {
  title: "News Vasdekis",
  description: "Your personalized content feed",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PasswordGate>{children}</PasswordGate>
        </ThemeProvider>
      </body>
    </html>
  );
}
