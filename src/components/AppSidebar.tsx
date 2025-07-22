import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Home, 
  Award, 
  User, 
  Building2, 
  LogOut, 
  Users,
  Menu,
  X,
  BookOpen,
  Download,
  FileCheck
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const navigate = useNavigate();
  const { userRole, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Use setTimeout to ensure state update completes before navigation
    setTimeout(() => {
      navigate('/login');
    }, 0);
  };

  const userNavItems = [
    { title: "Dashboard", url: "/user/dashboard", icon: Home },
    { title: "My Certificates", url: "/user/certificates", icon: Award },
    { title: "Downloads", url: "/user/downloads", icon: Download },
    { title: "Student Info", url: "/user/student-info", icon: User },
    { title: "Company Info", url: "/user/company-info", icon: Building2 },
  ];

  const adminNavItems = [
    { title: "Dashboard", url: "/admin/dashboard", icon: Home },
    { title: "Certificates", url: "/admin/certificates", icon: Award },
    { title: "Requests", url: "/admin/requests", icon: FileCheck },
    { title: "Courses", url: "/admin/courses", icon: BookOpen },
    { title: "Company Info", url: "/admin/company-info", icon: Building2 },
  ];

  const navItems = userRole === 'admin' ? adminNavItems : userNavItems;

  return (
    <Sidebar className="border-r border-sidebar-border" data-sidebar>
      <SidebarContent className="bg-sidebar text-sidebar-foreground" data-sidebar>
        {/* Header with Logo */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white">
              <img 
                src="/logo.jpg" 
                alt="NIGHA TECH Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-white sidebar-text">NIGHA TECH</h1>
                <p className="text-xs text-white/70 sidebar-text">Certificate Portal</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-white/80 mb-2 font-medium sidebar-text">
            {!collapsed && (userRole === 'admin' ? 'Admin Panel' : 'Student Portal')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 font-medium ${
                          isActive 
                            ? 'bg-accent text-black shadow-md' 
                            : 'text-white hover:bg-white/10'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon 
                            className="w-5 h-5" 
                            style={{ color: isActive ? '#000000' : '#FFFFFF' }} 
                          />
                          {!collapsed && (
                            <span style={{ color: isActive ? '#000000' : '#FFFFFF' }}>
                              {item.title}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Logout Button */}
        <div className="mt-auto p-4 border-t border-white/20">
          <Button
            onClick={handleLogout}
            className="w-full justify-start gap-3 bg-white/10 hover:bg-white/20 border-none"
            size="lg"
            style={{ color: '#FFFFFF' }}
          >
            <LogOut className="w-5 h-5" style={{ color: '#FFFFFF' }} />
            {!collapsed && <span className="font-medium sidebar-text">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}