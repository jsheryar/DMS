
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
import { getCurrentUser, isAdmin, isDataEntryOperator } from '@/lib/auth';
import { addLog } from '@/lib/logs';

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
      // Fallback for initial documents without a file
      alert(`Title: ${doc.title}\nDescription: ${doc.description}\nKeywords: ${doc.keywords}\nDate: ${doc.date}`);
    }
  };

  return (
    <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleView(); }}>
      <Eye className="mr-2 h-4 w-4" />View
    </DropdownMenuItem>
  );
}


function DocumentTable({ documents: tableDocs }: { documents: Document[] }) {
  const { toast } = useToast();
  const [canView, setCanView] = React.useState(false);

  React.useEffect(() => {
    const user = getCurrentUser();
    if(user) {
        setCanView(true);
    }
  }, []);

  const handleDownload = (doc: Document) => {
    if (doc.fileUrl && doc.fileName) {
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
    } else {
      toast({
        variant: 'destructive',
        title: 'Download Failed',
        description: 'This document does not have a file available for download.',
      });
    }
  };

  return (
    <>
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
          {tableDocs.length > 0 ? tableDocs.map((doc) => (
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
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No documents found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
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

function AdvancedFilterDialog({ applyFilters }: { applyFilters: (filters: any) => void }) {
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [date, setDate] = React.useState('');
  const [categories] = useLocalStorage<string[]>('categories', initialCategories);

  const handleApply = () => {
    applyFilters({ title, category, date });
    setOpen(false);
  };
  
  const handleClear = () => {
    setTitle('');
    setCategory('');
    setDate('');
    applyFilters({ title: '', category: '', date: '' });
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <ListFilter className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
          <DialogDescription>Filter documents by specific criteria.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="filter-title" className="text-right">Title</Label>
            <Input id="filter-title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" placeholder="Document title" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="filter-category" className="text-right">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Any Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any Category</SelectItem>
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="filter-date" className="text-right">Date</Label>
            <Input id="filter-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClear}>Clear</Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


// Custom hook for localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [storedValue, setStoredValue] = React.useState<T>(() => initialValue);
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            } else {
                 window.localStorage.setItem(key, JSON.stringify(initialValue));
                 setStoredValue(initialValue);
            }
        } catch (error) {
            console.log(error);
            setStoredValue(initialValue);
        }
    }, [key, initialValue]);
    
    React.useEffect(() => {
      if (isMounted) {
        const handleStorageChange = () => {
          try {
            const item = window.localStorage.getItem(key);
            if (item) {
              setStoredValue(JSON.parse(item));
            }
          } catch (error) {
            console.log(error);
          }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
      }
    }, [isMounted, key]);


    const setValue = (value: T | ((val: T) => T)) => {
        if (!isMounted) return;
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            // Manually dispatch a storage event so other tabs can update.
            window.dispatchEvent(new StorageEvent('storage', { key }));
        } catch (error) {
            console.log(error);
        }
    };
    
    // Return initialValue on server-side
    if (!isMounted) {
      return [initialValue, () => {}];
    }

    return [storedValue, setValue];
}


function DashboardPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [documents, setDocuments] = useLocalStorage<Document[]>('documents', initialDocuments);
  const [categories, setCategories] = useLocalStorage<string[]>('categories', initialCategories);
  const [isAdminOrOperator, setIsAdminOrOperator] = React.useState(false);
  const [isAdminUser, setIsAdminUser] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);
  const [advancedFilters, setAdvancedFilters] = React.useState({ title: '', category: '', date: '' });

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

      const matchesAdvancedFilters = 
        (!advancedFilters.title || doc.title.toLowerCase().includes(advancedFilters.title.toLowerCase())) &&
        (!advancedFilters.category || doc.category === advancedFilters.category) &&
        (!advancedFilters.date || doc.date === advancedFilters.date);

      return matchesSearchQuery && matchesAdvancedFilters;
    });
  }, [documents, searchQuery, advancedFilters]);

  const documentsForCurrentTab = React.useMemo(() => {
    if (tab === 'all') {
      return filteredDocuments;
    }
    return filteredDocuments.filter(d => d.category.toLowerCase() === tab);
  }, [filteredDocuments, tab]);


  const totalDocs = documents.length;
  const lettersCount = documents.filter(d => d.category === 'Letters').length;
  const notificationsCount = documents.filter(d => d.category === 'Notifications').length;
  const notesheetsCount = documents.filter(d => d.category === 'Notesheets').length;
  
  if (!isMounted) {
    return <div>Loading...</div>;
  }

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

      <Tabs defaultValue="all" value={tab} onValueChange={handleTabChange}>
        <div className="flex items-center">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {categories.map(cat => (
              <TabsTrigger key={cat} value={cat.toLowerCase()} className={cat.length > 10 ? "hidden sm:flex" : ""}>{cat}</TabsTrigger>
            ))}
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <AdvancedFilterDialog applyFilters={setAdvancedFilters} />
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
              <DocumentTable documents={documentsForCurrentTab} />
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
                <DocumentTable documents={documentsForCurrentTab} />
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
