import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HeartbeatPing from "@/components/HeartbeatPing";
import { getPlaylist } from "@/lib/musicData";
import MusicPlayerShell from "@/components/MusicPlayer/MusicPlayerShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TodoComics - Catálogo Geek",
  description:
    "Explora cómics, películas, series y libros del mundo geek. Tu catálogo personal estilo Netflix.",
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
  const playlist = await getPlaylist();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-zinc-950 text-zinc-100">
        <HeartbeatPing />
        <MusicPlayerShell playlist={playlist}>
          {children}
        </MusicPlayerShell>
      </body>
    </html>
  );
}
