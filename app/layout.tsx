import "./globals.css";
import type { Metadata, Viewport } from "next";
import Cursor from "@/components/Cursor";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "Perfect Samadhan Academy — CPCT, Typing Test, Mock Tests", template: "%s | Perfect Samadhan Academy" },
  description: "CPCT, SSC, Patwari, Police, Court & Steno — Mock Tests, Hindi/English Typing Test (Inscript, Remington Gail), Notes PDF aur Previous Year Papers.",
  icons: { icon: "/favicon.png", apple: "/apple-touch-icon.png" },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0e1756" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Hind:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Cursor />
      </body>
    </html>
  );
}
