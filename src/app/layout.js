import { Inter, Lora } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/contexts/ThemeContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { siteConfig } from "@/lib/config";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-sans',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

const lora = Lora({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-serif',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: {
    template: '%s | Shantanu Singh',
    default: "Systems and Strides",
  },
  description: siteConfig.description,
  keywords: ['AI', 'machine learning', 'engineering', 'endurance', 'blog', 'software engineering'],
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.title,
    locale: 'en_US',
    type: 'website',
  },
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
};

import Footer from "@/components/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <GoogleAnalytics />
      <body className={`${inter.variable} ${lora.variable}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
        <ThemeProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <div id="main-content" style={{ flex: 1 }} role="main">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
