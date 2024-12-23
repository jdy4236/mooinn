// src/app/layout.js

import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'MOOINN',
  description: 'An anonymous and authenticated chat application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
