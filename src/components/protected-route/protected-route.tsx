import { selectIsAuthChecked, selectUser } from '@selectors';
import { Preloader } from '@ui';
import { Navigate, useLocation } from 'react-router-dom';

import { useSelector } from '@services/store';

import type { TProtectedRouteProps } from './type';
import type { Location } from 'react-router-dom';

export const ProtectedRoute = ({
  onlyUnAuth = false,
  children,
}: TProtectedRouteProps): React.JSX.Element => {
  const isAuthChecked = useSelector(selectIsAuthChecked);
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!isAuthChecked) {
    return <Preloader />;
  }

  if (!onlyUnAuth && !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (onlyUnAuth && user) {
    const from = (location.state as { from?: Location } | null)?.from ?? {
      pathname: '/',
    };
    return <Navigate to={from} replace />;
  }

  return children;
};
