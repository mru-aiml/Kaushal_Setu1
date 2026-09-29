import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useSession } from './auth/AuthContext';
import { AppProvider } from './hooks/AppContext';
import AppLayout from './layouts/AppLayout';
import { RequireAuth, RequireRole, PublicOnly } from './routes/guards';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import OAuthCallback from './pages/OAuthCallback';
import Profile from './pages/Profile';
import { GovernmentData, TrainingCentreData, EmployerData, CandidateData } from './pages/DataWorkspace';
import Onboarding, { DemoEntry } from './pages/Onboarding';
import UnauthorizedPage from './pages/Unauthorized';
import { Contact, Privacy, Terms } from './pages/InfoPages';
import Overview from './pages/Overview';
import Districts from './pages/Districts';
import Signals from './pages/Signals';
import SkillGaps from './pages/SkillGaps';
import Curriculum from './pages/Curriculum';
import TrainingCapacity from './pages/TrainingCapacity';
import EmployerValidation from './pages/EmployerValidation';
import CareerNavigator from './pages/CareerNavigator';
import TrainingPlans from './pages/TrainingPlans';
import TrainingCentre from './pages/TrainingCentre';
import Employer from './pages/Employer';
import Candidate from './pages/Candidate';

// Protected workspace shell: auth guard → role isolation → app layout.
const workspace = (role, el) => (
  <RequireAuth>
    <RequireRole role={role}>
      <AppLayout>{el}</AppLayout>
    </RequireRole>
  </RequireAuth>
);

// /app — post-login entry point resolving to the user's own dashboard.
function AppIndex() {
  const { isAuthenticated, needsOnboarding, dashboardRoute, initializing } = useSession();
  if (initializing) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (needsOnboarding) return <Navigate to="/onboarding" replace />;
  return <Navigate to={dashboardRoute} replace />;
}

