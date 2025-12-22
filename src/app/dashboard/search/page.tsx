
'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Document } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
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
import { MoreHorizontal, Download, Eye, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addLog } from '@/lib/logs';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { Checkbox } from '@/components/ui/checkbox';
import * as XLSX from 'xlsx';

const initialDocuments: Document[] = [];
const initialCategories: string[] = ['Letters', 'Notifications', 'Notesheets'];

const categoryBadgeVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Letters: 'secondary',
  Notifications: 'default',
  Notesheets: 'outline',
};


function ViewDocumentDialog({ document: doc }: { document: Document }) {
  const { toast } = useToast();

  const renderExcelAsHtml = (dataUrl: string): string => {
    const base64 = dataUrl.split(',')[1];
    const workbook = XLSX.read(base64, { type: 'base64' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const html = XLSX.utils.sheet_to_html(worksheet);
    return `
      <html>
        <head>
          <title>${doc.fileName || 'Excel Preview'}</title>
          <style>
            body { font-family: sans-serif; }
            table { border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            thead { background-color: #f2f2f2; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `;
  };

  const handleView = () => {
    if (doc.fileUrl) {
       try {
        const isDataUrl = doc.fileUrl.startsWith('data:');
        if (isDataUrl) {
            const newWindow = window.open();
            if (newWindow) {
                const isExcel = doc.fileName?.match(/\.(xlsx|xls)$/i);

                if (doc.fileUrl.startsWith('data:application/pdf')) {
                    newWindow.document.write(`<iframe src="${doc.fileUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                } else if (doc.fileUrl.match(/^data:image\//)) {
                    newWindow.document.write(`<img src="${doc.fileUrl}" style="max-width: 100%;" />`);
                } else if (isExcel) {
                    const htmlContent = renderExcelAsHtml(doc.fileUrl);
                    newWindow.document.write(htmlContent);
                    newWindow.document.close();
                } else {
                     newWindow.document.write(`
                        <div style="font-family: sans-serif; padding: 2rem;">
                            <p>Cannot preview this file type. Please download to view.</p>
                            <a href="${doc.fileUrl}" download="${doc.fileName || 'download'}" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
                                Download
                            </a>
                        </div>
                     `);
                }
            } else {
                 toast({ variant: 'destructive', title: "Popup blocked", description: "Please allow popups for this site to view the document." });
            }
        } else {
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


function ResultsTable({ documents: tableDocs, onDocumentsChange }: { documents: Document[], onDocumentsChange: (docs: Document[]) => void; }) {
  const { toast } = useToast();
  const [isAdminUser, setIsAdminUser] = React.useState(false);
  const [selectedDocuments, setSelectedDocuments] = React.useState<string[]>([]);
  const [documentToDelete, setDocumentToDelete] = React.useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = React.useState(false);
  const [allDocuments, setAllDocuments] = useLocalStorage<Document[]>('documents', initialDocuments);
  

  React.useEffect(() => {
    setIsAdminUser(isAdmin());
  }, []);
  
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
  
    const handleSetDocumentToDelete = (docId: string) => {
        setDocumentToDelete(docId);
        setIsAlertOpen(true);
    };

    const handleDelete = () => {
        if (!documentToDelete) return;
        const updatedDocs = allDocuments.filter(d => d.id !== documentToDelete);
        setAllDocuments(updatedDocs);
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
        setAllDocuments(updatedDocs);
        onDocumentsChange(updatedDocs);
        addLog('Bulk Documents Deleted', { documentIds: selectedDocuments });
        toast({
            title: "Documents Deleted",
            description: `${selectedDocuments.length} documents have been successfully deleted.`,
        });
        setSelectedDocuments([]);
        setIsBulkDeleteAlertOpen(false);
    };
    
    const handleSelectAll = (checked: boolean) => {
        setSelectedDocuments(checked ? tableDocs.map(d => d.id) : []);
    };

    const handleSelectRow = (docId: string, checked: boolean) => {
        setSelectedDocuments(prev => 
            checked ? [...prev, docId] : prev.filter(id => id !== docId)
        );
    };

    const numSelected = selectedDocuments.length;
    const rowCount = tableDocs.length;


  return (
    <Card>
        <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>{tableDocs.length} document(s) found.</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <TableHead className="hidden w-[100px] sm:table-cell">ID</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {tableDocs.length > 0 ? (
                    tableDocs.map((doc) => (
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
                        <TableCell className="hidden sm:table-cell font-medium">{doc.id}</TableCell>
                        <TableCell className="font-medium">{doc.title}</TableCell>
                        <TableCell>
                            <Badge variant={categoryBadgeVariant[doc.category] || 'default'}>{doc.category}</Badge>
                        </TableCell>
                        <TableCell>{doc.date}</TableCell>
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
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={isAdminUser ? 6 : 5} className="h-24 text-center">
                        No results. Try refining your search.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </CardContent>
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
    </Card>
  );
}

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [documents, setDocuments] = useLocalStorage<Document[]>('documents', initialDocuments);
    const [categories] = useLocalStorage<string[]>('categories', initialCategories);

    const [title, setTitle] = React.useState(searchParams.get('title') || searchParams.get('q') || '');
    const [category, setCategory] = React.useState(searchParams.get('category') || '');
    const [date, setDate] = React.useState(searchParams.get('date') || '');
    const [keywords, setKeywords] = React.useState(searchParams.get('keywords') || '');
    
    const [filteredDocuments, setFilteredDocuments] = React.useState<Document[]>([]);

    const performSearch = React.useCallback(() => {
        const results = documents.filter(doc => {
            const matchesTitle = title ? doc.title.toLowerCase().includes(title.toLowerCase()) : true;
            const matchesCategory = category ? doc.category === category : true;
            const matchesDate = date ? doc.date === date : true;
            const matchesKeywords = keywords ? doc.keywords.toLowerCase().includes(keywords.toLowerCase()) : true;
            const generalQuery = searchParams.get('q');
            const matchesGeneralQuery = generalQuery ? (
                doc.title.toLowerCase().includes(generalQuery.toLowerCase()) ||
                doc.description.toLowerCase().includes(generalQuery.toLowerCase()) ||
                doc.keywords.toLowerCase().includes(generalQuery.toLowerCase())
            ) : true;

            return matchesTitle && matchesCategory && matchesDate && matchesKeywords && matchesGeneralQuery;
        });
        setFilteredDocuments(results);
    }, [documents, title, category, date, keywords, searchParams]);
    
    // This effect ensures that when the global documents state changes (e.g., after deletion),
    // the search results are updated accordingly.
    React.useEffect(() => {
        performSearch();
    }, [documents, performSearch]);

    // Perform search on initial load and when search params change
    React.useEffect(() => {
        performSearch();
    }, [performSearch, searchParams]);

    React.useEffect(() => {
        const user = getCurrentUser();
        if (!user) {
            router.push('/');
        }
    }, [router]);


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams);
        if (title) params.set('title', title); else params.delete('title');
        if (category) params.set('category', category); else params.delete('category');
        if (date) params.set('date', date); else params.delete('date');
        if (keywords) params.set('keywords', keywords); else params.delete('keywords');
        // Clear the general 'q' param if we're doing a specific search from this page
        params.delete('q');

        router.replace(`/dashboard/search?${params.toString()}`);
    };

    const handleClear = () => {
        setTitle('');
        setCategory('');
        setDate('');
        setKeywords('');
        router.replace('/dashboard/search');
    };
    
    const handleCategoryChange = (value: string) => {
      // The "all" value is used to clear the filter.
      if (value === "all") {
        setCategory("");
      } else {
        setCategory(value);
      }
    };

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>Advanced Document Search</CardTitle>
                <CardDescription>
                    Fill in any of the fields below to filter your documents.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSearch}>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="e.g., Financial Report" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Category</Label>
                        <Select value={category} onValueChange={handleCategoryChange}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="date">Date</Label>
                        <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="keywords">Keywords</Label>
                        <Input id="keywords" placeholder="e.g., report, q3, finance" value={keywords} onChange={e => setKeywords(e.target.value)} />
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={handleClear}>Clear</Button>
                    <Button type="submit">Search</Button>
                </CardFooter>
            </form>
        </Card>

        <ResultsTable documents={filteredDocuments} onDocumentsChange={setDocuments} />
    </div>
  );
}
