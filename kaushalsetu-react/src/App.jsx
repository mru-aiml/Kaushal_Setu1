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
// Goal 3 dedicated pages — one route per sidebar item (never scroll anchors).
import TCDemand from './pages/tc/Demand';
import TCCourseAlignment from './pages/tc/CourseAlignment';
import TCCapacity from './pages/tc/Capacity';
import TCTrainerReadiness from './pages/tc/TrainerReadiness';
import TCInfrastructure from './pages/tc/Infrastructure';
import TCSkillGaps from './pages/tc/SkillGaps';
import TCTrainingPlans from './pages/tc/TrainingPlans';
import EmIndustryDemand from './pages/employer/IndustryDemand';
import EmRequirements from './pages/employer/Requirements';
import EmSkillValidation from './pages/employer/SkillValidation';
import EmEmergingSkills from './pages/employer/EmergingSkills';
import EmSubmitRequirement from './pages/employer/SubmitRequirement';
import EmHiringSignals from './pages/employer/HiringSignals';
import CaSkills from './pages/candidate/Skills';
import CaSkillGap from './pages/candidate/SkillGap';
import CaCareerNavigator from './pages/candidate/CareerNavigator';
import CaRecommendedCourses from './pages/candidate/RecommendedCourses';
import CaCareerPath from './pages/candidate/CareerPath';
import CaOpportunities from './pages/candidate/Opportunities';
import GovTrainingCentres from './pages/gov/TrainingCentres';
import GovEmploymentOutcomes from './pages/gov/EmploymentOutcomes';
import GovProgrammeImpact from './pages/gov/ProgrammeImpact';
import GovReports from './pages/gov/Reports';

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
            <Route path="/government/training-centres" element={workspace('government', <GovTrainingCentres />)} />
            <Route path="/government/employment-outcomes" element={workspace('government', <GovEmploymentOutcomes />)} />
            <Route path="/government/programme-impact" element={workspace('government', <GovProgrammeImpact />)} />
            <Route path="/government/training-plans" element={workspace('government', <TrainingPlans />)} />
            <Route path="/government/reports" element={workspace('government', <GovReports />)} />
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

            {/* Training Centre workspace — dedicated pages */}
            <Route path="/training-centre" element={workspace('trainingCentre', <TrainingCentre section="dashboard" />)} />
            <Route path="/training-centre/demand" element={workspace('trainingCentre', <TCDemand />)} />
            <Route path="/training-centre/course-alignment" element={workspace('trainingCentre', <TCCourseAlignment />)} />
            <Route path="/training-centre/capacity" element={workspace('trainingCentre', <TCCapacity />)} />
            <Route path="/training-centre/trainer-readiness" element={workspace('trainingCentre', <TCTrainerReadiness />)} />
            <Route path="/training-centre/infrastructure" element={workspace('trainingCentre', <TCInfrastructure />)} />
            <Route path="/training-centre/skill-gaps" element={workspace('trainingCentre', <TCSkillGaps />)} />
            <Route path="/training-centre/training-plans" element={workspace('trainingCentre', <TCTrainingPlans />)} />
            <Route path="/training-centre/data" element={workspace('trainingCentre', <TrainingCentreData />)} />
            <Route path="/training-centre/profile" element={workspace('trainingCentre', <Profile />)} />
            {/* Legacy TC aliases → canonical dedicated pages */}
            <Route path="/training-centre/alignment" element={<Navigate to="/training-centre/course-alignment" replace />} />
            <Route path="/training-centre/trainers" element={<Navigate to="/training-centre/trainer-readiness" replace />} />
            <Route path="/training-centre/equipment" element={<Navigate to="/training-centre/infrastructure" replace />} />
            <Route path="/training-centre/gaps" element={<Navigate to="/training-centre/skill-gaps" replace />} />
            <Route path="/training-centre/plans" element={<Navigate to="/training-centre/training-plans" replace />} />
            <Route path="/training-centre/courses" element={<Navigate to="/training-centre/course-alignment" replace />} />
            <Route path="/training-centre/requirements" element={<Navigate to="/training-centre/demand" replace />} />
            <Route path="/training-centre/recommendations" element={<Navigate to="/training-centre/training-plans" replace />} />
            <Route path="/training" element={<Navigate to="/training-centre" replace />} />
            <Route path="/training/*" element={<Navigate to="/training-centre" replace />} />

            {/* Employer workspace — dedicated pages */}
            <Route path="/employer" element={workspace('employer', <Employer section="dashboard" />)} />
            <Route path="/employer/industry-demand" element={workspace('employer', <EmIndustryDemand />)} />
            <Route path="/employer/requirements" element={workspace('employer', <EmRequirements />)} />
            <Route path="/employer/skill-validation" element={workspace('employer', <EmSkillValidation />)} />
            <Route path="/employer/emerging-skills" element={workspace('employer', <EmEmergingSkills />)} />
            <Route path="/employer/submit-requirement" element={workspace('employer', <EmSubmitRequirement />)} />
            <Route path="/employer/hiring-signals" element={workspace('employer', <EmHiringSignals />)} />
            <Route path="/employer/data" element={workspace('employer', <EmployerData />)} />
            <Route path="/employer/profile" element={workspace('employer', <Profile />)} />
            {/* Legacy employer aliases → canonical dedicated pages */}
            <Route path="/employer/demand" element={<Navigate to="/employer/industry-demand" replace />} />
            <Route path="/employer/validation" element={<Navigate to="/employer/skill-validation" replace />} />
            <Route path="/employer/emerging" element={<Navigate to="/employer/emerging-skills" replace />} />
            <Route path="/employer/submit" element={<Navigate to="/employer/submit-requirement" replace />} />
            <Route path="/employer/hiring" element={<Navigate to="/employer/hiring-signals" replace />} />

            {/* Candidate workspace — dedicated pages */}
            <Route path="/candidate" element={workspace('candidate', <Candidate section="dashboard" />)} />
            <Route path="/candidate/profile" element={workspace('candidate', <Profile />)} />
            <Route path="/candidate/skills" element={workspace('candidate', <CaSkills />)} />
            <Route path="/candidate/skill-gap" element={workspace('candidate', <CaSkillGap />)} />
            <Route path="/candidate/career-navigator" element={workspace('candidate', <CaCareerNavigator />)} />
            <Route path="/candidate/recommended-courses" element={workspace('candidate', <CaRecommendedCourses />)} />
            <Route path="/candidate/career-path" element={workspace('candidate', <CaCareerPath />)} />
            <Route path="/candidate/opportunities" element={workspace('candidate', <CaOpportunities />)} />
            <Route path="/candidate/data" element={workspace('candidate', <CandidateData />)} />
            {/* Legacy candidate aliases → canonical dedicated pages */}
            <Route path="/candidate/gaps" element={<Navigate to="/candidate/skill-gap" replace />} />
            <Route path="/candidate/navigator" element={<Navigate to="/candidate/career-navigator" replace />} />
            <Route path="/candidate/courses" element={<Navigate to="/candidate/recommended-courses" replace />} />
            <Route path="/candidate/path" element={<Navigate to="/candidate/career-path" replace />} />

            <Route path="*" element={<CatchAll />} />
          </Routes>
        </AppProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
