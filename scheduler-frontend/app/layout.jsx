import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import CreateEventDrawer from "@/components/CreateEvent";
import Header from "@/components/header";
import { Suspense } from "react";
import ToastProvider from "@/components/ToastProvider";

export const metadata = {
  title: "Scheduler - Meeting Scheduling App",
  description:
    "Effortlessly schedule and manage meetings with our intuitive Scheduler app. Reduce scheduling conflicts and improve productivity.",
  keywords:
    "meeting scheduler, online scheduling, calendar app, appointment booking, productivity tool",
  author: "Rohit Mittal",
  robots: "index, follow",
  openGraph: {
    title: "Scheduler - Meeting Scheduling App",
    description:
      "Effortlessly schedule and manage meetings with our intuitive Scheduler app. Reduce scheduling conflicts and improve productivity.",
    url: "https://github.com/Rohit8008/scheduler",
    siteName: "Scheduler",
    type: "website",
    images: [
      {
        width: 1200,
        height: 630,
        alt: "Scheduler - Meeting Scheduling App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scheduler - Meeting Scheduling App",
    description:
      "Effortlessly schedule and manage meetings with our intuitive Scheduler app.",
  },
  canonical: "https://github.com/Rohit8008/scheduler",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <Suspense>
      <html lang="en">
        <body className={inter.className}>
          <AuthProvider>
            {/* Header */}
            <Header />
            <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
              {children}
            </main>
            {/* Footer */}
            <footer className="bg-blue-100 py-12">
              <div className="container mx-auto px-4 text-center text-gray-600">
                <p>Made by Rohit Mittal</p>
              </div>
            </footer>
            <CreateEventDrawer />
            <ToastProvider />
          </AuthProvider>
        </body>
      </html>
    </Suspense>
  );
}
