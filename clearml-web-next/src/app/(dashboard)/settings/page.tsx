'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/lib/hooks/use-toast';
import { useAuthStore } from '@/lib/stores/auth';
import { usePreferencesStore } from '@/lib/stores/preferences';
import {
  User,
  Mail,
  Key,
  Shield,
  Bell,
  Palette,
  Globe,
  Trash2,
  Copy,
  Plus,
  Eye,
  EyeOff,
} from 'lucide-react';

// Form schemas
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8, 'Password must be at least 8 characters'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const user = useAuthStore((state) => state.user);
  const updateUserPreferences = useAuthStore((state) => state.updateUserPreferences);

  const {
    theme,
    locale,
    notifications,
    autoRefresh,
    refreshInterval,
    tablePreferences,
    setTheme,
    setLocale,
    setNotifications,
    setAutoRefresh,
    setRefreshInterval,
    setTablePreferences,
  } = usePreferencesStore();

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: '1',
      name: 'Production API Key',
      key: 'sk_prod_********************************',
      createdAt: '2024-01-15',
      lastUsed: '2024-11-10',
    },
  ]);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // Profile form
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      company: user?.company?.name || '',
      bio: '',
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const handleProfileSubmit = (data: ProfileFormData) => {
    // TODO: Implement API call to update profile
    console.log('Updating profile:', data);
    toast({
      title: 'Profile updated',
      description: 'Your profile has been successfully updated.',
    });
  };

  const handlePasswordSubmit = (data: PasswordFormData) => {
    // TODO: Implement API call to change password
    console.log('Changing password');
    toast({
      title: 'Password changed',
      description: 'Your password has been successfully changed.',
    });
    passwordForm.reset();
  };

  const handleCreateApiKey = () => {
    if (!newKeyName) return;

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName,
      key: `sk_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date().toISOString().split('T')[0] as string,
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
    setShowNewKeyDialog(false);
    toast({
      title: 'API Key created',
      description: 'Your new API key has been created. Make sure to copy it now.',
    });
  };

  const handleDeleteApiKey = (id: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== id));
    toast({
      title: 'API Key deleted',
      description: 'The API key has been permanently deleted.',
      variant: 'destructive',
    });
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: 'Copied!',
      description: 'API key copied to clipboard.',
    });
  };

  const toggleKeyVisibility = (id: string) => {
    const newVisibleKeys = new Set(visibleKeys);
    if (newVisibleKeys.has(id)) {
      newVisibleKeys.delete(id);
    } else {
      newVisibleKeys.add(id);
    }
    setVisibleKeys(newVisibleKeys);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Palette className="mr-2 h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            <Key className="mr-2 h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="p-6">
            <form onSubmit={profileForm.handleSubmit(handleProfileSubmit) as any} className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-2xl">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Profile Picture</h3>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm">
                      Upload new picture
                    </Button>
                    <Button type="button" variant="ghost" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...profileForm.register('name')}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="mr-2 inline h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email || ''}
                    {...profileForm.register('email')}
                  />
                  {profileForm.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    {...profileForm.register('company')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  placeholder="Tell us about yourself..."
                  {...profileForm.register('bio')}
                />
                {profileForm.formState.errors.bio && (
                  <p className="text-sm text-destructive">
                    {profileForm.formState.errors.bio.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => profileForm.reset()}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          {/* Theme */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Appearance
                </h3>
                <p className="text-sm text-muted-foreground">
                  Customize the appearance of the application
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Theme</Label>
                  <RadioGroup value={theme} onValueChange={(value) => setTheme(value as any)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light" className="font-normal cursor-pointer">
                        Light
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark" className="font-normal cursor-pointer">
                        Dark
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system" className="font-normal cursor-pointer">
                        System
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="density">Table Density</Label>
                  <Select
                    value={tablePreferences.density}
                    onValueChange={(value) =>
                      setTablePreferences({ density: value as any })
                    }
                  >
                    <SelectTrigger id="density">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                      <SelectItem value="spacious">Spacious</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pageSize">Default Page Size</Label>
                  <Select
                    value={tablePreferences.pageSize.toString()}
                    onValueChange={(value) =>
                      setTablePreferences({ pageSize: parseInt(value) })
                    }
                  >
                    <SelectTrigger id="pageSize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 rows</SelectItem>
                      <SelectItem value="20">20 rows</SelectItem>
                      <SelectItem value="50">50 rows</SelectItem>
                      <SelectItem value="100">100 rows</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>

          {/* Localization */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <Globe className="mr-2 h-5 w-5" />
                  Localization
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set your language and regional preferences
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="locale">Language</Label>
                <Select value={locale} onValueChange={(value) => setLocale(value as any)}>
                  <SelectTrigger id="locale">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notifications
                </h3>
                <p className="text-sm text-muted-foreground">
                  Manage how you receive notifications
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications({ email: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications({ push: checked })
                    }
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label className="text-base">Event Notifications</Label>

                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Task Completed</Label>
                    <Switch
                      checked={notifications.taskComplete}
                      onCheckedChange={(checked) =>
                        setNotifications({ taskComplete: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Task Failed</Label>
                    <Switch
                      checked={notifications.taskFailed}
                      onCheckedChange={(checked) =>
                        setNotifications({ taskFailed: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Project Updates</Label>
                    <Switch
                      checked={notifications.projectUpdates}
                      onCheckedChange={(checked) =>
                        setNotifications({ projectUpdates: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Weekly Reports</Label>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) =>
                        setNotifications({ weeklyReports: checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Auto-refresh */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Auto-refresh</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically refresh data in real-time
                  </p>
                </div>
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                />
              </div>

              {autoRefresh && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Refresh Interval</Label>
                      <span className="text-sm text-muted-foreground">
                        {refreshInterval} seconds
                      </span>
                    </div>
                    <Slider
                      value={[refreshInterval || 30]}
                      onValueChange={([value]) => value && setRefreshInterval(value)}
                      min={10}
                      max={300}
                      step={10}
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Data will refresh every {refreshInterval} seconds
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={() => {
                toast({
                  title: 'Preferences saved',
                  description: 'Your preferences have been saved successfully.',
                });
              }}
            >
              Save Preferences
            </Button>
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold flex items-center">
                    <Key className="mr-2 h-5 w-5" />
                    API Keys
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your API keys for programmatic access
                  </p>
                </div>
                <Button onClick={() => setShowNewKeyDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Key
                </Button>
              </div>

              {showNewKeyDialog && (
                <>
                  <Separator />
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        placeholder="e.g., Production API Key"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowNewKeyDialog(false);
                          setNewKeyName('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateApiKey}>
                        Create Key
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <Separator />

              <div className="space-y-4">
                {apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{apiKey.name}</h4>
                        {!apiKey.lastUsed && (
                          <Badge variant="secondary">New</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                          {visibleKeys.has(apiKey.id)
                            ? apiKey.key
                            : apiKey.key.replace(/./g, '*')}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {visibleKeys.has(apiKey.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyApiKey(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created: {apiKey.createdAt}
                        {apiKey.lastUsed && ` • Last used: ${apiKey.lastUsed}`}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteApiKey(apiKey.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Change Password
                </h3>
                <p className="text-sm text-muted-foreground">
                  Update your password to keep your account secure
                </p>
              </div>

              <Separator />

              <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit) as any} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    {...passwordForm.register('currentPassword')}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    {...passwordForm.register('newPassword')}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...passwordForm.register('confirmPassword')}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => passwordForm.reset()}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Change Password
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          <Card className="p-6 border-destructive">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Irreversible and destructive actions
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Delete Account</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button variant="destructive">
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
