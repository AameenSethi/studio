
'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  LayoutDashboard,
  Lightbulb,
  FileText,
  BarChart2,
  TrendingUp,
  PanelLeft,
  User,
  History,
  HelpCircle,
  Wand2,
  BrainCircuit,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserNav } from './user-nav';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { ModeToggle } from './mode-toggle';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/study-plan', icon: Wand2, label: 'Study Plan' },
  { href: '/explanations', icon: Lightbulb, label: 'Explanations' },
  { href: '/practice', icon: FileText, label: 'Practice' },
  { href: '/doubt-solver', icon: BrainCircuit, label: 'Doubt Solver' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/progress', icon: TrendingUp, label: 'Progress' },
  { href: '/history', icon: History, label: 'History' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/help', icon: HelpCircle, label: 'Help' },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [underlineStyle, setUnderlineStyle] = useState({});
  const navRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    if (navRef.current) {
        const activeLink = navRef.current.querySelector(`a[data-active='true']`) as HTMLElement;
        if (activeLink) {
            const { offsetLeft, offsetWidth } = activeLink;
            setUnderlineStyle({
                left: `${offsetLeft}px`,
                width: `${offsetWidth}px`,
            });
        }
    }
}, [pathname]);

  return (
    <div className="flex min-h-screen w-full flex-col">
       <header className="sticky top-0 z-30 flex h-24 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm md:px-6">
          <div ref={navRef} className="relative hidden w-full flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link
              href="/dashboard"
              className="flex flex-col items-center gap-2 text-lg font-semibold md:text-base mr-4 px-3"
            >
              <BookOpen className="h-7 w-7 text-primary" />
              <span className="text-xs font-bold">StudyPal</span>
            </Link>
            <div className="flex flex-grow justify-center gap-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        data-active={pathname.startsWith(item.href)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 px-4 py-2 transition-colors duration-300 rounded-md w-20 h-16",
                            pathname.startsWith(item.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        <span className="text-xs">{item.label}</span>
                    </Link>
                ))}
            </div>
             <div
                className="absolute bottom-[-21px] h-1 bg-primary/80 rounded-full blur-lg transition-all duration-300"
                style={underlineStyle}
             />
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <nav className="grid gap-6 text-lg font-medium">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 text-lg font-semibold"
                        onClick={() => setOpen(false)}
                    >
                        <BookOpen className="h-6 w-6 text-primary" />
                         <span className="font-headline text-xl">StudyPal</span>
                    </Link>
                    {navItems.map((item) => (
                         <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "flex items-center gap-4 px-2.5 transition-colors duration-300",
                                pathname.startsWith(item.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </SheetContent>
          </Sheet>
          <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4 md:w-auto">
             <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold md:hidden"
            >
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="font-bold">StudyPal</span>
            </Link>
            <div className="ml-auto flex-1 sm:flex-initial" />
            <ModeToggle />
            <UserNav />
          </div>
       </header>
       <main className="flex-1 p-4 sm:px-6 sm:py-4 md:gap-8 md:p-8 space-y-8">
          {children}
       </main>
    </div>
  );
}
