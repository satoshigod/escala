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
  title: {
    default: "Escala — Escala es la plataforma donde encuentras lo que necesitas para crear, hacer crecer o mejorar tu negocio o empresa",
    template: "%s | Escala",
  },
  description: "Escala es la plataforma donde encuentras lo que necesitas para crear, hacer crecer o mejorar tu negocio o empresa — talento, capital, especialistas, tecnología, maquinaria y financiamiento en un solo lugar. Colombia y LATAM.",
  keywords: [
    "negocio empresa Colombia", "construir empresa sin capital", "maquinaria sin banco Colombia",
    "leasing maquinaria excedente", "financiar local comercial Colombia", "startup sin capital",
    "cofundador Colombia", "angel investor Colombia", "crear empresa Medellin",
    "programa maquinaria Medellin", "confeccion sin banco", "equipo salon belleza Medellin",
  ],
  authors: [{ name: "Escala", url: "https://escala.network" }],
  creator: "Escala Network",
  publisher: "Escala Network",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/brand/app-icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  openGraph: {
    title: "Escala — Escala es la plataforma donde encuentras lo que necesitas para crear, hacer crecer o mejorar tu negocio o empresa",
    description: "La infraestructura que reúne talento, capital, especialistas e IA para aumentar las probabilidades de construir empresas exitosas.",
    url: "https://escala.network",
    siteName: "Escala",
    images: [{ url: "https://escala.network/brand/og-default.png?v=3", width: 1200, height: 630, alt: "Escala — Escala es la plataforma donde encuentras lo que necesitas para crear, hacer crecer o mejorar tu negocio o empresa" }],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Escala — Escala es la plataforma donde encuentras lo que necesitas para crear, hacer crecer o mejorar tu negocio o empresa",
    description: "Talento, capital, especialistas e IA para construir empresas exitosas. Colombia y LATAM.",
    images: ["https://escala.network/brand/og-default.png"],
    creator: "@joinescala",
  },
  alternates: {
    canonical: "https://escala.network",
  },
  verification: {
    google: "REEMPLAZAR_CON_TU_CODIGO_GOOGLE_SEARCH_CONSOLE",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Escala",
  alternateName: "Escala Network",
  url: "https://escala.network",
  logo: "https://escala.network/brand/favicon.svg",
  description: "Plataforma para crear empresas reales. Conecta fundadores con cofundadores, especialistas, inversores y mentores en Latinoamérica y España.",
  foundingDate: "2026",
  areaServed: ["CO", "MX", "CL", "AR", "PE", "EC", "ES"],
  sameAs: [
    "https://www.facebook.com/profile.php?id=61591678262407",
    "https://www.instagram.com/joinescala",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: "Spanish",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Escala",
  url: "https://escala.network",
  description: "Plataforma para crear empresas con cofundadores, especialistas e inversores",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: "https://escala.network/buscar?q={search_term_string}" },
    "query-input": "required name=search_term_string",
  },
};

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Escala",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description: "Software para crear y gestionar empresas. Conecta con cofundadores, especialistas e inversores.",
  url: "https://escala.network",
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
