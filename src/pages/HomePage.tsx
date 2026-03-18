import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Gift, ShieldCheck, Heart } from 'lucide-react';
export function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-12 md:py-24 flex flex-col items-center text-center space-y-16">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 bg-playful-pink text-white px-8 py-3 rounded-full border-4 border-black font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Heart className="w-6 h-6 fill-current" />
            Shalom
          </div>
          <h1 className="text-6xl md:text-9xl font-black text-black leading-none tracking-tight">
            Passover <br />
            <span className="text-playful-blue">Gift Portal</span>
          </h1>
          <p className="text-2xl md:text-3xl font-black text-black/80 max-w-3xl mx-auto">
            Spread holiday cheer and support local farmers with a gift that matters.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-6xl">
          <Link to="/rep" className="group">
            <div className="card-playful bg-playful-yellow h-full flex flex-col items-center gap-8 group-hover:-translate-y-2 group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-24 h-24 bg-white border-4 border-black rounded-3xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <UserCircle className="w-14 h-14" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black">Rep Portal</h2>
                <p className="font-bold text-xl text-black/70">Generate your personalized gift links for customers.</p>
              </div>
            </div>
          </Link>
          <Link to="/gift?rep=Demo+Rep" className="group">
            <div className="card-playful bg-playful-green h-full flex flex-col items-center gap-8 group-hover:-translate-y-2 group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-24 h-24 bg-white border-4 border-black rounded-3xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Gift className="w-14 h-14" />
              </div>
              <div className="space-y-3">
                <h2 className="text-4xl font-black">Demo Form</h2>
                <p className="font-bold text-xl text-black/70">Preview the multi-step gift claim and review experience.</p>
              </div>
            </div>
          </Link>
          <Link to="/admin" className="group">
            <div className="card-playful bg-playful-blue h-full flex flex-col items-center gap-8 group-hover:-translate-y-2 group-hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="w-24 h-24 bg-black border-4 border-black rounded-3xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
                <ShieldCheck className="w-14 h-14" />
              </div>
              <div className="space-y-3 text-white">
                <h2 className="text-4xl font-black">Admin</h2>
                <p className="font-bold text-xl text-white/80">Securely manage and export all gift submissions.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}