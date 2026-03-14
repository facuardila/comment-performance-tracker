'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardStats } from '@/lib/db/comments';

// Add DashboardStats interface
interface DashboardStats {
  totalComments: number;
  statusBreakdown: Array<{ current_status: string; count: string }>;
  totalLikes: number;
  totalReplies: number;
  totalEngagement: number;
  recentSnapshots: any[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="text-center py-8">Loading dashboard...</div>
      </div>
    );
  }

  // Prepare data for status breakdown pie chart
  const statusData = stats?.statusBreakdown.map(item => ({
    name: item.current_status,
    value: parseInt(item.count),
  })) || [];

  // Colors for the pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  // Prepare data for top comments by engagement
  const topCommentsData = stats?.recentSnapshots
    .filter((snapshot: any) => snapshot.likes !== undefined && snapshot.replies !== undefined)
    .map((snapshot: any) => ({
      name: `Comment ${snapshot.tracked_comment_id.substring(0, 8)}...`,
      engagement: snapshot.likes + snapshot.replies,
      likes: snapshot.likes,
      replies: snapshot.replies,
    }))
    .sort((a: any, b: any) => b.engagement - a.engagement)
    .slice(0, 10) || [];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Comments</CardDescription>
            <CardTitle className="text-2xl">{stats?.totalComments || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Tracked comments</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Likes</CardDescription>
            <CardTitle className="text-2xl">{stats?.totalLikes || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">All tracked comments</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Replies</CardDescription>
            <CardTitle className="text-2xl">{stats?.totalReplies || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">All tracked comments</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Engagement</CardDescription>
            <CardTitle className="text-2xl">{stats?.totalEngagement || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Likes + Replies</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Comments by Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topCommentsData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" scale="band" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="engagement" name="Engagement (Likes + Replies)" fill="#8884d8" />
                  <Bar dataKey="likes" name="Likes" fill="#82ca9d" />
                  <Bar dataKey="replies" name="Replies" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}