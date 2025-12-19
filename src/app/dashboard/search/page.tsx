
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
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addLog } from '@/lib/logs';
import { getCurrentUser } from '@/lib/auth';

const initialDocuments: Document[] = [];
const initialCategories: string[] = ['Letters', 'Notifications', 'Notesheets'];

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


function ResultsTable({ documents: tableDocs }: { documents: Document[] }) {
  const { toast } = useToast();
  
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

  return (
    <Card>
        <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>{tableDocs.length} document(s) found.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
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
                    <TableRow key={doc.id}>
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
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No results. Try refining your search.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
  );
}

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [documents] = useLocalStorage<Document[]>('documents', initialDocuments);
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
            const matchesGeneralQuery = searchParams.get('q') ? (
                doc.title.toLowerCase().includes(searchParams.get('q')!.toLowerCase()) ||
                doc.description.toLowerCase().includes(searchParams.get('q')!.toLowerCase()) ||
                doc.keywords.toLowerCase().includes(searchParams.get('q')!.toLowerCase())
            ) : true;

            return matchesTitle && matchesCategory && matchesDate && matchesKeywords && matchesGeneralQuery;
        });
        setFilteredDocuments(results);
    }, [documents, title, category, date, keywords, searchParams]);

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
        const params = new URLSearchParams();
        if (title) params.set('title', title);
        if (category) params.set('category', category);
        if (date) params.set('date', date);
        if (keywords) params.set('keywords', keywords);
        // Clear the general 'q' param if we're doing a specific search
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
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger id="category">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Categories</SelectItem>
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

        <ResultsTable documents={filteredDocuments} />
    </div>
  );
}
