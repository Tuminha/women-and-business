import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: "Woman and Business - Maria Cudeiro",
    template: "%s | Woman and Business"
  },
  description: "Empowering female entrepreneurs in the modern business landscape",
  keywords: [
    "women entrepreneurs", 
    "female business", 
    "women leadership", 
    "management", 
    "beauty", 
    "entrepreneurship"
  ],
  authors: [{ name: "Maria Cudeiro" }],
  creator: "Maria Cudeiro",
  publisher: "Woman and Business",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://woman-and-business.vercel.app/",
    title: "Woman and Business - Maria Cudeiro",
    description: "Empowering female entrepreneurs in the modern business landscape",
    siteName: "Woman and Business",
  },
  twitter: {
    card: "summary_large_image",
    title: "Woman and Business - Maria Cudeiro",
    description: "Empowering female entrepreneurs in the modern business landscape",
  },
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://woman-and-business.vercel.app"),
}; 