'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { getTrackedComments, refreshSelectedComments } from '@/lib/db/comments';
import { Comment } from '@/types';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const data = await getTrackedComments();
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch comments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedComments.length === comments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(comments.map(c => c.id));
    }
  };

  const handleRefreshSelected = async () => {
    if (selectedComments.length === 0) return;
    
    try {
      await refreshSelectedComments(selectedComments);
      toast({
        title: 'Success',
        description: `${selectedComments.length} comments refreshed`,
      });
      fetchComments(); // Refresh the list
    } catch (error) {
      console.error('Error refreshing comments:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh comments',
        variant: 'destructive',
      });
    }
  };

  const filteredComments = comments.filter(comment =>
    comment.comment_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.comment_author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.target_account?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    comment.campaign_tag?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tracked Comments</h1>
        <Button asChild>
          <Link href="/comments/new">Add New Comment</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comments Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <Input
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <div className="flex gap-2 ml-auto">
              <Button
                onClick={handleRefreshSelected}
                disabled={selectedComments.length === 0}
              >
                Refresh Selected ({selectedComments.length})
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading comments...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 px-4 text-left w-12">
                      <Checkbox
                        checked={selectedComments.length === comments.length && comments.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="py-2 px-4 text-left">Platform</th>
                    <th className="py-2 px-4 text-left">Comment Text</th>
                    <th className="py-2 px-4 text-left">Author</th>
                    <th className="py-2 px-4 text-left">Target Account</th>
                    <th className="py-2 px-4 text-left">Published</th>
                    <th className="py-2 px-4 text-left">Likes</th>
                    <th className="py-2 px-4 text-left">Replies</th>
                    <th className="py-2 px-4 text-left">Engagement</th>
                    <th className="py-2 px-4 text-left">Status</th>
                    <th className="py-2 px-4 text-left">Campaign</th>
                    <th className="py-2 px-4 text-left">CM</th>
                    <th className="py-2 px-4 text-left">Last Checked</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComments.map((comment) => (
                    <tr key={comment.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">
                        <Checkbox
                          checked={selectedComments.includes(comment.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedComments([...selectedComments, comment.id]);
                            } else {
                              setSelectedComments(
                                selectedComments.filter(id => id !== comment.id)
                              );
                            }
                          }}
                        />
                      </td>
                      <td className="py-2 px-4">{comment.platform}</td>
                      <td className="py-2 px-4 max-w-xs truncate">
                        <Link 
                          href={`/comments/${comment.id}`} 
                          className="text-blue-600 hover:underline"
                        >
                          {comment.comment_text}
                        </Link>
                      </td>
                      <td className="py-2 px-4">{comment.comment_author}</td>
                      <td className="py-2 px-4">{comment.target_account}</td>
                      <td className="py-2 px-4">
                        {comment.published_at ? new Date(comment.published_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-2 px-4">{comment.current_likes}</td>
                      <td className="py-2 px-4">{comment.current_replies}</td>
                      <td className="py-2 px-4 font-medium">
                        {comment.current_likes + comment.current_replies}
                      </td>
                      <td className="py-2 px-4">
                        <Badge 
                          variant={
                            comment.current_status === 'active' ? 'default' :
                            comment.current_status === 'deleted' ? 'destructive' :
                            comment.current_status === 'not_found' ? 'outline' :
                            'secondary'
                          }
                        >
                          {comment.current_status}
                        </Badge>
                      </td>
                      <td className="py-2 px-4">{comment.campaign_tag}</td>
                      <td className="py-2 px-4">{comment.cm_name}</td>
                      <td className="py-2 px-4">
                        {comment.last_checked_at ? new Date(comment.last_checked_at).toLocaleDateString() : 'Never'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredComments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm ? 'No comments match your search' : 'No comments found'}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}