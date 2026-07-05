import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Escala — Convierte tu idea en empresa",
  description: "Escala conecta fundadores con especialistas que aportan su tiempo y conocimiento a cambio de participación diferida. La infraestructura para crear empresas reales.",
  icons: {
    icon: "/brand/favicon.svg",
    apple: "/brand/app-icon.svg",
  },
  openGraph: {
    title: "Escala",
    description: "Convierte tu idea en empresa con el equipo correcto.",
    images: ["/brand/isotipo-instagram.svg"],
    siteName: "Escala",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Escala",
  url: "https://escala.network",
  sameAs: [
    "https://www.facebook.com/profile.php?id=61591678262407",
    "https://www.instagram.com/joinescala",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