function CatchAll() {
  const { isAuthenticated, needsOnboarding, dashboardRoute, initializing } = useSession();
  if (initializing) return null;
  if (isAuthenticated) return <Navigate to={needsOnboarding ? '/onboarding' : dashboardRoute} replace />;
  return <Navigate to="/" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppProvider>
          <Routes>
            {/* Public website */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
            <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
            <Route path="/demo" element={<DemoEntry />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Onboarding — authenticated, pre-role */}
            <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
            <Route path="/app" element={<AppIndex />} />

            {/* Government workspace (canonical /government/*) */}
            <Route path="/government" element={workspace('government', <Overview />)} />
            <Route path="/government/districts" element={workspace('government', <Districts />)} />
            <Route path="/government/districts/:name" element={workspace('government', <Districts />)} />
            <Route path="/government/signals" element={workspace('government', <Signals />)} />
            <Route path="/government/skill-gaps" element={workspace('government', <SkillGaps />)} />
            <Route path="/government/curriculum" element={workspace('government', <Curriculum />)} />
            <Route path="/government/training-capacity" element={workspace('government', <TrainingCapacity />)} />
            <Route path="/government/employer-validation" element={workspace('government', <EmployerValidation />)} />
            <Route path="/government/training-plans" element={workspace('government', <TrainingPlans />)} />
            <Route path="/government/data" element={workspace('government', <GovernmentData />)} />
            <Route path="/government/profile" element={workspace('government', <Profile />)} />

            {/* Legacy government aliases — preserved, same role guard */}
            <Route path="/overview" element={workspace('government', <Overview />)} />
            <Route path="/districts" element={workspace('government', <Districts />)} />
            <Route path="/districts/:name" element={workspace('government', <Districts />)} />
            <Route path="/signals" element={workspace('government', <Signals />)} />
            <Route path="/skill-gaps" element={workspace('government', <SkillGaps />)} />
            <Route path="/curriculum" element={workspace('government', <Curriculum />)} />
            <Route path="/training-capacity" element={workspace('government', <TrainingCapacity />)} />
            <Route path="/employer-validation" element={workspace('government', <EmployerValidation />)} />
            <Route path="/career" element={workspace('government', <CareerNavigator />)} />
            <Route path="/training-plans" element={workspace('government', <TrainingPlans />)} />

            {/* Training Centre workspace */}
            <Route path="/training-centre" element={workspace('trainingCentre', <TrainingCentre section="dashboard" />)} />
            <Route path="/training-centre/demand" element={workspace('trainingCentre', <TrainingCentre section="requirements" />)} />
            <Route path="/training-centre/alignment" element={workspace('trainingCentre', <TrainingCentre section="alignment" />)} />
            <Route path="/training-centre/capacity" element={workspace('trainingCentre', <TrainingCentre section="equipment" />)} />
            <Route path="/training-centre/trainers" element={workspace('trainingCentre', <TrainingCentre section="trainers" />)} />
            <Route path="/training-centre/infrastructure" element={workspace('trainingCentre', <TrainingCentre section="equipment" />)} />
            <Route path="/training-centre/gaps" element={workspace('trainingCentre', <TrainingCentre section="gaps" />)} />
            <Route path="/training-centre/plans" element={workspace('trainingCentre', <TrainingPlans />)} />
            <Route path="/training-centre/data" element={workspace('trainingCentre', <TrainingCentreData />)} />
            <Route path="/training-centre/profile" element={workspace('trainingCentre', <Profile />)} />
            {/* Legacy TC aliases */}
            <Route path="/training-centre/courses" element={workspace('trainingCentre', <TrainingCentre section="courses" />)} />
            <Route path="/training-centre/equipment" element={workspace('trainingCentre', <TrainingCentre section="equipment" />)} />
            <Route path="/training-centre/requirements" element={workspace('trainingCentre', <TrainingCentre section="requirements" />)} />
            <Route path="/training-centre/recommendations" element={workspace('trainingCentre', <TrainingCentre section="recommendations" />)} />
            <Route path="/training" element={<Navigate to="/training-centre" replace />} />
            <Route path="/training/*" element={<Navigate to="/training-centre" replace />} />

            {/* Employer workspace */}
            <Route path="/employer" element={workspace('employer', <Employer section="dashboard" />)} />
            <Route path="/employer/demand" element={workspace('employer', <Employer section="demand" />)} />
            <Route path="/employer/requirements" element={workspace('employer', <Employer section="requirements" />)} />
            <Route path="/employer/validation" element={workspace('employer', <Employer section="validation" />)} />
            <Route path="/employer/emerging" element={workspace('employer', <Employer section="emerging" />)} />
            <Route path="/employer/submit" element={workspace('employer', <Employer section="submit" />)} />
            <Route path="/employer/hiring" element={workspace('employer', <Employer section="hiring" />)} />
            <Route path="/employer/data" element={workspace('employer', <EmployerData />)} />
            <Route path="/employer/profile" element={workspace('employer', <Profile />)} />

            {/* Candidate workspace */}
            <Route path="/candidate" element={workspace('candidate', <Candidate section="dashboard" />)} />
            <Route path="/candidate/profile" element={workspace('candidate', <Profile />)} />
            <Route path="/candidate/skills" element={workspace('candidate', <Candidate section="skills" />)} />
            <Route path="/candidate/gaps" element={workspace('candidate', <Candidate section="gaps" />)} />
            <Route path="/candidate/navigator" element={workspace('candidate', <Candidate section="navigator" />)} />
            <Route path="/candidate/courses" element={workspace('candidate', <Candidate section="courses" />)} />
            <Route path="/candidate/path" element={workspace('candidate', <Candidate section="path" />)} />
            <Route path="/candidate/opportunities" element={workspace('candidate', <Candidate section="opportunities" />)} />
            <Route path="/candidate/data" element={workspace('candidate', <CandidateData />)} />

            <Route path="*" element={<CatchAll />} />
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
