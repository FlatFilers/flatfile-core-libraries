import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import * as React from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

const menuStyles: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '1rem',
  borderBottom: '1px solid #ccc',
  borderLeft: '1px solid #ccc',
  position: 'absolute',
  right: 0,
}

const menuLinkStyles: React.CSSProperties = {
  padding: '0 1rem',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const menuItems = [
    { href: '/', label: 'Create a New Space' },
    { href: '/re-used-space', label: 'Re-use a Space' },
    { href: '/sheet', label: 'Sheet' },
    { href: '/workbook', label: 'Workbook' },
    { href: '/server-side-configure', label: 'Server Side Configure' },
  ];

  return (
    <html lang="en">
      <body className={inter.className}>
        <nav style={menuStyles}>
          {menuItems.map(({ href, label }) => (
            <a key={href} style={menuLinkStyles} href={href}>
              {label}
            </a>
          ))}
        </nav>
        {children}
      </body>
    </html>
  )
}
