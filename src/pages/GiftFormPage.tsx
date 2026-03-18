import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Heart, Sprout, CheckCircle2, Sparkles, Sun, ArrowLeft, Send, Edit3, Loader2, Home } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { ApiResponse } from '@shared/types';
const formSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  company: z.string().min(2, "Company name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(10, "Please provide a complete shipping address"),
});
type FormData = z.infer<typeof formSchema>;
type Step = 'form' | 'review' | 'final';
export function GiftFormPage() {
  const [searchParams] = useSearchParams();
  const repName = searchParams.get('rep') || 'Representative';
  const [step, setStep] = useState<Step>('form');
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: submittedData || {
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      phone: '',
      address: ''
    }
  });
  const handleFormSubmit = (data: FormData) => {
    setSubmittedData(data);
    setStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleConfirmSubmission = async () => {
    if (!submittedData) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...submittedData, repName }),
      });
      const result = await response.json() as ApiResponse;
      if (response.ok && result.success) {
        setTimeout(() => {
          setStep('final');
          window.scrollTo({ top: 0, behavior: 'smooth' });
          toast.success('Gift claim confirmed!');
        }, 800);
      } else {
        throw new Error(result.error || 'Failed to submit');
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };
  if (step === 'final') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-[80vh] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="card-playful bg-playful-yellow text-center space-y-8 max-w-2xl relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 animate-bounce delay-150">
            <Sparkles className="w-12 h-12 text-playful-pink" />
          </div>
          <div className="absolute top-12 left-8 animate-pulse delay-300">
            <Heart className="w-8 h-8 text-playful-blue fill-current" />
          </div>
          <div className="absolute bottom-8 right-12 animate-bounce delay-700">
            <Sun className="w-14 h-14 text-playful-blue" />
          </div>
          <div className="w-32 h-32 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-playful relative z-10">
            <CheckCircle2 className="w-20 h-20 text-playful-green" />
          </div>
          <div className="space-y-6 relative z-10">
            <h1 className="text-6xl md:text-7xl font-black leading-tight animate-bounce">Chag Sameach!</h1>
            <p className="text-2xl md:text-3xl font-bold leading-relaxed">
              Your Passover gift is on its way from grateful farmers. <br />
              <span className="text-playful-pink">Have a wonderful holiday!</span>
            </p>
            <div className="flex flex-col items-center gap-6 pt-4">
              <div className="flex justify-center gap-6">
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <Heart className="w-10 h-10 fill-playful-pink text-black" />
                </motion.div>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                  <Heart className="w-10 h-10 fill-playful-blue text-black" />
                </motion.div>
                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                  <Heart className="w-10 h-10 fill-playful-green text-black" />
                </motion.div>
              </div>
              <Link to="/" className="btn-playful bg-white px-10 py-4 text-xl flex items-center gap-2 hover:bg-gray-50">
                <Home className="w-6 h-6" /> Back Home
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-12 max-w-3xl mx-auto space-y-12">
        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key="form-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-playful-yellow px-6 py-2 rounded-full border-4 border-black font-black uppercase shadow-playful-sm">
                  Happy Passover
                </div>
                <h1 className="text-5xl md:text-7xl font-black italic">A Gift for You!</h1>
                <p className="text-xl font-bold text-black/70 italic">Presented by {repName}</p>
              </div>
              <div className="card-playful bg-playful-yellow/20 border-4 border-black shadow-playful-sm space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-playful-green p-3 rounded-2xl border-4 border-black shadow-playful-sm shrink-0">
                    <Sprout className="w-8 h-8 text-black" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black">Support Local Farmers</h2>
                    <p className="font-bold text-lg leading-relaxed text-black/90">
                      This holiday, we are proud to share a gift sourced from our local farmers.
                      Your gift represents hope, resilience, and the bounty of the land.
                    </p>
                  </div>
                </div>
              </div>
              <div className="card-playful bg-white space-y-8">
                <h3 className="text-3xl font-black border-b-4 border-black pb-2 inline-block">Claim Details</h3>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-black text-sm uppercase">First Name</label>
                    <input {...register('firstName')} className="input-playful w-full" placeholder="John" />
                    {errors.firstName && <p className="text-playful-pink font-bold text-sm mt-1">{errors.firstName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="font-black text-sm uppercase">Last Name</label>
                    <input {...register('lastName')} className="input-playful w-full" placeholder="Doe" />
                    {errors.lastName && <p className="text-playful-pink font-bold text-sm mt-1">{errors.lastName.message}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-black text-sm uppercase">Company</label>
                    <input {...register('company')} className="input-playful w-full" placeholder="Acme Inc." />
                    {errors.company && <p className="text-playful-pink font-bold text-sm mt-1">{errors.company.message}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-black text-sm uppercase">Email Address</label>
                    <input {...register('email')} type="email" className="input-playful w-full" placeholder="john@example.com" />
                    {errors.email && <p className="text-playful-pink font-bold text-sm mt-1">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-black text-sm uppercase">Phone Number</label>
                    <input {...register('phone')} className="input-playful w-full" placeholder="(555) 123-4567" />
                    {errors.phone && <p className="text-playful-pink font-bold text-sm mt-1">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="font-black text-sm uppercase">Shipping Address</label>
                    <textarea {...register('address')} className="input-playful w-full min-h-[120px]" placeholder="123 Pesach Way, Suite 4..." />
                    {errors.address && <p className="text-playful-pink font-bold text-sm mt-1">{errors.address.message}</p>}
                  </div>
                  <button
                    type="submit"
                    className="md:col-span-2 btn-playful bg-playful-blue text-white py-5 text-2xl flex items-center gap-3 justify-center mt-4"
                  >
                    Review My Gift <Heart className="w-6 h-6 fill-white" />
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="review-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-black italic">One Last Look!</h1>
                <p className="text-xl font-bold text-black/70">Ensure your shipping details are correct.</p>
              </div>
              <div className="card-playful bg-white space-y-10">
                <div className="grid grid-cols-1 gap-10 text-center">
                  <div className="space-y-2">
                    <span className="text-muted-foreground font-black uppercase text-xs tracking-widest bg-gray-100 px-3 py-1 rounded-full">Recipient</span>
                    <p className="text-3xl font-black text-black">{submittedData?.firstName} {submittedData?.lastName}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-muted-foreground font-black uppercase text-xs tracking-widest bg-gray-100 px-3 py-1 rounded-full">Company</span>
                    <p className="text-3xl font-black text-black">{submittedData?.company}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <span className="text-muted-foreground font-black uppercase text-xs tracking-widest bg-gray-100 px-3 py-1 rounded-full">Email</span>
                      <p className="text-xl font-black text-black break-all">{submittedData?.email}</p>
                    </div>
                    <div className="space-y-2">
                      <span className="text-muted-foreground font-black uppercase text-xs tracking-widest bg-gray-100 px-3 py-1 rounded-full">Phone</span>
                      <p className="text-xl font-black text-black font-mono">{submittedData?.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-muted-foreground font-black uppercase text-xs tracking-widest bg-gray-100 px-3 py-1 rounded-full">Sent From</span>
                    <p className="text-3xl font-black text-playful-blue">{repName}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="text-muted-foreground font-black uppercase text-xs tracking-widest bg-gray-100 px-3 py-1 rounded-full">Shipping To</span>
                    <p className="text-2xl font-black text-black leading-snug max-w-lg mx-auto">{submittedData?.address}</p>
                  </div>
                </div>
                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => { setStep('form'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="btn-playful bg-white flex-1 py-4 text-xl flex items-center gap-2 justify-center"
                    disabled={isLoading}
                  >
                    <Edit3 className="w-6 h-6" /> Fix Info
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={handleConfirmSubmission}
                    className="btn-playful bg-playful-green text-white flex-[2] py-4 text-xl flex items-center gap-3 justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        Confirm Claim <Send className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={() => { setStep('form'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="inline-flex items-center gap-2 font-black text-black/60 hover:text-black transition-colors mx-auto w-full justify-center"
              >
                <ArrowLeft className="w-5 h-5" /> Change details
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}