'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CopyIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ToolsPage() {
  const { toast } = useToast();
  const [bookmarkletCode, setBookmarkletCode] = useState('');
  
  useEffect(() => {
    // Generate the bookmarklet code
    const code = `javascript:(function(){window.open('${window.location.origin}/comments/new?url='+encodeURIComponent(window.location.href),'_blank','width=800,height=700');})();`;
    setBookmarkletCode(code);
  }, []);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    toast({
      title: 'Copied!',
      description: 'Bookmarklet code copied to clipboard',
    });
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Tools</h1>
      
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Instagram Comment Tracker Bookmarklet</CardTitle>
          <CardDescription>
            Drag this button to your bookmarks bar to quickly capture Instagram comment URLs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg">
            <a 
              href={bookmarkletCode}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded"
              onClick={(e) => {
                e.preventDefault();
                alert('To install this bookmarklet:\n\n1. Copy the code below\n2. Create a new bookmark in your browser\n3. Paste the code as the URL');
              }}
            >
              📌 Track Instagram Comment
            </a>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Bookmarklet Code:</label>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <CopyIcon className="h-4 w-4 mr-2" />
                Copy Code
              </Button>
            </div>
            <Textarea 
              readOnly 
              value={bookmarkletCode} 
              className="font-mono text-sm h-24"
            />
          </div>
          
          <div className="pt-4 border-t">
            <h3 className="font-medium mb-2">How to use:</h3>
            <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-600">
              <li>Copy the code above</li>
              <li>In your browser, create a new bookmark</li>
              <li>Paste the code in the URL field</li>
              <li>Name it "Track Instagram Comment"</li>
              <li>Visit any Instagram post or comment</li>
              <li>Click the bookmark in your bookmarks bar</li>
              <li>The URL will be automatically filled in the tracker</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}