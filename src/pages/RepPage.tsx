import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
export function RepPage() {
  const [name, setName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const encoded = encodeURIComponent(name.trim());
    const url = `${window.location.origin}/gift?rep=${encoded}`;
    setGeneratedLink(url);
    setCopied(false);
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-12 md:py-20">
        <Link to="/" className="inline-flex items-center gap-3 font-black text-2xl hover:translate-x-[-4px] transition-transform mb-12">
          <ArrowLeft className="w-7 h-7" /> Back Home
        </Link>
        <div className="max-w-3xl mx-auto">
          <div className="card-playful bg-white space-y-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="space-y-4 text-center">
              <h1 className="text-6xl font-black tracking-tight">Rep Portal</h1>
              <p className="text-2xl font-black text-black/60 italic">Create your unique gift link in seconds.</p>
            </div>
            <form onSubmit={handleGenerate} className="space-y-8">
              <div className="space-y-4">
                <label className="font-black text-3xl block">Enter Your Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Jane Doe"
                  className="input-playful w-full text-2xl h-20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-playful bg-playful-yellow w-full py-6 text-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                Generate Link
              </button>
            </form>
            {generatedLink && (
              <div className="space-y-6 pt-12 border-t-8 border-black animate-in fade-in slide-in-from-bottom-8 duration-700">
                <label className="font-black text-3xl flex items-center gap-3">
                  <LinkIcon className="w-8 h-8 text-playful-blue" /> Your Custom Link
                </label>
                <div className="flex flex-col gap-6">
                  <input
                    readOnly
                    className="input-playful w-full bg-gray-50 text-lg font-mono font-bold overflow-ellipsis border-dashed"
                    value={generatedLink}
                  />
                  <button
                    onClick={copyToClipboard}
                    className="btn-playful bg-playful-blue text-white py-5 text-2xl flex items-center gap-3 justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                  >
                    {copied ? <Check className="w-7 h-7" /> : <Copy className="w-7 h-7" />}
                    {copied ? 'Copied to Clipboard!' : 'Copy Link Now'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}