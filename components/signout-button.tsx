'use client';

import { signOut } from "next-auth/react";
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';

export function SignOutButton() {
  return (
    <DropdownMenuItem onSelect={(e) => {
      e.preventDefault();
      signOut({ redirectTo: '/login' });
    }}>
      Sign Out
    </DropdownMenuItem>
  );
}