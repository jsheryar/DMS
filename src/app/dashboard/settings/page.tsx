
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getBrandingSettings, setBrandingSettings, type BrandingSettings } from '@/lib/branding';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

function BrandingSettingsCard() {
  const { toast } = useToast();
  const [settings, setSettings] = React.useState<BrandingSettings>({ departmentName: '', logoUrl: '' });
  const [logoFile, setLogoFile] = React.useState<File | null>(null);

  React.useEffect(() => {
    setSettings(getBrandingSettings());
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      // Create a temporary URL for preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({...prev, logoUrl: reader.result as string }));
      }
      reader.readAsDataURL(file);
    }
  }

  const handleSave = () => {
    // If a new file was selected, the reader has already updated the settings.logoUrl state with a data URL.
    // If not, the existing settings.logoUrl is used.
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

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <BrandingSettingsCard />
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" defaultValue="John" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" defaultValue="Doe" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="johndoe@example.com" />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your experience.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue="en">
              <SelectTrigger id="language">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="theme">Theme</Label>
            <Select defaultValue="system">
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your notification settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox id="email-notifications" defaultChecked />
            <Label htmlFor="email-notifications">Email notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="push-notifications" />
            <Label htmlFor="push-notifications">Push notifications</Label>
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button>Save</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
