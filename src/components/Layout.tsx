import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 relative">
          {/* Certificate background pattern */}
          <div 
            className="fixed inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='160' height='120' x='20' y='15' fill='none' stroke='%230B5F7C' stroke-width='2'/%3E%3Cpath d='M40 35h80M40 50h80M40 65h80M40 80h40' stroke='%230B5F7C' stroke-width='1'/%3E%3Ccircle cx='160' cy='35' r='8' fill='none' stroke='%230B5F7C' stroke-width='1'/%3E%3C/svg%3E")`,
              backgroundSize: '300px 225px',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          />
          <div className="relative z-10 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}