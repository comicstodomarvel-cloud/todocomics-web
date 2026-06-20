import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import HeartbeatPing from "@/components/HeartbeatPing";
import { getPlaylist } from "@/lib/musicData";
import { getDiscordData } from "@/lib/discordData";
import MusicPlayerShell from "@/components/MusicPlayer/MusicPlayerShell";
import DiscordWidgetShell from "@/components/DiscordWidget/DiscordWidgetShell";

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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [playlist, discordData] = await Promise.all([
    getPlaylist(),
    getDiscordData(),
  ]);

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-100">
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
        <DiscordWidgetShell discordData={discordData} />
        <MusicPlayerShell playlist={playlist}>
          {children}
        </MusicPlayerShell>
      </body>
    </html>
  );
}
