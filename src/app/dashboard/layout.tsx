
'use client';

import Link from 'next/link';
import {
  Bell,
  FileText,
  History,
  Home,
  Search,
  Settings,
  StickyNote,
  Upload,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserNav } from '@/components/user-nav';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { isAdmin, getCurrentUser } from '@/lib/auth';
import React from 'react';
import { getBrandingSettings, type BrandingSettings } from '@/lib/branding';
import Image from 'next/image';

function BrandingDisplay() {
  const [settings, setSettings] = React.useState<BrandingSettings>({});

  React.useEffect(() => {
    // Function to update settings from localStorage
    const updateSettings = () => {
      setSettings(getBrandingSettings());
    };
    
    // Initial load
    updateSettings();

    // Listen for storage changes to update in real-time
    window.addEventListener('storage', updateSettings);

    // Cleanup listener
    return () => {
      window.removeEventListener('storage', updateSettings);
    };
  }, []);

  return (
    <div className="flex items-center gap-4">
      {settings.logoUrl ? (
        <Image src={settings.logoUrl} alt="Department Logo" width={40} height={40} className="h-10 w-10 object-contain" />
      ) : (
         <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-primary"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
         </div>
      )}
      <span className="font-semibold text-2xl hidden md:block">{settings.departmentName || 'DocuSafe'}</span>
    </div>
  );
}

function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = React.useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) {
      params.set('q', query);
    }
    
    // If we are not on the search page, navigate to it. Otherwise, just update the params.
    if (pathname !== '/dashboard/search') {
      router.push(`/dashboard/search?${params.toString()}`);
    } else {
      router.replace(`/dashboard/search?${params.toString()}`);
    }
  }

  return (
     <form onSubmit={handleSearch} className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search documents..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
      </form>
  );
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [showAdminLinks, setShowAdminLinks] = React.useState(false);
  const [showUploadLink, setShowUploadLink] = React.useState(false);

  React.useEffect(() => {
    const user = getCurrentUser();
    if(user) {
      const admin = user.role === 'admin';
      setShowAdminLinks(admin);
      setShowUploadLink(admin || user.role === 'data-entry-operator');
    }
  }, []);

  const navLinks = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/dashboard/search', icon: Search, label: 'Search' },
    { href: '/dashboard/letters', icon: FileText, label: 'Letters' },
    { href: '/dashboard/notifications', icon: Bell, label: 'Notifications' },
    { href: '/dashboard/notesheets', icon: StickyNote, label: 'Notesheets' },
  ];

  if (showUploadLink) {
    navLinks.push({ href: '/dashboard/upload', icon: Upload, label: 'Upload' });
  }

  const adminLinks = [
    { href: '/dashboard/users', icon: Users, label: 'Manage Users' },
    { href: '/dashboard/logs', icon: History, label: 'User Logs' },
  ];

  const allNavLinks = [...navLinks, ...(showAdminLinks ? adminLinks : [])];

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary-foreground transition-all group-hover:scale-110"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
            <span className="sr-only">DocuSafe</span>
          </Link>
          <TooltipProvider>
            {navLinks.map((link) => (
              <Tooltip key={link.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8',
                      pathname === link.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="sr-only">{link.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{link.label}</TooltipContent>
              </Tooltip>
            ))}
             {showAdminLinks && adminLinks.map((link) => (
              <Tooltip key={link.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8',
                      pathname === link.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                    <span className="sr-only">{link.label}</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{link.label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/dashboard/settings"
                  className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8',
                      pathname === '/dashboard/settings' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                    )}
                >
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Settings</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium">
                  <Link
                    href="#"
                    className="group flex h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary-foreground transition-all group-hover:scale-110"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                    <span className="sr-only">DocuSafe</span>
                  </Link>
                  {allNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                        'flex items-center gap-4 px-2.5',
                        pathname === link.href ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  ))}
                  <Link
                      href="/dashboard/settings"
                      className={cn(
                        'flex items-center gap-4 px-2.5',
                        pathname === '/dashboard/settings' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                    <Settings className="h-5 w-5" />
                    Settings
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <BrandingDisplay />
          
          <div className="flex items-center gap-2 ml-auto">
            <SearchInput />
            <UserNav />
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
