
'use client';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import React from 'react';
import { getBrandingSettings } from '@/lib/branding';


function AppManager({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  React.useEffect(() => {
    const updateTitle = () => {
      const settings = getBrandingSettings();
      document.title = settings.departmentName || 'DocuSafe';
    };
    updateTitle();
    window.addEventListener('storage', updateTitle);
    return () => {
      window.removeEventListener('storage', updateTitle);
    };
  }, []);

  return <>{children}</>;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AppManager>
            {children}
        </AppManager>
        <Toaster />
      </body>
    </html>
  );
}

    