'use client';

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
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserNav } from './user-nav';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/use-user-role';
import { ModeToggle } from './mode-toggle';

const allNavItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['Student', 'Teacher'] },
  { href: '/explanations', icon: Lightbulb, label: 'Explanations', roles: ['Student', 'Teacher'] },
  { href: '/practice', icon: FileText, label: 'Practice Tests', roles: ['Student', 'Teacher', 'Parent'] },
  { href: '/analytics', icon: BarChart2, label: 'Analytics', roles: ['Student', 'Teacher'] },
  { href: '/progress', icon: TrendingUp, label: 'Progress Reports', roles: ['Student', 'Teacher', 'Parent'] },
  { href: '/history', icon: History, label: 'History', roles: ['Student', 'Teacher', 'Parent'] },
  { href: '/profile', icon: User, label: 'Profile', roles: ['Student', 'Teacher', 'Parent'] },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { userRole } = useUser();
  const [navItems, setNavItems] = useState(allNavItems);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const filteredNavItems = allNavItems.filter(item => item.roles.includes(userRole));
    setNavItems(filteredNavItems);
  }, [userRole]);

  useEffect(() => {
    const handleScroll = () => {
      const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50; // 50px buffer
      setIsAtBottom(atBottom);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const NavLink = ({
    href,
    icon: Icon,
    label,
    isMobile = false,
  }: {
    href: string;
    icon: React.ElementType;
    label: string;
    isMobile?: boolean;
  }) => {
    const isActive = pathname === href;
    const linkClasses = cn(
      'flex items-center gap-4 px-2.5',
      isActive
        ? 'text-foreground bg-accent'
        : 'text-muted-foreground hover:text-foreground',
      isMobile ? 'rounded-lg py-2' : 'rounded-full justify-center py-2 h-9 w-9 text-lg'
    );

    if (isMobile) {
      return (
        <Link href={href} className={linkClasses}>
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      );
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href={href} className={linkClasses}>
              <Icon className="h-5 w-5" />
              <span className="sr-only">{label}</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={5}>
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-card sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <BookOpen className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">Study Journey</span>
          </Link>
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-card/80 backdrop-blur-sm px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <nav className="grid gap-6 text-lg font-medium">
                <Link
                  href="/dashboard"
                  className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                >
                  <BookOpen className="h-5 w-5 transition-all group-hover:scale-110" />
                  <span className="sr-only">Study Journey</span>
                </Link>
                {navItems.map((item) => (
                  <NavLink key={item.href} {...item} isMobile />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserNav />
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
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
