'use client';

import React from 'react';
import AppShell from '@/components/layout/AppShell';

interface PageWrapperProps {
  title: string;
  children: React.ReactNode;
}

export default function PageWrapper({ title, children }: PageWrapperProps) {
  return (
    <AppShell currentPage={title}>
      {children}
    </AppShell>
  );
}
