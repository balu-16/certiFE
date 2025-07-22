import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Download, Award, User, Building2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CertificateForm {
  studentName: string;
  courseName: string;
  companyName: string;
  startDate: Date | null;
  endDate: Date | null;
  duration: string;
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
    endDate: null,
    duration: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const certificateRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch courses and companies from Supabase
  useEffect(() => {
    fetchCoursesAndCompanies();
  }, []);

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

  const handleGenerate = () => {
    // Validate form
    if (!form.studentName.trim() || !form.courseName.trim() || !form.companyName.trim() ||
      !form.startDate || !form.endDate || !form.duration.trim()) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false);
      setShowCertificate(true);
    }, 1500);
  };

  const handleDownload = async () => {
    if (!certificateRef.current) return;

    try {
      // Import html2pdf dynamically
      const html2pdf = (await import('html2pdf.js')).default;

      const opt = {
        margin: 0, // Set margin to 0 to minimize blank space and prevent second page
        filename: `${form.studentName.replace(/\s+/g, '_')}_Certificate.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' } // A4 Landscape (11in x 8.5in)
      };

      // Use any type to avoid TypeScript issues with html2pdf
      await (html2pdf as any)().set(opt).from(certificateRef.current).save();

      toast({
        title: "Download Complete",
        description: "Certificate has been downloaded successfully.",
      });

      // Reset form after download
      setTimeout(() => {
        handleReset();
      }, 1000);
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download certificate. Please try again.",
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
      endDate: null,
      duration: ''
    });
    setShowCertificate(false);
  };

  const formatDateForCertificate = (date: Date) => {
    return format(date, 'MMMM dd, yyyy');
  };

  const generateCertificateId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `CERT-${timestamp}-${random}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {!showCertificate ? (
        <div className="grid gap-6">
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
              disabled={loadingOptions}
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
              disabled={loadingOptions}
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
              <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !form.startDate && "text-muted-foreground"
                    )}
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
              <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "justify-start text-left font-normal",
                      !form.endDate && "text-muted-foreground"
                    )}
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

          {/* Duration */}
          <div className="grid gap-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Duration *
            </Label>
            <Input
              id="duration"
              value={form.duration}
              onChange={(e) => setForm(prev => ({ ...prev, duration: e.target.value }))}
              placeholder="e.g., 3 months, 6 weeks"
              className="text-lg"
            />
          </div>

          {/* Generate Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="bg-primary hover:bg-primary/90"
            >
              {isGenerating ? "Generating..." : "Generate Certificate"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* START: Certificate Preview with Your Custom Canva Template */}
          <div
            ref={certificateRef}
            className="bg-white mx-auto relative" // 'relative' is crucial for absolute positioning of children
            style={{
              width: '11in', // Standard landscape A4 width
              height: '8.2in', // Adjusted back to 8.5in for standard A4 landscape
              // Set your Canva template image as the background
              backgroundImage: 'url("/certificates/template.png")', // <--- IMPORTANT: This path assumes file is in public/certificates/
              backgroundSize: 'cover', // Ensures the image covers the entire div
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              overflow: 'hidden', // Hide anything that goes outside the bounds
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)' // Optional: add a subtle shadow for preview
            }}
          >
            {/* Overlay dynamic text fields using absolute positioning */}
            {/* *** YOU MUST ADJUST 'top', 'left', 'width', 'fontSize', and 'color'
                  values very carefully based on where these elements appear on YOUR
                  specific Canva template image. This will require trial and error! *** */}

            {/* Student Name */}
            <div
              style={{
                position: 'absolute',
                top: '3.55in', // ADJUST THIS VALUE!
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '48px', // Adjust font size to fit your template's student name area
                fontWeight: 'bold',
                color: '#333', // Adjust text color to contrast with your template background
                textAlign: 'center',
                width: '8in', // Adjust width to prevent text from overflowing off the certificate
                fontFamily: 'Cinzel Decorative Custom', // Using the dynamically loaded font
                letterSpacing: '1px'
              }}
            >
              {form.studentName}
            </div>

            {/* Completion Text & Course/Company/Dates */}
            <div
              style={{
                position: 'absolute',
                top: '4.6in', // ADJUST THIS VALUE!
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '20px', // Adjust font size
                color: '#555', // Adjust text color
                textAlign: 'center',
                width: '9in', // Adjust width
                lineHeight: '1.4',
                fontFamily: 'Cinzel Decorative Custom' // Using the dynamically loaded font
              }}
            >
              <i>has successfully completed a{' '}
              <strong style={{ color: '#000000' }}>{form.courseName}</strong> program
              at <strong style={{ color: '#000000' }}>{form.companyName}</strong>,
              from <strong style={{ color: '#000000' }}>{form.startDate ? formatDateForCertificate(form.startDate) : ''}</strong> to{' '}
              <strong style={{ color: '#000000' }}>{form.endDate ? formatDateForCertificate(form.endDate) : ''}</strong>.
              Duration: <strong style={{ color: '#000000' }}>{form.duration}</strong>.</i>
            </div>

            {/* Issued Date (typically bottom right) */}
            <div
              style={{
                position: 'absolute',
                bottom: '0.55in', // ADJUST THIS VALUE!
                right: '1.65in', // ADJUST THIS VALUE!
                fontSize: '12px',
                color: '#666',
                textAlign: 'right',
                fontFamily: 'sans-serif' // Can change to Cinzel Decorative Custom if desired
              }}
            >
              Issued on {format(new Date(), 'MMMM dd, yyyy')}
            </div>

            {/* Certificate ID (typically bottom left) */}
            <div
              style={{
                position: 'absolute',
                bottom: '0.55in', // ADJUST THIS VALUE!
                left: '1.7in', // ADJUST THIS VALUE!
                fontSize: '12px',
                color: '#888',
                textAlign: 'left',
                fontFamily: 'monospace' // Can change to Cinzel Decorative Custom if desired
              }}
            >
              Certificate ID: {generateCertificateId()}
            </div>

            {/* Add more absolutely positioned divs for signatures, seals, or other text fields
                that are part of your dynamic data or static text overlays.
                You might even use <img> tags here for signature images if you have them. */}

          </div>
          {/* END: Certificate Preview with Your Custom Canva Template */}


          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <Button variant="outline" onClick={handleReset}>
              Generate New Certificate
            </Button>
            <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}