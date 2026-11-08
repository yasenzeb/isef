import React from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthenticateWithRedirectCallback, ClerkProvider } from '@clerk/clerk-react';
import { CLERK_PUBLISHABLE_KEY, clerkAppearance, isClerkConfigured } from './lib/clerkConfig';
import { LanguageProvider } from './context/LanguageContext';
import { SessionProvider, useSession } from './context/SessionContext';
import { LandingPage } from './components/site/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { DashboardHome } from './components/dashboard/DashboardHome';
import { CurriculumPage } from './components/dashboard/CurriculumPage';
import { LabsPage } from './components/dashboard/LabsPage';
import { LabWorkspace } from './components/dashboard/LabWorkspace';
import { ClassroomPage } from './components/dashboard/ClassroomPage';
import { ProgressPage } from './components/dashboard/ProgressPage';
import { SettingsPage } from './components/dashboard/SettingsPage';
import { AssistantPage } from './components/dashboard/AssistantPage';
import {
  ClassesPage,
  StudentsPage,
  AssignmentsPage,
  InstitutionsPage,
  UsersPage,
  AnalyticsPage,
} from './components/dashboard/TeamPages';
import { BrandMark } from './components/ui/Brand';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { EducatorPortalLogin } from './components/portal/EducatorPortalLogin';
import { EducatorLayout } from './components/portal/EducatorLayout';
import { EducatorOverview } from './components/portal/EducatorOverview';

const SsoCallback: React.FC = () => {
  if (!isClerkConfigured) return <Navigate to="/" replace />;
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/app"
        signUpFallbackRedirectUrl="/app"
      />
    </div>
  );
};

const SessionLoading: React.FC = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f5f5f5]">
    <BrandMark size={40} />
    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#a3a3a3]">
      Loading observatory
    </span>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn } = useSession();
  const location = useLocation();

  if (!isLoaded) return <SessionLoading />;
  if (!isSignedIn) return <Navigate to="/sign-in" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
};

const AppRoutes: React.FC = () => (
  <Routes>
    {/* Public and Auth */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/sign-in/*" element={<AuthPage mode="signin" />} />
    <Route path="/sign-up/*" element={<AuthPage mode="signup" />} />
    <Route path="/sso-callback" element={<SsoCallback />} />
    <Route path="/sign-in/sso-callback" element={<SsoCallback />} />
    <Route path="/sign-up/sso-callback" element={<SsoCallback />} />

    {/* ── Separate Dedicated Educator & Admin Portal ── */}
    <Route path="/portal/login" element={<EducatorPortalLogin />} />
    <Route path="/admin/login" element={<EducatorPortalLogin />} />
    <Route path="/portal/teacher" element={<EducatorPortalLogin />} />
    <Route path="/portal/admin" element={<EducatorPortalLogin />} />
    <Route path="/teacher/login" element={<EducatorPortalLogin />} />

    {/* Educator Portal Workspace */}
    <Route path="/portal" element={<EducatorLayout />}>
      <Route index element={<EducatorOverview />} />
      <Route path="classes" element={<ClassesPage />} />
      <Route path="students" element={<StudentsPage />} />
      <Route path="assignments" element={<AssignmentsPage />} />
      <Route path="institutions" element={<InstitutionsPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
    </Route>

    <Route path="/admin" element={<EducatorLayout />}>
      <Route index element={<InstitutionsPage />} />
      <Route path="classes" element={<ClassesPage />} />
      <Route path="students" element={<StudentsPage />} />
      <Route path="assignments" element={<AssignmentsPage />} />
      <Route path="institutions" element={<InstitutionsPage />} />
      <Route path="users" element={<UsersPage />} />
      <Route path="analytics" element={<AnalyticsPage />} />
    </Route>

    {/* ── Main Student Platform (/app) — Strictly for students ── */}
    <Route
      path="/app"
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<DashboardHome />} />
      <Route path="curriculum" element={<CurriculumPage />} />
      <Route path="labs" element={<LabsPage />} />
      <Route path="labs/:labId" element={<LabWorkspace />} />
      <Route path="classroom" element={<ClassroomPage />} />
      <Route path="progress" element={<ProgressPage />} />
      <Route path="assistant" element={<AssistantPage />} />
      <Route path="settings" element={<SettingsPage />} />

      {/* Redirect old educator URLs from /app directly to the dedicated portal */}
      <Route path="classes" element={<Navigate to="/portal/classes" replace />} />
      <Route path="students" element={<Navigate to="/portal/students" replace />} />
      <Route path="assignments" element={<Navigate to="/portal/assignments" replace />} />
      <Route path="institutions" element={<Navigate to="/portal/institutions" replace />} />
      <Route path="users" element={<Navigate to="/portal/users" replace />} />
      <Route path="analytics" element={<Navigate to="/portal/analytics" replace />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const ClerkWithRouter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();

  if (!isClerkConfigured) return <>{children}</>;

  return (
    <ClerkProvider
      publishableKey={CLERK_PUBLISHABLE_KEY!}
      appearance={clerkAppearance}
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/app"
      signUpFallbackRedirectUrl="/app"
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  );
};

export const App: React.FC = () => (
  <LanguageProvider>
    <BrowserRouter>
      <ClerkWithRouter>
        <SessionProvider>
          <ErrorBoundary scope="app">
            <AppRoutes />
          </ErrorBoundary>
        </SessionProvider>
      </ClerkWithRouter>
    </BrowserRouter>
  </LanguageProvider>
);

export default App;
