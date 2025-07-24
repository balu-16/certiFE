import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";

// Import all pages
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// User pages
import UserDashboard from "./pages/user/Dashboard";
import UserCertificates from "./pages/user/Certificates";
import UserStudentInfo from "./pages/user/StudentInfo";
import UserCompanyInfo from "./pages/user/CompanyInfo";
import UserDownloads from "./pages/user/Downloads";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminCertificates from "./pages/admin/Certificates";
import AdminCourses from "./pages/admin/Courses";
import AdminCompanyInfo from "./pages/admin/CompanyInfo";
import AdminRequests from "./pages/admin/Requests";
import AdminTemplates from "./pages/admin/Templates";
import AdminColleges from "./pages/admin/Colleges";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Default redirect to login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Authentication */}
              <Route path="/login" element={
                <ProtectedRoute requireAuth={false}>
                  <Login />
                </ProtectedRoute>
              } />
            
            {/* User Routes */}
            <Route path="/user/dashboard" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/user/certificates" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <UserCertificates />
              </ProtectedRoute>
            } />
            <Route path="/user/downloads" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <UserDownloads />
              </ProtectedRoute>
            } />
            <Route path="/user/student-info" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <UserStudentInfo />
              </ProtectedRoute>
            } />
            <Route path="/user/company-info" element={
              <ProtectedRoute allowedRoles={["student"]}>
                <UserCompanyInfo />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/certificates" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCertificates />
              </ProtectedRoute>
            } />
            <Route path="/admin/requests" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminRequests />
              </ProtectedRoute>
            } />
            <Route path="/admin/courses" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCourses />
              </ProtectedRoute>
            } />
            <Route path="/admin/company-info" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminCompanyInfo />
              </ProtectedRoute>
            } />
            <Route path="/admin/templates" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminTemplates />
              </ProtectedRoute>
            } />
            <Route path="/admin/colleges" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminColleges />
              </ProtectedRoute>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
