import React from 'react';

const ThemeToggle = () => (
  <button
    className="rounded-full p-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition"
    title="Toggle theme"
  >
    <span role="img" aria-label="theme">🌓</span>
  </button>
);

export default ThemeToggle; 