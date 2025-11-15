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
import { useState, useEffect, Fragment } from 'react';
import { useUser } from '@/hooks/use-user-role';
import { ModeToggle } from './mode-toggle';
import { Separator } from '@/components/ui/separator';

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
      'flex items-center gap-2 transition-colors',
      isActive
        ? 'font-semibold text-primary'
        : 'text-muted-foreground hover:text-foreground',
      isMobile ? 'p-2 rounded-lg text-lg' : 'px-3 py-2 rounded-md text-sm'
    );

    return (
      <Link href={href} className={linkClasses}>
        <Icon className="h-5 w-5" />
        {label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
       <header className="sticky top-0 z-30 flex h-20 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
          <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
            <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold md:text-base mr-2"
            >
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="font-headline text-xl">StudyPal</span>
            </Link>
            {navItems.map((item, index) => (
                <Fragment key={item.href}>
                  {index > 0 && <Separator orientation="vertical" className="h-10" />}
                  <Link
                      href={item.href}
                      className={cn(
                          "flex flex-col items-center justify-center gap-1 w-20 text-center transition-colors duration-300",
                          pathname === item.href ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                      )}
                  >
                      <item.icon className="h-5 w-5" />
                      <span className="text-xs">{item.label}</span>
                  </Link>
                </Fragment>
            ))}
          </nav>
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
                                pathname === item.href ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </SheetContent>
          </Sheet>
          <div className="flex w-full items-center justify-end gap-4 md:ml-auto md:gap-2 lg:gap-4">
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
