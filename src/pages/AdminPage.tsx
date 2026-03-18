import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, Download, RefreshCw, FileSpreadsheet, Trash2, 
  Check, X, Edit2, AlertCircle, Search, Package, Clock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from 'sonner';
import type { ApiResponse, GiftSubmission, FulfillmentStatus } from '@shared/types';
import { format, isValid, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
export function AdminPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<GiftSubmission>>({});
  const [deletingItem, setDeletingItem] = useState<GiftSubmission | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const response = await fetch('/api/submissions');
      if (!response.ok) throw new Error('Network response was not ok');
      const json = await response.json() as ApiResponse<GiftSubmission[]>;
      return json.data || [];
    }
  });
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<GiftSubmission> }) => {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      const res = await response.json() as ApiResponse;
      if (!res.success) throw new Error(res.error || 'Update failed');
      return res;
    },
    onSuccess: () => {
      toast.success('Updated successfully!');
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update'),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
      const res = await response.json() as ApiResponse;
      if (!res.success) throw new Error(res.error || 'Delete failed');
      return res;
    },
    onSuccess: () => {
      toast.success('Submission deleted');
      setDeletingItem(null);
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete'),
  });
  const handleToggleStatus = (item: GiftSubmission) => {
    const newStatus: FulfillmentStatus = item.status === 'shipped' ? 'pending' : 'shipped';
    updateMutation.mutate({ id: item.id, updates: { status: newStatus } });
  };
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;
    try {
      const escape = (val: string | undefined | null) => `"${String(val ?? "").replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
      const headers = ['Date', 'Status', 'Rep', 'Name', 'Company', 'Email', 'Phone', 'Address'];
      const csvContent = [
        headers.join(','),
        ...data.map(s => [
          escape(s.createdAt),
          escape(s.status),
          escape(s.repName),
          escape(`${s.firstName} ${s.lastName}`),
          escape(s.company),
          escape(s.email),
          escape(s.phone),
          escape(s.address)
        ].join(','))
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `passover-fulfillment-${format(new Date(), 'yyyyMMdd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Export failed");
    }
  };
  const filteredAndSortedData = useMemo(() => {
    if (!data) return [];
    const filtered = data.filter(s => {
      const query = searchQuery.toLowerCase();
      return (
        s.firstName.toLowerCase().includes(query) ||
        s.lastName.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.company.toLowerCase().includes(query) ||
        s.repName.toLowerCase().includes(query)
      );
    });
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data, searchQuery]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 font-black text-lg hover:underline">
              <ArrowLeft className="w-5 h-5" /> Back Home
            </Link>
            <h1 className="text-5xl font-black">Fulfillment Center</h1>
          </div>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => refetch()} className="btn-playful bg-white px-6 py-3 flex items-center gap-2">
              <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} /> Refresh
            </button>
            <button onClick={handleExportCSV} disabled={!data?.length} className="btn-playful bg-playful-green px-8 py-3 flex items-center gap-2 text-white">
              <Download className="w-5 h-5" /> Export
            </button>
          </div>
        </div>
        <div className="relative group max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-black/40 group-focus-within:text-playful-blue transition-colors" />
          <input
            type="text"
            placeholder="Search by name, email, or company..."
            className="input-playful w-full pl-14 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {isError && (
          <div className="card-playful bg-playful-pink/10 text-playful-pink flex items-center gap-4">
            <AlertCircle className="w-8 h-8" />
            <p className="text-xl font-bold">Error loading submissions.</p>
          </div>
        )}
        <div className="card-playful bg-white overflow-hidden p-0 border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black">
                <TableRow className="hover:bg-black border-none">
                  <TableHead className="text-white font-black text-lg py-6 px-6">Status</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 px-6">Recipient</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 px-6">Rep</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 px-6">Address</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 px-6 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i} className="border-b-4 border-black h-24 animate-pulse bg-gray-50"><TableCell colSpan={5} /></TableRow>
                  ))
                ) : filteredAndSortedData.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-64 text-center font-black text-2xl text-black/30">No matching claims found.</TableCell></TableRow>
                ) : (
                  filteredAndSortedData.map((item) => {
                    const isEditing = editingId === item.id;
                    return (
                      <TableRow key={item.id} className="border-b-4 border-black hover:bg-gray-50 transition-colors">
                        <TableCell className="py-6 px-6">
                          <button
                            onClick={() => handleToggleStatus(item)}
                            className={cn(
                              "btn-playful px-4 py-2 text-xs uppercase tracking-tighter flex items-center gap-2",
                              item.status === 'shipped' ? "bg-playful-green text-white" : "bg-playful-yellow text-black"
                            )}
                          >
                            {item.status === 'shipped' ? <Package className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            {item.status}
                          </button>
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <div className="flex flex-col">
                            <span className="font-black text-xl">{item.firstName} {item.lastName}</span>
                            <span className="text-sm font-bold text-black/50">{item.company}</span>
                            <span className="text-xs font-mono text-black/40 mt-1">{item.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-6 px-6">
                          <span className="inline-block bg-playful-blue/10 border-2 border-black px-3 py-1 rounded-full text-sm font-black italic">
                            {item.repName}
                          </span>
                        </TableCell>
                        <TableCell className="py-6 px-6 max-w-xs">
                          <p className="text-sm font-bold line-clamp-2 italic text-black/70">"{item.address}"</p>
                        </TableCell>
                        <TableCell className="py-6 px-6 text-center">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => setDeletingItem(item)} className="btn-playful bg-playful-pink p-2 text-white">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent className="border-8 border-black rounded-[3rem] shadow-[15px_15px_0_0_#000]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black">Delete Claim?</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-bold">
              Are you sure you want to remove the gift claim for {deletingItem?.firstName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-4">
            <AlertDialogCancel className="btn-playful bg-white px-6">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingItem && deleteMutation.mutate(deletingItem.id)} className="btn-playful bg-playful-pink text-white px-6">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}