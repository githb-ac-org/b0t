'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CredentialsList } from '@/components/credentials/credentials-list';
import { CredentialForm } from '@/components/credentials/credential-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CredentialListItem } from '@/types/workflows';

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<CredentialListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchCredentials = async () => {
    try {
      const response = await fetch('/api/credentials');
      const data = await response.json();
      setCredentials(data.credentials || []);
    } catch (error) {
      console.error('Failed to fetch credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleCredentialAdded = () => {
    setShowAddDialog(false);
    fetchCredentials();
  };

  const handleCredentialDeleted = () => {
    fetchCredentials();
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-4">
        <div className="flex justify-end">
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-foreground text-background hover:bg-foreground/90 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Credential
          </Button>
        </div>

        <CredentialsList
          credentials={credentials}
          loading={loading}
          onCredentialDeleted={handleCredentialDeleted}
        />

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add API Credential</DialogTitle>
              <DialogDescription>
                Store an API key or token securely. All credentials are encrypted at rest.
              </DialogDescription>
            </DialogHeader>
            <CredentialForm onSuccess={handleCredentialAdded} />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
