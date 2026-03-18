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
      <div className="py-8 md:py-12">
        <Link to="/" className="inline-flex items-center gap-2 font-black text-lg hover:underline mb-8">
          <ArrowLeft className="w-5 h-5" /> Back Home
        </Link>
        <div className="max-w-2xl mx-auto">
          <div className="card-playful bg-white space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-black">Rep Portal</h1>
              <p className="text-lg font-bold text-muted-foreground">Enter your name to create your unique gift link.</p>
            </div>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <label className="font-black text-xl">Your Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Jane Doe"
                  className="input-playful w-full text-lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-playful bg-playful-yellow w-full py-4 text-xl">
                Generate Link
              </button>
            </form>
            {generatedLink && (
              <div className="space-y-4 pt-6 border-t-4 border-black/5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <label className="font-black text-xl flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" /> Your Custom Link
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    readOnly
                    className="input-playful flex-1 bg-gray-50 text-sm font-mono overflow-ellipsis"
                    value={generatedLink}
                  />
                  <button
                    onClick={copyToClipboard}
                    className="btn-playful bg-playful-blue text-white px-8 flex items-center gap-2"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Copied!' : 'Copy'}
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