
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getBrandingSettings, setBrandingSettings, type BrandingSettings } from '@/lib/branding';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { getUsers } from '@/lib/auth';
import type { Document } from '@/lib/types';
import { isAdmin } from '@/lib/auth';
import { setUsers } from '@/lib/auth';

function BrandingSettingsCard() {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState<BrandingSettings>({ departmentName: '', logoUrl: '' });
  
  React.useEffect(() => {
    setSettings(getBrandingSettings());
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({...prev, logoUrl: reader.result as string }));
      }
      reader.readAsDataURL(file);
    }
  }

  const handleSave = () => {
    setBrandingSettings({ departmentName: settings.departmentName, logoUrl: settings.logoUrl });
    toast({
      title: 'Settings Saved',
      description: 'Your branding settings have been updated.',
    });
  };

  return (
      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Customize the look of your dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
           <div className="grid gap-2">
              <Label htmlFor="department-name">Department Name</Label>
              <Input 
                id="department-name" 
                value={settings.departmentName || ''}
                onChange={(e) => setSettings(prev => ({...prev, departmentName: e.target.value}))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="logo-upload">Logo</Label>
              <Input id="logo-upload" type="file" accept="image/*" onChange={handleFileChange} />
              {settings.logoUrl && (
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Current Logo:</span>
                  <Image src={settings.logoUrl} alt="Current Logo" width={40} height={40} className="rounded-md object-contain" />
                </div>
              )}
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button onClick={handleSave}>Save</Button>
        </CardFooter>
      </Card>
  )
}

function BackupAndRestoreCard() {
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleBackup = () => {
        const users = getUsers();
        const documents: Document[] = JSON.parse(localStorage.getItem('documents') || '[]');
        
        const backupData = {
            users,
            documents,
            branding: getBrandingSettings(),
            categories: JSON.parse(localStorage.getItem('categories') || '[]'),
            logs: JSON.parse(localStorage.getItem('user_logs') || '[]'),
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `docusafe-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast({
            title: "Backup Created",
            description: "Your data has been downloaded as a JSON file.",
        });
    };

    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target?.result as string);
                if (data.users && data.documents && data.branding && data.categories) {
                    setUsers(data.users);
                    localStorage.setItem('documents', JSON.stringify(data.documents));
                    setBrandingSettings(data.branding);
                    localStorage.setItem('categories', JSON.stringify(data.categories));
                    localStorage.setItem('user_logs', JSON.stringify(data.logs || []));
                    
                    toast({
                        title: "Restore Successful",
                        description: "Your data has been restored from the backup file. Please refresh the page.",
                    });
                     // Trigger storage event to update other components like layout
                    window.dispatchEvent(new Event('storage'));

                } else {
                    throw new Error("Invalid backup file format.");
                }
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Restore Failed",
                    description: (error as Error).message || "Could not read or parse the backup file.",
                });
            }
        };
        reader.readAsText(file);
    };

    if (!isAdmin()) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>
                    Download a backup of your data or restore from a file.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
                <Button onClick={handleBackup}>Download Backup</Button>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Restore from Backup
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleRestore}
                    className="hidden"
                    accept="application/json"
                />
            </CardContent>
             <CardFooter>
                <p className="text-sm text-muted-foreground">
                    Restoring data will overwrite all current users, documents, and settings.
                </p>
            </CardFooter>
        </Card>
    );
}

export default function SettingsPage() {
  const [showAdminSettings, setShowAdminSettings] = React.useState(false);

  React.useEffect(() => {
    setShowAdminSettings(isAdmin());
  }, []);

  return (
    <div className="grid gap-6">
      {showAdminSettings && <BrandingSettingsCard />}
      <BackupAndRestoreCard />
    </div>
  );
}
