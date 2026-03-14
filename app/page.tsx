"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Comment Performance Tracker</h1>
          <p className="text-xl text-gray-600 mb-8">
            Track Instagram comment performance for community managers
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/comments/new">
                Quick Add Comment
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link href="/comments">
                View All Comments
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard">
                Dashboard
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Quick Add</h3>
            <p className="text-gray-600">
              Add new Instagram comments to track with a simple form. Perfect for daily use by community managers.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Track Performance</h3>
            <p className="text-gray-600">
              Monitor likes, replies, and engagement metrics over time for each comment.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600">
              Get insights and reports on comment performance across campaigns and community managers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}