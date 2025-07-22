import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Calendar as CalendarIcon, BookOpen, CheckCircle, Shield, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CertificateGenerator from '@/components/CertificateGenerator';

interface Certificate {
  id: string;
  name: string;
  course: string;
  issueDate: string;
  status: 'completed' | 'in-progress';
  downloadUrl?: string | Uint8Array | null;
}

export default function UserCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const { toast } = useToast();

  // Function to fetch user certificates
  const fetchUserCertificates = async () => {
    try {
      setLoading(true);
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) {
        console.error('No user phone found in localStorage');
        setLoading(false);
        return;
      }

      const { data: student, error } = await supabase
        .from('students')
        .select('certificate, certificate_id, eligible, downloaded_count')
        .eq('phone_number', userPhone)
        .single();

      if (error) {
        console.error('Error fetching student data:', error);
        setLoading(false);
        return;
      }

      // Set eligibility status
      setIsEligible(student?.eligible || false);

      // Remove the Internship Certificate section - no certificates will be shown
      setCertificates([]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of user certificates
  useEffect(() => {
    fetchUserCertificates();
  }, []);

  // Function to refresh eligibility status
  const refreshEligibility = async () => {
    try {
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) return;
      
      const { data: student, error } = await supabase
        .from('students')
        .select('eligible')
        .eq('phone_number', userPhone)
        .single();

      if (!error && student) {
        setIsEligible(student.eligible || false);
      }
    } catch (error) {
      console.error('Error refreshing eligibility:', error);
    }
  };

  // Refresh eligibility periodically
  useEffect(() => {
    const userPhone = localStorage.getItem('userPhone');
    if (!userPhone) return;

    // Initial check
    refreshEligibility();
    
    // Refresh eligibility every 10 seconds (reduced from 30 seconds for faster updates)
    const interval = setInterval(refreshEligibility, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Refresh eligibility when window gains focus (user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      console.log('Window focused, refreshing certificates...');
      // Re-fetch certificates when window gains focus
      const userPhone = localStorage.getItem('userPhone');
      if (userPhone) {
        setLoading(true);
        // Refresh eligibility status
        refreshEligibility();
        // Re-run the fetch function
        fetchUserCertificates();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);



  const handleDownload = (certificate: Certificate) => {
    if (certificate.status === 'in-progress') {
      toast({
        title: "Certificate Not Ready",
        description: "This certificate is still being processed.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Download Started",
      description: `Downloading ${certificate.name}...`,
    });

    // Simulate download
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Certificate has been downloaded successfully.",
      });
    }, 2000);
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-xl text-muted-foreground">Loading your certificates...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">My Certificates</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            View and download all your internship certificates from NIGHA TECH.
          </p>
        </div>

        {/* Certificate Approval Status */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary flex items-center gap-2">
              <Award className="w-5 h-5" />
              Certificate Status
            </CardTitle>
            <CardDescription>
              Check your certificate eligibility status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 hover:bg-accent/5">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  isEligible 
                    ? 'bg-green-100 text-green-600' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {isEligible ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Shield className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-primary">Eligibility Status</h3>
                    <Badge variant={isEligible ? 'default' : 'outline'} 
                           className={isEligible ? 'bg-green-100 text-green-700' : ''}>
                      {isEligible ? 'Eligible' : 'Not Eligible'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isEligible 
                      ? 'You are eligible to download certificates.' 
                      : 'Contact your administrator for certificate eligibility.'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custom Certificate Generator */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-primary flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Custom Certificate Generator
            </CardTitle>
            <CardDescription>
              Generate and download custom certificates instantly (for demonstration purposes)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CertificateGenerator />
          </CardContent>
        </Card>

        {/* Certificates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {certificates.map((certificate) => (
            <Card 
              key={certificate.id} 
              className="border-primary/20 hover:shadow-teal transition-all duration-300 hover:scale-105"
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent/10 rounded-lg">
                      <Award className="w-6 h-6 text-highlight" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-primary">
                        {certificate.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <BookOpen className="w-4 h-4" />
                        {certificate.course}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={certificate.status === 'completed' ? 'default' : 'secondary'}
                    className={certificate.status === 'completed' ? 'bg-accent text-accent-foreground' : ''}
                  >
                    {certificate.status === 'completed' ? 'Ready' : 'In Progress'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="w-4 h-4" />
                  {certificate.status === 'completed' 
                    ? `Issued on ${new Date(certificate.issueDate).toLocaleDateString()}`
                    : 'Issue date: To be determined'
                  }
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleDownload(certificate)}
                    variant={certificate.status === 'completed' ? 'golden' : 'outline'}
                    disabled={certificate.status === 'in-progress'}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {certificate.status === 'completed' ? 'Download PDF' : 'Not Available'}
                  </Button>
                </div>

                {certificate.status === 'completed' && (
                  <div className="text-xs text-muted-foreground">
                    Certificate ID: {certificate.id}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {certificates.length === 0 && (
          <Card className="border-primary/20">
            <CardContent className="text-center py-12">
              {!isEligible ? (
                <>
                  <Award className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">Certificate Access Pending</h3>
                  <p className="text-muted-foreground mb-4">
                    You need approval from the admin to get access to your certificate.
                  </p>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-orange-800">
                      <strong>Status:</strong> Not eligible
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      Please contact your administrator for certificate eligibility.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-primary mb-2">No Certificates Yet</h3>
                  <p className="text-muted-foreground">
                    Complete your internship to receive your certificates.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}