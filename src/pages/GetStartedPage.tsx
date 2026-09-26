import React from 'react';
import { AuthPage } from './AuthPage';
import { AuthUser } from '../services/authService';

interface GetStartedPageProps {
  onOpenSignInModal?: () => void;
  onNavigate: (page: string) => void;
  onShowToast?: (msg: string) => void;
}

export const GetStartedPage: React.FC<GetStartedPageProps> = ({
  onNavigate,
  onShowToast = () => {},
}) => {
  return (
    <AuthPage
      initialMode="signup"
      onSuccess={(_user: AuthUser) => {
        onNavigate('assistant');
      }}
      onNavigate={onNavigate}
      onShowToast={onShowToast}
    />
  );
};

export default GetStartedPage;
