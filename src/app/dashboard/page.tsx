
'use client';

import * as React from 'react';
import {
  ListFilter,
  MoreHorizontal,
  PlusCircle,
  Download,
  Eye,
  FileText,
  Bell,
  StickyNote,
  File,
  Plus,
  Trash2,
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend, Cell } from 'recharts';


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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Document } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser, isAdmin, isDataEntryOperator } from '@/lib/auth';
import { addLog } from '@/lib/logs';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Checkbox } from '@/components/ui/checkbox';

const initialDocuments: Document[] = [
    {
    id: 'DOC-001',
    title: 'Quarterly Financial Report Q2 2023',
    category: 'Letters',
    date: '2023-06-30',
    description: 'Detailed financial report for the second quarter of 2023.',
    keywords: 'finance, report, q2',
    fileUrl: 'data:text/plain;base64,VGhpcyBpcyBhIHNhbXBsZSB0ZXh0IGRvY3VtZW50Lg==',
    fileName: 'sample.txt',
  },
  {
    id: 'DOC-002',
    title: 'New Office Safety Protocols',
    category: 'Notifications',
    date: '2023-07-15',
    description: 'Updated safety protocols for all office employees.',
    keywords: 'safety, office, protocols',
    fileUrl: 'data:text/plain;base64,VGhpcyBpcyBhIHNhbXBsZSB0ZXh0IGRvY3VtZW50Lg==',
    fileName: 'sample.txt',
  },
  {
    id: 'DOC-003',
    title: 'Project Alpha - Phase 1 Approval',
    category: 'Notesheets',
    date: '2023-07-20',
    description: 'Approval notesheet for the first phase of Project Alpha.',
    keywords: 'project alpha, approval, phase 1',
    fileUrl: 'data:text/plain;base64,VGhpcyBpcyBhIHNhbXBsZSB0ZXh0IGRvY3VtZW50Lg==',
    fileName: 'sample.txt',
  },
  {
    id: 'DOC-004',
    title: 'Employee Onboarding Feedback Form',
    category: 'Letters',
    date: '2023-08-01',
    description: 'Form for new employees to provide feedback on the onboarding process.',
    keywords: 'onboarding, feedback, employee',
    fileUrl: 'data:text/plain;base64,VGhpcyBpcyBhIHNhbXBsZSB0ZXh0IGRvY3VtZW50Lg==',
    fileName: 'sample.txt',
  },
  {
    id: 'DOC-005',
    title: 'Company Holiday Schedule 2024',
    category: 'Notifications',
    date: '2023-08-05',
    description: 'The official company holiday schedule for the year 2024.',
    keywords: 'holiday, schedule, 2024',
    fileUrl: 'data:text/plain;base64,VGhpcyBpcyBhIHNhbXBsZSB0ZXh0IGRvY3VtZW50Lg==',
    fileName: 'sample.txt',
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

function ViewDocumentDialog({ document: doc }: { document: Document }) {
  const { toast } = useToast();
  const handleView = () => {
    if (doc.fileUrl) {
       try {
        const isDataUrl = doc.fileUrl.startsWith('data:');
        if (isDataUrl) {
            const newWindow = window.open();
            if (newWindow) {
                // For PDF, we can use an iframe
                if (doc.fileUrl.startsWith('data:application/pdf')) {
                    newWindow.document.write(`<iframe src="${doc.fileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                } else if (doc.fileUrl.match(/^data:image\//)) {
                    newWindow.document.write(`<img src="${doc.fileUrl}" style="max-width: 100%;" />`);
                } else {
                     newWindow.document.write(`<p>Cannot preview this file type. Please download to view.</p><a href="${doc.fileUrl}" download="${doc.fileName || 'download'}">Download</a>`);
                }
            } else {
                 toast({ variant: 'destructive', title: "Popup blocked", description: "Please allow popups for this site to view the document." });
            }
        } else {
            // It's a regular URL
            window.open(doc.fileUrl, '_blank');
        }
       } catch (e) {
          console.error(e);
          toast({ variant: 'destructive', title: "Error", description: "Could not open the file." });
       }
    } else {
      toast({
        variant: 'destructive',
        title: 'File not found',
        description: 'The file for this document could not be found. It might have been moved or deleted.',
      });
    }
  };

  return (
    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleView(); }}>
      <Eye className="mr-2 h-4 w-4" />View
    </DropdownMenuItem>
  );
}


function DocumentTable({ documents: tableDocs, onDocumentsChange }: { documents: Document[], onDocumentsChange: (docs: Document[]) => void }) {
  const { toast } = useToast();
  const [canView, setCanView] = React.useState(false);
  const [isAdminUser, setIsAdminUser] = React.useState(false);
  const [selectedDocuments, setSelectedDocuments] = React.useState<string[]>([]);
  const [documentToDelete, setDocumentToDelete] = React.useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = React.useState(false);

  React.useEffect(() => {
    const user = getCurrentUser();
    if(user) {
        setCanView(true);
        setIsAdminUser(isAdmin());
    }
  }, []);

  const allDocuments = useLocalStorage<Document[]>('documents', initialDocuments)[0];

  const handleSetDocumentToDelete = (docId: string) => {
    setDocumentToDelete(docId);
    setIsAlertOpen(true);
  }

  const handleDelete = () => {
    if (!documentToDelete) return;

    const updatedDocs = allDocuments.filter(d => d.id !== documentToDelete);
    onDocumentsChange(updatedDocs);

    addLog('Document Deleted', { documentId: documentToDelete });
    toast({
        title: "Document Deleted",
        description: "The document has been successfully deleted.",
    });
    setDocumentToDelete(null);
    setIsAlertOpen(false);
  };
  
  const handleBulkDelete = () => {
    const updatedDocs = allDocuments.filter(d => !selectedDocuments.includes(d.id));
    onDocumentsChange(updatedDocs);
    addLog('Bulk Documents Deleted', { documentIds: selectedDocuments });
    toast({
        title: "Documents Deleted",
        description: `${selectedDocuments.length} documents have been successfully deleted.`,
    });
    setSelectedDocuments([]);
    setIsBulkDeleteAlertOpen(false);
  };

  const handleDownload = (doc: Document) => {
    if (doc.fileUrl && doc.fileName) {
      try {
        const link = document.createElement('a');
        link.href = doc.fileUrl;
        link.download = doc.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: 'Download Started',
          description: `Your download for "${doc.title}" has started.`,
        });
        addLog('Document Downloaded', { documentId: doc.id, documentTitle: doc.title });
      } catch (e) {
        console.error(e);
        toast({
          variant: 'destructive',
          title: 'Download Failed',
          description: 'An error occurred while trying to download the file.',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'This document does not have a file available for download.',
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDocuments(tableDocs.map(d => d.id));
    } else {
      setSelectedDocuments([]);
    }
  };

  const handleSelectRow = (docId: string, checked: boolean) => {
    if (checked) {
      setSelectedDocuments(prev => [...prev, docId]);
    } else {
      setSelectedDocuments(prev => prev.filter(id => id !== docId));
    }
  };
  
  const numSelected = selectedDocuments.length;
  const rowCount = tableDocs.length;

  return (
    <>
      {isAdminUser && numSelected > 0 && (
          <div className="flex items-center gap-2 mb-4 px-1">
              <Button variant="destructive" onClick={() => setIsBulkDeleteAlertOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected ({numSelected})
              </Button>
              <span className="text-sm text-muted-foreground">
                  {numSelected} of {rowCount} row(s) selected.
              </span>
          </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            {isAdminUser && (
                <TableHead padding="checkbox">
                    <Checkbox
                        checked={rowCount > 0 && numSelected === rowCount}
                        onCheckedChange={(checked) => handleSelectAll(Boolean(checked))}
                        aria-label="Select all"
                    />
                </TableHead>
            )}
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
          {tableDocs.length > 0 ? tableDocs.map((doc) => (
            <TableRow key={doc.id} data-state={selectedDocuments.includes(doc.id) && "selected"}>
              {isAdminUser && (
                  <TableCell padding="checkbox">
                      <Checkbox
                          checked={selectedDocuments.includes(doc.id)}
                          onCheckedChange={(checked) => handleSelectRow(doc.id, Boolean(checked))}
                          aria-label="Select row"
                      />
                  </TableCell>
              )}
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
                {canView && (
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
                      <DropdownMenuItem onClick={() => handleDownload(doc)}><Download className="mr-2 h-4 w-4" />Download</DropdownMenuItem>
                       {isAdminUser && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              handleSetDocumentToDelete(doc.id);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={isAdminUser ? 6 : 5} className="h-24 text-center">
                No documents found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the document.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDocumentToDelete(null)}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={isBulkDeleteAlertOpen} onOpenChange={setIsBulkDeleteAlertOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the {numSelected} selected documents.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkDelete}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
       </AlertDialog>
    </>
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

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !category || !description || !keywords || !file) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please fill out all fields to upload a document.",
      });
      return;
    }

    try {
        const fileUrl = await fileToDataUrl(file);

        const newDocument: Document = {
            id: `DOC-${String(Date.now()).slice(-5)}`,
            title,
            category,
            date: new Date().toISOString().split('T')[0],
            description,
            keywords,
            fileName: file.name,
            fileUrl,
        };

        onUpload(newDocument);
        addLog('Document Uploaded', { documentId: newDocument.id, documentTitle: newDocument.title });
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

    } catch (error) {
        console.error("Error converting file to data URL", error);
        toast({
            variant: "destructive",
            title: "File Upload Failed",
            description: "There was an error processing your file. Please try again.",
        });
    }
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
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

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
  
  if (!isMounted) return null;

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
  const router = useRouter();
  const [documents, setDocuments] = useLocalStorage<Document[]>('documents', initialDocuments);
  const [categories, setCategories] = useLocalStorage<string[]>('categories', initialCategories);
  const [isAdminOrOperator, setIsAdminOrOperator] = React.useState(false);
  const [isAdminUser, setIsAdminUser] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  const tab = searchParams.get('tab') || 'all';
  const searchQuery = searchParams.get('q') || '';

  React.useEffect(() => {
    setIsMounted(true);
    const user = getCurrentUser();
    if (!user) {
      router.push('/');
    } else {
        const admin = isAdmin();
        setIsAdminUser(admin);
        setIsAdminOrOperator(admin || isDataEntryOperator());
    }
  }, [router]);
  
  const handleUpload = (newDocument: Document) => {
    setDocuments(prev => [newDocument, ...prev]);
  };

  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', value);
    router.push(`/dashboard?${params.toString()}`);
  };

  const filteredDocuments = React.useMemo(() => {
    return documents.filter(doc => {
      const matchesSearchQuery = searchQuery
        ? doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.keywords.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      return matchesSearchQuery;
    });
  }, [documents, searchQuery]);

  const documentsForCurrentTab = React.useMemo(() => {
    if (tab === 'all') {
      return filteredDocuments;
    }
    return filteredDocuments.filter(d => d.category.toLowerCase() === tab);
  }, [filteredDocuments, tab]);


  const categoryCounts = React.useMemo(() => {
    const counts: { [key: string]: number } = {};
    categories.forEach(cat => {
      counts[cat] = 0;
    });
    documents.forEach(doc => {
      if (counts[doc.category] !== undefined) {
        counts[doc.category]++;
      }
    });
    return counts;
  }, [documents, categories]);

  const chartData = React.useMemo(() => {
    return categories.map(cat => ({
      name: cat,
      documents: categoryCounts[cat] || 0,
    }));
  }, [categories, categoryCounts]);

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  if (!isMounted) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Letters</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryCounts['Letters'] || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryCounts['Notifications'] || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notesheets</CardTitle>
            <StickyNote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryCounts['Notesheets'] || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Document Overview</CardTitle>
            <CardDescription>A bar chart showing the number of documents per category.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`}/>
                  <Tooltip cursor={{fill: 'hsl(var(--muted))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                  <Bar dataKey="documents" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
             <CardDescription>A pie chart showing the document distribution.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={chartData} dataKey="documents" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                   {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}/>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" value={tab} onValueChange={handleTabChange}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat.toLowerCase()} className={cat.length > 10 ? "hidden sm:flex" : ""}>{cat}</TabsTrigger>
            ))}
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
             {isAdminUser && (
              <ManageCategoriesDialog categories={categories} setCategories={setCategories} />
             )}
             {isAdminOrOperator && (
              <UploadDocumentDialog categories={categories} onUpload={handleUpload} />
             )}
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
              <DocumentTable documents={documentsForCurrentTab} onDocumentsChange={setDocuments} />
            </CardContent>
            <CardFooter>
              <div className="text-xs text-muted-foreground">
                Showing <strong>1-{documentsForCurrentTab.length}</strong> of <strong>{documentsForCurrentTab.length}</strong> documents
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
                <DocumentTable documents={documentsForCurrentTab} onDocumentsChange={setDocuments} />
              </CardContent>
               <CardFooter>
                 <div className="text-xs text-muted-foreground">
                    Showing <strong>1-{documentsForCurrentTab.length}</strong> of <strong>{documentsForCurrentTab.length}</strong> documents
                 </div>
                </CardFooter>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <DashboardPageContent />
    </React.Suspense>
  )
}

    