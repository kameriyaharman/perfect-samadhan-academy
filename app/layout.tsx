import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/hind/400.css";
import "@fontsource/hind/500.css";
import "@fontsource/hind/600.css";
import "@fontsource/hind/700.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";

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
      <body>
        {children}
      </body>
    </html>
  );
}
