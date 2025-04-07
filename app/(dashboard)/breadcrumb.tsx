'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb';

export function DynamicBreadcrumb() {
  const pathname = usePathname();
  
  // Split the pathname into segments
  const segments = pathname.split('/').filter(Boolean);
  
  // Format label to be more readable
  const formatLabel = (segment: string): string => {
    // Replace hyphens with spaces and capitalize each word
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Special case for pages that need custom labels
  const getPageSpecificLabel = (segment: string, isLast: boolean): string => {
    if (segment === 'products' && isLast) {
      return 'All Products';
    }
    return formatLabel(segment);
  };
  
  // Generate breadcrumb items
  const breadcrumbItems = [];
  
  // Always add Dashboard as the root
  breadcrumbItems.push({
    label: 'Dashboard',
    href: '/dashboard',
    active: segments.length === 1 && segments[0] === 'dashboard'
  });
  
  // Add remaining segments as breadcrumb items
  segments.forEach((segment, index) => {
    if (segment === 'dashboard' && index === 0) return; // Skip dashboard as it's already added
    
    const href = `/${segments.slice(0, index + 1).join('/')}`;
    const isLast = index === segments.length - 1;
    const label = getPageSpecificLabel(segment, isLast);
    
    breadcrumbItems.push({
      label,
      href,
      active: isLast
    });
  });
  
  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.href}>
            {index > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {item.active ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}