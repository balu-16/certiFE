import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Phone, Mail, Calendar, MapPin, Edit3, Save, X, Building2, BookOpen, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { fetchCourses, fetchCompanies } from '@/integrations/supabase/database';
import type { Course, Company } from '@/integrations/supabase/types';

interface StudentProfile {
  name: string;
  id: string;
  phone: string;
  email: string;
  enrollmentDate: string;
  address: string;
  course: string;
  year: number;
  branch: string;
  collegeName: string;
  certificateId: string;
  eligible: string;
  internshipStartDate: string;
  internshipEndDate: string;
  companyId: number | null;
  courseId: number | null;
  preferredName: string;
}

export default function StudentInfo() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<StudentProfile | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch student profile data from database
    const fetchStudentProfile = async () => {
      try {
        setLoading(true);
        const userPhone = localStorage.getItem('userPhone');
        if (!userPhone) {
          console.error('No user phone found in localStorage');
          return;
        }

        // Fetch courses and companies
        const [coursesData, companiesData] = await Promise.all([
          fetchCourses(),
          fetchCompanies()
        ]);
        setCourses(coursesData);
        setCompanies(companiesData);

        const { data: student, error } = await supabase
           .from('students')
           .select(`
             student_id, name, phone_number, email, created_at, year, branch, 
             college_name, certificate_id, eligible, internship_start_date, 
             internship_end_date, company_id, course_id, preferred_name
           `)
           .eq('phone_number', userPhone)
           .single();

        if (error) {
          console.error('Error fetching student data:', error);
          return;
        }

        if (student) {
          const profileData = {
             name: student.name || 'Student',
             id: student.student_id?.toString() || 'N/A',
             phone: student.phone_number || '',
             email: student.email || '',
             enrollmentDate: student.created_at ? new Date(student.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
             address: 'Not provided',
             course: 'Not assigned',
             year: student.year || 1,
             branch: student.branch || 'Not specified',
             collegeName: student.college_name || 'NIGHA TECH',
             certificateId: student.certificate_id || 'Not assigned',
             eligible: student.eligible ? 'Yes' : 'No',
             internshipStartDate: student.internship_start_date || '',
             internshipEndDate: student.internship_end_date || '',
             companyId: student.company_id,
             courseId: student.course_id,
             preferredName: student.preferred_name || student.name || ''
           };
          setProfile(profileData);
          setEditedProfile(profileData);
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [navigate, toast]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!editedProfile) return;

    try {
      const userPhone = localStorage.getItem('userPhone');
      if (!userPhone) {
        toast({
          title: "Error",
          description: "User phone number not found. Please log in again.",
          variant: "destructive"
        });
        return;
      }

      // Update student data in Supabase
      const { error } = await supabase
        .from('students')
        .update({
          name: editedProfile.name,
          email: editedProfile.email,
          year: editedProfile.year,
          branch: editedProfile.branch,
          college_name: editedProfile.collegeName,
          internship_start_date: editedProfile.internshipStartDate || null,
          internship_end_date: editedProfile.internshipEndDate || null,
          company_id: editedProfile.companyId,
          course_id: editedProfile.courseId,
          preferred_name: editedProfile.preferredName
        })
        .eq('phone_number', userPhone);

      if (error) {
        console.error('Error updating student data:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update your information. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setProfile(editedProfile);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your information has been updated successfully.",
      });
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof StudentProfile, value: string | number) => {
    if (!editedProfile) return;
    setEditedProfile({
      ...editedProfile,
      [field]: value
    });
  };

  if (loading || !profile || !editedProfile) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-xl text-muted-foreground">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">Student Information</h1>
          <p className="text-xl text-muted-foreground">
            View and update your personal information
          </p>
        </div>

        {/* Profile Card */}
        <Card className="border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-2xl text-primary">Personal Details</CardTitle>
              <CardDescription>
                Manage your profile information and contact details
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline">
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button onClick={handleSave} variant="golden" size="sm">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-highlight" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={editedProfile.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              {/* Student ID */}
              <div className="space-y-2">
                <Label htmlFor="id" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-highlight" />
                  Student ID
                </Label>
                <Input
                  id="id"
                  value={editedProfile.id}
                  disabled
                  className="border-primary/20 bg-muted"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-highlight" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={editedProfile.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  disabled={!isEditing}
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-highlight" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editedProfile.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              {/* Year */}
              <div className="space-y-2">
                <Label htmlFor="year" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-highlight" />
                  Academic Year
                </Label>
                <Input
                  id="year"
                  type="number"
                  min="1"
                  max="4"
                  value={editedProfile.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value) || 1)}
                  disabled={!isEditing}
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              {/* Branch */}
              <div className="space-y-2">
                <Label htmlFor="branch" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-highlight" />
                  Branch/Department
                </Label>
                <Input
                  id="branch"
                  value={editedProfile.branch}
                  onChange={(e) => handleInputChange('branch', e.target.value)}
                  disabled={!isEditing}
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              {/* College Name */}
              <div className="space-y-2">
                <Label htmlFor="collegeName" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-highlight" />
                  College Name
                </Label>
                <Input
                  id="collegeName"
                  value={editedProfile.collegeName}
                  onChange={(e) => handleInputChange('collegeName', e.target.value)}
                  disabled={!isEditing}
                  className="border-primary/20 focus:border-primary"
                />
              </div>

              {/* Preferred Name */}
              <div className="space-y-2">
                <Label htmlFor="preferredName" className="flex items-center gap-2">
                  <User className="w-4 h-4 text-highlight" />
                  Preferred Name (for certificates)
                </Label>
                <Input
                  id="preferredName"
                  value={editedProfile.preferredName}
                  onChange={(e) => handleInputChange('preferredName', e.target.value)}
                  disabled={!isEditing}
                  className="border-primary/20 focus:border-primary"
                  placeholder="Name to appear on certificates"
                />
              </div>
            </div>

            {/* Internship Information Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-primary mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Internship Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Course */}
                <div className="space-y-2">
                  <Label htmlFor="courseId" className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-highlight" />
                    Course
                  </Label>
                  {isEditing ? (
                    <Select
                      value={editedProfile.courseId?.toString() || ''}
                      onValueChange={(value) => handleInputChange('courseId', value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="border-primary/20 focus:border-primary">
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No course selected</SelectItem>
                        {courses.map((course) => (
                          <SelectItem key={course.course_id} value={course.course_id.toString()}>
                            {course.course_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={courses.find(c => c.course_id === editedProfile.courseId)?.course_name || 'Not assigned'}
                      disabled
                      className="border-primary/20 bg-muted"
                    />
                  )}
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="companyId" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-highlight" />
                    Company
                  </Label>
                  {isEditing ? (
                    <Select
                      value={editedProfile.companyId?.toString() || ''}
                      onValueChange={(value) => handleInputChange('companyId', value ? parseInt(value) : null)}
                    >
                      <SelectTrigger className="border-primary/20 focus:border-primary">
                        <SelectValue placeholder="Select a company" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No company selected</SelectItem>
                        {companies.map((company) => (
                          <SelectItem key={company.company_id} value={company.company_id.toString()}>
                            {company.company_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={companies.find(c => c.company_id === editedProfile.companyId)?.company_name || 'Not assigned'}
                      disabled
                      className="border-primary/20 bg-muted"
                    />
                  )}
                </div>

                {/* Internship Start Date */}
                <div className="space-y-2">
                  <Label htmlFor="internshipStartDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-highlight" />
                    Internship Start Date
                  </Label>
                  <Input
                    id="internshipStartDate"
                    type="date"
                    value={editedProfile.internshipStartDate}
                    onChange={(e) => handleInputChange('internshipStartDate', e.target.value)}
                    disabled={!isEditing}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>

                {/* Internship End Date */}
                <div className="space-y-2">
                  <Label htmlFor="internshipEndDate" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-highlight" />
                    Internship End Date
                  </Label>
                  <Input
                    id="internshipEndDate"
                    type="date"
                    value={editedProfile.internshipEndDate}
                    onChange={(e) => handleInputChange('internshipEndDate', e.target.value)}
                    disabled={!isEditing}
                    className="border-primary/20 focus:border-primary"
                  />
                </div>
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-4 border border-primary/10 rounded-lg">
                <span className="text-muted-foreground">Account Status</span>
                <span className="font-medium text-accent">Active</span>
              </div>
              <div className="flex justify-between items-center p-4 border border-primary/10 rounded-lg">
                <span className="text-muted-foreground">Certificate ID</span>
                <span className="font-medium text-primary">{profile.certificateId}</span>
              </div>
              <div className="flex justify-between items-center p-4 border border-primary/10 rounded-lg">
                <span className="text-muted-foreground">Certificate Eligible</span>
                <span className={`font-medium ${profile.eligible === 'Yes' ? 'text-green-600' : 'text-orange-600'}`}>{profile.eligible}</span>
              </div>
              <div className="flex justify-between items-center p-4 border border-primary/10 rounded-lg">
                <span className="text-muted-foreground">Certificates Earned</span>
                <span className="font-medium text-primary">1</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}