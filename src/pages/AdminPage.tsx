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
              className="btn-playful bg-white px-4 py-2 flex items-center gap-2"
            >
              <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
              Refresh
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!data?.length}
              className="btn-playful bg-playful-green px-6 py-2 flex items-center gap-2 text-white disabled:opacity-50"
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
        <div className="card-playful bg-white overflow-hidden p-0 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black text-white border-b-4 border-black">
                <TableRow className="hover:bg-black border-none">
                  <TableHead className="text-white font-black text-lg py-6 border-r border-white/20">Rep</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 border-r border-white/20">Recipient</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 border-r border-white/20">Contact</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 border-r border-white/20">Address</TableHead>
                  <TableHead className="text-white font-black text-lg py-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={5} className="h-24 animate-pulse bg-gray-50 border-b-2 border-black/5"></TableCell>
                    </TableRow>
                  ))
                ) : sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <FileSpreadsheet className="w-16 h-16 opacity-20" />
                        <p className="text-2xl font-bold">No gifts claimed yet!</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((item) => {
                    const isEditing = editingId === item.id;
                    return (
                      <TableRow key={item.id} className={cn(
                        "border-b-2 border-black/5 transition-colors",
                        isEditing ? "bg-playful-yellow/5" : "hover:bg-playful-yellow/10"
                      )}>
                        <TableCell className="font-black text-playful-blue py-6">
                          {isEditing ? (
                            <input
                              className="input-playful w-full text-sm p-2"
                              value={editValues.repName || ''}
                              onChange={(e) => setEditValues({ ...editValues, repName: e.target.value })}
                            />
                          ) : item.repName}
                        </TableCell>
                        <TableCell className="py-6">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                className="input-playful w-full text-sm p-2"
                                placeholder="First Name"
                                value={editValues.firstName || ''}
                                onChange={(e) => setEditValues({ ...editValues, firstName: e.target.value })}
                              />
                              <input
                                className="input-playful w-full text-sm p-2"
                                placeholder="Last Name"
                                value={editValues.lastName || ''}
                                onChange={(e) => setEditValues({ ...editValues, lastName: e.target.value })}
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              <span className="font-black text-lg">{item.firstName} {item.lastName}</span>
                              <span className="text-sm font-bold text-muted-foreground">{item.company}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-6">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                className="input-playful w-full text-sm p-2"
                                placeholder="Email"
                                value={editValues.email || ''}
                                onChange={(e) => setEditValues({ ...editValues, email: e.target.value })}
                              />
                              <input
                                className="input-playful w-full text-sm p-2"
                                placeholder="Phone"
                                value={editValues.phone || ''}
                                onChange={(e) => setEditValues({ ...editValues, phone: e.target.value })}
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col text-xs font-mono">
                              <span>{item.email}</span>
                              <span>{item.phone}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-6 max-w-[250px]">
                          {isEditing ? (
                            <textarea
                              className="input-playful w-full min-h-[80px] text-sm p-2"
                              value={editValues.address || ''}
                              onChange={(e) => setEditValues({ ...editValues, address: e.target.value })}
                            />
                          ) : (
                            <span className="text-sm block line-clamp-2">{item.address}</span>
                          )}
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => updateMutation.mutate({ id: item.id, updates: editValues })}
                                  disabled={updateMutation.isPending}
                                  className="btn-playful bg-playful-green p-2 text-white shadow-playful-sm"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => { setEditingId(null); setEditValues({}); }}
                                  className="btn-playful bg-white p-2 shadow-playful-sm"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => { setEditingId(item.id); setEditValues(item); }}
                                  className="btn-playful bg-playful-yellow p-2 shadow-playful-sm"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setDeletingItem(item)}
                                  className="btn-playful bg-playful-pink p-2 text-white shadow-playful-sm"
                                >
                                  <Trash2 className="w-4 h-4" />
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
        <AlertDialogContent className="border-4 border-black rounded-[2rem] shadow-playful bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-3xl font-black">Careful now!</AlertDialogTitle>
            <AlertDialogDescription className="text-lg font-bold text-black/70">
              Are you sure you want to remove the gift claim for <span className="text-playful-pink">{deletingItem?.firstName} {deletingItem?.lastName}</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-4">
            <AlertDialogCancel className="btn-playful bg-white border-4 border-black px-6 py-2 rounded-2xl shadow-playful-sm">
              Keep it
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingItem && deleteMutation.mutate(deletingItem.id)}
              className="btn-playful bg-playful-pink text-white border-4 border-black px-6 py-2 rounded-2xl shadow-playful-sm hover:bg-playful-pink/90"
            >
              {deleteMutation.isPending ? 'Removing...' : 'Delete Forever'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}