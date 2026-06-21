import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import RegisterSW from "@/components/RegisterSW";
import HeartbeatPing from "@/components/HeartbeatPing";
import TeraboxNotification from "@/components/TeraboxNotification";
import DesktopToolbar from "@/components/DesktopToolbar";
import { getPlaylist } from "@/lib/musicData";
import { Suspense } from "react";
import { PlayerProvider } from "@/lib/playerStore";
import YouTubeBridge from "@/components/MusicPlayer/YouTubeBridge";
import DesktopPanel from "@/components/MusicPlayer/DesktopPanel";
import MobileSheet from "@/components/MusicPlayer/MobileSheet";
import MobileBottomBar from "@/components/MobileBottomBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://todocomics.vercel.app'

export const metadata: Metadata = {
  title: "TodoComics - Catálogo Geek",
  description:
    "Explora cómics, películas, series y libros del mundo geek. Tu catálogo personal estilo Netflix.",
  metadataBase: new URL(siteUrl),
  manifest: "/manifest.json",
  icons: {
    icon: "https://axfugtisjsjbkqlkixla.supabase.co/storage/v1/object/public/portadas/MTC.png",
    apple: "https://axfugtisjsjbkqlkixla.supabase.co/storage/v1/object/public/portadas/MTC.png",
  },
  appleWebApp: {
    capable: true,
    title: "TodoComics",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TodoComics - Catálogo Geek",
    description:
      "Explora cómics, películas, series y libros del mundo geek. Tu catálogo personal estilo Netflix.",
    type: "website",
    siteName: "TodoComics",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "TodoComics - Catálogo Geek",
    description:
      "Explora cómics, películas, series y libros del mundo geek. Tu catálogo personal estilo Netflix.",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#121212",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [playlist] = await Promise.all([
    getPlaylist(),
  ]);

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-100 pb-16 lg:pb-0 lg:pt-14 overflow-x-hidden">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "TodoComics",
            url: siteUrl,
            description:
              "Explora cómics, películas, series y libros del mundo geek. Tu catálogo personal estilo Netflix.",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${siteUrl}/?busqueda={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <HeartbeatPing />
        <TeraboxNotification />
        <RegisterSW />
        <PlayerProvider playlist={playlist}>
          <DesktopToolbar />
          <YouTubeBridge />
          {children}
          <DesktopPanel />
          <MobileSheet />
          <Suspense fallback={null}>
            <MobileBottomBar />
          </Suspense>
        </PlayerProvider>
      </body>
    </html>
  );
}
