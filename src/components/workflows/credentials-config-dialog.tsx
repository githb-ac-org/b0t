'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { WorkflowCredentialsStatus } from './workflow-credentials-status';
import { Info } from 'lucide-react';

interface CredentialsConfigDialogProps {
  workflowId: string;
  workflowName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CredentialsConfigDialog({
  workflowId,
  workflowName,
  open,
  onOpenChange,
}: CredentialsConfigDialogProps) {
  const [hasCredentials, setHasCredentials] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;

    const checkCredentials = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/workflows/${workflowId}/credentials`);
        if (response.ok) {
          const data = await response.json();
          setHasCredentials(data.credentials && data.credentials.length > 0);
        }
      } catch (error) {
        console.error('Failed to check credentials:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCredentials();
  }, [workflowId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Credentials & API Keys: {workflowName}</DialogTitle>
          <DialogDescription>
            Configure OAuth connections and API keys required for this workflow.
            Select which accounts or keys to use for each platform.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loading ? (
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Required Credentials:</div>
              <div className="space-y-1.5">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </div>
          ) : hasCredentials === false ? (
            <div className="rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950 p-6 text-center">
              <Info className="h-8 w-8 mx-auto mb-3 text-blue-600 dark:text-blue-400" />
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                No External Credentials Required
              </h3>
              <p className="text-xs text-blue-800 dark:text-blue-200">
                This workflow doesn&apos;t use any external APIs or services that require authentication.
                If you add steps that connect to platforms like Twitter, OpenAI, or other services,
                their credentials will appear here.
              </p>
            </div>
          ) : (
            <WorkflowCredentialsStatus workflowId={workflowId} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
