import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Award, User, Building2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import QRCode from 'qrcode';

interface CertificateForm {
  studentName: string;
  courseName: string;
  companyName: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface Course {
  course_id: number;
  course_name: string;
}

interface Company {
  company_id: number;
  company_name: string;
}

export default function CertificateGenerator() {
  const [form, setForm] = useState<CertificateForm>({
    studentName: '',
    courseName: '',
    companyName: '',
    startDate: null,
    endDate: null
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [certificateId, setCertificateId] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isEligible, setIsEligible] = useState<boolean>(false);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
 const [downloadCount, setDownloadCount] = useState<number>(0);
  const { toast } = useToast();

  // Fetch courses and companies from Supabase
  useEffect(() => {
    fetchCoursesAndCompanies();
    refreshEligibility();
  }, []);

  // Function to refresh eligibility status
  const refreshEligibility = async () => {
    try {
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) return;
      
      const { data: student, error } = await supabase
        .from('students')
        .select('eligible, downloaded_count')
        .eq('phone_number', userPhone)
        .single();

      if (!error && student) {
        setIsEligible(student.eligible || false);
        setDownloadCount(student.downloaded_count || 0);
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
      console.log('Window focused, checking eligibility...');
      refreshEligibility();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // Check user eligibility (using refreshEligibility for consistency)
  const checkEligibility = async () => {
    try {
      setEligibilityLoading(true);
      await refreshEligibility();
    } catch (error) {
      console.error('Error in checkEligibility:', error);
      setIsEligible(false);
    } finally {
      setEligibilityLoading(false);
    }
  };

  // --- START: Dynamic Font Injection for Cinzel Decorative ---
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = 'cinzel-decorative-font-styles';

    // IMPORTANT: These URLs assume your font files are in your 'public/font/' directory.
    // E.g., if CinzelDecorative-Regular.ttf is in public/font/, use '/font/CinzelDecorative-Regular.ttf'
    const fontStyles = `
      @font-face {
        font-family: 'Cinzel Decorative Custom'; /* The name you'll use in your JSX */
        src: url('/font/CinzelDecorative-Regular.ttf') format('truetype');
        font-weight: 400; /* For the regular version */
        font-style: normal;
        font-display: swap;
      }

      @font-face {
        font-family: 'Cinzel Decorative Custom'; /* Use the same font-family name */
        src: url('/font/CinzelDecorative-Bold.ttf') format('truetype');
        font-weight: 700; /* For the bold version */
        font-style: normal;
        font-display: swap;
      }
    `;

    styleElement.textContent = fontStyles;
    document.head.appendChild(styleElement);

    // Cleanup function: remove the style tag when the component unmounts
    return () => {
      const existingStyleElement = document.getElementById('cinzel-decorative-font-styles');
      if (existingStyleElement) {
        document.head.removeChild(existingStyleElement);
      }
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount
  // --- END: Dynamic Font Injection ---

  const fetchCoursesAndCompanies = async () => {
    try {
      setLoadingOptions(true);

      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('course_id, course_name')
        .order('course_name');

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        toast({
          title: "Error",
          description: "Failed to load courses. Please refresh the page.",
          variant: "destructive"
        });
      } else {
        setCourses(coursesData || []);
      }

      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('company_id, company_name')
        .order('company_name');

      if (companiesError) {
        console.error('Error fetching companies:', companiesError);
        toast({
          title: "Error",
          description: "Failed to load companies. Please refresh the page.",
          variant: "destructive"
        });
      } else {
        setCompanies(companiesData || []);
      }
    } catch (error) {
      console.error('Error in fetchCoursesAndCompanies:', error);
      toast({
        title: "Error",
        description: "Failed to load dropdown options. Please refresh the page.",
        variant: "destructive"
      });
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleGenerate = async () => {
     // Check download limit first
    if (downloadCount >= 2) {
      toast({
        title: "Request Limit Reached",
        description: "You have already reached the maximum limit of 2 certificate requests.",
        variant: "destructive"
      });
      return;
    }

    // Validate form
    if (!form.studentName.trim() || !form.courseName.trim() || !form.companyName.trim() ||
      !form.startDate || !form.endDate) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Fetch existing certificate ID and generate QR code
      const certId = await fetchExistingCertificateId();
      
      if (certId) {
        // Generate the certificate PDF and save it as a request
        await generateAndSaveCertificateRequest(certId);
        
        setIsGenerating(false);
        toast({
          title: "Certificate Request Submitted",
          description: "Your certificate request has been submitted for admin approval. You'll be able to download it from the Downloads section once approved.",
        });
        // Refresh download count after successful request
        await refreshEligibility();
        
        // Reset form after request
        setTimeout(() => {
          handleReset();
        }, 1000);
      } else {
        setIsGenerating(false);
      }
    } catch (error) {
      console.error('Error submitting certificate request:', error);
      setIsGenerating(false);
      toast({
        title: "Request Failed",
        description: "Failed to submit certificate request. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    setForm({
      studentName: '',
      courseName: '',
      companyName: '',
      startDate: null,
      endDate: null
    });
  };

  const formatDateForCertificate = (date: Date) => {
    return format(date, 'MMMM dd, yyyy');
  };

  // Fetch existing certificate ID from Supabase (do not generate new ones)
  const fetchExistingCertificateId = async () => {
    try {
      // Get the current user's phone number from localStorage
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) {
        toast({
          title: "Authentication Error",
          description: "User phone number not found. Please log in again.",
          variant: "destructive"
        });
        return null;
      }

      // Fetch the certificate_id from the students table
      const { data: student, error } = await supabase
        .from('students')
        .select('certificate_id, name')
        .eq('phone_number', userPhone)
        .single();

      if (error) {
        console.error('Error fetching student data:', error);
        toast({
          title: "Database Error",
          description: "Failed to fetch certificate data from database.",
          variant: "destructive"
        });
        return null;
      }

      if (!student) {
        toast({
          title: "Student Not Found",
          description: "No student record found for this phone number.",
          variant: "destructive"
        });
        return null;
      }

      const certificateIdToUse = student.certificate_id;

      // Only proceed if certificate_id already exists in database
      if (!certificateIdToUse) {
        toast({
          title: "Certificate ID Not Found",
          description: "No certificate ID found for this student. Please contact admin.",
          variant: "destructive"
        });
        return null;
      }

      setCertificateId(certificateIdToUse);
      
      // Generate QR code with the existing certificate ID
      const qrDataUrl = await QRCode.toDataURL(certificateIdToUse, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeDataUrl(qrDataUrl);
      
      return certificateIdToUse;
    } catch (error) {
      console.error('Error fetching certificate ID or generating QR code:', error);
      toast({
        title: "Error",
        description: "Failed to fetch certificate ID. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  // Generate certificate PDF and save as request
  const generateAndSaveCertificateRequest = async (certId: string) => {
    try {
      // Get the current user's phone number from localStorage
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) {
        throw new Error('User phone number not found');
      }

      // Generate QR code for this specific certificate ID
      const qrDataUrl = await QRCode.toDataURL(certId, {
        width: 150,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create a temporary certificate element for image generation
      const tempCertificate = document.createElement('div');
      tempCertificate.innerHTML = generateCertificateHTML(certId, qrDataUrl);
      tempCertificate.style.position = 'absolute';
      tempCertificate.style.left = '-9999px';
      document.body.appendChild(tempCertificate);

      // Import html2canvas for image generation
      const html2canvas = (await import('html2canvas')).default;

      // Generate high-quality image
      const canvas = await html2canvas(tempCertificate, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: 1056,
        height: 787
      });

      // Convert canvas to base64 image string
      const certificateImageData = canvas.toDataURL('image/png', 1.0);

      // Clean up temporary element
      document.body.removeChild(tempCertificate);

      // Get current student data to check download count
      const { data: studentData, error: fetchError } = await supabase
        .from('students')
        .select('downloaded_count')
        .eq('phone_number', userPhone)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // Check if student has reached the download limit
      const currentDownloadCount = studentData?.downloaded_count || 0;
      if (currentDownloadCount >= 2) {
        throw new Error('You have reached the maximum limit of 2 certificate requests.');
      }

      // Find the selected course and company IDs
      const selectedCourse = courses.find(course => course.course_name === form.courseName);
      const selectedCompany = companies.find(company => company.company_name === form.companyName);

      // Save certificate request to database and increment download count
      const { error: updateError } = await supabase
        .from('students')
        .update({
          certificate: certificateImageData,
          certificate_id: certId,
          certificate_status: 'pending',
          certificate_approved: false,
          certificate_requested_at: new Date().toISOString(),
          downloaded_count: currentDownloadCount + 1,
          internship_start_date: form.startDate ? form.startDate.toISOString().split('T')[0] : null,
          internship_end_date: form.endDate ? form.endDate.toISOString().split('T')[0] : null,
          course_id: selectedCourse ? selectedCourse.course_id : null,
          company_id: selectedCompany ? selectedCompany.company_id : null,
          preferred_name: form.studentName.trim() || null,
          course_enrolled: form.courseName
        })
        .eq('phone_number', userPhone);

      if (updateError) {
        throw updateError;
      }

    } catch (error) {
      console.error('Error generating and saving certificate request:', error);
      throw error;
    }
  };

  // Generate certificate HTML for PDF creation
  const generateCertificateHTML = (certId?: string, qrDataUrl?: string) => {
    // Use provided parameters or fallback to state values
    const certificateIdToUse = certId || certificateId;
    const qrCodeToUse = qrDataUrl || qrCodeDataUrl;
    
    return `
      <div style="width: 11in; height: 8.2in; position: relative; font-family: 'Cinzel Decorative Custom', serif; background-image: url('/certificates/template.png'); background-size: cover; background-position: center; background-repeat: no-repeat; overflow: hidden;">
        
        <!-- Student Name positioned exactly as in your template -->
        <div style="position: absolute; top: 3.45in; left: 50%; transform: translateX(-50%); font-size: 48px; font-weight: bold; color: #333; text-align: center; width: 8in; font-family: 'Cinzel Decorative Custom'; letter-spacing: 1px;">
          ${form.studentName}
        </div>
        
        <!-- Completion Text & Course/Company/Dates positioned as in your template -->
        <div style="position: absolute; top: 4.4in; left: 50%; transform: translateX(-50%); font-size: 20px; color: #555; text-align: center; width: 9in; line-height: 1.4; font-family: 'Cinzel Decorative Custom';">
          <i>has successfully completed a <strong style="color: #000000;">${form.courseName}</strong> program at <strong style="color: #000000;">${form.companyName}</strong>, from <strong style="color: #000000;">${formatDateForCertificate(form.startDate!)}</strong> to <strong style="color: #000000;">${formatDateForCertificate(form.endDate!)}</strong>.</i>
        </div>
        
        <!-- QR Code positioned at the blue circle location (top right) -->
        ${qrCodeToUse ? `
        <div style="position: absolute; top: 1.5in; right: 1.0in; z-index: 10;">
          <img src="${qrCodeToUse}" style="width: 80px; height: 80px; display: block;" alt="QR Code">
        </div>
        ` : ''}
        
        <!-- Certificate ID positioned as in your template (bottom left) - no background -->
        <div style="position: absolute; bottom: 0.55in; left: 1.7in; font-size: 12px; color: #000; text-align: left; font-family: sans-serif;">
          Certificate ID: ${certificateIdToUse || 'PENDING'}
        </div>
        
        <!-- Issued Date positioned as in your template (bottom right) - no background -->
        <div style="position: absolute; bottom: 0.55in; right: 1.65in; font-size: 12px; color: #666; text-align: right; font-family: sans-serif;">
          Issued on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>
    `;
  };

  // Save certificate data to Supabase (optional - for future use)
  const saveCertificateToSupabase = async (certId: string) => {
    try {
      // Get the current user's phone number from localStorage
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) {
        console.error('User phone number not found');
        return;
      }

      // Find the selected course and company IDs
      const selectedCourse = courses.find(course => course.course_name === form.courseName);
      const selectedCompany = companies.find(company => company.company_name === form.companyName);

      // Prepare the update data with internship details
      const updateData: any = {
        certificate_id: certId,
        internship_start_date: form.startDate ? form.startDate.toISOString().split('T')[0] : null,
        internship_end_date: form.endDate ? form.endDate.toISOString().split('T')[0] : null,
        course_id: selectedCourse ? selectedCourse.course_id : null,
        company_id: selectedCompany ? selectedCompany.company_id : null,
        preferred_name: form.studentName.trim() || null
      };

      // Update the student record with internship details
      const { error: updateError } = await supabase
        .from('students')
        .update(updateData)
        .eq('phone_number', userPhone);

      if (updateError) {
        console.error('Error updating student internship details:', updateError);
        toast({
          title: "Warning",
          description: "Certificate generated but failed to save internship details.",
          variant: "destructive"
        });
      } else {
        console.log('Student internship details updated successfully');
        toast({
          title: "Success",
          description: "Certificate generated and internship details saved successfully.",
        });
      }
      
    } catch (error) {
      console.error('Error saving certificate metadata to Supabase:', error);
      toast({
        title: "Warning",
        description: "Certificate generated but failed to save some details.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative">


        {/* Eligible Success Message */}
        {!eligibilityLoading && isEligible && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-full p-2 mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-green-800">Certificate Request Enabled</h4>
                <p className="text-sm text-green-700">You can now request certificates for admin approval.</p>
              </div>
            </div>
          </div>
        )}

        {/* Not Eligible Message */}
        {!eligibilityLoading && !isEligible && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Certificate Request Not Available</h3>
            <p className="text-red-700 mb-4">
              You need to get eligibility approval from the admin before you can request certificates.
            </p>
            <p className="text-sm text-red-600 mb-4">
              Please contact your administrator to update your eligibility status.
            </p>
            <Button
              onClick={refreshEligibility}
              disabled={eligibilityLoading}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              {eligibilityLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                  Checking...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh Status
                </>
              )}
            </Button>
          </div>
        )}

        {/* Download Count Information - Show when eligible */}
        {!eligibilityLoading && isEligible && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-800 mb-1">Certificate Request Status</h3>
                <p className="text-blue-700">
                  You have requested <span className="font-semibold">{downloadCount}</span> out of <span className="font-semibold">2</span> maximum certificates.
                </p>
                {downloadCount >= 2 && (
                  <p className="text-red-600 font-medium mt-2">
                    ⚠️ You have reached the maximum limit of certificate requests.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form Section - Blurred when not eligible or download limit reached */}
        <div className={cn(
          "grid gap-6 transition-all duration-300",
          (!eligibilityLoading && !isEligible) || downloadCount >= 2 && "blur-sm pointer-events-none opacity-50"
        )}>
          {/* Student Name */}
          <div className="grid gap-2">
            <Label htmlFor="studentName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Student Name *
            </Label>
            <Input
              id="studentName"
              value={form.studentName}
              onChange={(e) => setForm(prev => ({ ...prev, studentName: e.target.value }))}
              placeholder="Enter your full name"
              className="text-lg"
              disabled={!isEligible || downloadCount >= 2}
            />
          </div>

          {/* Course Name */}
          <div className="grid gap-2">
            <Label htmlFor="courseName" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Course/Program Name *
            </Label>
            <Select
              value={form.courseName}
              onValueChange={(value) => setForm(prev => ({ ...prev, courseName: value }))}
              disabled={loadingOptions || !isEligible || downloadCount >= 2}
            >
              <SelectTrigger className="text-lg">
                <SelectValue placeholder={loadingOptions ? "Loading courses..." : "Select a course/program"} />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.course_id} value={course.course_name}>
                    {course.course_name}
                  </SelectItem>
                ))}
                {courses.length === 0 && !loadingOptions && (
                  <SelectItem value="" disabled>
                    No courses available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Company Name */}
          <div className="grid gap-2">
            <Label htmlFor="companyName" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Company Name *
            </Label>
            <Select
              value={form.companyName}
              onValueChange={(value) => setForm(prev => ({ ...prev, companyName: value }))}
              disabled={loadingOptions || !isEligible || downloadCount >= 2}
            >
              <SelectTrigger className="text-lg">
                <SelectValue placeholder={loadingOptions ? "Loading companies..." : "Select a company"} />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.company_id} value={company.company_name}>
                    {company.company_name}
                  </SelectItem>
                ))}
                {companies.length === 0 && !loadingOptions && (
                  <SelectItem value="" disabled>
                    No companies available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Start Date *
              </Label>
              <Popover open={isStartDateOpen && isEligible && downloadCount < 2} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !form.startDate && "text-muted-foreground"
                    )}
                    disabled={!isEligible || downloadCount >= 2}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.startDate ? format(form.startDate, "PPP") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.startDate || undefined}
                    onSelect={(date) => {
                      setForm(prev => ({ ...prev, startDate: date || null }));
                      setIsStartDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="grid gap-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                End Date *
              </Label>
              <Popover open={isEndDateOpen && isEligible && downloadCount < 2} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !form.endDate && "text-muted-foreground"
                    )}
                    disabled={!isEligible || downloadCount >= 2}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.endDate ? format(form.endDate, "PPP") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.endDate || undefined}
                    onSelect={(date) => {
                      setForm(prev => ({ ...prev, endDate: date || null }));
                      setIsEndDateOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Request Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !isEligible || downloadCount >= 2}
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? "Submitting Request..." : downloadCount >= 2 ? "Request Limit Reached" : "Request Certificate"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}