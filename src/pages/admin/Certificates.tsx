import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { Award, Download, Search, Filter, Users, Plus, Edit, Trash2, UserPlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AppConfig } from '@/config/app.config';

interface Student {
  id: string;
  name: string;
  phone: string;
  certificates: Certificate[];
  year?: number;
  branch?: string;
  collegeName?: string;
  certificateId?: string;
  eligible?: boolean;
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
  college_name?: string;
}

export default function AdminCertificates() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Course management
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [newCourseName, setNewCourseName] = useState('');
  
  // Student management
  const [showStudentDialog, setShowStudentDialog] = useState(false);
  const [newStudent, setNewStudent] = useState<NewStudent>({
    name: '',
    phone_number: '',
    year: undefined,
    branch: '',
    college_name: ''
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
          college_name: newStudent.college_name?.trim() || null,
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
        college_name: ''
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

  const fetchStudentsData = async () => {
    try {
      setLoading(true);
      const { data: studentsData, error } = await supabase
        .from('students')
        .select('student_id, name, phone_number, certificate_id, eligible, created_at, year, branch, college_name')
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
          collegeName: student.college_name || undefined,
          certificateId: student.certificate_id || undefined,
          eligible: student.eligible || false
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
            <h1 className="text-4xl font-bold text-primary">Certificate Management</h1>
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
                <Label htmlFor="studentCollege">College Name</Label>
                <Input
                  id="studentCollege"
                  placeholder="Enter college name"
                  value={newStudent.college_name}
                  onChange={(e) => setNewStudent({...newStudent, college_name: e.target.value})}
                />
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
                      college_name: ''
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
      </div>
    </Layout>
  );
}