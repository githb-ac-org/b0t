'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Heart, Repeat2, MessageCircle, Eye, FlaskConical, AlertTriangle, CheckCircle } from 'lucide-react';

interface TestResult {
  selectedTweet: {
    id: string;
    text: string;
    author: string;
    authorName: string;
    likes: number;
    retweets: number;
    replies: number;
    views: number;
    createdAt: string;
  };
  generatedReply: string;
}

export default function TestRepliesPage() {
  const [searchQuery, setSearchQuery] = useState('AI');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/workflows/test-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchQuery,
          systemPrompt, // Send as-is, including empty string
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || 'Failed to run test');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-black text-2xl tracking-tight">Test Tweet Replies</h1>
          <p className="text-sm text-secondary">
            Test and refine your reply prompts without posting to Twitter
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Configuration */}
          <div className="space-y-4">
            <Card className="border-border bg-surface">
              <CardHeader>
                <CardTitle className="text-base font-bold">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">
                    Search Query
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="e.g., AI, nextjs, your-topic"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-primary">
                    System Prompt (Optional)
                  </label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="Enter your custom system prompt here. Leave blank for no system prompt (GPT will use only the tweet context)..."
                    rows={12}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-secondary">
                    The AI will use ONLY this prompt. Leave empty to test with no guidance.
                  </p>
                </div>

                <button
                  onClick={runTest}
                  disabled={loading || !searchQuery}
                  className="w-full py-2 bg-primary text-white font-medium rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Running Test...' : 'Test Reply Generation'}
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4">
            {/* Error Display */}
            {error && (
              <Card className="border-red-500 bg-red-500/10">
                <CardContent className="pt-4">
                  <div className="text-sm text-red-500">
                    <strong>Error:</strong> {error}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Results Section */}
            {result && (
              <>
                {/* Selected Tweet */}
                <Card className="border-border bg-surface">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Selected Tweet</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-primary">
                        {result.selectedTweet.authorName} <span className="text-secondary">@{result.selectedTweet.author}</span>
                      </div>
                      <div className="text-sm text-primary leading-relaxed">
                        {result.selectedTweet.text}
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs text-secondary">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {result.selectedTweet.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="h-3 w-3" />
                        {result.selectedTweet.retweets}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {result.selectedTweet.replies}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {result.selectedTweet.views}
                      </span>
                    </div>

                    <div className="text-xs text-secondary">
                      Tweet ID: {result.selectedTweet.id}
                    </div>
                  </CardContent>
                </Card>

                {/* Generated Reply */}
                <Card className="border-border bg-surface">
                  <CardHeader>
                    <CardTitle className="text-base font-bold">Generated Reply</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-4 bg-background border border-border rounded-md">
                        <p className="text-sm text-primary leading-relaxed">
                          {result.generatedReply}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-xs text-secondary">
                        <span>{result.generatedReply.length} characters</span>
                        <span className={`flex items-center gap-1 ${result.generatedReply.length > 280 ? 'text-red-500' : 'text-green-500'}`}>
                          {result.generatedReply.length > 280 ? (
                            <>
                              <AlertTriangle className="h-3 w-3" />
                              Too long
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Valid length
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Banner */}
                <Card className="border-blue-500 bg-blue-500/10">
                  <CardContent className="pt-4">
                    <div className="text-sm text-blue-500 flex items-start gap-2">
                      <FlaskConical className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>
                        <strong>Dry Run Mode:</strong> This reply was not posted to Twitter. Adjust your prompt and run again to refine.
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Placeholder when no results */}
            {!result && !error && (
              <Card className="border-border bg-surface">
                <CardContent className="pt-6 pb-6">
                  <div className="text-center text-secondary text-sm">
                    Run a test to see results here
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
