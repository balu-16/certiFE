import React, { useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, MapPin, Globe, Mail, Phone, Award, Users, Target, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminCompanyInfo() {
  const navigate = useNavigate();

  const fetchCompanies = async () => {
    // This function can be implemented to fetch company data from Supabase
    // For now, it's a placeholder to resolve the TypeScript error
    console.log('Fetching companies...');
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  return (
    <Layout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-accent rounded-2xl flex items-center justify-center shadow-golden">
            <span className="text-4xl font-bold text-accent-foreground">N</span>
          </div>
          <h1 className="text-4xl font-bold text-primary">NIGHA TECH</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Administrative Company Information Portal
          </p>
        </div>

        {/* Admin Quick Actions */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <Settings className="w-6 h-6 text-highlight" />
              Admin Actions
            </CardTitle>
            <CardDescription>
              Company management and administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                onClick={() => navigate('/admin/dashboard')}
                variant="outline"
                size="lg"
                className="h-16 flex-col gap-2"
              >
                <Users className="w-6 h-6" />
                View Dashboard
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-16 flex-col gap-2"
                onClick={() => window.open('https://nighatech.com/admin', '_blank')}
              >
                <Globe className="w-6 h-6" />
                Admin Portal
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Company Overview */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <Building2 className="w-6 h-6 text-highlight" />
              About NIGHA TECH
            </CardTitle>
            <CardDescription className="text-base">
              Leading technology education and professional development company
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">
              NIGHA TECH is a premier technology education company dedicated to providing 
              comprehensive internship programs and professional certification courses. 
              We specialize in cutting-edge technologies including web development, 
              mobile app development, artificial intelligence, and data science.
            </p>
            <p className="text-foreground leading-relaxed">
              Our mission is to bridge the gap between academic learning and industry 
              requirements by providing hands-on experience and practical knowledge 
              that prepares students for successful careers in technology.
            </p>
          </CardContent>
        </Card>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center gap-3">
                <Target className="w-5 h-5 text-highlight" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                To provide world-class technology education and internship programs 
                that equip students with the skills, knowledge, and confidence needed 
                to excel in the rapidly evolving tech industry.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl text-primary flex items-center gap-3">
                <Award className="w-5 h-5 text-highlight" />
                Our Vision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground leading-relaxed">
                To be the leading technology education platform that transforms 
                aspiring professionals into industry-ready experts, fostering 
                innovation and excellence in the global tech ecosystem.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-primary flex items-center gap-3">
              <Mail className="w-6 h-6 text-highlight" />
              Contact Information
            </CardTitle>
            <CardDescription>
              Official company contact details and administrative information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex items-center gap-3 p-4 border border-primary/10 rounded-lg">
                <MapPin className="w-5 h-5 text-highlight" />
                <div>
                  <div className="font-medium text-primary">Headquarters</div>
                  <div className="text-sm text-muted-foreground">
                    Mumbai, Maharashtra<br />
                    India - 400001
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-primary/10 rounded-lg">
                <Phone className="w-5 h-5 text-highlight" />
                <div>
                  <div className="font-medium text-primary">Admin Phone</div>
                  <div className="text-sm text-muted-foreground">
                    +91 98765 43210
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-primary/10 rounded-lg">
                <Mail className="w-5 h-5 text-highlight" />
                <div>
                  <div className="font-medium text-primary">Admin Email</div>
                  <div className="text-sm text-muted-foreground">
                    admin@nighatech.com
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-primary/10 rounded-lg">
                <Globe className="w-5 h-5 text-highlight" />
                <div>
                  <div className="font-medium text-primary">Website</div>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm text-accent hover:text-highlight"
                    onClick={() => window.open('https://nighatech.com', '_blank')}
                  >
                    www.nighatech.com
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-highlight" />
                <div>
                  <div className="font-medium text-primary">Total Students</div>
                  <div className="text-sm text-muted-foreground">
                    5000+ Active Learners
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 border border-primary/10 rounded-lg">
                <Award className="w-5 h-5 text-highlight" />
                <div>
                  <div className="font-medium text-primary">Certificates Issued</div>
                  <div className="text-sm text-muted-foreground">
                    8000+ Verified Certificates
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Programs and Services */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Internship Programs</CardTitle>
            <CardDescription>
              Professional development programs offered by NIGHA TECH
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-primary/10 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Frontend Development</h3>
                <p className="text-sm text-muted-foreground">
                  React.js, Vue.js, Angular, HTML5, CSS3, JavaScript
                </p>
                <div className="mt-2 text-xs text-highlight">Duration: 3-6 months</div>
              </div>
              <div className="p-4 border border-primary/10 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Backend Development</h3>
                <p className="text-sm text-muted-foreground">
                  Node.js, Python, Java, PHP, Database Management
                </p>
                <div className="mt-2 text-xs text-highlight">Duration: 3-6 months</div>
              </div>
              <div className="p-4 border border-primary/10 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Full Stack Development</h3>
                <p className="text-sm text-muted-foreground">
                  Complete web development with modern frameworks
                </p>
                <div className="mt-2 text-xs text-highlight">Duration: 6-12 months</div>
              </div>
              <div className="p-4 border border-primary/10 rounded-lg">
                <h3 className="font-semibold text-primary mb-2">Mobile App Development</h3>
                <p className="text-sm text-muted-foreground">
                  React Native, Flutter, iOS, Android development
                </p>
                <div className="mt-2 text-xs text-highlight">Duration: 4-8 months</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Administrative Notes
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl text-primary">Administrative Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-4 border border-primary/10 rounded-lg">
                <span className="text-muted-foreground">Registration Status</span>
                <span className="font-medium text-accent">Active & Verified</span>
              </div>
              <div className="flex justify-between items-center p-4 border border-primary/10 rounded-lg">
                <span className="text-muted-foreground">Accreditation</span>
                <span className="font-medium text-primary">ISO 9001:2015</span>
              </div>
              <div className="flex justify-between items-center p-4 border border-primary/10 rounded-lg">
                <span className="text-muted-foreground">Established</span>
                <span className="font-medium text-primary">2020</span>
              </div>
              <div className="flex justify-between items-center p-4 border border-primary/10 rounded-lg">
                <span className="text-muted-foreground">Legal Entity</span>
                <span className="font-medium text-primary">Private Limited Company</span>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </Layout>
  );
}