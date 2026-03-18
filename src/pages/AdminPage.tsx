import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, FileSpreadsheet, Trash2, Check, X, Edit2 } from 'lucide-react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import type { ApiResponse, GiftSubmission } from '@shared/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
export function AdminPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<GiftSubmission>>({});
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const response = await fetch('/api/submissions');
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
      return response.json();
    },
    onSuccess: () => {
      toast.success('Submission updated!');
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
    onError: () => toast.error('Failed to update submission'),
  });
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      toast.success('Submission deleted');
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    },
    onError: () => toast.error('Failed to delete submission'),
  });
  const startEditing = (item: GiftSubmission) => {
    setEditingId(item.id);
    setEditValues(item);
  };
  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({});
  };
  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, updates: editValues });
    }
  };
  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const escape = (val: string | undefined | null) => {
      const s = String(val ?? "");
      return `"${s.replace(/"/g, '""')}"`;
    };
    const headers = ['Date', 'Rep Name', 'First Name', 'Last Name', 'Company', 'Email', 'Phone', 'Address'];
    const csvContent = [
      headers.join(','),
      ...data.map(s => [
        escape(format(new Date(s.createdAt), 'yyyy-MM-dd HH:mm')),
        escape(s.repName),
        escape(s.firstName),
        escape(s.lastName),
        escape(s.company),
        escape(s.email),
        escape(s.phone),
        escape(s.address.replace(/\r?\n/g, ' '))
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passover-gifts-export-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const renderCell = (item: GiftSubmission, field: keyof GiftSubmission, label: string) => {
    const isEditing = editingId === item.id;
    if (isEditing) {
      if (field === 'address') {
        return (
          <textarea
            className="input-playful w-full min-h-[80px] text-sm p-2"
            value={String(editValues[field] || '')}
            onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
          />
        );
      }
      return (
        <input
          className="input-playful w-full text-sm p-2"
          value={String(editValues[field] || '')}
          onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
        />
      );
    }
    return <span className="block truncate max-w-[200px]">{String(item[field])}</span>;
  };
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
              onClick={exportCSV}
              disabled={!data?.length}
              className="btn-playful bg-playful-green px-6 py-2 flex items-center gap-2 text-white"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>
        <div className="card-playful bg-white overflow-hidden p-0 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black text-white border-b-4 border-black">
                <TableRow className="hover:bg-black border-none">
                  <TableHead className="text-white font-black text-lg py-6 border-r border-white/20">Rep</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 border-r border-white/20">Name</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 border-r border-white/20">Email</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 border-r border-white/20">Company</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 border-r border-white/20">Address</TableHead>
                  <TableHead className="text-white font-black text-lg py-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="h-20 animate-pulse bg-gray-50 border-b-2 border-black/5"></TableCell>
                    </TableRow>
                  ))
                ) : data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-64 text-center">
                      <div className="flex flex-col items-center gap-4 text-muted-foreground">
                        <FileSpreadsheet className="w-16 h-16 opacity-20" />
                        <p className="text-2xl font-bold">No gifts claimed yet!</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.map((item) => (
                    <TableRow key={item.id} className={cn(
                      "border-b-2 border-black/5 transition-colors",
                      editingId === item.id ? "bg-playful-yellow/5" : "hover:bg-playful-yellow/10"
                    )}>
                      <TableCell className="font-black text-playful-blue py-6">{renderCell(item, 'repName', 'Rep')}</TableCell>
                      <TableCell className="font-bold py-6">
                        {editingId === item.id ? (
                          <div className="space-y-2">
                            {renderCell(item, 'firstName', 'First')}
                            {renderCell(item, 'lastName', 'Last')}
                          </div>
                        ) : (
                          <span>{item.firstName} {item.lastName}</span>
                        )}
                      </TableCell>
                      <TableCell className="py-6 font-mono text-xs">{renderCell(item, 'email', 'Email')}</TableCell>
                      <TableCell className="py-6 font-medium">{renderCell(item, 'company', 'Company')}</TableCell>
                      <TableCell className="py-6 text-sm">{renderCell(item, 'address', 'Address')}</TableCell>
                      <TableCell className="py-6">
                        <div className="flex items-center gap-2">
                          {editingId === item.id ? (
                            <>
                              <button
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                                className="btn-playful bg-playful-green p-2 text-white shadow-playful-sm"
                                title="Save"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="btn-playful bg-white p-2 shadow-playful-sm"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEditing(item)}
                                className="btn-playful bg-playful-yellow p-2 shadow-playful-sm"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button className="btn-playful bg-playful-pink p-2 text-white shadow-playful-sm" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="border-4 border-black rounded-[2rem] shadow-playful">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-3xl font-black">Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-lg font-bold text-black/70">
                                      This will permanently remove the gift submission for {item.firstName} {item.lastName}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="gap-4">
                                    <AlertDialogCancel className="btn-playful bg-white border-4 border-black px-6 py-2 rounded-2xl shadow-playful-sm">
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => deleteMutation.mutate(item.id)}
                                      className="btn-playful bg-playful-pink text-white border-4 border-black px-6 py-2 rounded-2xl shadow-playful-sm"
                                    >
                                      Delete Forever
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}