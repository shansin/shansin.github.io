import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/contexts/ThemeContext";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'sans-serif'],
});

const siteUrl = 'https://shsin.github.io';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  title: {
    template: '%s | Shantanu Singh',
    default: "Systems and Strides",
  },
  description: "Personal blog about AI, engineering and endurance activities.",
  keywords: ['AI', 'machine learning', 'engineering', 'endurance', 'blog', 'software engineering'],
  authors: [{ name: 'Shantanu Singh' }],
  creator: 'Shantanu Singh',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': '/feed.xml',
    },
  },
  openGraph: {
    title: "Systems and Strides",
    description: "Personal blog about AI, engineering and endurance activities.",
    url: siteUrl,
    siteName: "Systems and Strides",
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@shantanu_singh',
    title: "Systems and Strides",
    description: "Personal blog about AI, engineering and endurance activities.",
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
  verification: {
    google: 'your-google-verification-code', // Add your Google Search Console verification code
  },
};

import Footer from "@/components/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <GoogleAnalytics />
      <body className={inter.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
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
