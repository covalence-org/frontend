// components/User.tsx
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { SignOutButton } from '@/components/signout-button';
import Link from 'next/link';
import { auth, signOut } from '../../auth';


// Server component for the user dropdown
export async function User() {
  const session = await auth();
  const user = session?.user;
  console.log('User:', user);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <Image
            src={user?.email_confirmed_at ? `/api/avatar/${user.id}` : '/placeholder-user.jpg'}
            width={36}
            height={36}
            alt="Avatar"
            className="overflow-hidden rounded-full"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        {user && (
          <DropdownMenuLabel className="font-normal text-xs truncate">
            {user.email}
          </DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link href="/settings" className="w-full">Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/support" className="w-full">Support</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user ? (
          <SignOutButton />
        ) : (
          <DropdownMenuItem>
            <Link href="/login" className="w-full">Sign In</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}