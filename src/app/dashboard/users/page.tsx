
'use client';

import * as React from 'react';
import { MoreHorizontal, PlusCircle, Trash2, KeyRound, UserCheck, UserX } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser, isAdmin, getUsers, addUser, removeUser, adminChangeUserPassword, toggleUserStatus } from '@/lib/auth';
import type { User, UserRole } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function AddUserDialog({ onUserAdded }: { onUserAdded: (user: User) => void }) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('viewer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill out all fields to add a new user.",
      });
      return;
    }
    
    const result = addUser({ name, email, password, role });
    
    if (result.success && result.user) {
      onUserAdded(result.user);
      toast({
        title: "User Added",
        description: `User ${name} has been created successfully.`,
      });
      setName('');
      setEmail('');
      setPassword('');
      setRole('viewer');
      setOpen(false);
    } else {
       toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add User
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user and assign them a role.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Jane Smith" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g., jane@example.com" className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer</SelectItem>
                  <SelectItem value="data-entry-operator">Data Entry Operator</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdminChangePasswordDialog({ user, onPasswordChanged }: { user: User, onPasswordChanged: () => void }) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast({
        variant: "destructive",
        title: "Missing field",
        description: "Please enter a new password.",
      });
      return;
    }
    
    const result = adminChangeUserPassword(user.id, newPassword);
    
    if (result.success) {
      onPasswordChanged();
      toast({
        title: "Password Changed",
        description: `Password for ${user.name} has been updated.`,
      });
      setNewPassword('');
      setOpen(false);
    } else {
       toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <KeyRound className="mr-2 h-4 w-4" />Change Password
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Change Password for {user.name}</DialogTitle>
            <DialogDescription>
              Enter a new password for this user. They will not be notified.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-password" className="text-right">
                New Password
              </Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Set New Password</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>([]);
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  
  const fetchUsers = React.useCallback(() => {
    setUsers(getUsers());
  }, []);

  React.useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/');
      return;
    }
     if (user.role !== 'admin') {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You must be an admin to view this page.',
      });
      router.push('/dashboard');
      return;
    }
    setCurrentUser(user);
    fetchUsers();
  }, [router, toast, fetchUsers]);

  const handleUserAdded = (newUser: User) => {
    setUsers(prev => [...prev, newUser]);
  };
  
  const handleRemoveUser = (userId: string) => {
    if (userId === currentUser?.id) {
       toast({
        variant: "destructive",
        title: "Cannot remove self",
        description: "You cannot remove your own account.",
      });
      return;
    }
    const result = removeUser(userId);
    if (result.success) {
      fetchUsers();
      toast({
        title: "User Removed",
        description: "The user has been successfully removed.",
      });
    } else {
       toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  };

  const handleToggleStatus = (userId: string) => {
     if (userId === currentUser?.id) {
       toast({
        variant: "destructive",
        title: "Cannot change own status",
        description: "You cannot deactivate your own account. This action is disabled to prevent self-lockout.",
      });
      return;
    }
    const result = toggleUserStatus(userId);
    if (result.success) {
      fetchUsers();
      toast({
        title: `User ${result.newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
        description: `The user account has been ${result.newStatus}.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  };


  const [isAdminUser, setIsAdminUser] = React.useState(false);
  React.useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);

  if (!isAdminUser) {
    return null; 
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Add, edit, or remove users from the system.
          </CardDescription>
        </div>
        <AddUserDialog onUserAdded={handleUserAdded} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className={user.status === 'inactive' ? 'bg-muted/50 text-muted-foreground' : ''}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                    {user.role.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2">
                     <Switch
                      id={`status-switch-${user.id}`}
                      checked={user.status === 'active'}
                      onCheckedChange={() => handleToggleStatus(user.id)}
                      aria-label="Toggle user status"
                    />
                     <span className="capitalize">{user.status}</span>
                   </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost" disabled={user.id === currentUser?.id}>
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <AdminChangePasswordDialog user={user} onPasswordChanged={fetchUsers} />
                      <DropdownMenuSeparator />
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                               <Trash2 className="mr-2 h-4 w-4" />Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the user account for {user.name}.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveUser(user.id)}>
                                Continue
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>

                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
