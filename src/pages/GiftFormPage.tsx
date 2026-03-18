import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Heart, Sprout, CheckCircle2, Home } from 'lucide-react';
import { toast } from 'sonner';
const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  company: z.string().min(2, "Company name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(10, "Full shipping address required"),
});
type FormData = z.infer<typeof formSchema>;
export function GiftFormPage() {
  const [searchParams] = useSearchParams();
  const repName = searchParams.get('rep') || 'Your Representative';
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, repName }),
      });
      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Gift claim submitted successfully!');
      } else {
        throw new Error('Failed to submit');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  if (isSubmitted) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div className="card-playful bg-playful-green text-center space-y-8 max-w-xl animate-in zoom-in duration-500">
          <div className="w-24 h-24 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-playful-sm">
            <CheckCircle2 className="w-16 h-16 text-playful-green" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-black">Thank You!</h1>
            <p className="text-xl font-bold">Your Passover gift has been reserved. Wishing you a wonderful and meaningful holiday!</p>
          </div>
          <Link to="/" className="btn-playful bg-white px-8 py-3 text-lg flex items-center gap-2 mx-auto">
            <Home className="w-5 h-5" /> Back Home
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-12 max-w-3xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-playful-yellow px-6 py-2 rounded-full border-4 border-black font-black uppercase shadow-playful-sm">
            Happy Passover
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic">A Gift for You!</h1>
          <p className="text-xl font-bold text-black/70 italic">from {repName}</p>
        </div>
        <div className="card-playful bg-playful-green/20 space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-playful-green p-3 rounded-2xl border-4 border-black shadow-playful-sm shrink-0">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black">Sourced with Love</h2>
              <p className="font-bold text-lg leading-relaxed">
                This year’s gift is lovingly sourced from local farmers who cultivate the land and have shown incredible resilience. Each package supports their ongoing commitment to bringing fresh produce to our tables.
              </p>
            </div>
          </div>
        </div>
        <div className="card-playful bg-white space-y-8">
          <h3 className="text-3xl font-black">Shipping Details</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-black">First Name</label>
              <input {...register('firstName')} className="input-playful w-full" placeholder="John" />
              {errors.firstName && <p className="text-playful-pink font-bold text-sm">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="font-black">Last Name</label>
              <input {...register('lastName')} className="input-playful w-full" placeholder="Doe" />
              {errors.lastName && <p className="text-playful-pink font-bold text-sm">{errors.lastName.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="font-black">Company</label>
              <input {...register('company')} className="input-playful w-full" placeholder="Acme Corp" />
              {errors.company && <p className="text-playful-pink font-bold text-sm">{errors.company.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="font-black">Phone Number</label>
              <input {...register('phone')} className="input-playful w-full" placeholder="+1 (555) 000-0000" />
              {errors.phone && <p className="text-playful-pink font-bold text-sm">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="font-black">Shipping Address</label>
              <textarea {...register('address')} className="input-playful w-full min-h-[120px]" placeholder="123 Pesach St, Floor 4, Suite 101..." />
              {errors.address && <p className="text-playful-pink font-bold text-sm">{errors.address.message}</p>}
            </div>
            <button
              disabled={isLoading}
              type="submit"
              className="md:col-span-2 btn-playful bg-playful-blue text-white py-5 text-2xl flex items-center gap-3 justify-center"
            >
              {isLoading ? 'Processing...' : (
                <>
                  Claim My Gift <Heart className="w-6 h-6 fill-white" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}