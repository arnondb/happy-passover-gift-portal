import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, FileSpreadsheet, Trash2, Check, X, Edit2, AlertCircle } from 'lucide-react';
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
import type { ApiResponse, GiftSubmission } from '@shared/types';
import { format, isValid, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
export function AdminPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<GiftSubmission>>({});
  const [deletingItem, setDeletingItem] = useState<GiftSubmission | null>(null);
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
      toast.success('Submission updated!');
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update submission'),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
      });
      const res = await response.json() as ApiResponse;
      if (!res.success) throw new Error(res.error || 'Delete failed');
      return res;
    },
    onSuccess: () => {
      toast.success('Submission deleted');
      setDeletingItem(null);
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete submission'),
  });
  const handleExportCSV = () => {
    if (!data || data.length === 0) return;
    try {
      const escape = (val: string | undefined | null) => {
        const s = String(val ?? "");
        return `"${s.replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
      };
      const headers = ['Date', 'Rep Name', 'First Name', 'Last Name', 'Company', 'Email', 'Phone', 'Address'];
      const csvContent = [
        headers.join(','),
        ...data.map(s => {
          const date = parseISO(s.createdAt);
          const dateStr = isValid(date) ? format(date, 'yyyy-MM-dd HH:mm') : s.createdAt;
          return [
            escape(dateStr),
            escape(s.repName),
            escape(s.firstName),
            escape(s.lastName),
            escape(s.company),
            escape(s.email),
            escape(s.phone),
            escape(s.address)
          ].join(',');
        })
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `passover-gifts-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to export CSV");
    }
  };
  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [data]);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-8 md:py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 font-black text-lg hover:underline">
              <ArrowLeft className="w-5 h-5" /> Back Home
            </Link>
            <h1 className="text-5xl font-black">Admin Dashboard</h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => refetch()}
              className="btn-playful bg-white px-6 py-3 flex items-center gap-2"
            >
              <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!data?.length}
              className="btn-playful bg-playful-green px-8 py-3 flex items-center gap-2 text-white disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>
        {isError && (
          <div className="card-playful bg-playful-pink/10 border-playful-pink text-playful-pink flex items-center gap-4">
            <AlertCircle className="w-8 h-8" />
            <p className="text-xl font-bold">Failed to load submissions. Please refresh.</p>
          </div>
        )}
        <div className="card-playful bg-white overflow-hidden p-0 border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
          <div className="overflow-x-auto">
            <Table className="border-collapse">
              <TableHeader className="bg-black text-white">
                <TableRow className="hover:bg-black border-none">
                  <TableHead className="text-white font-black text-xl py-8 border-r-4 border-white/20 px-6">Sales Rep</TableHead>
                  <TableHead className="text-white font-black text-xl py-8 border-r-4 border-white/20 px-6">Recipient Info</TableHead>
                  <TableHead className="text-white font-black text-xl py-8 border-r-4 border-white/20 px-6">Contact Details</TableHead>
                  <TableHead className="text-white font-black text-xl py-8 border-r-4 border-white/20 px-6">Home Address</TableHead>
                  <TableHead className="text-white font-black text-xl py-8 px-6 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i} className="border-b-4 border-black">
                      <TableCell colSpan={5} className="h-24 animate-pulse bg-gray-50"></TableCell>
                    </TableRow>
                  ))
                ) : sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <FileSpreadsheet className="w-24 h-24 text-playful-blue/40" />
                        <p className="text-3xl font-black text-muted-foreground/60 italic">No gifts claimed yet!</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((item) => {
                    const isEditing = editingId === item.id;
                    return (
                      <TableRow key={item.id} className={cn(
                        "border-b-4 border-black transition-colors",
                        isEditing ? "bg-playful-yellow/10" : "hover:bg-playful-blue/5"
                      )}>
                        <TableCell className="py-8 px-6 border-r-4 border-black/5">
                          {isEditing ? (
                            <input
                              className="input-playful w-full text-sm p-3"
                              value={editValues.repName || ''}
                              onChange={(e) => setEditValues({ ...editValues, repName: e.target.value })}
                            />
                          ) : (
                            <div className="inline-block bg-playful-yellow px-4 py-1 rounded-full border-2 border-black font-black text-sm shadow-playful-sm">
                              {item.repName}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-8 px-6 border-r-4 border-black/5">
                          {isEditing ? (
                            <div className="space-y-3">
                              <input className="input-playful w-full text-sm p-3" placeholder="First Name" value={editValues.firstName || ''} onChange={(e) => setEditValues({ ...editValues, firstName: e.target.value })} />
                              <input className="input-playful w-full text-sm p-3" placeholder="Last Name" value={editValues.lastName || ''} onChange={(e) => setEditValues({ ...editValues, lastName: e.target.value })} />
                              <input className="input-playful w-full text-sm p-3" placeholder="Company" value={editValues.company || ''} onChange={(e) => setEditValues({ ...editValues, company: e.target.value })} />
                            </div>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="font-black text-2xl leading-none text-black">{item.firstName} {item.lastName}</span>
                              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-1 bg-gray-100 px-2 py-0.5 rounded-md w-fit">{item.company}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-8 px-6 border-r-4 border-black/5">
                          {isEditing ? (
                            <div className="space-y-3">
                              <input className="input-playful w-full text-sm p-3" placeholder="Email" value={editValues.email || ''} onChange={(e) => setEditValues({ ...editValues, email: e.target.value })} />
                              <input className="input-playful w-full text-sm p-3" placeholder="Phone" value={editValues.phone || ''} onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })} />
                            </div>
                          ) : (
                            <div className="flex flex-col gap-2">
                              <div className="text-sm font-black bg-playful-blue/10 px-3 py-1.5 rounded-xl border-2 border-black shadow-playful-sm w-fit">{item.email}</div>
                              <div className="text-sm font-mono font-bold text-black/60 px-2 tracking-tighter">{item.phone}</div>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-8 px-6 border-r-4 border-black/5 max-w-[300px]">
                          {isEditing ? (
                            <textarea
                              className="input-playful w-full min-h-[100px] text-sm p-3"
                              value={editValues.address || ''}
                              onChange={(e) => setEditValues({ ...editValues, address: e.target.value })}
                            />
                          ) : (
                            <span className="text-sm font-bold block leading-relaxed italic text-black/80 line-clamp-3">"{item.address}"</span>
                          )}
                        </TableCell>
                        <TableCell className="py-8 px-6 text-center">
                          <div className="flex items-center justify-center gap-3">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => updateMutation.mutate({ id: item.id, updates: editValues })}
                                  disabled={updateMutation.isPending}
                                  className="btn-playful bg-playful-green p-3 text-white shadow-playful-sm hover:scale-105 active:scale-95"
                                  title="Save Changes"
                                >
                                  <Check className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => { setEditingId(null); setEditValues({}); }}
                                  className="btn-playful bg-white p-3 shadow-playful-sm border-2 hover:scale-105 active:scale-95"
                                  title="Cancel"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => { setEditingId(item.id); setEditValues(item); }}
                                  className="btn-playful bg-playful-yellow p-3 shadow-playful-sm hover:scale-110 active:scale-90"
                                  title="Edit Entry"
                                >
                                  <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => setDeletingItem(item)}
                                  className="btn-playful bg-playful-pink p-3 text-white shadow-playful-sm hover:scale-110 active:scale-90"
                                  title="Delete Entry"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </>
                            )}
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
      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent className="border-8 border-black rounded-[3.5rem] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] bg-white max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-4xl font-black italic">Wait a second!</AlertDialogTitle>
            <AlertDialogDescription className="text-xl font-bold text-black/80 mt-4 leading-relaxed">
              Are you sure you want to remove the gift claim for <span className="text-playful-pink underline decoration-4">{deletingItem?.firstName} {deletingItem?.lastName}</span>?
              <br /><br />
              This will erase their shipping data forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-4 mt-8">
            <AlertDialogCancel className="btn-playful bg-white px-8 py-3 text-lg hover:bg-gray-50">
              No, keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingItem && deleteMutation.mutate(deletingItem.id)}
              className="btn-playful bg-playful-pink text-white px-8 py-3 text-lg hover:bg-playful-pink/90 active:translate-y-1"
            >
              {deleteMutation.isPending ? 'Erasing...' : 'Yes, Delete It'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}