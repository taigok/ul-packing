import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "UL Packing - ウルトラライトパッキングリスト",
  description: "あなたの装備を管理し、最適なパッキングリストを作成",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans">
        <div className="min-h-screen bg-slate-50">
          <nav className="bg-white border-b">
            <div className="container mx-auto px-4">
              <div className="flex h-16 items-center justify-between">
                <div className="flex items-center gap-8">
                  <Link href="/" className="text-xl font-bold text-slate-900">
                    UL Packing
                  </Link>
                  <div className="flex gap-4">
                    <Link
                      href="/gears"
                      className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      ギア管理
                    </Link>
                    <Link
                      href="/lists"
                      className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      パッキングリスト
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
