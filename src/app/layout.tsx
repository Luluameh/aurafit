import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
import { CartNotice } from "@/components/store/cart-notice";
import { BagProvider } from "@/lib/cart/bag";
import { SiteIntroGate } from "@/components/site-intro-gate";
import "./globals.css";

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "AuraFit — Virtual fitting room for fashion stores",
    template: "%s — AuraFit",
  },
  applicationName: "AuraFit",
  description:
    "Add YouCam-powered virtual try-on and outfit suggestions to any online fashion store with one embed.",
  openGraph: {
    title: "AuraFit — Virtual fitting room for fashion stores",
    description:
      "Add YouCam-powered virtual try-on and outfit suggestions to any online fashion store with one embed.",
    images: [{ url: "/brand/aurafit.png", alt: "AuraFit" }],
  },
  icons: {
    icon: [{ url: "/brand/aurafit-icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/brand/apple-touch.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${bodoni.variable} ${manrope.variable} h-full`}>
      <body className="min-h-full font-body antialiased">
        <BagProvider>
          <SiteIntroGate>{children}</SiteIntroGate>
          <CartNotice />
        </BagProvider>
      </body>
    </html>
  );
}
