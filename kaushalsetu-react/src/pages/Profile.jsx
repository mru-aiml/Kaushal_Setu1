import { useEffect, useState } from 'react';
import { api, apiAvailable, ApiError } from '../services/api';
import { SectionHeader, DemoBadge } from '../components/ui';
import { LoadingState, ErrorState, EmptyState } from '../components/states';
import ProfileForm from '../components/ProfileForm';
import { useSession } from '../auth/AuthContext';

// Role-aware profile page. Schema + data come from the backend; the same
// component serves all four roles (/government/profile, /training-centre/profile,
// /employer/profile, /candidate/profile).
export default function Profile() {
  const { roleConfig, authMode } = useSession();
  const [schema, setSchema] = useState(null);
  const [profile, setProfile] = useState(null);
  const [supports, setSupports] = useState({ photo: true, resume: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const s = await api.get('/api/profile-schema');
      const p = await api.get('/api/me/profile');
      setSchema(s.schema);
      setProfile(p.profile);
      setSupports({ photo: s.supportsPhoto, resume: s.supportsResume });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (!apiAvailable() || authMode !== 'backend') {
    return (
      <div className="fade-in">
        <SectionHeader title="My Profile" sub={roleConfig?.org || ''} right={<DemoBadge label="Local auth" />} />
        <EmptyState
          title="Profiles need the backend API"
          desc="Connect the KaushalSetu server (VITE_API_BASE_URL) to create, edit and persist your profile. In local demo mode, profiles are unavailable."
        />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <SectionHeader
        title="My Profile"
        sub={`${roleConfig?.label} workspace · saved to your account, persists across sessions`}
        right={<DemoBadge label={authMode === 'backend' ? 'Live account data' : 'Local auth'} />}
      />
      {loading && <LoadingState label="Loading your profile…" />}
      {!loading && error && <ErrorState title="Could not load profile" desc={error} onRetry={load} />}
      {!loading && !error && schema && (
        <ProfileForm
          role={roleConfig?.id}
          schema={schema}
          profile={profile}
          supportsPhoto={supports.photo}
          supportsResume={supports.resume}
          onSaved={(p) => setProfile(p)}
        />
      )}
      {!loading && !error && !schema && (
        <ErrorState title="Profile unavailable" desc={error || 'No profile schema for this role.'} onRetry={load} />
      )}
    </div>
  );
}
