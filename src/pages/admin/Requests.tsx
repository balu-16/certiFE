import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { convertImageToPdf } from "@/utils/imageToPdfConverter";
import { Eye, CheckCircle, XCircle, Calendar, User, BookOpen, Building, Check, X } from "lucide-react";
import { AppConfig } from "@/config/app.config";

interface CertificateRequest {
  student_id: number;
  name: string;
  email: string;
  certificate: string;
  certificate_id: string;
  course_enrolled: string;
  certificate_requested_at: string;
  certificate_status: string;
  certificate_approved: boolean;
  internship_start_date: string | null;
  internship_end_date: string | null;
  companies?: {
    company_name: string;
  };
}

const Requests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<CertificateRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCertificateRequests();
  }, []);

  const fetchCertificateRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("students")
        .select(`
          *,
          companies (
            company_name
          )
        `)
        .eq("certificate_status", "pending")
        .not("certificate", "is", null)
        .order("certificate_requested_at", { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching certificate requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch certificate requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (studentId: number, approved: boolean) => {
    setProcessingId(studentId);
    
    try {
      // Fetch student details with company information from Supabase database
      const { data: studentData, error: fetchError } = await supabase
        .from("students")
        .select(`
          student_id, 
          name, 
          email, 
          certificate_id, 
          course_enrolled,
          companies (
            company_name
          )
        `)
        .eq("student_id", studentId)
        .single();

      if (fetchError || !studentData) {
        throw new Error('Failed to fetch student details from database');
      }

      // Check if student has an email address
      if (!studentData.email) {
        toast({
          title: "Warning",
          description: `Certificate ${approved ? "approved" : "rejected"} successfully, but no email address found for student.`,
          variant: "destructive"
        });
      }

      // Update certificate status in database
      const { error } = await supabase
        .from("students")
        .update({
          certificate_approved: approved,
          certificate_status: approved ? "approved" : "rejected"
        })
        .eq("student_id", studentId);

      if (error) throw error;

      // Send email notification only if email exists
      if (studentData.email) {
        try {
          const emailEndpoint = approved ? 'certificate-approval' : 'certificate-rejection';
          const emailData = approved 
            ? {
                studentEmail: studentData.email,
                studentName: studentData.name,
                studentId: studentData.student_id.toString(), // Send studentId instead of certificateId
                courseName: studentData.course_enrolled,
                companyName: studentData.companies?.company_name || 'Unknown Company' // Include company name
              }
            : {
                studentEmail: studentData.email,
                studentName: studentData.name,
                courseName: studentData.course_enrolled,
                reason: '' // You can add a reason field later if needed
              };

          const emailResponse = await fetch(`${AppConfig.api.baseUrl}/v1/email/${emailEndpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData)
          });

          const emailResult = await emailResponse.json();
          
          if (!emailResult.success) {
            console.error('Failed to send email notification:', emailResult.error);
            // Don't fail the approval process if email fails
            toast({
              title: "Warning",
              description: `Certificate ${approved ? "approved" : "rejected"} successfully, but email notification failed to send.`,
              variant: "destructive"
            });
          } else {
            console.log('Email notification sent successfully:', emailResult.messageId);
            toast({
              title: "Success",
              description: `Certificate ${approved ? "approved" : "rejected"} successfully! Student has been notified via email.`,
            });
          }
        } catch (emailError) {
          console.error('Error sending email notification:', emailError);
          // Don't fail the approval process if email fails
          toast({
            title: "Warning",
            description: `Certificate ${approved ? "approved" : "rejected"} successfully, but email notification failed to send.`,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Success",
          description: `Certificate ${approved ? "approved" : "rejected"} successfully!`,
        });
      }

      fetchCertificateRequests(); // Refresh the list
    } catch (error) {
      console.error("Error updating certificate status:", error);
      toast({
        title: "Error",
        description: "Failed to update certificate status",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const previewCertificate = async (certificate: string) => {
    try {
      console.log('🔍 Starting certificate preview...');
      console.log('📊 Certificate data type:', typeof certificate);
      console.log('📏 Certificate data length:', certificate.length);
      
      if (!certificate || certificate.length === 0) {
        console.error('❌ Certificate data is empty or invalid');
        throw new Error('Certificate data is empty or invalid');
      }

      console.log('🔄 Converting image to PDF for preview...');
      
      // Convert image data to PDF
      const result = await convertImageToPdf(certificate);
      
      if (!result.success || !result.blob) {
        console.error('❌ Failed to convert image to PDF:', result.error);
        throw new Error(result.error || 'Failed to convert certificate to PDF');
      }
      
      console.log('📦 PDF blob created for preview:', {
        size: result.blob.size,
        type: result.blob.type,
        isEmpty: result.blob.size === 0
      });
      
      if (result.blob.size === 0) {
        console.error('❌ Generated PDF blob is empty');
        throw new Error('Generated PDF blob is empty');
      }
      
      console.log('🔗 Creating preview URL...');
      const url = URL.createObjectURL(result.blob);
      
      console.log('🪟 Opening preview window...');
      const previewWindow = window.open(url, '_blank');
      
      if (!previewWindow) {
        console.warn('⚠️ Pop-up blocked, creating download link instead...');
        const link = document.createElement('a');
        link.href = url;
        link.download = 'certificate_preview.pdf';
        link.click();
        
        toast({
          title: "Preview Downloaded",
          description: "Pop-up was blocked. Certificate preview has been downloaded instead.",
        });
      } else {
        console.log('✅ Preview window opened successfully');
        toast({
          title: "Preview Opened",
          description: "Certificate preview opened in new tab",
        });
      }
      
      // Clean up URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);
      
    } catch (error) {
      console.error('❌ Error previewing certificate:', error);
      toast({
        title: "Preview Error",
        description: error instanceof Error ? error.message : "Failed to preview certificate",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Certificate Requests</h1>
          <p className="text-gray-600">Review and approve student certificate requests</p>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No pending requests
            </h3>
            <p className="text-gray-500">
              Certificate requests will appear here when students submit them.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((request) => (
              <div
                key={request.student_id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.name}
                      </h3>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                        Pending
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{request.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span>{request.course_enrolled}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        <span>{request.companies?.company_name || 'No company assigned'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Requested: {new Date(request.certificate_requested_at).toLocaleDateString()}
                        </span>
                      </div>
                      {request.internship_start_date && request.internship_end_date && (
                        <div className="flex items-center gap-2 md:col-span-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Internship: {new Date(request.internship_start_date).toLocaleDateString()} - {new Date(request.internship_end_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-medium">ID:</span>
                        <span>{request.certificate_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => previewCertificate(request.certificate)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      Preview
                    </button>
                    
                    <button
                      onClick={() => handleApproval(request.student_id, false)}
                      disabled={processingId === request.student_id}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Reject
                    </button>
                    
                    <button
                      onClick={() => handleApproval(request.student_id, true)}
                      disabled={processingId === request.student_id}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Approve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Requests;