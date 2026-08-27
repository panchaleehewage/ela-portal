import { useEffect, useState } from 'react';
import { useAuthContext } from '@asgardeo/auth-react';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, requiredRole }) {
  const { state, getDecodedIDToken, signIn } = useAuthContext();
  const [userRoles, setUserRoles] = useState([]);
  const [checkingRoles, setCheckingRoles] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchUserRoles() {
      if (!state.isAuthenticated) {
        if (!state.isLoading && isMounted) {
          setCheckingRoles(false);
        }
        return;
      }

      try {
        const decodedToken = await getDecodedIDToken();
        if (isMounted) {
          const extracted = [
            ...(Array.isArray(decodedToken?.roles) ? decodedToken.roles : decodedToken?.roles ? [decodedToken.roles] : []),
            ...(Array.isArray(decodedToken?.groups) ? decodedToken.groups : decodedToken?.groups ? [decodedToken.groups] : []),
            ...(Array.isArray(decodedToken?.['http://wso2.org/claims/role']) ? decodedToken['http://wso2.org/claims/role'] : decodedToken?.['http://wso2.org/claims/role'] ? [decodedToken['http://wso2.org/claims/role']] : []),
            ...(Array.isArray(decodedToken?.application_roles) ? decodedToken.application_roles : decodedToken?.application_roles ? [decodedToken.application_roles] : [])
          ];

          setUserRoles(extracted);
          setCheckingRoles(false);
        }
      } catch {
        if (isMounted) {
          setCheckingRoles(false);
        }
      }
    }

    fetchUserRoles();

    return () => {
      isMounted = false;
    };
  }, [state.isAuthenticated, state.isLoading, getDecodedIDToken]);

  if (state.isLoading || checkingRoles) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-ela-gray font-medium text-sm">
          <div className="w-2.5 h-2.5 rounded-full bg-ela-orange animate-ping" />
          Verifying credentials with Asgardeo...
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <h2 className="font-serif text-2xl font-bold text-ela-dark mb-2">Member Sign In Required</h2>
        <p className="text-ela-gray text-sm mb-6 max-w-sm">
          You must sign in with your ELA account to access this section.
        </p>
        <button
          onClick={() => signIn()}
          className="px-6 py-3 bg-ela-orange hover:bg-ela-tangerine text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const hasAccess = !requiredRole || userRoles.some((r) => 
    typeof r === 'string' && r.toLowerCase().includes(requiredRole.toLowerCase())
  );

  if (!hasAccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 max-w-md mx-auto">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4 border border-red-100">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-ela-dark mb-2">Restricted Access</h2>
        <p className="text-ela-gray text-sm mb-4">
          This area is restricted to the <strong>{requiredRole}</strong> role (Executive Board). Your current account does not have sufficient clearance.
        </p>
        <span className="text-[11px] font-mono bg-orange-50 text-ela-orange px-3 py-1 rounded-full border border-orange-200">
          Current roles: {userRoles.length ? userRoles.join(', ') : 'General Member'}
        </span>
      </div>
    );
  }

  return children;
}