'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { createFeedbackComment } from '@/app/actions/feedback';
import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Paperclip } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    display_name: string | null;
    role: string;
    display_organization: string | null;
    show_organization: boolean;
    campus_name?: string | null;
    tenant_name?: string | null;
  } | null;
}

interface CommentsSectionProps {
  feedbackId: string;
  comments: Comment[];
}

export function CommentsSection({ feedbackId, comments: initialComments }: CommentsSectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      // Redirect to login
      router.push(`/login`);
      return;
    }

    if (!content.trim()) {
      setError('Please enter a comment');
      return;
    }

    startTransition(async () => {
      try {
        const result = await createFeedbackComment({
          feedbackId,
          content: content.trim(),
        });

        if (result.success) {
          setContent('');
          router.refresh();
        } else {
          setError(result.error || 'Failed to post comment');
        }
      } catch (err) {
        console.error('Comment submission error:', err);
        setError('An error occurred while posting your comment');
      }
    });
  };

  return (
    <div className="bg-white rounded-lg border border-[#CBCFD4] p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-slate-600" />
        <h2 className="text-lg font-semibold text-slate-900">
          Discussion ({initialComments.length})
        </h2>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="space-y-4">
          <div>
            <Label htmlFor="comment" className="text-sm font-medium text-slate-900">
              Leave a comment
            </Label>
            <Textarea
              id="comment"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts, ask questions, or provide feedback..."
              rows={4}
              className="mt-1.5 border-[#828282] bg-white"
              disabled={isPending}
            />
            <p className="text-xs text-slate-500 mt-1">
              {content.length}/5000 characters
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              disabled
            >
              <Paperclip className="w-4 h-4" />
              <span>Attach images</span>
              <span className="text-xs text-slate-400">(Coming soon)</span>
            </button>

            <Button
              type="submit"
              disabled={isPending || !content.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending ? 'Posting...' : user ? 'Post Comment' : 'Sign in to Comment'}
            </Button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {initialComments.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {initialComments.map((comment) => {
            const userName = comment.user?.display_name || 'Anonymous';

            // Format role display: "District Admin • Birdville ISD" or "Campus Admin • Campus Name"
            let roleDisplay = 'User';
            if (comment.user?.role) {
              const role = comment.user.role;
              const formattedRole = role.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());

              if (role === 'campus_admin' && comment.user.campus_name) {
                roleDisplay = `Campus Admin • ${comment.user.campus_name}`;
              } else if (role === 'district_admin' && comment.user.tenant_name) {
                roleDisplay = `District Admin • ${comment.user.tenant_name}`;
              } else if (role === 'master_admin' && comment.user.tenant_name) {
                roleDisplay = `District Admin • ${comment.user.tenant_name}`;
              } else {
                roleDisplay = formattedRole;
              }
            }

            return (
              <div key={comment.id} className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0">
                {/* Comment Header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-slate-900">{userName}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-600">{roleDisplay}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {/* Comment Content */}
                <p className="text-slate-700 whitespace-pre-wrap ml-10">
                  {comment.content}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
