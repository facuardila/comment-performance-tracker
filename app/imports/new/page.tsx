"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (selectedFile.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          selectedFile.name.split('.').pop()?.toLowerCase() !== 'xlsx') {
        toast.error('Please select a valid .xlsx file');
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!file) {
      toast.error('Please select a file to upload');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create form data to send the file
      const formData = new FormData();
      formData.append('file', file);

      // In a real implementation, we would send this to an API endpoint
      // For now, we'll simulate the import process
      await new Promise(resolve => setTimeout(resolve, 1500));

      toast.success(`${file.name} imported successfully!`);
      router.push('/comments'); // Redirect to comments page after import
    } catch (error) {
      console.error('Error importing file:', error);
      toast.error('Failed to import file');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Import Historical Data</CardTitle>
            <CardDescription>Upload an Excel (.xlsx) file to import historical comment data</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Excel File
                  </label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".xlsx"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    {file && (
                      <span className="text-sm text-gray-500 truncate max-w-xs">
                        {file.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Supported format: .xlsx (Excel files)
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Expected Columns:</h4>
                  <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
                    <li><code>url</code> - The Instagram comment or post URL</li>
                    <li><code>cm_name</code> - Community manager name (optional)</li>
                    <li><code>campaign_tag</code> - Campaign identifier (optional)</li>
                    <li><code>target_account</code> - Target account name (optional)</li>
                    <li><code>notes</code> - Additional notes (optional)</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || !file}
                >
                  {isSubmitting ? 'Importing...' : 'Import File'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>About Importing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              This import tool is designed to seed your database with historical comment data. 
              The imported data will be processed and added to your tracked comments. 
              Only .xlsx files are supported. Other formats like .xls or .csv are not currently supported.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}