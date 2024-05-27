import React, { useEffect } from 'react';
import {
  Route,
  Routes,
  redirect,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import GetRole from './GetRole.utils';

const ProtectedRoute = ({ Component }) => {
  const nav = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const role = GetRole();
    if (role !== 'bdTeam') {
      if (location.pathname !== '/pendingApprovals') {
        // location.redirect('/');
      }
      // nav('/pendingApprovals');
      if (location.pathname === '/') {
        nav('/');
      }
    } else {
      nav('/');
    }
  }, [Component]);

  return (
    <div>
      <Component />
    </div>
  );
};

export default ProtectedRoute;
