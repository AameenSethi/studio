
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
  ArrowDown,
  ArrowUp,
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
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [underlineStyle, setUnderlineStyle] = useState({});
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50; // 50px buffer
      setIsAtBottom(atBottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (navRef.current) {
        const activeLink = navRef.current.querySelector(`a[href="${pathname}"]`) as HTMLElement;
        if (activeLink) {
            const { offsetLeft, offsetWidth } = activeLink;
            setUnderlineStyle({
                left: `${offsetLeft}px`,
                width: `${offsetWidth}px`,
            });
        }
    }
}, [pathname]);


  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
       <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
            <div className="flex items-center">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-lg font-semibold md:text-base mr-6"
                >
                    <BookOpen className="h-6 w-6 text-primary" />
                    <span className="font-headline text-xl">StudyPal</span>
                </Link>
            </div>
            <div className='flex-1 flex justify-center'>
              <nav ref={navRef} className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-2 md:text-sm lg:gap-4 relative">
                  {navItems.map((item, index) => (
                      <React.Fragment key={item.href}>
                        <Link
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-1 w-20 text-center transition-colors duration-300 group",
                                pathname.startsWith(item.href) ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                            <span className="text-xs">{item.label}</span>
                        </Link>
                        {index < navItems.length - 1 && (
                            <div className="h-8 w-px bg-border" />
                        )}
                      </React.Fragment>
                  ))}
                  <div className="absolute -bottom-[21px] h-0.5 bg-primary transition-all duration-300" style={underlineStyle} />
              </nav>
            </div>
          <Sheet>
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
                    >
                        <BookOpen className="h-6 w-6 text-primary" />
                         <span className="font-headline text-xl">StudyPal</span>
                    </Link>
                    {navItems.map((item) => (
                         <Link
                            key={item.href}
                            href={item.href}
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
          <div className="flex items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <ModeToggle />
            <UserNav />
          </div>
       </header>
       <main className="flex-1 p-4 sm:px-6 sm:py-4 md:gap-8 md:p-8 space-y-8">
          {children}
       </main>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="default"
                        size="icon"
                        className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
                        onClick={isAtBottom ? scrollToTop : scrollToBottom}
                    >
                        {isAtBottom ? (
                            <ArrowUp className="h-6 w-6" />
                        ) : (
                            <ArrowDown className="h-6 w-6" />
                        )}
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    {isAtBottom ? 'Scroll to Top' : 'Scroll to Bottom'}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    </div>
  );
}
