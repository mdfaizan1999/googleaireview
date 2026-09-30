import React, { useState } from 'react';
import { ViewType, ToastMessage } from './types';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { CustomerFunnelSimulator } from './components/CustomerFunnelSimulator';
import { Features } from './components/Features';
import { SeoAnalyzer } from './components/SeoAnalyzer';
import { HowItWorks } from './components/HowItWorks';
import { Comparison } from './components/Comparison';
import { QrFlyerDesigner } from './components/QrFlyerDesigner';
import { Industries } from './components/Industries';
import { ShowcaseTabs } from './components/ShowcaseTabs';
import { StatsStrip } from './components/StatsStrip';
import { Pricing } from './components/Pricing';
import { SourceCodeSection } from './components/SourceCodeSection';
import { ReferralProgram } from './components/ReferralProgram';
import { AgencyApplication } from './components/AgencyApplication';
import { Testimonials } from './components/Testimonials';
import { Faq } from './components/Faq';
import { CtaSection } from './components/CtaSection';
import { Footer } from './components/Footer';
import { WhatsAppWidget } from './components/WhatsAppWidget';
import { AuthModal } from './components/AuthModal';
import { Toast } from './components/Toast';
import { SignInPage } from './components/SignInPage';
import { RegisterPage } from './components/RegisterPage';
import { OnboardingWizard } from './components/OnboardingWizard';
import { BusinessDashboard } from './components/BusinessDashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('register');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [businessProfile, setBusinessProfile] = useState({
    name: 'Muzaffarabad azad jamu and kashmir',
    address: '9F4G+2Q8, Domail Muzaffarabad',
    category: 'Other'
  });

  const addToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleOpenAuth = (mode: 'signin' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToDemo = () => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        const el = document.getElementById('funnel-demo');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      const el = document.getElementById('funnel-demo');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Navigation Header (Hidden on dedicated Business Dashboard, Analytics, Negative Reviews, Review Settings, Physical Stands & Services) */}
      {currentView !== 'dashboard' && currentView !== 'analytics' && currentView !== 'feedback' && currentView !== 'settings' && currentView !== 'stand' && currentView !== 'services' && (
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <Hero
              onStartFree={() => handleNavigate('register')}
              onExploreDemo={handleScrollToDemo}
            />
            <TrustBar />
            <CustomerFunnelSimulator onNotify={addToast} />
            <Features onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
            <SeoAnalyzer standalone={false} />
            <HowItWorks />
            <Comparison onStartFree={() => handleNavigate('register')} />
            <QrFlyerDesigner onNotify={addToast} />
            <Industries />
            <ShowcaseTabs onStartFree={() => handleNavigate('register')} />
            <StatsStrip />
            <Pricing
              standalone={false}
              onSelectPlan={(plan) => {
                addToast(`Selected ${plan}. Starting onboarding...`, 'info');
                handleNavigate('register');
              }}
              onStartFree={() => handleNavigate('register')}
            />
            <SourceCodeSection standalone={false} />
            <ReferralProgram
              standalone={false}
              onNavigateToReferral={() => handleNavigate('referral-program')}
            />
            <Testimonials />
            <Faq />
            <CtaSection
              onStartFree={() => handleNavigate('register')}
              onExploreDemo={handleScrollToDemo}
            />
          </>
        )}

        {currentView === 'vs-normal-qr' && (
          <div>
            <Comparison standalone={true} onStartFree={() => handleNavigate('register')} />
            <CustomerFunnelSimulator onNotify={addToast} />
          </div>
        )}

        {currentView === 'pricing' && (
          <div>
            <Pricing
              standalone={true}
              onSelectPlan={(plan) => {
                addToast(`Selected ${plan}. Launching signup...`, 'info');
                handleNavigate('register');
              }}
              onStartFree={() => handleNavigate('register')}
            />
            <Faq />
            <CtaSection
              onStartFree={() => handleNavigate('register')}
              onExploreDemo={handleScrollToDemo}
            />
          </div>
        )}

        {currentView === 'source-code' && (
          <div className="pt-24 pb-16">
            <SourceCodeSection standalone={true} />
            <CtaSection
              onStartFree={() => handleNavigate('register')}
              onExploreDemo={handleScrollToDemo}
            />
          </div>
        )}

        {currentView === 'referral-program' && (
          <div>
            <ReferralProgram standalone={true} />
            <CtaSection
              onStartFree={() => handleNavigate('register')}
              onExploreDemo={handleScrollToDemo}
            />
          </div>
        )}

        {currentView === 'agency' && (
          <div>
            <AgencyApplication
              standalone={true}
              onNavigateToPricing={() => handleNavigate('pricing')}
              onNavigateToSignIn={() => handleNavigate('signin')}
            />
            <CtaSection
              onStartFree={() => handleNavigate('register')}
              onExploreDemo={handleScrollToDemo}
            />
          </div>
        )}

        {currentView === 'analyzer' && (
          <div className="pt-24 pb-16">
            <SeoAnalyzer standalone={true} />
            <CtaSection
              onStartFree={() => handleNavigate('register')}
              onExploreDemo={handleScrollToDemo}
            />
          </div>
        )}

        {currentView === 'flyer-tool' && (
          <div className="pt-24 pb-16">
            <QrFlyerDesigner onNotify={addToast} />
            <CtaSection
              onStartFree={() => handleNavigate('register')}
              onExploreDemo={handleScrollToDemo}
            />
          </div>
        )}

        {currentView === 'signin' && (
          <SignInPage
            onBackToHome={() => handleNavigate('home')}
            onOpenRegister={() => handleNavigate('register')}
            onSuccess={(msg) => {
              addToast(msg, 'success');
              handleNavigate('dashboard');
            }}
          />
        )}

        {currentView === 'register' && (
          <RegisterPage
            onBackToHome={() => handleNavigate('home')}
            onNavigateToSignIn={() => handleNavigate('signin')}
            onGoToOnboarding={() => handleNavigate('onboarding')}
            onSuccess={(msg) => addToast(msg, 'success')}
          />
        )}

        {currentView === 'onboarding' && (
          <OnboardingWizard
            onComplete={(data?: any) => {
              if (data && data.name) {
                setBusinessProfile(data);
              }
              addToast('Business review funnel activated! Welcome to your dashboard.', 'success');
              handleNavigate('dashboard');
            }}
            onBackToHome={() => handleNavigate('home')}
            onNotify={addToast}
          />
        )}

        {currentView === 'dashboard' && (
          <BusinessDashboard
            businessName={businessProfile.name}
            businessAddress={businessProfile.address}
            businessCategory={businessProfile.category}
            initialTab="dashboard"
            onNavigate={handleNavigate}
            onSignOut={() => {
              addToast('Signed out of business console.', 'info');
              handleNavigate('home');
            }}
            onNotify={addToast}
          />
        )}

        {currentView === 'analytics' && (
          <BusinessDashboard
            businessName={businessProfile.name}
            businessAddress={businessProfile.address}
            businessCategory={businessProfile.category}
            initialTab="analytics"
            onNavigate={handleNavigate}
            onSignOut={() => {
              addToast('Signed out of business console.', 'info');
              handleNavigate('home');
            }}
            onNotify={addToast}
          />
        )}

        {currentView === 'feedback' && (
          <BusinessDashboard
            businessName={businessProfile.name}
            businessAddress={businessProfile.address}
            businessCategory={businessProfile.category}
            initialTab="feedback"
            onNavigate={handleNavigate}
            onSignOut={() => {
              addToast('Signed out of business console.', 'info');
              handleNavigate('home');
            }}
            onNotify={addToast}
          />
        )}

        {currentView === 'settings' && (
          <BusinessDashboard
            businessName={businessProfile.name}
            businessAddress={businessProfile.address}
            businessCategory={businessProfile.category}
            initialTab="settings"
            onNavigate={handleNavigate}
            onSignOut={() => {
              addToast('Signed out of business console.', 'info');
              handleNavigate('home');
            }}
            onNotify={addToast}
          />
        )}

        {currentView === 'stand' && (
          <BusinessDashboard
            businessName={businessProfile.name}
            businessAddress={businessProfile.address}
            businessCategory={businessProfile.category}
            initialTab="stand"
            onNavigate={handleNavigate}
            onSignOut={() => {
              addToast('Signed out of business console.', 'info');
              handleNavigate('home');
            }}
            onNotify={addToast}
          />
        )}

        {currentView === 'services' && (
          <BusinessDashboard
            businessName={businessProfile.name}
            businessAddress={businessProfile.address}
            businessCategory={businessProfile.category}
            initialTab="services"
            onNavigate={handleNavigate}
            onSignOut={() => {
              addToast('Signed out of business console.', 'info');
              handleNavigate('home');
            }}
            onNotify={addToast}
          />
        )}
      </main>

      {/* Footer (Hidden on dedicated full-screen signin, register, onboarding, dashboard, analytics, feedback, settings, stand, and services views) */}
      {currentView !== 'signin' && currentView !== 'register' && currentView !== 'onboarding' && currentView !== 'dashboard' && currentView !== 'analytics' && currentView !== 'feedback' && currentView !== 'settings' && currentView !== 'stand' && currentView !== 'services' && (
        <Footer onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
      )}

      {/* Floating WhatsApp Support Widget */}
      <WhatsAppWidget />

      {/* Auth & Free Trial Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(msg) => addToast(msg, 'success')}
      />
    </div>
  );
}
