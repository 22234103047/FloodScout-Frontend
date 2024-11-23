"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import Dashboard from "@/components/Dashboard";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = getCookie('isAuthenticated');
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="w-full h-full">
      <Dashboard />
    </div>
  );
} 