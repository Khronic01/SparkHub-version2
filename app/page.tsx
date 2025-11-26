
// This file is a conflict and must be deleted.
// If you see this in the browser, the cleanup script failed.
import React from 'react';

export default function ConflictPage() {
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1 style={{ color: 'red' }}>Configuration Error</h1>
      <p>The application has detected duplicate routing files.</p>
      <p>Please delete the file <strong>app/page.tsx</strong> manually and refresh.</p>
      <p>Next.js is trying to load this file instead of the Dashboard in <code>app/(main)/page.tsx</code>.</p>
    </div>
  );
}
