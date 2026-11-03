import React, { useState } from 'react';
import { Share2, Bookmark, Check } from 'lucide-react';

const ShareButtons = ({ title }) => {
  const [copied, setCopied] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments where clipboard API might be restricted
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  return (
    <div className="lg:col-span-1 flex lg:flex-col space-x-3 lg:space-x-0 lg:space-y-3 text-slate-400">
      <button
        type="button"
        onClick={handleCopyLink}
        className={`p-2 border rounded-full transition-colors relative ${
          copied 
            ? 'border-emerald-300 bg-emerald-50 text-emerald-600' 
            : 'border-slate-200 hover:bg-blue-50 hover:text-blue-600'
        }`}
        title={copied ? "Copied!" : "Share Article Link"}
        aria-label="Share article"
      >
        {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
      </button>

      <button
        type="button"
        onClick={handleBookmark}
        className={`p-2 border rounded-full transition-colors ${
          bookmarked 
            ? 'border-blue-300 bg-blue-50 text-blue-600' 
            : 'border-slate-200 hover:bg-blue-50 hover:text-blue-600'
        }`}
        title={bookmarked ? "Bookmarked" : "Save Bookmark"}
        aria-label="Bookmark article"
      >
        <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
};

export default ShareButtons;
