import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Job Search MVP",
  description: "AI-powered job aggregation and matching prototype.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </html>
  );
}
