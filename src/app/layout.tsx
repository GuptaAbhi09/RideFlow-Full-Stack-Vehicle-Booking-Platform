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
  title: "RideFlow — Real-Time Vehicle Booking Platform",
  description: "RideFlow is a production-grade vehicle booking platform with real-time live map tracking, Video KYC driver verification, and seamless Razorpay payments. Book rides instantly, track live.",
};

import { Toaster } from 'react-hot-toast';
import { ReduxProvider } from '@/redux/reduxprovider';
import { SessionProvider } from 'next-auth/react';
import { ReduxSync } from '@/redux/ReduxSync';
import { InitUser } from '@/components/InitUser';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <ReduxProvider>
            <ReduxSync />
            <InitUser>
              {children}
              <Toaster 
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#18181b',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.1)',
                  },
                }}
              />
            </InitUser>
          </ReduxProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
