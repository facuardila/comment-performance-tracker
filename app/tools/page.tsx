"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ToolsPage() {
  const [bookmarkletCode, setBookmarkletCode] = useState('');

  const generateBookmarklet = () => {
    const code = `javascript:(function(){window.open('${window.location.origin}/comments/new?url='+encodeURIComponent(window.location.href));})();`;
    setBookmarkletCode(code);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tools</h1>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Instagram Comment Tracker Bookmarklet</CardTitle>
            <CardDescription>
              Drag this bookmarklet to your bookmarks bar for quick access to add Instagram comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">How to use:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Click the button below to generate the bookmarklet</li>
                  <li>Drag the generated link to your browser's bookmarks bar</li>
                  <li>When viewing an Instagram post or comment, click the bookmarklet to quickly add it to tracking</li>
                </ol>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <button
                  onClick={generateBookmarklet}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Generate Bookmarklet
                </button>
                
                {bookmarkletCode && (
                  <div className="w-full">
                    <p className="text-sm text-gray-600 mb-2">Drag this to your bookmarks bar:</p>
                    <a
                      href={bookmarkletCode}
                      className="inline-block px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-move"
                    >
                      📌 Track Instagram Comment
                    </a>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">What it does:</h4>
                <p className="text-sm text-gray-600">
                  The bookmarklet captures the current page URL and opens the Quick Add form with the URL pre-filled.
                  This allows community managers to quickly add comments they see on Instagram without having to copy URLs manually.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Other Tools</CardTitle>
            <CardDescription>
              Additional utilities for managing your comment tracking workflow
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Bulk Refresh</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Update metrics for multiple tracked comments at once
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Access Tool →
                </button>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Export Data</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Export tracked comments and metrics to various formats
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Access Tool →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}