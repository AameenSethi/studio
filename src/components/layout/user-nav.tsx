'use client';

import {
  LogOut,
  Settings,
  User,
  Trash2,
  FileDown,
  History
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user-role';
import { useHistory } from '@/hooks/use-history';
import { useToast } from '@/hooks/use-toast';

export function UserNav() {
  const router = useRouter();
  const { toast } = useToast();
  const { userName, userEmail, userAvatar } = useUser();
  const { history, clearHistory } = useHistory();

  const handleLogout = () => {
    router.push('/');
  };

  const handleClearAllData = () => {
    try {
        localStorage.clear();
        toast({
            title: "Local Data Cleared",
            description: "All your local history and settings have been reset. The app will now reload."
        });
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    } catch (e) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not clear local data."
        })
    }
  }

  const handleClearHistory = () => {
    try {
        clearHistory();
        toast({
            title: "History Cleared",
            description: "Your action history has been cleared."
        });
    } catch (e) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not clear history."
        })
    }
  }

  const handleExportHistory = () => {
    try {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
            JSON.stringify(history, null, 2)
        )}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `studypal_history_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        toast({
            title: "History Exported",
            description: "Your action history has been downloaded as a JSON file."
        });
    } catch (e) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not export history."
        });
    }
  }

  const getInitials = (name: string) => {
    if (!name) return '';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {userAvatar && (
              <AvatarImage
                src={userAvatar}
                alt="User avatar"
              />
            )}
            <AvatarFallback>{getInitials(userName)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/profile" passHref>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={handleExportHistory}>
                  <FileDown className="mr-2 h-4 w-4" />
                  <span>Export History</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleClearHistory}>
                  <History className="mr-2 h-4 w-4" />
                  <span>Clear History</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={handleClearAllData} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Clear All Data</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
