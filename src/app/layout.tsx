import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from '@vercel/analytics/react';
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://asrulbasri.com'),
  title: {
    default: "Asrul Basri | System Builder",
    template: "%s | Asrul Basri"
  },
  description: "Turning Ideas Into Action. I help businesses and individuals organize their work, use simple tools, and get clear on their direction. Less stress, more results.",
  keywords: ["system builder", "business operations", "digital tools", "productivity", "automation", "Notion", "workflow"],
  authors: [{ name: "Asrul Basri", url: "https://asrulbasri.com" }],
  creator: "Asrul Basri",
  publisher: "Asrul Basri",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://asrulbasri.com",
    siteName: "Asrul Basri",
    title: "Asrul Basri | System Builder",
    description: "Turning Ideas Into Action. I help businesses and individuals organize their work, use simple tools, and get clear on their direction.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Asrul Basri - System Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asrul Basri | System Builder",
    description: "Turning Ideas Into Action. I help businesses and individuals organize their work.",
    creator: "@asrulbasri",
    images: ["/og-image.png"],
  },
  verification: {
    google: "3VyWGE108JN_HOcouGrS10nfw-Pj4JKr-0JRNxX7Ijc",
  },
  alternates: {
    canonical: "https://asrulbasri.com",
  },
  other: {
    'copyright': '© 2025 Asrul Basri. All rights reserved.',
    'author': 'Asrul Basri',
    'revisit-after': '7 days',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Asrul Basri',
    url: 'https://asrulbasri.com',
    jobTitle: 'System Builder',
    description: 'I help businesses and individuals organize their work, use simple tools, and get clear on their direction.',
    sameAs: [
      'https://twitter.com/asrulbasri',
      'https://linkedin.com/in/asrulbasri',
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-200 selection:text-emerald-900`}
      >
        <LayoutWrapper>{children}</LayoutWrapper>
        <Analytics />
      </body>
    </html>
  );
}
