import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, GraduationCap, Search } from 'lucide-react';
import type { College, CollegeInsert, CollegeUpdate } from '@/integrations/supabase/types';

export default function AdminColleges() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [newCollegeName, setNewCollegeName] = useState('');
  const [editCollegeName, setEditCollegeName] = useState('');
  const { toast } = useToast();

  // Fetch colleges from database
  const fetchColleges = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .order('college_id', { ascending: true });

      if (error) {
        console.error('Error fetching colleges:', error);
        toast({
          title: "Error",
          description: "Failed to fetch colleges data.",
          variant: "destructive"
        });
        return;
      }

      setColleges(data || []);
      setFilteredColleges(data || []);
    } catch (error) {
      console.error('Error in fetchColleges:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter colleges based on search term
  useEffect(() => {
    const filtered = colleges.filter(college =>
      college.college_name.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => a.college_id - b.college_id);
    setFilteredColleges(filtered);
  }, [searchTerm, colleges]);

  // Add new college
  const handleAddCollege = async () => {
    if (!newCollegeName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a college name.",
        variant: "destructive"
      });
      return;
    }

    try {
      const collegeData: CollegeInsert = {
        college_name: newCollegeName.trim()
      };

      const { error } = await supabase
        .from('colleges')
        .insert([collegeData]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Error",
            description: "A college with this name already exists.",
            variant: "destructive"
          });
        } else {
          console.error('Error adding college:', error);
          toast({
            title: "Error",
            description: "Failed to add college.",
            variant: "destructive"
          });
        }
        return;
      }

      toast({
        title: "Success",
        description: "College added successfully.",
      });

      setNewCollegeName('');
      setShowAddDialog(false);
      fetchColleges();
    } catch (error) {
      console.error('Error in handleAddCollege:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  // Edit college
  const handleEditCollege = (college: College) => {
    setEditingCollege(college);
    setEditCollegeName(college.college_name);
    setShowEditDialog(true);
  };

  // Update college
  const handleUpdateCollege = async () => {
    if (!editCollegeName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a college name.",
        variant: "destructive"
      });
      return;
    }

    if (!editingCollege) return;

    try {
      const updateData: CollegeUpdate = {
        college_name: editCollegeName.trim()
      };

      const { error } = await supabase
        .from('colleges')
        .update(updateData)
        .eq('college_id', editingCollege.college_id);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Error",
            description: "A college with this name already exists.",
            variant: "destructive"
          });
        } else {
          console.error('Error updating college:', error);
          toast({
            title: "Error",
            description: "Failed to update college.",
            variant: "destructive"
          });
        }
        return;
      }

      toast({
        title: "Success",
        description: "College updated successfully.",
      });

      setEditCollegeName('');
      setEditingCollege(null);
      setShowEditDialog(false);
      fetchColleges();
    } catch (error) {
      console.error('Error in handleUpdateCollege:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  // Delete college
  const handleDeleteCollege = async (college: College) => {
    if (!confirm(`Are you sure you want to delete "${college.college_name}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('colleges')
        .delete()
        .eq('college_id', college.college_id);

      if (error) {
        console.error('Error deleting college:', error);
        toast({
          title: "Error",
          description: "Failed to delete college.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "College deleted successfully.",
      });

      fetchColleges();
    } catch (error) {
      console.error('Error in handleDeleteCollege:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-xl text-muted-foreground">Loading colleges...</div>
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
            <h1 className="text-4xl font-bold text-primary">College Management</h1>
            <p className="text-xl text-muted-foreground">
              Manage college information and settings
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add College
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New College</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">College Name</label>
                    <Input
                      value={newCollegeName}
                      onChange={(e) => setNewCollegeName(e.target.value)}
                      placeholder="Enter college name"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddDialog(false);
                        setNewCollegeName('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddCollege}>
                      Add College
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search colleges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 border-primary/20 focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Colleges</p>
                  <p className="text-2xl font-bold text-primary">{colleges.length}</p>
                </div>
                <GraduationCap className="w-5 h-5 text-highlight" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colleges Table */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-primary">All Colleges</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredColleges.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No colleges found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new college.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>College ID</TableHead>
                    <TableHead>College Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredColleges.map((college) => (
                    <TableRow key={college.college_id}>
                      <TableCell className="font-medium">{college.college_id}</TableCell>
                      <TableCell>{college.college_name}</TableCell>
                      <TableCell>{new Date(college.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCollege(college)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteCollege(college)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
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

        {/* Edit College Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit College</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">College Name</label>
                <Input
                  value={editCollegeName}
                  onChange={(e) => setEditCollegeName(e.target.value)}
                  placeholder="Enter college name"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditCollegeName('');
                    setEditingCollege(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateCollege}>
                  Update College
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}