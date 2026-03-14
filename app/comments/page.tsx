"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CommentTable from '@/components/comment-table';
import { getTrackedComments } from '@/lib/db/comments';
import { TrackedComment } from '@/types';

export default function CommentsPage() {
  const [initialComments, setInitialComments] = useState<TrackedComment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const result = await getTrackedComments(1, 20, {});
        setInitialComments(result.data);
        setTotalCount(result.count);
      } catch (error) {
        console.error('Error loading initial comments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading comments...</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Loading tracked comments...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <CommentTable initialComments={initialComments} initialCount={totalCount} />
    </div>
  );
}