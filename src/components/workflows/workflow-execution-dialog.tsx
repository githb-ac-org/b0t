'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ChatTriggerConfig } from './trigger-configs/chat-trigger-config';
import { WebhookTriggerConfig } from './trigger-configs/webhook-trigger-config';

interface WorkflowExecutionDialogProps {
  workflowId: string;
  workflowName: string;
  triggerType: 'manual' | 'cron' | 'webhook' | 'telegram' | 'discord' | 'chat';
  triggerConfig?: Record<string, unknown>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExecuted?: () => void;
}

export function WorkflowExecutionDialog({
  workflowId,
  workflowName,
  triggerType,
  open,
  onOpenChange,
  onExecuted,
}: WorkflowExecutionDialogProps) {
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; output?: unknown; error?: string } | null>(null);
  const [triggerData, setTriggerData] = useState<Record<string, unknown>>({});

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setResult(null);
      setTriggerData({});
    }
  }, [open]);

  const handleExecute = useCallback(async (data?: Record<string, unknown>) => {
    setExecuting(true);
    setResult(null);

    try {
      const response = await fetch(`/api/workflows/${workflowId}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerData: data || triggerData }),
      });

      const responseData = await response.json();

      if (response.ok) {
        const result = { success: true, output: responseData.output };
        setResult(result);
        toast.success('Workflow executed successfully');
        onExecuted?.();
        return result;
      } else {
        const result = { success: false, error: responseData.error };
        setResult(result);
        toast.error(responseData.error || 'Workflow execution failed');
        return result;
      }
    } catch (error) {
      console.error('Execution error:', error);
      const result = { success: false, error: 'Failed to execute workflow' };
      setResult(result);
      toast.error('Failed to execute workflow');
      return result;
    } finally {
      setExecuting(false);
    }
  }, [workflowId, triggerData, onExecuted]);

  const getTriggerDescription = () => {
    switch (triggerType) {
      case 'chat':
        return 'Chat with this workflow to trigger execution with conversational context.';
      case 'webhook':
        return 'Test webhook triggers for this workflow.';
      default:
        return 'Execute this workflow now.';
    }
  };

  const renderTriggerConfig = () => {
    switch (triggerType) {
      case 'chat':
        return (
          <ChatTriggerConfig
            workflowId={workflowId}
            workflowName={workflowName}
            onConfigChange={setTriggerData}
            onExecute={handleExecute}
          />
        );
      case 'webhook':
        return (
          <WebhookTriggerConfig
            workflowId={workflowId}
            onConfigChange={setTriggerData}
            onExecute={handleExecute}
          />
        );
      default:
        return null; // Manual and other triggers just show the execute button
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        {triggerType !== 'chat' && (
          <DialogHeader>
            <DialogTitle>Execute: {workflowName}</DialogTitle>
            <DialogDescription>{getTriggerDescription()}</DialogDescription>
          </DialogHeader>
        )}

        <div className={triggerType === 'chat' ? 'pt-6' : 'space-y-4 py-4'}>
          {/* Render trigger-specific configuration */}
          {renderTriggerConfig()}

          {/* Execution Result - only for non-chat triggers */}
          {triggerType !== 'chat' && result && (
            <div
              className={`rounded-lg border p-4 ${
                result.success
                  ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
                  : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <span className="font-medium">
                  {result.success ? 'Execution Successful' : 'Execution Failed'}
                </span>
              </div>
              {result.error && (
                <p className="text-sm text-red-700 dark:text-red-300">{result.error}</p>
              )}
              {result.output !== undefined && (
                <details className="mt-2">
                  <summary className="text-sm font-medium cursor-pointer hover:underline">
                    View Output
                  </summary>
                  <pre className="mt-2 text-xs bg-black/5 dark:bg-white/5 p-2 rounded overflow-auto max-h-40">
                    {typeof result.output === 'string'
                      ? result.output
                      : JSON.stringify(result.output, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>

        {triggerType !== 'chat' && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={executing}>
              Close
            </Button>
            {/* Only show Execute button for triggers without built-in execution UI */}
            {triggerType !== 'webhook' && (
              <Button onClick={() => handleExecute()} disabled={executing}>
                {executing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Execute Workflow
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
