export type ViewType = 
  | 'home' 
  | 'vs-normal-qr' 
  | 'pricing' 
  | 'source-code' 
  | 'referral-program' 
  | 'agency' 
  | 'analyzer'
  | 'flyer-tool'
  | 'signin'
  | 'register'
  | 'onboarding'
  | 'dashboard'
  | 'analytics'
  | 'feedback'
  | 'settings'
  | 'stand'
  | 'services'
  | 'billing'
  | 'account'
  | 'funnel'
  | 'admin';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  message: string;
}

export interface ReviewDraft {
  id: string;
  text: string;
  rating: number;
  tags: string[];
  language: string;
}
