import React from 'react';
import { Layers } from 'lucide-react';

const TableOfContents = ({ headings = [] }) => {
  if (!headings.length) return null;

  return (
    <div className="sticky top-24 bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm">
      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center">
        <Layers className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
        Table of Contents
      </h4>
      <nav className="space-y-1.5 text-xs">
        {headings.map((h, i) => (
          <a
            key={i}
            href={`#${h.id}`}
            className={`block py-1 hover:text-blue-600 transition-colors ${
              h.level === 3 ? 'pl-3 text-slate-500' : 'font-medium text-slate-700'
            }`}
          >
            {h.text}
          </a>
        ))}
      </nav>
    </div>
  );
};

export default TableOfContents;
