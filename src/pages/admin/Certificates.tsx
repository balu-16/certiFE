import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Award, Download, Search, Filter, Users, Plus, Edit, Trash2, UserPlus, ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AppConfig } from '@/config/app.config';
import { convertImageToPdf } from '@/utils/imageToPdfConverter';

interface Student {
  id: string;
  name: string;
  phone: string;
  certificates: Certificate[];
  year?: number;
  branch?: string;
  collegeName?: string;
  collegeId?: number;
  certificateId?: string;
  eligible?: boolean;
  downloadedCount?: number;
}

interface Certificate {
  id: string;
  name: string;
  course: string;
  issueDate: string;
  status: 'completed' | 'in-progress';
  downloadUrl?: string | Uint8Array | null;
}

interface Course {
  course_id: number;
  course_name: string;
}

interface Company {
  company_id: number;
  company_name: string;
}

interface NewStudent {
  name: string;
  phone_number: string;
  year?: number;
  branch?: string;
  college_id?: number;
}

export default function AdminCertificates() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [colleges, setColleges] = useState<{college_id: number; college_name: string}[]>([]);
  
  // Dialog states
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [showEditStudentDialog, setShowEditStudentDialog] = useState(false);
  
  // Course management
  const [newCourseName, setNewCourseName] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  // Student management
  const [newStudent, setNewStudent] = useState<NewStudent>({
    name: '',
    phone_number: '',
    year: undefined,
    branch: '',
    college_id: undefined
  });
  
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [editStudentData, setEditStudentData] = useState({
    name: '',
    phone: '',
    year: undefined as number | undefined,
    branch: '',
    collegeId: undefined as number | undefined,
    downloadedCount: 0
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEligibilityToggle = async (studentId: string, currentEligibility: boolean) => {
    try {
      console.log('=== ELIGIBILITY TOGGLE DEBUG ===');
      console.log('Student ID:', studentId, 'Type:', typeof studentId);
      console.log('Current eligibility:', currentEligibility, 'Type:', typeof currentEligibility);
      
      // Ensure studentId is a valid number
      const numericStudentId = parseInt(studentId);
      if (isNaN(numericStudentId)) {
        throw new Error(`Invalid student ID format: ${studentId}`);
      }

      const newEligibility = !currentEligibility;
      console.log('Numeric student ID:', numericStudentId);
      console.log('New eligibility value:', newEligibility);

      // Use the backend API endpoint instead of direct Supabase call
      const response = await fetch(`${AppConfig.api.baseUrl}/v1/students/${numericStudentId}/eligibility`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eligible: newEligibility
        })
      });

      console.log('Backend API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Backend API error:', errorData);
        
        // Handle specific database trigger error
        if (errorData.error && errorData.error.includes('Database trigger error')) {
          toast({
            title: "Database Configuration Issue",
            description: "Database trigger still references dropped columns. Go to Supabase Dashboard → Database → Triggers and remove triggers referencing dropped columns.",
            variant: "destructive"
          });
          return;
        }
        
        // Handle other errors
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update eligibility`);
      }

      const responseData = await response.json();
      console.log('Backend API response data:', responseData);

      toast({
        title: "Success",
        description: `Student eligibility ${newEligibility ? 'enabled' : 'disabled'} successfully.`,
      });

      // Refresh the data
      fetchStudentsData();
    } catch (error) {
      console.error('Error in handleEligibilityToggle:', error);
      
      // Provide more specific error messages
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        if (error.message.includes('has no field') || error.message.includes('Database trigger') || error.message.includes('column')) {
          errorMessage = "Database trigger issue: Please remove triggers referencing old columns in Supabase Dashboard → Database → Triggers.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: `Failed to update student eligibility: ${errorMessage}`,
        variant: "destructive"
      });
    }
  };

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('course_id, course_name')
        .order('course_name');

      if (error) {
        console.error('Error fetching courses:', error);
      } else {
        setCourses(data || []);
      }
    } catch (error) {
      console.error('Error in fetchCourses:', error);
    }
  };

  const fetchColleges = async () => {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('college_id, college_name')
        .order('college_name');

      if (error) {
        console.error('Error fetching colleges:', error);
      } else {
        setColleges(data || []);
      }
    } catch (error) {
      console.error('Error in fetchColleges:', error);
    }
  };

  const handleAddCourse = async () => {
    if (!newCourseName.trim()) {
      toast({
        title: "Error",
        description: "Course name is required.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .insert([{ course_name: newCourseName.trim() }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Course added successfully.",
      });

      setNewCourseName('');
      setShowCourseDialog(false);
      fetchCourses();
    } catch (error) {
      console.error('Error adding course:', error);
      toast({
        title: "Error",
        description: "Failed to add course. It may already exist.",
        variant: "destructive"
      });
    }
  };

  const handleEditCourse = async () => {
    if (!editingCourse || !newCourseName.trim()) {
      toast({
        title: "Error",
        description: "Course name is required.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .update({ course_name: newCourseName.trim() })
        .eq('course_id', editingCourse.course_id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Course updated successfully.",
      });

      setEditingCourse(null);
      setNewCourseName('');
      setShowCourseDialog(false);
      fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
      toast({
        title: "Error",
        description: "Failed to update course.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('course_id', courseId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Course deleted successfully.",
      });

      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: "Failed to delete course. It may be in use by students.",
        variant: "destructive"
      });
    }
  };

  const handleAddStudent = async () => {
    if (!newStudent.name.trim() || !newStudent.phone_number.trim()) {
      toast({
        title: "Error",
        description: "Name and phone number are required.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('students')
        .insert([{
          name: newStudent.name.trim(),
          phone_number: newStudent.phone_number.trim(),
          year: newStudent.year,
          branch: newStudent.branch?.trim() || null,
          college_id: newStudent.college_id || null,
          eligible: false
        }]);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Student added successfully.",
      });

      setNewStudent({
        name: '',
        phone_number: '',
        year: undefined,
        branch: '',
        college_id: undefined
      });
      setShowStudentDialog(false);
      fetchStudentsData();
    } catch (error) {
      console.error('Error adding student:', error);
      toast({
        title: "Error",
        description: "Failed to add student. Phone number may already exist.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('student_id', parseInt(studentId));

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Student deleted successfully.",
      });

      fetchStudentsData();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast({
        title: "Error",
        description: "Failed to delete student.",
        variant: "destructive"
      });
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setEditStudentData({
      name: student.name,
      phone: student.phone,
      year: student.year,
      branch: student.branch || '',
      collegeId: student.collegeId,
      downloadedCount: student.downloadedCount || 0
    });
    setShowEditStudentDialog(true);
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;

    try {
      const { error } = await supabase
        .from('students')
        .update({
          name: editStudentData.name,
          phone_number: editStudentData.phone,
          year: editStudentData.year,
          branch: editStudentData.branch,
          college_id: editStudentData.collegeId,
          downloaded_count: editStudentData.downloadedCount
        })
        .eq('student_id', parseInt(editingStudent.id));

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Student updated successfully.",
      });

      setShowEditStudentDialog(false);
      setEditingStudent(null);
      fetchStudentsData();
    } catch (error) {
      console.error('Error updating student:', error);
      toast({
        title: "Error",
        description: "Failed to update student.",
        variant: "destructive"
      });
    }
  };

  const previewCertificate = async (studentId: string, studentName: string) => {
    try {
      console.log('🔍 Starting certificate preview for student:', studentName);
      
      // Fetch student certificate data from database
      const { data: studentData, error } = await supabase
        .from('students')
        .select('certificate, certificate_approved, eligible')
        .eq('student_id', parseInt(studentId))
        .single();

      if (error) {
        throw new Error('Failed to fetch student certificate data');
      }

      if (!studentData) {
        throw new Error('Student not found');
      }

      // Check if student is eligible and has an approved certificate
      if (!studentData.eligible) {
        toast({
          title: "Not Eligible",
          description: "This student is not eligible for a certificate.",
          variant: "destructive"
        });
        return;
      }

      if (!studentData.certificate_approved) {
        toast({
          title: "Certificate Not Approved",
          description: "This student's certificate has not been approved yet.",
          variant: "destructive"
        });
        return;
      }

      if (!studentData.certificate || studentData.certificate.length === 0) {
        toast({
          title: "No Certificate",
          description: "No certificate data found for this student.",
          variant: "destructive"
        });
        return;
      }

      console.log('📊 Certificate data type:', typeof studentData.certificate);
      console.log('📏 Certificate data length:', studentData.certificate.length);
      
      console.log('🔄 Converting image to PDF for preview...');
      
      // Convert image data to PDF
      const result = await convertImageToPdf(studentData.certificate);
      
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
        link.download = `${studentName}_certificate_preview.pdf`;
        link.click();
        
        toast({
          title: "Preview Downloaded",
          description: "Pop-up was blocked. Certificate preview has been downloaded instead.",
        });
      } else {
        console.log('✅ Preview window opened successfully');
        toast({
          title: "Preview Opened",
          description: `Certificate preview for ${studentName} opened in new tab`,
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

  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`
          student_id, 
          name, 
          phone_number, 
          certificate_id, 
          eligible, 
          created_at, 
          year, 
          branch, 
          college_id,
          downloaded_count,
          colleges(college_name)
        `)
        .order('student_id', { ascending: true });

      if (error) {
        console.error('Error fetching students:', error);
        toast({
          title: "Error",
          description: "Failed to fetch students data.",
          variant: "destructive"
        });
        return;
      }

      const formattedStudents: Student[] = studentsData?.map(student => {
        const certificates: Certificate[] = [];
        
        // If student is eligible, add completed certificate
        if (student.eligible) {
          certificates.push({
            id: student.certificate_id || `CERT_${student.student_id}`,
            name: 'Internship Certificate',
            course: 'Internship Program',
            issueDate: new Date(student.created_at).toLocaleDateString(),
            status: 'completed' as const
          });
        }

        // Ensure student_id is properly formatted
        const studentId = student.student_id?.toString();
        console.log('Processing student:', student.name, 'ID:', studentId, 'Type:', typeof student.student_id);

        return {
          id: studentId || 'Unknown',
          name: student.name,
          phone: student.phone_number,
          certificates,
          year: student.year || undefined,
          branch: student.branch || undefined,
          collegeName: student.colleges?.college_name || undefined,
          collegeId: student.college_id || undefined,
          certificateId: student.certificate_id || undefined,
          eligible: student.eligible || false,
          downloadedCount: student.downloaded_count || 0
        };
      }) || [];

      setStudents(formattedStudents);
      setFilteredStudents(formattedStudents);
    } catch (error) {
      console.error('Error in fetchStudentsData:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsData();
    fetchCourses();
    fetchColleges();
  }, []);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm)
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const handleDownloadCertificate = (certificate: Certificate, studentName: string) => {
    toast({
      title: "Download Started",
      description: `Downloading ${certificate.name} for ${studentName}...`,
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
          <div className="text-xl text-muted-foreground">Loading certificates...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary">Student Management</h1>
            <p className="text-xl text-muted-foreground">
              View and manage all student certificates
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => {
                setEditingCourse(null);
                setNewCourseName('');
                setShowCourseDialog(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Manage Courses
            </Button>
            <Button
              onClick={() => setShowStudentDialog(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Student
            </Button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 border-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold text-primary">{students.length}</p>
                </div>
                <Users className="w-5 h-5 text-highlight" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Certificates</p>
                  <p className="text-2xl font-bold text-primary">
                    {students.reduce((total, student) => total + student.certificates.length, 0)}
                  </p>
                </div>
                <Award className="w-5 h-5 text-highlight" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-primary">
                    {students.reduce((total, student) => 
                      total + student.certificates.filter(cert => cert.status === 'completed').length, 0
                    )}
                  </p>
                </div>
                <Award className="w-5 h-5 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eligible Students</p>
                  <p className="text-2xl font-bold text-primary">
                    {students.filter(student => student.eligible).length}
                  </p>
                </div>
                <Users className="w-5 h-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl text-primary">All Students</CardTitle>
            <CardDescription>
              Click "Individual View" to see detailed certificate information for each student
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Certificate ID</TableHead>
                  <TableHead>Eligibility</TableHead>
                  <TableHead>Certificates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium text-primary">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.id}</TableCell>
                    <TableCell>{student.phone}</TableCell>
                    <TableCell>
                      <span className="text-sm font-mono text-muted-foreground">
                        {student.certificateId || 'Not assigned'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={student.eligible || false}
                          onCheckedChange={() => handleEligibilityToggle(student.id, student.eligible || false)}
                        />
                        <span className={`text-sm font-medium ${
                          student.eligible ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {student.eligible ? 'Eligible' : 'Not Eligible'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="bg-accent/10 text-accent-foreground">
                          {student.certificates.length} Completed
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {/* Edit Button */}
                        <Button
                          onClick={() => handleEditStudent(student)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        
                        {/* Preview Button - only show for eligible students with approved certificates */}
                        {student.eligible && (
                          <Button
                            onClick={() => previewCertificate(student.id, student.name)}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        
                        {/* Delete Button */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Student</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {student.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteStudent(student.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-primary mb-2">No Students Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search criteria.' : 'No students have been registered yet.'}
                </p>
               </div>
             )}
          </CardContent>
        </Card>

        {/* Course Management Dialog */}
        <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-primary">
                {editingCourse ? 'Edit Course' : 'Manage Courses'}
              </DialogTitle>
              <DialogDescription>
                {editingCourse ? 'Update course information' : 'Add new courses and manage existing ones'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Add/Edit Course Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    placeholder="Enter course name"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={editingCourse ? handleEditCourse : handleAddCourse}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    {editingCourse ? 'Update Course' : 'Add Course'}
                  </Button>
                  {editingCourse && (
                    <Button
                      onClick={() => {
                        setEditingCourse(null);
                        setNewCourseName('');
                      }}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              {/* Existing Courses */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Existing Courses</h3>
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Name</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {courses.map((course) => (
                        <TableRow key={course.course_id}>
                          <TableCell className="font-medium">
                            {course.course_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  setEditingCourse(course);
                                  setNewCourseName(course.course_name);
                                }}
                                variant="outline"
                                size="sm"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{course.course_name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteCourse(course.course_id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Student Dialog */}
        <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl text-primary">Add New Student</DialogTitle>
              <DialogDescription>
                Enter student information to add them to the system
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="studentName">Name *</Label>
                <Input
                  id="studentName"
                  placeholder="Enter student name"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentPhone">Phone Number *</Label>
                <Input
                  id="studentPhone"
                  placeholder="Enter phone number"
                  value={newStudent.phone_number}
                  onChange={(e) => setNewStudent({...newStudent, phone_number: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentYear">Year</Label>
                <Input
                  id="studentYear"
                  type="number"
                  placeholder="Enter year (e.g., 2024)"
                  value={newStudent.year || ''}
                  onChange={(e) => setNewStudent({...newStudent, year: e.target.value ? parseInt(e.target.value) : undefined})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentBranch">Branch</Label>
                <Input
                  id="studentBranch"
                  placeholder="Enter branch (e.g., Computer Science)"
                  value={newStudent.branch}
                  onChange={(e) => setNewStudent({...newStudent, branch: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="studentCollege">College</Label>
                <Select
                  value={newStudent.college_id?.toString() || ''}
                  onValueChange={(value) => setNewStudent({...newStudent, college_id: value ? parseInt(value) : undefined})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.college_id} value={college.college_id.toString()}>
                        {college.college_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAddStudent}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Add Student
                </Button>
                <Button
                  onClick={() => {
                    setNewStudent({
                      name: '',
                      phone_number: '',
                      year: undefined,
                      branch: '',
                      college_id: undefined
                    });
                    setShowStudentDialog(false);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Student Dialog */}
        <Dialog open={showEditStudentDialog} onOpenChange={setShowEditStudentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl text-primary">Edit Student</DialogTitle>
              <DialogDescription>
                Update student information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editStudentName">Name *</Label>
                <Input
                  id="editStudentName"
                  placeholder="Enter student name"
                  value={editStudentData.name}
                  onChange={(e) => setEditStudentData({...editStudentData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editStudentPhone">Phone Number *</Label>
                <Input
                  id="editStudentPhone"
                  placeholder="Enter phone number"
                  value={editStudentData.phone}
                  onChange={(e) => setEditStudentData({...editStudentData, phone: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editStudentYear">Year</Label>
                <Input
                  id="editStudentYear"
                  type="number"
                  placeholder="Enter year (e.g., 2024)"
                  value={editStudentData.year || ''}
                  onChange={(e) => setEditStudentData({...editStudentData, year: e.target.value ? parseInt(e.target.value) : undefined})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editStudentBranch">Branch</Label>
                <Input
                  id="editStudentBranch"
                  placeholder="Enter branch (e.g., Computer Science)"
                  value={editStudentData.branch}
                  onChange={(e) => setEditStudentData({...editStudentData, branch: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editStudentCollege">College</Label>
                <Select
                  value={editStudentData.collegeId?.toString() || ''}
                  onValueChange={(value) => setEditStudentData({...editStudentData, collegeId: value ? parseInt(value) : undefined})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map((college) => (
                      <SelectItem key={college.college_id} value={college.college_id.toString()}>
                        {college.college_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="editStudentDownloadCount">Download Count</Label>
                <Input
                  id="editStudentDownloadCount"
                  type="number"
                  placeholder="Enter download count"
                  value={editStudentData.downloadedCount}
                  onChange={(e) => setEditStudentData({...editStudentData, downloadedCount: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpdateStudent}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Update Student
                </Button>
                <Button
                  onClick={() => {
                    setShowEditStudentDialog(false);
                    setEditingStudent(null);
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}