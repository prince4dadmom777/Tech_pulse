import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateWorkflowPage } from './pages/CreateWorkflowPage';
import { WorkflowListPage } from './pages/WorkflowListPage';
import { WorkflowDetailPage } from './pages/WorkflowDetailPage';
import { AgentsPage } from './pages/AgentsPage';
import { TasksPage } from './pages/TasksPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { BusinessDataPage } from './pages/BusinessDataPage';
import { TemplatesPage } from './pages/TemplatesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ActivityPage } from './pages/ActivityPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />

        {/* Protected App Workspace */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/workflows" element={<WorkflowListPage />} />
          <Route path="/workflows/new" element={<CreateWorkflowPage />} />
          <Route path="/workflows/:id" element={<WorkflowDetailPage />} />
          <Route path="/agents" element={<AgentsPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/business-data" element={<BusinessDataPage />} />
          <Route path="/templates" element={<TemplatesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/activity" element={<ActivityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
