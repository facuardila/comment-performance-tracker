'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTrackedCommentById, getCommentSnapshots } from '@/lib/db/comments';
import { Comment, CommentSnapshot } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface CommentDetailPageProps {
  params: {
    id: string;
  };
}

export default function CommentDetailPage({ params }: CommentDetailPageProps) {
  const { id } = params;
  const [comment, setComment] = useState<Comment | null>(null);
  const [snapshots, setSnapshots] = useState<CommentSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchCommentDetail();
  }, [id]);

  const fetchCommentDetail = async () => {
    try {
      setLoading(true);
      const commentData = await getTrackedCommentById(id);
      const snapshotsData = await getCommentSnapshots(id);
      
      if (commentData) {
        setComment(commentData);
      }
      
      setSnapshots(snapshotsData);
    } catch (error) {
      console.error('Error fetching comment detail:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch comment details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      const response = await fetch(`/api/comments/${id}/refresh`, {
        method: 'POST',
      });
      
      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Comment refreshed successfully',
        });
        // Refetch the data
        fetchCommentDetail();
      } else {
        throw new Error('Failed to refresh comment');
      }
    } catch (error) {
      console.error('Error refreshing comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh comment',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Comment Detail</h1>
        <div className="text-center py-8">Loading comment...</div>
      </div>
    );
  }

  if (!comment) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Comment Detail</h1>
        <div className="text-center py-8">Comment not found</div>
      </div>
    );
  }

  // Prepare data for charts
  const chartData = snapshots.map(snapshot => ({
    date: new Date(snapshot.scraped_at).toLocaleDateString(),
    likes: snapshot.likes,
    replies: snapshot.replies,
    engagement: snapshot.likes + snapshot.replies,
  }));

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Comment Detail</h1>
        <Button onClick={handleRefresh}>Refresh Data</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Comment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Source URL</h3>
              <p className="break-all">
                <a 
                  href={comment.source_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {comment.source_url}
                </a>
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Comment Text</h3>
              <p className="whitespace-pre-wrap">{comment.comment_text}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Author</h3>
                <p>{comment.comment_author || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Target Account</h3>
                <p>{comment.target_account || 'N/A'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Published At</h3>
                <p>{comment.published_at ? new Date(comment.published_at).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
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
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Likes</h3>
                <p className="text-xl font-bold">{comment.current_likes}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Current Replies</h3>
                <p className="text-xl font-bold">{comment.current_replies}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Engagement</h3>
                <p className="text-xl font-bold">{comment.current_likes + comment.current_replies}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Campaign Tag</h3>
                <p>{comment.campaign_tag || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">CM Name</h3>
                <p>{comment.cm_name || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Notes</h3>
              <p>{comment.notes || 'No notes'}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Platform</h3>
              <p>{comment.platform}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">First Seen</h3>
              <p>{comment.first_seen_at ? new Date(comment.first_seen_at).toLocaleDateString() : 'N/A'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Checked</h3>
              <p>{comment.last_checked_at ? new Date(comment.last_checked_at).toLocaleDateString() : 'Never'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <p>{new Date(comment.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Engagement Timeline</CardTitle>
          <CardDescription>Historical data of likes, replies, and engagement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45} 
                  textAnchor="end" 
                  height={60}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="likes" name="Likes" fill="#8884d8" />
                <Bar dataKey="replies" name="Replies" fill="#82ca9d" />
                <Bar dataKey="engagement" name="Engagement (Likes + Replies)" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Historical Snapshots</CardTitle>
          <CardDescription>All recorded metrics for this comment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-4 text-left">Date</th>
                  <th className="py-2 px-4 text-left">Likes</th>
                  <th className="py-2 px-4 text-left">Replies</th>
                  <th className="py-2 px-4 text-left">Engagement</th>
                  <th className="py-2 px-4 text-left">Status</th>
                  <th className="py-2 px-4 text-left">Response Time (ms)</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((snapshot) => (
                  <tr key={snapshot.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{new Date(snapshot.scraped_at).toLocaleString()}</td>
                    <td className="py-2 px-4">{snapshot.likes}</td>
                    <td className="py-2 px-4">{snapshot.replies}</td>
                    <td className="py-2 px-4 font-medium">{snapshot.likes + snapshot.replies}</td>
                    <td className="py-2 px-4">
                      <Badge 
                        variant={
                          snapshot.status === 'active' ? 'default' :
                          snapshot.status === 'deleted' ? 'destructive' :
                          snapshot.status === 'not_found' ? 'outline' :
                          'secondary'
                        }
                      >
                        {snapshot.status}
                      </Badge>
                    </td>
                    <td className="py-2 px-4">{snapshot.response_time_ms || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {snapshots.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No historical snapshots available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}