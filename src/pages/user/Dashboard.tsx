import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function UserDashboard() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userPhone = localStorage.getItem('userPhone');
    
    // Fetch real user data from Supabase
    fetchUserData(userPhone);
  }, []);

  // Refresh user data when window gains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refreshing dashboard data...');
      const userPhone = localStorage.getItem('userPhone');
      if (userPhone) {
        // Re-fetch user data to get the latest eligibility status
        fetchUserData(userPhone);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Refresh user data periodically
  useEffect(() => {
    const userPhone = localStorage.getItem('userPhone');
    if (!userPhone) return;
    
    // Refresh user data every 10 seconds to get the latest eligibility status
    const interval = setInterval(() => {
      fetchUserData(userPhone);
    }, 10000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const fetchUserData = async (phoneNumber: string) => {
    try {
      setLoading(true);
      
      // Fetch student data
      const { data: studentData, error: studentError } = await supabase
        .from('students')
        .select('*')
        .eq('phone_number', phoneNumber)
        .eq('deleted', false)
        .single();

      if (studentError) {
        console.error('Error fetching student data:', studentError);
        return;
      }

      // Certificate count is based on whether the student has a certificate
      const certificateCount = studentData.certificate ? 1 : 0;

      setUserProfile({
        name: studentData.name,
        id: `ST${studentData.student_id.toString().padStart(3, '0')}`,
        phone: studentData.phone_number,
        email: studentData.email,
        year: studentData.year,
        branch: studentData.branch,
        collegeName: studentData.college_name,
        certificateCount: certificateCount,
        certificate: studentData.certificate,
        downloadedCount: studentData.downloaded_count,
        eligible: studentData.eligible || false
      });
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !userProfile) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
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
            Welcome, {userProfile.name}!
          </h1>
          <p className="text-xl welcome-subtitle max-w-2xl mx-auto">
            Download your internship certificates and manage your profile information.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-primary/20 hover:shadow-teal transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Certificates
              </CardTitle>
              <Award className="h-4 w-4 text-highlight" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{userProfile.certificateCount}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:shadow-teal transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Eligibility Status
              </CardTitle>
              <Award className="h-4 w-4 text-highlight" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${userProfile.eligible ? 'text-green-600' : 'text-red-600'}`}>
                {userProfile.eligible ? 'Eligible' : 'Not Eligible'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {userProfile.eligible 
                  ? 'You can download certificates' 
                  : 'Contact admin for eligibility approval'
                }
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:shadow-teal transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                College
              </CardTitle>
              <User className="h-4 w-4 text-highlight" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{userProfile.collegeName}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:shadow-teal transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Last Login
              </CardTitle>
              <Calendar className="h-4 w-4 text-highlight" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">Today</div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Quick Actions</CardTitle>
            <CardDescription>
              Access your most important features
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => navigate('/user/certificates')}
              variant="golden"
              size="lg"
              className="h-16 flex-col gap-2"
            >
              <Award className="w-6 h-6" />
              View My Certificates
            </Button>
            <Button
              onClick={() => navigate('/user/student-info')}
              variant="outline"
              size="lg"
              className="h-16 flex-col gap-2"
            >
              <User className="w-6 h-6" />
              Update Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}