import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import { api } from '../../lib/api';

export const AppLayout: React.FC = () => {
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  const fetchSummary = async () => {
    try {
      const res = await api.getApprovals('pending');
      setPendingApprovalsCount(res.approvals?.length || 0);
    } catch (_) {}
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-background text-slate-100 font-sans">
      <Sidebar pendingApprovalsCount={pendingApprovalsCount} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavigation onRefresh={fetchSummary} />
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
