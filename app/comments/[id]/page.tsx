"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getTrackedCommentById, getCommentSnapshots } from '@/lib/db/comments';
import { TrackedComment, CommentSnapshot } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CommentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [comment, setComment] = useState<TrackedComment | null>(null);
  const [snapshots, setSnapshots] = useState<CommentSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadCommentData();
  }, [id]);

  const loadCommentData = async () => {
    try {
      setLoading(true);
      const commentResult = await getTrackedCommentById(id as string);
      if (commentResult) {
        setComment(commentResult);
        const snapshotsResult = await getCommentSnapshots(commentResult.id);
        setSnapshots(snapshotsResult);
      }
    } catch (error) {
      console.error('Error loading comment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (!id) return;
    
    try {
      setRefreshing(true);
      const response = await fetch(`/api/comments/${id}/refresh`, {
        method: 'POST',
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Reload the data
          await loadCommentData();
        }
      }
    } catch (error) {
      console.error('Error refreshing comment:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading comment...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading comment details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!comment) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Comment Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested comment could not be found.</p>
            <Button onClick={() => router.push('/comments')} className="mt-4">
              Back to Comments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare chart data
  const chartData = snapshots.map(snapshot => ({
    date: new Date(snapshot.scraped_at).toLocaleDateString(),
    likes: snapshot.likes || 0,
    replies: snapshot.replies || 0,
    engagement: (snapshot.likes || 0) + (snapshot.replies || 0)
  })).reverse(); // Reverse to show oldest first

  // Calculate growth
  let likesGrowth = 0;
  let repliesGrowth = 0;
  if (snapshots.length >= 2) {
    const first = snapshots[snapshots.length - 1]; // Oldest
    const last = snapshots[0]; // Newest
    likesGrowth = (last.likes || 0) - (first.likes || 0);
    repliesGrowth = (last.replies || 0) - (first.replies || 0);
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold">Comment Detail</h1>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh Now'}
          </Button>
          <Button onClick={() => router.push('/comments')}>
            Back to List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Comment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold">Comment Text</h3>
              <p className="text-gray-700">{comment.comment_text}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Author</h3>
                <p>{comment.comment_author || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Target Account</h3>
                <p>{comment.target_account || 'N/A'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Platform</h3>
                <p>{comment.platform}</p>
              </div>
              <div>
                <h3 className="font-semibold">Status</h3>
                <Badge 
                  variant={
                    comment.current_status === 'active' ? 'default' :
                    comment.current_status === 'deleted' ? 'destructive' :
                    comment.current_status === 'not_found' ? 'secondary' :
                    comment.current_status === 'private' ? 'outline' :
                    'secondary'
                  }
                >
                  {comment.current_status}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Published At</h3>
                <p>{comment.published_at ? new Date(comment.published_at).toLocaleString() : 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-semibold">First Seen</h3>
                <p>{comment.first_seen_at ? new Date(comment.first_seen_at).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold">Campaign</h3>
                <p>{comment.campaign_tag || 'N/A'}</p>
              </div>
              <div>
                <h3 className="font-semibold">Community Manager</h3>
                <p>{comment.cm_name || 'N/A'}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold">Source URL</h3>
              <a 
                href={comment.source_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {comment.source_url}
              </a>
            </div>
            
            {comment.notes && (
              <div>
                <h3 className="font-semibold">Notes</h3>
                <p>{comment.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Likes</span>
                <span className="text-2xl font-bold">{comment.current_likes || 0}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Replies</span>
                <span className="text-2xl font-bold">{comment.current_replies || 0}</span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
                <span className="text-gray-600">Engagement</span>
                <span className="text-2xl font-bold text-blue-700">
                  {(comment.current_likes || 0) + (comment.current_replies || 0)}
                </span>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Growth (since tracking started)</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Likes:</span>
                    <span className={likesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {likesGrowth >= 0 ? '+' : ''}{likesGrowth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Replies:</span>
                    <span className={repliesGrowth >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {repliesGrowth >= 0 ? '+' : ''}{repliesGrowth}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tracking Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Last Checked</span>
                <span>
                  {comment.last_checked_at 
                    ? new Date(comment.last_checked_at).toLocaleString() 
                    : 'Never'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created</span>
                <span>{new Date(comment.created_at).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      {chartData.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Engagement History</CardTitle>
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
                  <Tooltip 
                    formatter={(value) => [value, 'Count']}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="likes" name="Likes" fill="#8884d8" />
                  <Bar dataKey="replies" name="Replies" fill="#82ca9d" />
                  <Bar dataKey="engagement" name="Engagement" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Snapshots Table */}
      {snapshots.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Snapshots History ({snapshots.length})</CardTitle>
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
                  </tr>
                </thead>
                <tbody>
                  {snapshots.map((snapshot) => (
                    <tr key={snapshot.id} className="border-b">
                      <td className="py-2 px-4">{new Date(snapshot.scraped_at).toLocaleString()}</td>
                      <td className="py-2 px-4">{snapshot.likes || 0}</td>
                      <td className="py-2 px-4">{snapshot.replies || 0}</td>
                      <td className="py-2 px-4 font-medium">{(snapshot.likes || 0) + (snapshot.replies || 0)}</td>
                      <td className="py-2 px-4">
                        <Badge variant={snapshot.status === 'active' ? 'default' : 'destructive'}>
                          {snapshot.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}