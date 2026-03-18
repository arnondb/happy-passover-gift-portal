import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Download, RefreshCw, Trash2,
  Search, Package, Clock, AlertCircle
} from 'lucide-react';
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
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
export function AdminPage() {
  const queryClient = useQueryClient();
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
      toast.success('Status updated!');
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
  const filteredData = useMemo(() => {
    if (!data) return [];
    return data
      .filter(s => {
        const query = searchQuery.toLowerCase();
        return (
          s.firstName.toLowerCase().includes(query) ||
          s.lastName.toLowerCase().includes(query) ||
          s.email.toLowerCase().includes(query) ||
          s.company.toLowerCase().includes(query) ||
          s.repName.toLowerCase().includes(query)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data, searchQuery]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 font-black text-xl hover:translate-x-[-4px] transition-transform">
              <ArrowLeft className="w-6 h-6" /> Back Home
            </Link>
            <h1 className="text-6xl font-black tracking-tight">Fulfillment Center</h1>
          </div>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => refetch()} className="btn-playful bg-white px-8 py-3 flex items-center gap-2">
              <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} /> Refresh
            </button>
            <button onClick={handleExportCSV} disabled={!data?.length} className="btn-playful bg-playful-green px-10 py-3 flex items-center gap-2 text-white">
              <Download className="w-5 h-5" /> Export CSV
            </button>
          </div>
        </div>
        <div className="relative group max-w-2xl">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-7 h-7 text-black group-focus-within:text-playful-blue transition-colors" />
          <input
            type="text"
            placeholder="Search claims..."
            className="input-playful w-full pl-16 text-xl h-16 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {isError && (
          <div className="card-playful bg-playful-pink/20 border-playful-pink flex items-center gap-4">
            <AlertCircle className="w-10 h-10 text-black" />
            <p className="text-2xl font-black">System error: Unable to load claims.</p>
          </div>
        )}
        <div className="card-playful bg-white p-0 overflow-hidden border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black">
                <TableRow className="hover:bg-black border-none h-20">
                  <TableHead className="text-white font-black text-xl px-8">Status</TableHead>
                  <TableHead className="text-white font-black text-xl px-8">Recipient Info</TableHead>
                  <TableHead className="text-white font-black text-xl px-8">Referrer</TableHead>
                  <TableHead className="text-white font-black text-xl px-8">Shipping Address</TableHead>
                  <TableHead className="text-white font-black text-xl px-8 text-center">Manage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b-4 border-black h-28 animate-pulse bg-gray-50"><TableCell colSpan={5} /></TableRow>
                  ))
                ) : filteredData.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-80 text-center font-black text-3xl text-black/20">NO CLAIMS FOUND</TableCell></TableRow>
                ) : (
                  filteredData.map((item) => (
                    <TableRow key={item.id} className="border-b-4 border-black last:border-0 hover:bg-gray-50/50 transition-colors h-28">
                      <TableCell className="px-8">
                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={cn(
                            "btn-playful px-4 py-2 text-xs uppercase tracking-widest flex items-center gap-2 active:scale-95",
                            item.status === 'shipped' ? "bg-playful-green text-white" : "bg-playful-yellow text-black"
                          )}
                        >
                          {item.status === 'shipped' ? <Package className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          {item.status}
                        </button>
                      </TableCell>
                      <TableCell className="px-8">
                        <div className="flex flex-col">
                          <span className="font-black text-2xl">{item.firstName} {item.lastName}</span>
                          <span className="text-sm font-black text-black/40 uppercase tracking-tighter">{item.company}</span>
                          <span className="text-xs font-mono font-bold text-playful-blue mt-1">{item.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-8">
                        <span className="inline-block bg-white border-4 border-black px-4 py-1 rounded-full text-sm font-black italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                          {item.repName}
                        </span>
                      </TableCell>
                      <TableCell className="px-8 max-w-xs">
                        <p className="text-sm font-black leading-tight text-black/80">{item.address}</p>
                      </TableCell>
                      <TableCell className="px-8 text-center">
                        <button 
                          onClick={() => setDeletingItem(item)} 
                          className="btn-playful bg-playful-pink p-3 text-white hover:bg-red-600 transition-colors"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <AlertDialog open={!!deletingItem} onOpenChange={() => setDeletingItem(null)}>
        <AlertDialogContent className="border-8 border-black rounded-[3rem] shadow-[20px_20px_0_0_#000] p-10 max-w-xl">
          <AlertDialogHeader className="space-y-4">
            <AlertDialogTitle className="text-5xl font-black leading-tight">Delete Claim?</AlertDialogTitle>
            <AlertDialogDescription className="text-2xl font-black text-black/70">
              Are you absolutely sure you want to remove the gift claim for <span className="text-playful-pink">{deletingItem?.firstName}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-10 gap-6">
            <AlertDialogCancel className="btn-playful bg-white px-8 py-4 text-xl flex-1">Keep it</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingItem && deleteMutation.mutate(deletingItem.id)} 
              className="btn-playful bg-playful-pink text-white px-8 py-4 text-xl flex-1"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}