import React, { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { convertImageToPdf, downloadPdfBlob } from "@/utils/imageToPdfConverter";
import { supabase } from "@/integrations/supabase/client";
import { Download, Calendar, Award } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApprovedCertificate {
  student_id: number;
  name: string;
  certificate: string;
  certificate_id: string;
  course_enrolled: string;
  company_id: number;
  internship_start_date: string;
  internship_end_date: string;
  certificate_requested_at: string;
  downloaded_count: number;
}

const Downloads = () => {
  const { userPhone } = useAuth();
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<ApprovedCertificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovedCertificates();
  }, [userPhone]);

  const fetchApprovedCertificates = async () => {
    if (!userPhone) return;

    try {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("phone_number", userPhone)
        .eq("certificate_approved", true)
        .not("certificate", "is", null);

      if (error) throw error;

      setCertificates(data || []);
    } catch (error) {
      console.error("Error fetching approved certificates:", error);
      toast({
        title: "Error",
        description: "Failed to fetch approved certificates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadCertificate = async (certificate: string, studentName: string, certificateId: string) => {
    try {
      console.log('🔍 Starting certificate download for:', studentName);
      console.log('📋 Student data:', { studentName, certificateId, certificateExists: !!certificate });
      
      // Ensure we have valid data
      if (!certificate || certificate.length === 0) {
        console.error('❌ Certificate data is empty or invalid');
        throw new Error('Certificate data is empty or invalid');
      }

      console.log('🔄 Converting image to PDF...');
      
      // Convert image data to PDF
      const result = await convertImageToPdf(certificate);
      
      if (!result.success || !result.blob) {
        console.error('❌ Failed to convert image to PDF:', result.error);
        throw new Error(result.error || 'Failed to convert certificate to PDF');
      }

      // Validate blob size
      if (result.blob.size === 0) {
        console.error('❌ Generated PDF blob is empty');
        throw new Error('Generated PDF blob is empty');
      }

      console.log('✅ PDF conversion successful, blob size:', result.blob.size);

      // Download the PDF
      const filename = `${studentName.replace(/\s+/g, '_')}_Certificate_${certificateId}.pdf`;
      downloadPdfBlob(result.blob, filename);

      console.log('✅ Certificate download completed successfully');
      
      toast({
        title: "Download Successful",
        description: `Certificate for ${studentName} has been downloaded successfully.`,
      });

    } catch (error) {
      console.error('❌ Certificate download failed:', error);
      
      toast({
        title: "Download Failed",
        description: error instanceof Error ? error.message : "Failed to download certificate. Please try again.",
        variant: "destructive",
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Downloads</h1>
          <p className="text-gray-600">Download your approved certificates</p>
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No approved certificates yet
            </h3>
            <p className="text-gray-500">
              Your certificates will appear here once they are approved by the admin.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate) => (
              <div
                key={certificate.student_id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {certificate.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Course: {certificate.course_enrolled}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      Requested: {new Date(certificate.certificate_requested_at).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-gray-500">
                      Downloads: {certificate.downloaded_count}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => downloadCertificate(certificate.certificate, certificate.name, certificate.certificate_id)}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Certificate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Downloads;