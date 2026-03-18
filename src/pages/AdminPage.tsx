import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, RefreshCw, FileSpreadsheet } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ApiResponse, GiftSubmission } from '@shared/types';
import { format } from 'date-fns';
export function AdminPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['submissions'],
    queryFn: async () => {
      const response = await fetch('/api/submissions');
      const json = await response.json() as ApiResponse<GiftSubmission[]>;
      return json.data || [];
    }
  });
  const exportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = ['Date', 'Rep Name', 'First Name', 'Last Name', 'Company', 'Email', 'Phone', 'Address'];
    const csvContent = [
      headers.join(','),
      ...data.map(s => [
        format(new Date(s.createdAt), 'yyyy-MM-dd HH:mm'),
        `"${s.repName}"`,
        `"${s.firstName}"`,
        `"${s.lastName}"`,
        `"${s.company}"`,
        `"${s.email}"`,
        `"${s.phone}"`,
        `"${s.address.replace(/\n/g, ' ')}"`
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passover-gifts-${format(new Date(), 'yyyyMMdd-HHmm')}.csv`;
    a.click();
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
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
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
        <div className="card-playful bg-white overflow-hidden p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black text-white">
                <TableRow className="hover:bg-black border-none">
                  <TableHead className="text-white font-black text-lg py-6 border-r border-white/20">Date</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 border-r border-white/20">Rep</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 border-r border-white/20">Customer</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 border-r border-white/20">Email</TableHead>
                  <TableHead className="text-white font-black text-lg py-6 border-r border-white/20">Company</TableHead>
                  <TableHead className="text-white font-black text-lg py-6">Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={6} className="h-16 animate-pulse bg-gray-50"></TableCell>
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
                    <TableRow key={item.id} className="border-b-4 border-black/5 hover:bg-playful-yellow/5">
                      <TableCell className="font-bold py-6">{format(new Date(item.createdAt), 'MMM d, h:mm a')}</TableCell>
                      <TableCell className="font-black text-playful-blue py-6">{item.repName}</TableCell>
                      <TableCell className="font-bold py-6">{item.firstName} {item.lastName}</TableCell>
                      <TableCell className="py-6 font-mono text-xs">{item.email}</TableCell>
                      <TableCell className="py-6 font-medium">{item.company}</TableCell>
                      <TableCell className="py-6 font-mono text-sm">{item.phone}</TableCell>
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