'use client';
import { useState, useRef, useEffect } from 'react';
import i18n from '../../i18n/i18n';

const languages = [
  { code: 'en', label: 'En', flag: '/gb.svg' },
  { code: 'gr', label: 'Ελ', flag: '/gr.svg' },
];

export default function LanguageSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const current = languages.find(l => l.code === i18n.language) || languages[0];

  return (
  <div
  ref={ref}
  className="fixed top-4 right-4 z-50 inline-block text-left"
>
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center px-4 py-2 text-[#4A2C2A] bg-white/80 border border-gray-300 rounded-lg shadow  hover:bg-gray-100 transition"
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <img src={current.flag} alt={current.label} className="w-6 h-6 rounded-full" />
          {/* No text here */}
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
          {open && (
          <ul className="text-sm absolute left-0 w-full z-10 mt-2 text-[#4A2C2A] bg-white/80 border border-gray-200 rounded-lg shadow-lg">
            {languages.map(lang => (
              <li
                key={lang.code}
                className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:rounded-lg hover:bg-gray-100 ${i18n.language === lang.code ? 'font-bold' : ''}`}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setOpen(false);
                }}
                role="option"
                aria-selected={i18n.language === lang.code}
              >
                <img src={lang.flag} alt={lang.label} className="w-5 h-6 rounded-full" />
                <span>{lang.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}