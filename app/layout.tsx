import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Credit Analytics Platform",
  description:
    "Credit analysis and financial  platform for institutional risk assessment, entity evaluation, and financial statement analysis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">{children}</body>
    </html>
  );
}