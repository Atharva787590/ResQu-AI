import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

// Include Leaflet CSS globally to ensure maps render with correct styles
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "ResQu AI - Crisis Response & Disaster Assistance",
  description: "AI-powered emergency operations dashboard and volunteer coordination.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50 text-slate-800 antialiased">
      <body className="min-h-screen flex bg-slate-50">
        <Sidebar />
        <main className="flex-1 flex flex-col bg-white overflow-x-hidden relative h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
