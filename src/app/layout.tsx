import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShortsNews | เว็บไซต์สรุปข่าวสั้นและรวดเร็วสำหรับคุณ",
  description: "อัพเดทข่าวสารด้วยบทสรุปย่อที่กระชับ รวดเร็ว เข้าใจง่าย ค้นพบข่าวสารหมวดหมู่เทคโนโลยี การเงิน และธุรกิจได้ในที่เดียว",
  keywords: "สรุปข่าว, ข่าวสั้น, ShortsNews, ข่าวไอที, ข่าวการเงิน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        <Navbar />
        <main className="flex-1 bg-gradient-to-b from-[#0b0f19] via-[#0f172a] to-[#090d16]">
          {children}
        </main>
        <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ShortsNews. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}

