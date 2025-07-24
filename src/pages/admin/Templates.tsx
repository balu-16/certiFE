import React, { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Image, Plus, Trash2, Upload, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Template, Company } from '@/integrations/supabase/types';

interface TemplateWithCompany extends Template {
  company_name?: string;
}

export default function AdminTemplates() {
  const [templates, setTemplates] = useState<TemplateWithCompany[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
    fetchCompanies();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          companies:company_id(company_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching templates:', error);
        toast({
          title: "Error",
          description: "Failed to fetch templates",
          variant: "destructive"
        });
      } else {
        const templatesWithCompany = data?.map(template => ({
          ...template,
          company_name: (template.companies as any)?.company_name
        })) || [];
        setTemplates(templatesWithCompany);
      }
    } catch (error) {
      console.error('Error in fetchTemplates:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('company_name');

      if (error) {
        console.error('Error fetching companies:', error);
      } else {
        setCompanies(data || []);
      }
    } catch (error) {
      console.error('Error in fetchCompanies:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive"
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleAddTemplate = async () => {
    if (!selectedCompanyId || !selectedFile) {
      toast({
        title: "Error",
        description: "Please select both a company and an image file",
        variant: "destructive"
      });
      return;
    }

    try {
      setUploading(true);
      
      // Check if template already exists for this company
      const existingTemplate = templates.find(t => t.company_id === parseInt(selectedCompanyId));
      if (existingTemplate) {
        toast({
          title: "Error",
          description: "A template already exists for this company. Please delete the existing one first.",
          variant: "destructive"
        });
        return;
      }

      // Convert file to base64
      const base64String = await convertFileToBase64(selectedFile);

      const { error } = await supabase
        .from('templates')
        .insert({
          template: base64String,
          company_id: parseInt(selectedCompanyId)
        });

      if (error) {
        console.error('Error adding template:', error);
        toast({
          title: "Error",
          description: "Failed to add template",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Template uploaded successfully",
        });
        setShowAddDialog(false);
        setSelectedCompanyId('');
        setSelectedFile(null);
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error in handleAddTemplate:', error);
      toast({
        title: "Error",
        description: "Failed to upload template",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', templateId);

      if (error) {
        console.error('Error deleting template:', error);
        toast({
          title: "Error",
          description: "Failed to delete template",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Template deleted successfully",
        });
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error in handleDeleteTemplate:', error);
    }
  };

  const handleToggleSelected = async (templateId: number, currentSelected: boolean) => {
    try {
      const { error } = await supabase
        .from('templates')
        .update({ is_selected: !currentSelected })
        .eq('id', templateId);

      if (error) {
        console.error('Error updating template selection:', error);
        toast({
          title: "Error",
          description: "Failed to update template selection",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: `Template ${!currentSelected ? 'selected' : 'deselected'} successfully`,
        });
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error in handleToggleSelected:', error);
    }
  };

  const previewTemplate = (templateData: string) => {
    // Create a new window to display the image
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Template Preview</title>
            <style>
              body { margin: 0; padding: 20px; background: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
              img { max-width: 100%; max-height: 100%; object-fit: contain; border: 1px solid #ddd; background: white; }
            </style>
          </head>
          <body>
            <img src="${templateData}" alt="Template Preview" />
          </body>
        </html>
      `);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading templates...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
            <p className="text-muted-foreground">
              Manage certificate templates for different companies
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Template</DialogTitle>
                <DialogDescription>
                  Select a company and upload an image template.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.company_id} value={company.company_id.toString()}>
                          {company.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="template-file">Template Image</Label>
                  <Input
                    id="template-file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
                <Button 
                  onClick={handleAddTemplate} 
                  className="w-full" 
                  disabled={uploading || !selectedCompanyId || !selectedFile}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Template
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
              <p className="text-xs text-muted-foreground">
                Active certificate templates
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies with Templates</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Set(templates.map(t => t.company_id)).size}
              </div>
              <p className="text-xs text-muted-foreground">
                Out of {companies.length} total companies
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Template Management</CardTitle>
            <CardDescription>
              View and manage all certificate templates in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <Image className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No templates found</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by uploading your first template
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Template
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Template Preview</TableHead>
                    <TableHead>Selected</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="font-medium">{template.company_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <img 
                            src={template.template} 
                            alt="Template preview" 
                            className="w-16 h-12 object-cover rounded border"
                          />
                          <Badge variant="secondary">Custom Image</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={template.is_selected || false}
                          onCheckedChange={() => handleToggleSelected(template.id, template.is_selected || false)}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(template.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => previewTemplate(template.template)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}