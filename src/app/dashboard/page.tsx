'use client';

import * as React from 'react';
import {
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Download,
  Send,
  Eye,
  FileText,
  Bell,
  StickyNote,
  File,
  Plus,
  Trash2,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';

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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';


const initialDocuments: Document[] = [
  {
    id: 'DOC-001',
    title: 'Quarterly Financial Report Q2 2023',
    category: 'Letters',
    date: '2023-06-30',
    description: 'Detailed financial report for the second quarter of 2023.',
    keywords: 'finance, report, q2',
  },
  {
    id: 'DOC-002',
    title: 'New Office Safety Protocols',
    category: 'Notifications',
    date: '2023-07-15',
    description: 'Updated safety protocols for all office employees.',
    keywords: 'safety, office, protocols',
  },
  {
    id: 'DOC-003',
    title: 'Project Alpha - Phase 1 Approval',
    category: 'Notesheets',
    date: '2023-07-20',
    description: 'Approval notesheet for the first phase of Project Alpha.',
    keywords: 'project alpha, approval, phase 1',
  },
  {
    id: 'DOC-004',
    title: 'Employee Onboarding Feedback Form',
    category: 'Letters',
    date: '2023-08-01',
    description: 'Form for new employees to provide feedback on the onboarding process.',
    keywords: 'onboarding, feedback, employee',
  },
  {
    id: 'DOC-005',
    title: 'Company Holiday Schedule 2024',
    category: 'Notifications',
    date: '2023-08-05',
    description: 'The official company holiday schedule for the year 2024.',
    keywords: 'holiday, schedule, 2024',
  },
];

const initialCategories = [
  'Letters', 'Notifications', 'Notesheets'
]

const categoryBadgeVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Letters: 'secondary',
  Notifications: 'default',
  Notesheets: 'outline',
};

function ViewDocumentDialog({ document }: { document: Document }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
          <Eye className="mr-2 h-4 w-4" />View
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{document.title}</DialogTitle>
          <DialogDescription>
            Document ID: {document.id}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Category</Label>
            <div className="col-span-3">
              <Badge variant={categoryBadgeVariant[document.category] || 'default'}>
                {document.category}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Date</Label>
            <span className="col-span-3 text-sm">{document.date}</span>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-1">Description</Label>
            <p className="col-span-3 text-sm">{document.description}</p>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-1">Keywords</Label>
            <p className="col-span-3 text-sm">{document.keywords}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DocumentTable({ documents: tableDocs }: { documents: Document[] }) {
  const { toast } = useToast();

  const handleAction = (action: 'download' | 'forward', docTitle: string) => {
    toast({
      title: `${action === 'download' ? 'Download Started' : 'Forwarding Initiated'}`,
      description: `The document "${docTitle}" is being prepared. This is a simulated action.`,
    });
  };

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
                  <ViewDocumentDialog document={doc} />
                  <DropdownMenuItem onClick={() => handleAction('download', doc.title)}><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('forward', doc.title)}><Send className="mr-2 h-4 w-4" />Forward</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function UploadDocumentDialog({ categories, onUpload }: { categories: string[], onUpload: (doc: Document) => void }) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [keywords, setKeywords] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !description || !keywords || !file) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill out all fields to upload a document.",
      });
      return;
    }

    const newDocument: Document = {
      id: `DOC-${String(Date.now()).slice(-3)}`,
      title,
      category,
      date: new Date().toISOString().split('T')[0],
      description,
      keywords,
    };
    onUpload(newDocument);
    toast({
      title: "Document Uploaded",
      description: `${title} has been successfully uploaded.`,
    });

    // Reset form and close dialog
    setTitle('');
    setCategory('');
    setDescription('');
    setKeywords('');
    setFile(null);
    setOpen(false);
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Upload Document
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Add a new document to your repository. Select a file and fill in the details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Q3 Marketing Report" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description of the document." className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="keywords" className="text-right">
                Keywords
              </Label>
              <Input id="keywords" value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="e.g., finance, report, q3" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document" className="text-right">
                File
              </Label>
              <Input id="document" type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Upload</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ManageCategoriesDialog({ categories, setCategories }: { categories: string[], setCategories: React.Dispatch<React.SetStateAction<string[]>> }) {
  const { toast } = useToast();
  const [newCategory, setNewCategory] = React.useState('');

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory('');
      toast({ title: 'Category added', description: `"${newCategory}" has been added.` });
    } else if (categories.includes(newCategory)) {
      toast({ variant: "destructive", title: 'Category exists', description: 'This category already exists.' });
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(c => c !== categoryToRemove));
    toast({ title: 'Category removed', description: `"${categoryToRemove}" has been removed.` });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <ListFilter className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Manage Categories
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>Add or remove document categories.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category name"
            />
            <Button onClick={handleAddCategory}><Plus className="h-4 w-4 mr-2" />Add</Button>
          </div>
          <div className="space-y-2">
            <Label>Existing Categories</Label>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
              {categories.map(category => (
                <div key={category} className="flex items-center justify-between rounded-md border p-2">
                  <span>{category}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveCategory(category)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DashboardPageContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const [documents, setDocuments] = React.useState<Document[]>(initialDocuments);
  const [categories, setCategories] = React.useState<string[]>(initialCategories);

  const handleUpload = (newDocument: Document) => {
    setDocuments(prev => [newDocument, ...prev]);
  };

  const totalDocs = documents.length;
  const lettersCount = documents.filter(d => d.category === 'Letters').length;
  const notificationsCount = documents.filter(d => d.category === 'Notifications').length;
  const notesheetsCount = documents.filter(d => d.category === 'Notesheets').length;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 mb-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Letters</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lettersCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notesheets</CardTitle>
            <StickyNote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notesheetsCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" value={tab || 'all'}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat.toLowerCase()} className={cat.length > 10 ? "hidden sm:flex" : ""}>{cat}</TabsTrigger>
            ))}
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <ManageCategoriesDialog categories={categories} setCategories={setCategories} />
            <UploadDocumentDialog categories={categories} onUpload={handleUpload} />
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
        {categories.map(cat => (
           <TabsContent key={cat} value={cat.toLowerCase()}>
            <Card>
              <CardHeader>
                <CardTitle>{cat}</CardTitle>
                <CardDescription>All documents categorized as {cat}.</CardDescription>
              </CardHeader>
              <CardContent>
                <DocumentTable documents={documents.filter(d => d.category === cat)} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <DashboardPageContent />
    </React.Suspense>
  )
}
