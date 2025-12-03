'use client';

import './globals.css';
import { cn } from "@/lib/utils";
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthGuard } from '@/components/auth-guard';
import { usePathname } from 'next/navigation';


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const noHeaderFooter = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <title>WeGo</title>
      </head>
      <body className={cn("font-body antialiased min-h-screen flex flex-col")} suppressHydrationWarning>
        <FirebaseClientProvider>
          <AuthGuard>
            {!noHeaderFooter && <Header />}
            <main className="flex-grow">
              {children}
            </main>
            {!noHeaderFooter && <Footer />}
            <Toaster />
          </AuthGuard>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
