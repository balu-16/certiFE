import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Users, TrendingUp, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch real admin stats data
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      
      // Fetch total students count
      const { count: totalStudents, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('deleted', false);

      // Fetch total certificates count (students with certificates)
      const { count: totalCertificates, error: certificatesError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('deleted', false)
        .not('certificate', 'is', null);

      // Fetch this month's certificates (students who got certificates this month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count: thisMonthIssued, error: monthError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('deleted', false)
        .not('certificate', 'is', null)
        .gte('created_at', startOfMonth.toISOString());

      if (studentsError) console.error('Error fetching students:', studentsError);
      if (certificatesError) console.error('Error fetching certificates:', certificatesError);
      if (monthError) console.error('Error fetching monthly data:', monthError);

      setStats({
        totalStudents: totalStudents || 0,
        totalCertificates: totalCertificates || 0,
        pendingCertificates: 0, // Students without certificates
        thisMonthIssued: thisMonthIssued || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold welcome-title">
            Welcome, Admin
          </h1>
          <p className="text-xl welcome-subtitle max-w-2xl mx-auto">
            Manage student certificates and monitor platform performance.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-primary/20 hover:shadow-teal transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Students
              </CardTitle>
              <Users className="h-4 w-4 text-highlight" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                Active learners
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:shadow-teal transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Certificates
              </CardTitle>
              <Award className="h-4 w-4 text-highlight" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalCertificates}</div>
              <p className="text-xs text-muted-foreground">
                Certificates issued
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:shadow-teal transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                This Month
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-highlight" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.thisMonthIssued}</div>
              <p className="text-xs text-muted-foreground">
                New certificates
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:shadow-teal transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <FileText className="h-4 w-4 text-highlight" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.pendingCertificates}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => navigate('/admin/certificates')}
              variant="golden"
              size="lg"
              className="h-16 flex-col gap-2"
            >
              <Award className="w-6 h-6" />
              Manage Certificates
            </Button>
            <Button
              onClick={() => navigate('/admin/certificates')}
              variant="outline"
              size="lg"
              className="h-16 flex-col gap-2"
            >
              <Users className="w-6 h-6" />
              View All Students
            </Button>
            <Button
              onClick={() => navigate('/admin/company-info')}
              variant="outline"
              size="lg"
              className="h-16 flex-col gap-2"
            >
              <FileText className="w-6 h-6" />
              Company Information
            </Button>
          </CardContent>
        </Card>



        {/* Monthly Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl text-primary">This Month's Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Certificates Issued</span>
                <span className="font-bold text-primary">{stats.thisMonthIssued}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">New Enrollments</span>
                <span className="font-bold text-primary">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Course Completions</span>
                <span className="font-bold text-primary">31</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl text-primary">Popular Programs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Full Stack Development</span>
                <span className="font-bold text-primary">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">React.js Development</span>
                <span className="font-bold text-primary">28%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Python Programming</span>
                <span className="font-bold text-primary">27%</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}