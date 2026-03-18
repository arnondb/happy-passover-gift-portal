import React from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Gift, ShieldCheck, Heart } from 'lucide-react';
export function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-12 md:py-20 flex flex-col items-center text-center space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 bg-playful-pink text-white px-6 py-2 rounded-full border-4 border-black font-black uppercase tracking-widest shadow-playful-sm">
            <Heart className="w-5 h-5 fill-current" />
            Shalom
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-black leading-none drop-shadow-sm">
            Passover <br />
            <span className="text-playful-blue">Gift Portal</span>
          </h1>
          <p className="text-xl md:text-2xl font-bold text-gray-700 max-w-2xl mx-auto">
            Spread holiday cheer and support our resilient local farmers with a gift that matters.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <Link to="/rep" className="group">
            <div className="card-playful bg-playful-yellow h-full flex flex-col items-center gap-6 group-hover:-translate-y-2 transition-transform">
              <div className="w-20 h-20 bg-white border-4 border-black rounded-2xl flex items-center justify-center shadow-playful-sm">
                <UserCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black">Rep Portal</h2>
                <p className="font-bold text-black/70">Generate your personalized gift links for customers.</p>
              </div>
            </div>
          </Link>
          <Link to="/gift?rep=Demo+Rep" className="group">
            <div className="card-playful bg-playful-green h-full flex flex-col items-center gap-6 group-hover:-translate-y-2 transition-transform">
              <div className="w-20 h-20 bg-white border-4 border-black rounded-2xl flex items-center justify-center shadow-playful-sm">
                <Gift className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-black">Demo Form</h2>
                <p className="font-bold text-black/70">Preview the multi-step gift claim and review experience.</p>
              </div>
            </div>
          </Link>
          <Link to="/admin" className="group">
            <div className="card-playful bg-playful-blue h-full flex flex-col items-center gap-6 group-hover:-translate-y-2 transition-transform">
              <div className="w-20 h-20 bg-white border-4 border-black rounded-2xl flex items-center justify-center shadow-playful-sm text-white bg-black">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <div className="space-y-2 text-white">
                <h2 className="text-3xl font-black">Admin</h2>
                <p className="font-bold text-white/80">Securely manage and export all gift submissions.</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}