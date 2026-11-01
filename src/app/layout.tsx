import type { Metadata } from "next";
import { Bodoni_Moda, Manrope } from "next/font/google";
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
  title: "FSH — Virtual fitting room for fashion stores",
  description:
    "Add YouCam-powered virtual try-on and outfit suggestions to any online fashion store with one embed.",
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
        <SiteIntroGate>{children}</SiteIntroGate>
      </body>
    </html>
  );
}
