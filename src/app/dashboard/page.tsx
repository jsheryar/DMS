'use client';

import * as React from 'react';
import {
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Download,
  Send,
  Eye,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import type { Document } from '@/lib/types';


const documents: Document[] = [
  {
    id: 'DOC-001',
    title: 'Quarterly Financial Report Q2 2023',
    category: 'Letters',
    date: '2023-06-30',
  },
  {
    id: 'DOC-002',
    title: 'New Office Safety Protocols',
    category: 'Notifications',
    date: '2023-07-15',
  },
  {
    id: 'DOC-003',
    title: 'Project Alpha - Phase 1 Approval',
    category: 'Notesheets',
    date: '2023-07-20',
  },
  {
    id: 'DOC-004',
    title: 'Employee Onboarding Feedback Form',
    category: 'Letters',
    date: '2023-08-01',
  },
  {
    id: 'DOC-005',
    title: 'Company Holiday Schedule 2024',
    category: 'Notifications',
    date: '2023-08-05',
  },
];

const categoryBadgeVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Letters: 'secondary',
  Notifications: 'default',
  Notesheets: 'outline',
};

function DocumentTable({ documents: tableDocs }: { documents: Document[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="hidden w-[100px] sm:table-cell">
            ID
          </TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="hidden md:table-cell">Category</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tableDocs.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell className="hidden sm:table-cell font-medium">
              {doc.id}
            </TableCell>
            <TableCell className="font-medium">{doc.title}</TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge variant={categoryBadgeVariant[doc.category] || 'default'}>
                {doc.category}
              </Badge>
            </TableCell>
            <TableCell className="hidden md:table-cell">{doc.date}</TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button aria-haspopup="true" size="icon" variant="ghost">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem><Eye className="mr-2 h-4 w-4" />View</DropdownMenuItem>
                  <DropdownMenuItem><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem>
                  <DropdownMenuItem><Send className="mr-2 h-4 w-4" />Forward</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function UploadDocumentDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Upload Document
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Add a new document to your repository. Select a file and assign a category.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" placeholder="e.g., Q3 Marketing Report" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="letters">Letters</SelectItem>
                <SelectItem value="notifications">Notifications</SelectItem>
                <SelectItem value="notesheets">Notesheets</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="document" className="text-right">
              File
            </Label>
            <Input id="document" type="file" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Upload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


export default function DashboardPage() {
  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="letters">Letters</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="notesheets" className="hidden sm:flex">Notesheets</TabsTrigger>
        </TabsList>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Date
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Category</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <UploadDocumentDialog />
        </div>
      </div>
      <TabsContent value="all">
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>
              Manage your office letters, notifications, and notesheets.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentTable documents={documents} />
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>1-{documents.length}</strong> of <strong>{documents.length}</strong> documents
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="letters">
        <Card>
          <CardHeader>
            <CardTitle>Letters</CardTitle>
            <CardDescription>All official letters and correspondence.</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentTable documents={documents.filter(d => d.category === 'Letters')} />
          </CardContent>
        </Card>
      </TabsContent>
       <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>All internal and external notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentTable documents={documents.filter(d => d.category === 'Notifications')} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="notesheets">
        <Card>
          <CardHeader>
            <CardTitle>Notesheets</CardTitle>
            <CardDescription>Internal notes and decision sheets.</CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentTable documents={documents.filter(d => d.category === 'Notesheets')} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
