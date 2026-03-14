"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrackedComment } from '@/types';
import { getTrackedComments, refreshComments } from '@/lib/db/comments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface CommentTableProps {
  initialComments?: TrackedComment[];
  initialCount?: number;
}

export default function CommentTable({ initialComments = [], initialCount = 0 }: CommentTableProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [comments, setComments] = useState<TrackedComment[]>(initialComments);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('');
  const [cmFilter, setCmFilter] = useState('');
  const [limit] = useState(20);

  // Fetch comments
  const fetchComments = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (campaignFilter) filters.campaignTag = campaignFilter;
      if (cmFilter) filters.cmName = cmFilter;
      if (search) filters.search = search;

      const result = await getTrackedComments(page, limit, filters);
      setComments(result.data);
      setCount(result.count);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to load comments: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load comments on mount and when filters change
  useEffect(() => {
    fetchComments();
  }, [page, search, statusFilter, campaignFilter, cmFilter]);

  // Handle refresh selected
  const handleRefreshSelected = async () => {
    if (selectedComments.length === 0) return;

    try {
      setLoading(true);
      const results = await refreshComments(selectedComments);
      
      // Count successes and failures
      const successCount = results.filter(r => r.success).length;
      const errorCount = results.filter(r => !r.success).length;
      
      if (successCount > 0) {
        toast({
          title: "Success",
          description: `Refreshed ${successCount} comment(s)`
        });
      }
      
      if (errorCount > 0) {
        toast({
          title: "Errors",
          description: `Failed to refresh ${errorCount} comment(s)`,
          variant: "destructive",
        });
      }
      
      // Refresh the table
      await fetchComments();
      setSelectedComments([]);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to refresh comments: ${error}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedComments.length === comments.length) {
      setSelectedComments([]);
    } else {
      setSelectedComments(comments.map(c => c.id));
    }
  };

  // Calculate engagement
  const calculateEngagement = (comment: TrackedComment) => {
    return (comment.current_likes || 0) + (comment.current_replies || 0);
  };

  // Calculate pages
  const totalPages = Math.ceil(count / limit);

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row justify-between gap-4">
        <CardTitle>Tracked Comments</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={handleRefreshSelected} 
            disabled={selectedComments.length === 0 || loading}
          >
            Refresh Selected
          </Button>
          <Button 
            onClick={() => router.push('/comments/new')}
            variant="default"
          >
            Add Comment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to first page when searching
            }}
          />
          <select
            className="border rounded-md px-3 py-2"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="deleted">Deleted</option>
            <option value="not_found">Not Found</option>
            <option value="private">Private</option>
            <option value="error">Error</option>
          </select>
          <Input
            placeholder="Campaign Filter"
            value={campaignFilter}
            onChange={(e) => {
              setCampaignFilter(e.target.value);
              setPage(1);
            }}
          />
          <Input
            placeholder="CM Filter"
            value={cmFilter}
            onChange={(e) => {
              setCmFilter(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Table */}
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
              {comments.map((comment) => (
                <tr 
                  key={comment.id} 
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/comments/${comment.id}`)}
                >
                  <td className="py-2 px-4">
                    <Checkbox
                      checked={selectedComments.includes(comment.id)}
                      onCheckedChange={(checked: boolean) => {
                        if (checked) {
                          setSelectedComments([...selectedComments, comment.id]);
                        } else {
                          setSelectedComments(selectedComments.filter(id => id !== comment.id));
                        }
                      }}
                    />
                  </td>
                  <td className="py-2 px-4">{comment.platform}</td>
                  <td className="py-2 px-4 max-w-xs truncate" title={comment.comment_text || ''}>
                    {comment.comment_text ? comment.comment_text.substring(0, 50) + (comment.comment_text.length > 50 ? '...' : '') : ''}
                  </td>
                  <td className="py-2 px-4">{comment.comment_author}</td>
                  <td className="py-2 px-4">{comment.target_account}</td>
                  <td className="py-2 px-4">
                    {comment.published_at ? new Date(comment.published_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="py-2 px-4">{comment.current_likes}</td>
                  <td className="py-2 px-4">{comment.current_replies}</td>
                  <td className="py-2 px-4 font-medium">{calculateEngagement(comment)}</td>
                  <td className="py-2 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      comment.current_status === 'active' ? 'bg-green-100 text-green-800' :
                      comment.current_status === 'deleted' ? 'bg-red-100 text-red-800' :
                      comment.current_status === 'not_found' ? 'bg-yellow-100 text-yellow-800' :
                      comment.current_status === 'private' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {comment.current_status}
                    </span>
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
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-6">
          <div>
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, count)} of {count} comments
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <span className="px-4 py-2">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}