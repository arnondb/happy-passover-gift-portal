import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Heart, Sprout, CheckCircle2, Sparkles, Sun, ArrowLeft, Send, Edit3 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { ApiResponse } from '@shared/types';
const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  company: z.string().min(2, "Company name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(10, "Full shipping address required"),
});
type FormData = z.infer<typeof formSchema>;
type Step = 'form' | 'review' | 'final';
export function GiftFormPage() {
  const [searchParams] = useSearchParams();
  const repName = searchParams.get('rep') || 'Your Representative';
  const [step, setStep] = useState<Step>('form');
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    values: submittedData || {
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
        setStep('final');
        toast.success('Gift claim confirmed!');
      } else {
        throw new Error(result.error || 'Failed to submit');
      }
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  if (step === 'final') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center bg-[#FFF9EA]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="card-playful bg-playful-yellow text-center space-y-8 max-w-2xl relative overflow-hidden"
        >
          <div className="absolute top-4 right-4 animate-bounce">
            <Sparkles className="w-8 h-8 text-playful-pink" />
          </div>
          <div className="absolute bottom-4 left-4 animate-pulse">
            <Sun className="w-10 h-10 text-playful-blue" />
          </div>
          <div className="w-32 h-32 bg-white border-4 border-black rounded-full flex items-center justify-center mx-auto shadow-playful">
            <CheckCircle2 className="w-20 h-20 text-playful-green" />
          </div>
          <div className="space-y-6 relative z-10">
            <h1 className="text-6xl font-black leading-tight">Chag Sameach!</h1>
            <p className="text-2xl font-bold leading-relaxed">
              Your Passover gift is on its way from grateful farmers. <br />
              <span className="text-playful-pink">Happy Holiday!</span>
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Heart className="w-8 h-8 fill-playful-pink text-black" />
              <Heart className="w-8 h-8 fill-playful-blue text-black" />
              <Heart className="w-8 h-8 fill-playful-green text-black" />
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-12"
            >
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
                <form onSubmit={handleSubmit(handleFormSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    <label className="font-black">Email Address</label>
                    <input {...register('email')} type="email" className="input-playful w-full" placeholder="john@example.com" />
                    {errors.email && <p className="text-playful-pink font-bold text-sm">{errors.email.message}</p>}
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
                    type="submit"
                    className="md:col-span-2 btn-playful bg-playful-blue text-white py-5 text-2xl flex items-center gap-3 justify-center"
                  >
                    Review My Claim <Heart className="w-6 h-6 fill-white" />
                  </button>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="review-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h1 className="text-5xl font-black italic">Review Details</h1>
                <p className="text-xl font-bold text-black/70">Almost there! Double check your information.</p>
              </div>
              <div className="card-playful bg-white space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-black uppercase text-xs tracking-widest">Recipient</span>
                    <p className="text-2xl font-black text-black">{submittedData?.firstName} {submittedData?.lastName}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-black uppercase text-xs tracking-widest">Company</span>
                    <p className="text-2xl font-black text-black">{submittedData?.company}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-black uppercase text-xs tracking-widest">Email</span>
                    <p className="text-2xl font-black text-black">{submittedData?.email}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-black uppercase text-xs tracking-widest">Phone</span>
                    <p className="text-2xl font-black text-black font-mono">{submittedData?.phone}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-muted-foreground font-black uppercase text-xs tracking-widest">Sent via</span>
                    <p className="text-2xl font-black text-playful-blue">{repName}</p>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <span className="text-muted-foreground font-black uppercase text-xs tracking-widest">Shipping To</span>
                    <p className="text-2xl font-black text-black leading-snug">{submittedData?.address}</p>
                  </div>
                </div>
                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => setStep('form')}
                    className="btn-playful bg-white flex-1 py-4 text-xl flex items-center gap-2 justify-center"
                  >
                    <Edit3 className="w-6 h-6" /> Edit Details
                  </button>
                  <button
                    disabled={isLoading}
                    onClick={handleConfirmSubmission}
                    className="btn-playful bg-playful-green text-white flex-[2] py-4 text-xl flex items-center gap-3 justify-center"
                  >
                    {isLoading ? 'Processing...' : (
                      <>
                        Approve & Send <Send className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setStep('form')}
                className="inline-flex items-center gap-2 font-black text-black/60 hover:text-black transition-colors mx-auto w-full justify-center"
              >
                <ArrowLeft className="w-5 h-5" /> Go Back
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}