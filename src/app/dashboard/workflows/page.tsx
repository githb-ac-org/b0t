'use client';

import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { WorkflowsList } from '@/components/workflows/workflows-list';
import { ExecutionResultDialog } from '@/components/workflows/execution-result-dialog';
import { ExecutionHistoryDialog } from '@/components/workflows/execution-history-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { WorkflowListItem } from '@/types/workflows';

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<WorkflowListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    output?: unknown;
    error?: string;
    errorStep?: string;
    duration?: number;
  } | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [executedWorkflowName, setExecutedWorkflowName] = useState('');
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [historyWorkflowId, setHistoryWorkflowId] = useState('');
  const [historyWorkflowName, setHistoryWorkflowName] = useState('');

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows');
      const data = await response.json();
      setWorkflows(data.workflows || []);
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleWorkflowDeleted = () => {
    fetchWorkflows();
  };

  const handleWorkflowRun = async (id: string) => {
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) return;

    const startTime = Date.now();

    try {
      const response = await fetch(`/api/workflows/${id}/run`, {
        method: 'POST',
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to run workflow');
      }

      const result = await response.json();

      // Show result in dialog
      setExecutionResult({
        ...result,
        duration,
      });
      setExecutedWorkflowName(workflow.name);
      setShowResultDialog(true);

      // Refresh to update last run status
      fetchWorkflows();
    } catch (error) {
      console.error('Failed to run workflow:', error);

      // Show error in dialog
      setExecutionResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      });
      setExecutedWorkflowName(workflow.name);
      setShowResultDialog(true);
    }
  };

  const handleWorkflowExport = async (id: string) => {
    try {
      const response = await fetch(`/api/workflows/${id}/export`);
      if (!response.ok) {
        throw new Error('Failed to export workflow');
      }

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workflow-${data.name.toLowerCase().replace(/\s+/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export workflow:', error);
      alert('Failed to export workflow');
    }
  };

  const handleImportClick = () => {
    setShowImportDialog(true);
    setImportError('');
  };

  const handleViewHistory = (id: string) => {
    const workflow = workflows.find((w) => w.id === id);
    if (!workflow) return;

    setHistoryWorkflowId(id);
    setHistoryWorkflowName(workflow.name);
    setShowHistoryDialog(true);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError('');

    try {
      const text = await file.text();
      const workflowJson = JSON.parse(text);

      const response = await fetch('/api/workflows/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowJson }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to import workflow');
      }

      const result = await response.json();

      // Show success message with required credentials if any
      if (result.requiredCredentials && result.requiredCredentials.length > 0) {
        alert(
          `Workflow "${result.name}" imported successfully!\n\n` +
          `Required credentials: ${result.requiredCredentials.join(', ')}\n` +
          `Please add these credentials in the Credentials page.`
        );
      } else {
        alert(`Workflow "${result.name}" imported successfully!`);
      }

      setShowImportDialog(false);
      fetchWorkflows();
    } catch (error) {
      console.error('Failed to import workflow:', error);
      setImportError(
        error instanceof Error ? error.message : 'Failed to import workflow'
      );
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button
            onClick={handleImportClick}
            className="bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
        </div>

        <WorkflowsList
          workflows={workflows}
          loading={loading}
          onWorkflowDeleted={handleWorkflowDeleted}
          onWorkflowExport={handleWorkflowExport}
          onWorkflowRun={handleWorkflowRun}
          onWorkflowViewHistory={handleViewHistory}
          onWorkflowUpdated={fetchWorkflows}
        />

        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Import Workflow</DialogTitle>
              <DialogDescription>
                Upload a workflow JSON file to import it into your account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workflow-file">Workflow File</Label>
                <Input
                  id="workflow-file"
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileSelect}
                  disabled={importing}
                />
                <p className="text-xs text-muted-foreground">
                  Select a workflow JSON file to import
                </p>
              </div>

              {importError && (
                <div className="text-sm text-destructive">
                  {importError}
                </div>
              )}

              {importing && (
                <div className="text-sm text-muted-foreground">
                  Importing workflow...
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <ExecutionResultDialog
          open={showResultDialog}
          onOpenChange={setShowResultDialog}
          result={executionResult}
          workflowName={executedWorkflowName}
        />

        <ExecutionHistoryDialog
          open={showHistoryDialog}
          onOpenChange={setShowHistoryDialog}
          workflowId={historyWorkflowId}
          workflowName={historyWorkflowName}
        />
      </div>
    </DashboardLayout>
  );
}
