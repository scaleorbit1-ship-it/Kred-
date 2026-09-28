/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CleanLandingPage from './components/CleanLandingPage';
import Footer from './components/Footer';
import BrandSystemModal from './components/BrandSystemModal';
import SignInModal from './components/SignInModal';
import SettingsModal from './components/SettingsModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { authService, AuthUser } from './services/authService';

// Dedicated Full Website Pages
import ProductPage from './pages/ProductPage';
import SolutionsPage from './pages/SolutionsPage';
import HowItWorksPage from './pages/HowItWorksPage';
import SecurityPage from './pages/SecurityPage';
import PricingPage from './pages/PricingPage';
import AssistantPage from './pages/AssistantPage';
import AboutPage from './pages/AboutPage';
import GetStartedPage from './pages/GetStartedPage';
import OnboardingPage from './pages/OnboardingPage';
import AuthPage from './pages/AuthPage';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getCurrentUser());
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const initialUser = authService.getCurrentUser();
    return initialUser ? 'assistant' : 'home';
  });
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const { themeConfig, openSettings } = useTheme();

  // Auto-route authenticated users directly to main website page ('assistant') when visiting/returning
  useEffect(() => {
    const unsub = authService.subscribe((user) => {
      setCurrentUser(user);
      if (user) {
        // If logged-in user is returning or on public landing/auth pages, direct to main workspace page
        setCurrentPage((prevPage) => {
          if (prevPage === 'home' || prevPage === 'auth' || prevPage === 'get-started') {
            return 'assistant';
          }
          return prevPage;
        });
      }
    });
    return unsub;
  }, []);

  // Hidden developer hotkey to view brand system in code (Ctrl/Cmd + Shift + B)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'B' || e.key === 'b')) {
        setIsBrandModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigatePage = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateSection = (sectionId: string) => {
    if (currentPage !== 'home') {
      setCurrentPage('home');
      setTimeout(() => {
        const elem = document.getElementById(sectionId);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const elem = document.getElementById(sectionId);
      if (elem) elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const showToast = (_msg: string) => {
    // Pop up notifications removed per user request
  };

  const handleStartFree = () => {
    handleNavigatePage('get-started');
  };

  const handleSignInSuccess = (_userEmail: string, _isDemo?: boolean) => {
    setIsSignInModalOpen(false);
    // Direct routing to AI Assistant first after login
    handleNavigatePage('assistant');
  };

  // Nav bar is hidden on Auth ('auth'), Sign Up ('get-started'), Onboarding ('onboarding'), Dashboard ('dashboard'), Assistant ('assistant'), Tasks ('tasks'), and Settings ('settings')
  const isWorkspaceOrAuthPage =
    currentPage === 'auth' ||
    currentPage === 'get-started' ||
    currentPage === 'onboarding' ||
    currentPage === 'dashboard' ||
    currentPage === 'assistant' ||
    currentPage === 'tasks' ||
    currentPage === 'settings';

  const shouldShowHeader = !isWorkspaceOrAuthPage;
  const isInnerSection = currentPage === 'assistant' || currentPage === 'dashboard' || currentPage === 'tasks';

  return (
    <div
      className={`min-h-screen antialiased selection:bg-[#10C77A]/30 flex flex-col font-sans transition-colors duration-200 ${
        isInnerSection ? '' : 'bg-[#F8F7F2] text-[#18181B]'
      }`}
      style={
        isInnerSection
          ? {
              backgroundColor: themeConfig.bgCanvas,
              color: themeConfig.textPrimary,
            }
          : undefined
      }
    >
      {/* Navigation Header on Public Website Pages */}
      {shouldShowHeader && (
        <Header
          currentPage={currentPage}
          onNavigatePage={handleNavigatePage}
          onNavigateSection={handleNavigateSection}
          onOpenBrandModal={() => setIsBrandModalOpen(true)}
          onOpenEarlyAccess={handleStartFree}
          onOpenSignInModal={() => setIsSignInModalOpen(true)}
          onShowToast={showToast}
        />
      )}

      {/* Main Content Router */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <CleanLandingPage
            onStartFree={handleStartFree}
            onNavigatePage={handleNavigatePage}
            onShowToast={showToast}
          />
        )}

        {currentPage === 'auth' && (
          <AuthPage
            onSuccess={(_user) => {
              handleNavigatePage('assistant');
            }}
            onNavigate={handleNavigatePage}
            onShowToast={showToast}
          />
        )}

        {currentPage === 'get-started' && (
          <GetStartedPage
            onOpenSignInModal={() => setIsSignInModalOpen(true)}
            onNavigate={handleNavigatePage}
            onShowToast={showToast}
          />
        )}

        {currentPage === 'onboarding' && (
          <OnboardingPage
            onComplete={() => handleNavigatePage('assistant')}
            onNavigate={handleNavigatePage}
            onShowToast={showToast}
          />
        )}

        {currentPage === 'product' && (
          <ProductPage
            onStartFree={handleStartFree}
            onNavigate={handleNavigatePage}
            onShowToast={showToast}
          />
        )}

        {currentPage === 'solutions' && (
          <SolutionsPage
            onStartFree={handleStartFree}
            onNavigate={handleNavigatePage}
          />
        )}

        {currentPage === 'how' && (
          <HowItWorksPage
            onStartFree={handleStartFree}
            onNavigate={handleNavigatePage}
          />
        )}

        {currentPage === 'security' && (
          <SecurityPage
            onStartFree={handleStartFree}
            onNavigate={handleNavigatePage}
          />
        )}

        {currentPage === 'pricing' && (
          <PricingPage
            onStartFree={handleStartFree}
            onNavigate={handleNavigatePage}
          />
        )}

        {(currentPage === 'assistant' || currentPage === 'dashboard' || currentPage === 'tasks') && (
          <AssistantPage
            initialView={currentPage === 'tasks' ? 'tasks' : 'chat'}
            onNavigate={handleNavigatePage}
            onShowToast={showToast}
          />
        )}

        {currentPage === 'settings' && (
          <SettingsPage
            onNavigate={handleNavigatePage}
            onShowToast={showToast}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            onStartFree={handleStartFree}
            onNavigate={handleNavigatePage}
          />
        )}
      </main>

      {/* Footer on subpages (CleanLandingPage has the complete integrated footer matching the reference design) */}
      {currentPage !== 'home' && !isWorkspaceOrAuthPage && (
        <Footer
          onNavigatePage={handleNavigatePage}
          onOpenBrandModal={() => setIsBrandModalOpen(true)}
          onShowToast={showToast}
        />
      )}

      {/* Interactive Brand Guidelines Modal (Triggerable via Cmd/Ctrl + Shift + B) */}
      <BrandSystemModal
        isOpen={isBrandModalOpen}
        onClose={() => setIsBrandModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Interactive Sign In Pop-up Modal */}
      <SignInModal
        isOpen={isSignInModalOpen}
        onClose={() => setIsSignInModalOpen(false)}
        onSuccess={handleSignInSuccess}
        onGoToSignUp={() => {
          setIsSignInModalOpen(false);
          handleNavigatePage('get-started');
        }}
        onShowToast={showToast}
      />

      {/* Global Settings Modal for Theme & Vault Configuration */}
      <SettingsModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
