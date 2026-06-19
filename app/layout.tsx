import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeartbeatPing from "@/components/HeartbeatPing";
import { getPlaylist } from "@/lib/musicData";
import { getDiscordData } from "@/lib/discordData";
import { AuthProvider } from "@/lib/AuthContext";
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
        <HeartbeatPing />
        <DiscordWidgetShell discordData={discordData} />
        <AuthProvider>
          <MusicPlayerShell playlist={playlist}>
            {children}
          </MusicPlayerShell>
        </AuthProvider>
      </body>
    </html>
  );
}
