import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  Business,
  BusinessLocation,
  GoogleConnection,
  GoogleLocation,
  GoogleLocationLink,
  GoogleReview,
  Review,
  ReviewFunnel,
  FunnelEvent,
  QRCode,
  AnalyticsDaily,
  Plan,
  Subscription,
  Payment,
  AuditLog,
  AIReviewAnalysis,
  AIReplySuggestion,
  AIUsageLog,
  AISuggestionStatus,
  BillingCustomer,
  Invoice,
  WebhookEvent,
  UsageCounter,
  FeatureFlag,
  SystemSettings,
  FailedJob,
  SchedulerTask
} from './types';

interface DatabaseSchema {
  users: User[];
  businesses: Business[];
  business_locations: BusinessLocation[];
  google_connections: GoogleConnection[];
  google_locations: GoogleLocation[];
  google_location_links: GoogleLocationLink[];
  google_reviews: GoogleReview[];
  reviews: Review[];
  review_funnels: ReviewFunnel[];
  funnel_events: FunnelEvent[];
  analytics_daily: AnalyticsDaily[];
  qr_codes: QRCode[];
  plans: Plan[];
  subscriptions: Subscription[];
  payments: Payment[];
  audit_logs: AuditLog[];
  ai_review_analyses: AIReviewAnalysis[];
  ai_reply_suggestions: AIReplySuggestion[];
  ai_usage_logs: AIUsageLog[];
  billing_customers: BillingCustomer[];
  invoices: Invoice[];
  webhook_events: WebhookEvent[];
  usage_counters: UsageCounter[];
  feature_flags: FeatureFlag[];
  system_settings: SystemSettings;
  failed_jobs: FailedJob[];
  scheduler_tasks: SchedulerTask[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DB_DIR, 'db.json');

class DatabaseService {
  private data: DatabaseSchema;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.data = this.loadDatabase();
  }

  private getInitialData(): DatabaseSchema {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('Password@123', salt);
    const adminPasswordHash = bcrypt.hashSync('Admin@123456', salt);

    const now = new Date().toISOString();

    const adminUser: User = {
      id: 'usr_admin_001',
      name: 'ReviewFlow Admin',
      email: 'admin@reviewflowai.in',
      password_hash: adminPasswordHash,
      phone: '+91 9707842047',
      role: 'admin',
      status: 'active',
      email_verified_at: now,
      created_at: now,
      updated_at: now
    };

    const demoUser: User = {
      id: 'usr_demo_002',
      name: 'harsh',
      email: 'ahmadfaizan1999@gmail.com',
      password_hash: demoPasswordHash,
      phone: '+91 8877307350',
      role: 'user',
      status: 'active',
      email_verified_at: now,
      last_login_at: now,
      created_at: now,
      updated_at: now
    };

    const demoBusiness: Business = {
      id: 'biz_001',
      user_id: demoUser.id,
      name: 'Muzaffarabad azad jamu and kashmir',
      slug: 'muzaffarabad-ajk',
      category: 'Healthcare & Dental',
      description: 'Comprehensive family healthcare, diagnostic center and pharmacy clinic.',
      phone: '+91 8877307350',
      email: 'contact@muzaffarabadhealth.com',
      address: '9F4G+2Q8, Domail Muzaffarabad',
      city: 'Muzaffarabad',
      state: 'Azad Jammu and Kashmir',
      country: 'Pakistan',
      postal_code: '13100',
      timezone: 'Asia/Karachi',
      status: 'active',
      google_review_url: 'https://g.page/r/CbX7-reviewflow/review',
      min_star_threshold: 4,
      custom_keywords: ['Dr. Sharma', 'Root Canal', 'Gentle Care', 'Fast Appointment', 'Clean Clinic'],
      created_at: now,
      updated_at: now
    };

    const demoLocation: GoogleLocation = {
      id: 'gloc_001',
      business_id: demoBusiness.id,
      place_id: 'ChIJ59Z_EXAMPLE_MUZAFFARABAD',
      location_title: 'Muzaffarabad azad jamu and kashmir',
      address: '9F4G+2Q8, Domail Muzaffarabad',
      phone: '+91 8877307350',
      review_url: 'https://g.page/r/CbX7-reviewflow/review',
      rating: 4.9,
      review_count: 148,
      verified: true,
      status: 'active',
      last_synced_at: now,
      created_at: now,
      updated_at: now
    };

    const demoFunnel: ReviewFunnel = {
      id: 'fnl_001',
      business_id: demoBusiness.id,
      google_location_id: demoLocation.id,
      name: 'Main Entrance QR Funnel',
      slug: 'muzaffarabad-reviews',
      title: 'How was your experience today?',
      subtitle: 'Your feedback helps our doctors and team improve care every day.',
      primary_color: '#34A853',
      background_color: '#F9FAFB',
      language: 'en',
      enabled: true,
      show_customer_name: true,
      google_review_url: 'https://g.page/r/CbX7-reviewflow/review',
      created_at: now,
      updated_at: now
    };

    const demoQr: QRCode = {
      id: 'qr_001',
      business_id: demoBusiness.id,
      funnel_id: demoFunnel.id,
      name: 'Reception Counter QR Stand',
      short_code: 'muz-rec',
      destination_url: `/r/${demoFunnel.slug}`,
      style: 'modern_dots',
      foreground_color: '#166534',
      background_color: '#FFFFFF',
      scan_count: 48,
      status: 'active',
      created_at: now,
      updated_at: now
    };

    const demoPlans: Plan[] = [
      {
        id: 'plan_free_trial',
        name: 'Free Trial',
        slug: 'free-trial',
        description: 'Get started with essential Google review QR stand tools.',
        price: 0,
        monthly_price: 0,
        annual_price: 0,
        currency: 'INR',
        is_free: true,
        trial_days: 14,
        sort_order: 1,
        billing_interval: 'month',
        max_businesses: 1,
        max_locations: 1,
        max_qr_codes: 2,
        monthly_scans: 100,
        ai_generations: 20,
        analytics_enabled: true,
        google_integration: true,
        white_label: false,
        api_access: false,
        features: {
          analytics: true,
          google_reviews: true,
          google_reply: true,
          ai_review_analysis: true,
          ai_reply_generation: true,
          multiple_locations: false,
          custom_branding: false,
          advanced_analytics: false,
          api_access: false,
          team_members: false,
          export: false
        },
        limits: {
          businesses: 1,
          locations: 1,
          funnels: 2,
          qr_codes: 2,
          google_reviews: 500,
          ai_generations: 20,
          monthly_scans: 100
        },
        status: 'active'
      },
      {
        id: 'plan_starter_monthly',
        name: 'Starter Plan',
        slug: 'starter-monthly',
        description: 'Ideal for local clinics and single-location retail businesses.',
        price: 499,
        monthly_price: 499,
        annual_price: 4990,
        currency: 'INR',
        is_free: false,
        razorpay_monthly_plan_id: 'plan_rzp_starter_monthly',
        razorpay_annual_plan_id: 'plan_rzp_starter_annual',
        trial_days: 0,
        sort_order: 2,
        billing_interval: 'month',
        max_businesses: 1,
        max_locations: 2,
        max_qr_codes: 5,
        monthly_scans: 1000,
        ai_generations: 250,
        analytics_enabled: true,
        google_integration: true,
        white_label: false,
        api_access: false,
        features: {
          analytics: true,
          google_reviews: true,
          google_reply: true,
          ai_review_analysis: true,
          ai_reply_generation: true,
          multiple_locations: true,
          custom_branding: false,
          advanced_analytics: true,
          api_access: false,
          team_members: false,
          export: true
        },
        limits: {
          businesses: 1,
          locations: 2,
          funnels: 5,
          qr_codes: 5,
          google_reviews: 2000,
          ai_generations: 250,
          monthly_scans: 1000
        },
        status: 'active'
      },
      {
        id: 'plan_yearly_individual',
        name: 'Growth Plan',
        slug: 'yearly-individual',
        description: 'For growing businesses expanding to multiple branches.',
        price: 1499,
        monthly_price: 1499,
        annual_price: 14990,
        currency: 'INR',
        is_free: false,
        razorpay_monthly_plan_id: 'plan_rzp_growth_monthly',
        razorpay_annual_plan_id: 'plan_rzp_growth_annual',
        trial_days: 0,
        sort_order: 3,
        billing_interval: 'year',
        max_businesses: 3,
        max_locations: 5,
        max_qr_codes: 20,
        monthly_scans: 10000,
        ai_generations: 1500,
        analytics_enabled: true,
        google_integration: true,
        white_label: true,
        api_access: false,
        features: {
          analytics: true,
          google_reviews: true,
          google_reply: true,
          ai_review_analysis: true,
          ai_reply_generation: true,
          multiple_locations: true,
          custom_branding: true,
          advanced_analytics: true,
          api_access: true,
          team_members: false,
          export: true
        },
        limits: {
          businesses: 3,
          locations: 5,
          funnels: 20,
          qr_codes: 20,
          google_reviews: 10000,
          ai_generations: 1500,
          monthly_scans: 10000
        },
        status: 'active'
      },
      {
        id: 'plan_agency_custom',
        name: 'Agency Multi-Location Plan',
        slug: 'agency-custom',
        description: 'For marketing agencies and multi-location hospital chains.',
        price: 4999,
        monthly_price: 4999,
        annual_price: 49990,
        currency: 'INR',
        is_free: false,
        razorpay_monthly_plan_id: 'plan_rzp_agency_monthly',
        razorpay_annual_plan_id: 'plan_rzp_agency_annual',
        trial_days: 0,
        sort_order: 4,
        billing_interval: 'month',
        max_businesses: 50,
        max_locations: 50,
        max_qr_codes: 200,
        monthly_scans: 50000,
        ai_generations: 10000,
        analytics_enabled: true,
        google_integration: true,
        white_label: true,
        api_access: true,
        features: {
          analytics: true,
          google_reviews: true,
          google_reply: true,
          ai_review_analysis: true,
          ai_reply_generation: true,
          multiple_locations: true,
          custom_branding: true,
          advanced_analytics: true,
          api_access: true,
          team_members: true,
          export: true
        },
        limits: {
          businesses: 50,
          locations: 50,
          funnels: 200,
          qr_codes: 200,
          google_reviews: 50000,
          ai_generations: 10000,
          monthly_scans: 50000
        },
        status: 'active'
      }
    ];

    const demoSubscription: Subscription = {
      id: 'sub_001',
      user_id: demoUser.id,
      plan_id: 'plan_free_trial',
      gateway: 'manual',
      status: 'active',
      starts_at: now,
      ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      trial_ends_at: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
    };

    const demoReviews: Review[] = [
      {
        id: 'rev_001',
        business_id: demoBusiness.id,
        google_location_id: demoLocation.id,
        google_review_id: 'g_rev_101',
        reviewer_name: 'Priya Sharma',
        reviewer_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        rating: 5,
        comment: 'Outstanding care from the team! Dr. Sharma explained everything patiently. The clinic is spotless and modern.',
        review_created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        owner_reply: 'Thank you so much Priya! It was our pleasure to take care of you.',
        reply_status: 'replied',
        reply_source: 'ai',
        created_at: now,
        updated_at: now
      },
      {
        id: 'rev_002',
        business_id: demoBusiness.id,
        google_location_id: demoLocation.id,
        google_review_id: 'g_rev_102',
        reviewer_name: 'Rahul Verma',
        reviewer_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        rating: 5,
        comment: 'Very professional appointment scheduling. Fast consultation and affordable pricing.',
        review_created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        reply_status: 'unanswered',
        created_at: now,
        updated_at: now
      },
      {
        id: 'rev_003',
        business_id: demoBusiness.id,
        google_location_id: demoLocation.id,
        reviewer_name: 'Vikram Mehta',
        rating: 2,
        comment: 'Waited 35 minutes past my scheduled appointment time before being called into the room.',
        review_created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        reply_status: 'unanswered',
        policy_violation_status: 'none',
        created_at: now,
        updated_at: now
      }
    ];

    const demoBusinessLocation: BusinessLocation = {
      id: 'loc_001',
      business_id: demoBusiness.id,
      name: 'Main Clinic & Dental Care',
      address: '9F4G+2Q8, Domail Muzaffarabad',
      city: 'Muzaffarabad',
      state: 'Azad Jammu and Kashmir',
      country: 'Pakistan',
      postal_code: '13100',
      phone: '+91 8877307350',
      timezone: 'Asia/Karachi',
      status: 'active',
      created_at: now,
      updated_at: now
    };

    return {
      users: [adminUser, demoUser],
      businesses: [demoBusiness],
      business_locations: [demoBusinessLocation],
      google_connections: [],
      google_locations: [demoLocation],
      google_location_links: [],
      google_reviews: [],
      reviews: demoReviews,
      review_funnels: [demoFunnel],
      funnel_events: [],
      analytics_daily: [],
      qr_codes: [demoQr],
      plans: demoPlans,
      subscriptions: [demoSubscription],
      payments: [],
      audit_logs: [
        {
          id: 'aud_001',
          user_id: demoUser.id,
          action: 'user.registered',
          entity_type: 'user',
          entity_id: demoUser.id,
          ip_address: '127.0.0.1',
          created_at: now
        }
      ],
      ai_review_analyses: [],
      ai_reply_suggestions: [],
      ai_usage_logs: [],
      billing_customers: [],
      invoices: [],
      webhook_events: [],
      usage_counters: [],
      feature_flags: [
        {
          id: 'ff_001',
          name: 'AI Reply Suggestions',
          key: 'ai_reply_suggestions',
          description: 'Enables LLM-assisted draft replies for Google reviews.',
          enabled: true,
          environment: 'all',
          created_at: now,
          updated_at: now
        },
        {
          id: 'ff_002',
          name: 'Google Review Sync',
          key: 'google_review_sync',
          description: 'Automated 30-min background sync with Google Business Profile.',
          enabled: true,
          environment: 'all',
          created_at: now,
          updated_at: now
        },
        {
          id: 'ff_003',
          name: 'Advanced Analytics',
          key: 'advanced_analytics',
          description: 'Detailed NPS, funnel conversion, and star rating distribution metrics.',
          enabled: true,
          environment: 'all',
          created_at: now,
          updated_at: now
        },
        {
          id: 'ff_004',
          name: 'Agency Multi-Location Mode',
          key: 'agency_mode',
          description: 'Multi-business management tools and white-label QR standees.',
          enabled: true,
          environment: 'all',
          created_at: now,
          updated_at: now
        },
        {
          id: 'ff_005',
          name: 'Razorpay Billing Gateway',
          key: 'razorpay_checkout',
          description: 'Live recurring subscriptions and automated webhook processing.',
          enabled: true,
          environment: 'all',
          created_at: now,
          updated_at: now
        }
      ],
      system_settings: {
        maintenance_mode: false,
        new_registration_enabled: true,
        default_timezone: 'Asia/Kolkata',
        default_currency: 'INR',
        support_email: 'support@reviewflowai.in',
        support_url: 'https://reviewflowai.in/support',
        billing_grace_period_days: 3,
        default_ai_provider: 'gemini',
        updated_at: now
      },
      failed_jobs: [],
      scheduler_tasks: [
        {
          id: 'task_001',
          task_name: 'Analytics Rolling Aggregation',
          interval_minutes: 15,
          last_run: now,
          last_status: 'success',
          last_duration_ms: 45
        },
        {
          id: 'task_002',
          task_name: 'Google Reviews Background Sync',
          interval_minutes: 30,
          last_run: now,
          last_status: 'success',
          last_duration_ms: 120
        },
        {
          id: 'task_003',
          task_name: 'Billing Grace Period & Expiry Monitor',
          interval_minutes: 60,
          last_run: now,
          last_status: 'success',
          last_duration_ms: 15
        }
      ]
    };
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content);
        if (!parsed.business_locations) parsed.business_locations = [];
        if (!parsed.google_connections) parsed.google_connections = [];
        if (!parsed.google_location_links) parsed.google_location_links = [];
        if (!parsed.google_reviews) parsed.google_reviews = [];
        if (!parsed.funnel_events) parsed.funnel_events = [];
        if (!parsed.analytics_daily) parsed.analytics_daily = [];
        if (!parsed.ai_review_analyses) parsed.ai_review_analyses = [];
        if (!parsed.ai_reply_suggestions) parsed.ai_reply_suggestions = [];
        if (!parsed.ai_usage_logs) parsed.ai_usage_logs = [];
        if (!parsed.billing_customers) parsed.billing_customers = [];
        if (!parsed.invoices) parsed.invoices = [];
        if (!parsed.webhook_events) parsed.webhook_events = [];
        if (!parsed.usage_counters) parsed.usage_counters = [];
        if (!parsed.feature_flags) parsed.feature_flags = this.getInitialData().feature_flags;
        if (!parsed.system_settings) parsed.system_settings = this.getInitialData().system_settings;
        if (!parsed.failed_jobs) parsed.failed_jobs = [];
        if (!parsed.scheduler_tasks) parsed.scheduler_tasks = this.getInitialData().scheduler_tasks;
        return parsed;
      }
    } catch (err) {
      console.error('[Database] Failed to read database file, initializing fresh:', err);
    }

    const initial = this.getInitialData();
    this.persist(initial);
    return initial;
  }

  private persist(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to write database file:', err);
    }
  }

  public save() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.persist(this.data);
    }, 100);
  }

  // ═══════ USERS ═══════
  public findUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public findUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const now = new Date().toISOString();
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: now,
      updated_at: now
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return null;

    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.users[index];
  }

  public deleteUser(id: string): boolean {
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== id);
    if (this.data.users.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // ═══════ SLUG & CODE GENERATORS ═══════
  public generateUniqueBusinessSlug(name: string, excludeId?: string): string {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'business';
    let slug = base;
    let counter = 1;
    while (this.data.businesses.some((b) => b.slug === slug && b.id !== excludeId && !b.deleted_at)) {
      counter++;
      slug = `${base}-${counter}`;
    }
    return slug;
  }

  public generateUniqueFunnelSlug(name: string, excludeId?: string): string {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'funnel';
    let slug = base;
    let counter = 1;
    while ((this.data.review_funnels || []).some((f) => f.slug === slug && f.id !== excludeId && !f.deleted_at)) {
      counter++;
      slug = `${base}-${counter}`;
    }
    return slug;
  }

  public generateUniqueShortCode(): string {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
    let code = '';
    do {
      code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while ((this.data.qr_codes || []).some((q) => q.short_code.toLowerCase() === code.toLowerCase() && !q.deleted_at));
    return code;
  }

  // ═══════ BUSINESSES ═══════
  public findBusinessesByUserId(userId: string): Business[] {
    return this.data.businesses.filter((b) => b.user_id === userId && !b.deleted_at);
  }

  public findBusinessById(id: string): Business | undefined {
    return this.data.businesses.find((b) => b.id === id && !b.deleted_at);
  }

  public findBusinessBySlug(slug: string): Business | undefined {
    return this.data.businesses.find((b) => b.slug === slug && !b.deleted_at);
  }

  public createBusiness(biz: Omit<Business, 'id' | 'created_at' | 'updated_at'>): Business {
    const now = new Date().toISOString();
    const newBiz: Business = {
      ...biz,
      id: `biz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: now,
      updated_at: now
    };
    this.data.businesses.push(newBiz);
    this.save();
    return newBiz;
  }

  public updateBusiness(id: string, updates: Partial<Business>): Business | null {
    const index = this.data.businesses.findIndex((b) => b.id === id && !b.deleted_at);
    if (index === -1) return null;

    this.data.businesses[index] = {
      ...this.data.businesses[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.businesses[index];
  }

  public deleteBusiness(id: string): boolean {
    const biz = this.data.businesses.find((b) => b.id === id && !b.deleted_at);
    if (!biz) return false;

    // Soft delete
    biz.deleted_at = new Date().toISOString();
    biz.status = 'inactive';
    this.save();
    return true;
  }

  // ═══════ BUSINESS LOCATIONS ═══════
  public findLocationsByBusinessId(businessId: string): BusinessLocation[] {
    if (!this.data.business_locations) this.data.business_locations = [];
    return this.data.business_locations.filter((l) => l.business_id === businessId && !l.deleted_at);
  }

  public findLocationById(id: string): BusinessLocation | undefined {
    if (!this.data.business_locations) this.data.business_locations = [];
    return this.data.business_locations.find((l) => l.id === id && !l.deleted_at);
  }

  public createLocation(loc: Omit<BusinessLocation, 'id' | 'created_at' | 'updated_at'>): BusinessLocation {
    const now = new Date().toISOString();
    const newLoc: BusinessLocation = {
      ...loc,
      id: `loc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: loc.status || 'active',
      created_at: now,
      updated_at: now
    };
    if (!this.data.business_locations) this.data.business_locations = [];
    this.data.business_locations.push(newLoc);
    this.save();
    return newLoc;
  }

  public updateLocation(id: string, updates: Partial<BusinessLocation>): BusinessLocation | null {
    if (!this.data.business_locations) return null;
    const index = this.data.business_locations.findIndex((l) => l.id === id && !l.deleted_at);
    if (index === -1) return null;

    this.data.business_locations[index] = {
      ...this.data.business_locations[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.business_locations[index];
  }

  public deleteLocation(id: string): boolean {
    if (!this.data.business_locations) return false;
    const loc = this.data.business_locations.find((l) => l.id === id && !l.deleted_at);
    if (!loc) return false;

    loc.deleted_at = new Date().toISOString();
    loc.status = 'inactive';
    this.save();
    return true;
  }

  // ═══════ REVIEWS ═══════
  public findReviewsByBusinessId(businessId: string): Review[] {
    return this.data.reviews.filter((r) => r.business_id === businessId);
  }

  public findReviewById(id: string): Review | undefined {
    return (this.data.reviews || []).find((r) => r.id === id);
  }

  public createReview(rev: Omit<Review, 'id' | 'created_at' | 'updated_at'>): Review {
    const now = new Date().toISOString();
    const newRev: Review = {
      ...rev,
      id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: now,
      updated_at: now
    };
    this.data.reviews.push(newRev);
    this.save();
    return newRev;
  }

  public updateReview(id: string, updates: Partial<Review>): Review | null {
    const index = this.data.reviews.findIndex((r) => r.id === id);
    if (index === -1) return null;

    this.data.reviews[index] = {
      ...this.data.reviews[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.reviews[index];
  }

  // ═══════ PLANS & SUBSCRIPTIONS ═══════
  public getPlans(): Plan[] {
    return this.data.plans.filter((p) => p.status === 'active');
  }

  public findSubscriptionByUserId(userId: string): Subscription | undefined {
    return this.data.subscriptions.find((s) => s.user_id === userId);
  }

  public upsertSubscription(userId: string, planId: string, gateway: Subscription['gateway'] = 'upi'): Subscription {
    const now = new Date().toISOString();
    const existingIndex = this.data.subscriptions.findIndex((s) => s.user_id === userId);

    const plan = this.data.plans.find((p) => p.id === planId || p.slug === planId);
    const durationDays = plan?.billing_interval === 'year' ? 365 : 30;
    const endsAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    if (existingIndex !== -1) {
      this.data.subscriptions[existingIndex] = {
        ...this.data.subscriptions[existingIndex],
        plan_id: plan?.id || planId,
        gateway,
        status: 'active',
        starts_at: now,
        ends_at: endsAt
      };
      this.save();
      return this.data.subscriptions[existingIndex];
    } else {
      const newSub: Subscription = {
        id: `sub_${Date.now()}`,
        user_id: userId,
        plan_id: plan?.id || planId,
        gateway,
        status: 'active',
        starts_at: now,
        ends_at: endsAt
      };
      this.data.subscriptions.push(newSub);
      this.save();
      return newSub;
    }
  }

  public findPlanById(id: string): Plan | undefined {
    return this.data.plans.find((p) => p.id === id);
  }

  public findPlanBySlug(slug: string): Plan | undefined {
    return this.data.plans.find((p) => p.slug === slug);
  }

  public findSubscriptionById(id: string): Subscription | undefined {
    return this.data.subscriptions.find((s) => s.id === id);
  }

  public findSubscriptionByRazorpayId(rzpSubId: string): Subscription | undefined {
    return this.data.subscriptions.find(
      (s) => s.razorpay_subscription_id === rzpSubId || s.gateway_subscription_id === rzpSubId
    );
  }

  public createSubscriptionRecord(sub: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>): Subscription {
    const now = new Date().toISOString();
    const newSub: Subscription = {
      ...sub,
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: now,
      updated_at: now
    };
    this.data.subscriptions.push(newSub);
    this.save();
    return newSub;
  }

  public updateSubscription(id: string, updates: Partial<Subscription>): Subscription | null {
    const index = this.data.subscriptions.findIndex((s) => s.id === id);
    if (index === -1) return null;

    this.data.subscriptions[index] = {
      ...this.data.subscriptions[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.subscriptions[index];
  }

  // ═══════ BILLING CUSTOMERS ═══════
  public findBillingCustomerByUserId(userId: string): BillingCustomer | undefined {
    if (!this.data.billing_customers) this.data.billing_customers = [];
    return this.data.billing_customers.find((c) => c.user_id === userId);
  }

  public upsertBillingCustomer(cust: Omit<BillingCustomer, 'id' | 'created_at' | 'updated_at'>): BillingCustomer {
    if (!this.data.billing_customers) this.data.billing_customers = [];
    const now = new Date().toISOString();

    const existingIndex = this.data.billing_customers.findIndex((c) => c.user_id === cust.user_id);
    if (existingIndex !== -1) {
      this.data.billing_customers[existingIndex] = {
        ...this.data.billing_customers[existingIndex],
        ...cust,
        updated_at: now
      };
      this.save();
      return this.data.billing_customers[existingIndex];
    }

    const newCust: BillingCustomer = {
      ...cust,
      id: `bcust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: now,
      updated_at: now
    };
    this.data.billing_customers.push(newCust);
    this.save();
    return newCust;
  }

  // ═══════ INVOICES ═══════
  public findInvoicesByUserId(userId: string): Invoice[] {
    if (!this.data.invoices) this.data.invoices = [];
    return this.data.invoices
      .filter((i) => i.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public findInvoiceById(id: string): Invoice | undefined {
    if (!this.data.invoices) this.data.invoices = [];
    return this.data.invoices.find((i) => i.id === id);
  }

  public findInvoiceByRazorpayId(rzpInvId: string): Invoice | undefined {
    if (!this.data.invoices) this.data.invoices = [];
    return this.data.invoices.find((i) => i.razorpay_invoice_id === rzpInvId);
  }

  public createInvoice(inv: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Invoice {
    if (!this.data.invoices) this.data.invoices = [];
    const now = new Date().toISOString();

    const newInv: Invoice = {
      ...inv,
      id: `inv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: now,
      updated_at: now
    };
    this.data.invoices.unshift(newInv);
    this.save();
    return newInv;
  }

  public updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    if (!this.data.invoices) return null;
    const index = this.data.invoices.findIndex((i) => i.id === id);
    if (index === -1) return null;

    this.data.invoices[index] = {
      ...this.data.invoices[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.invoices[index];
  }

  // ═══════ WEBHOOK EVENTS ═══════
  public findWebhookEvent(provider: string, eventId: string): WebhookEvent | undefined {
    if (!this.data.webhook_events) this.data.webhook_events = [];
    return this.data.webhook_events.find((e) => e.provider === provider && e.event_id === eventId);
  }

  public createWebhookEvent(event: Omit<WebhookEvent, 'id' | 'created_at' | 'updated_at'>): WebhookEvent {
    if (!this.data.webhook_events) this.data.webhook_events = [];
    const now = new Date().toISOString();

    const newEv: WebhookEvent = {
      ...event,
      id: `whev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      created_at: now,
      updated_at: now
    };
    this.data.webhook_events.unshift(newEv);
    if (this.data.webhook_events.length > 2000) {
      this.data.webhook_events = this.data.webhook_events.slice(0, 2000);
    }
    this.save();
    return newEv;
  }

  public updateWebhookEvent(id: string, updates: Partial<WebhookEvent>): WebhookEvent | null {
    if (!this.data.webhook_events) return null;
    const index = this.data.webhook_events.findIndex((e) => e.id === id);
    if (index === -1) return null;

    this.data.webhook_events[index] = {
      ...this.data.webhook_events[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.webhook_events[index];
  }

  // ═══════ PAYMENTS ═══════
  public findPaymentsByUserId(userId: string): Payment[] {
    return this.data.payments.filter((p) => p.user_id === userId);
  }

  public createPayment(payment: Omit<Payment, 'id'>): Payment {
    const newPayment: Payment = {
      ...payment,
      id: `pay_${Date.now()}`
    };
    this.data.payments.unshift(newPayment);
    this.save();
    return newPayment;
  }

  // ═══════ REVIEW FUNNELS ═══════
  public findFunnelsByBusinessId(businessId: string): ReviewFunnel[] {
    return (this.data.review_funnels || []).filter((f) => f.business_id === businessId && !f.deleted_at);
  }

  public findFunnelById(id: string): ReviewFunnel | undefined {
    return (this.data.review_funnels || []).find((f) => f.id === id && !f.deleted_at);
  }

  public findFunnelBySlug(slug: string): ReviewFunnel | undefined {
    return (this.data.review_funnels || []).find((f) => f.slug === slug && !f.deleted_at);
  }

  public createFunnel(funnel: Omit<ReviewFunnel, 'id' | 'created_at' | 'updated_at'>): ReviewFunnel {
    const now = new Date().toISOString();
    const newFunnel: ReviewFunnel = {
      ...funnel,
      id: `fnl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: now,
      updated_at: now
    };
    if (!this.data.review_funnels) this.data.review_funnels = [];
    this.data.review_funnels.push(newFunnel);
    this.save();
    return newFunnel;
  }

  public updateFunnel(id: string, updates: Partial<ReviewFunnel>): ReviewFunnel | null {
    if (!this.data.review_funnels) return null;
    const index = this.data.review_funnels.findIndex((f) => f.id === id && !f.deleted_at);
    if (index === -1) return null;

    this.data.review_funnels[index] = {
      ...this.data.review_funnels[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.review_funnels[index];
  }

  public deleteFunnel(id: string): boolean {
    if (!this.data.review_funnels) return false;
    const funnel = this.data.review_funnels.find((f) => f.id === id && !f.deleted_at);
    if (!funnel) return false;

    funnel.deleted_at = new Date().toISOString();
    funnel.enabled = false;
    this.save();
    return true;
  }

  // ═══════ QR CODES ═══════
  public findQrCodesByBusinessId(businessId: string): QRCode[] {
    return (this.data.qr_codes || []).filter((q) => q.business_id === businessId && !q.deleted_at);
  }

  public findQrCodeById(id: string): QRCode | undefined {
    return (this.data.qr_codes || []).find((q) => q.id === id && !q.deleted_at);
  }

  public findQrCodeByShortCode(shortCode: string): QRCode | undefined {
    return (this.data.qr_codes || []).find((q) => q.short_code.toLowerCase() === shortCode.toLowerCase() && !q.deleted_at);
  }

  public createQrCode(qr: Omit<QRCode, 'id' | 'scan_count' | 'created_at' | 'updated_at'>): QRCode {
    const now = new Date().toISOString();
    const newQr: QRCode = {
      ...qr,
      id: `qr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      scan_count: 0,
      created_at: now,
      updated_at: now
    };
    if (!this.data.qr_codes) this.data.qr_codes = [];
    this.data.qr_codes.push(newQr);
    this.save();
    return newQr;
  }

  public updateQrCode(id: string, updates: Partial<QRCode>): QRCode | null {
    if (!this.data.qr_codes) return null;
    const index = this.data.qr_codes.findIndex((q) => q.id === id && !q.deleted_at);
    if (index === -1) return null;

    this.data.qr_codes[index] = {
      ...this.data.qr_codes[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.qr_codes[index];
  }

  public deleteQrCode(id: string): boolean {
    if (!this.data.qr_codes) return false;
    const qr = this.data.qr_codes.find((q) => q.id === id && !q.deleted_at);
    if (!qr) return false;

    qr.deleted_at = new Date().toISOString();
    qr.status = 'inactive';
    this.save();
    return true;
  }

  public incrementQrScan(id: string): void {
    if (!this.data.qr_codes) return;
    const qr = this.data.qr_codes.find((q) => q.id === id);
    if (qr) {
      qr.scan_count = (qr.scan_count || 0) + 1;
      this.save();
    }
  }

  // ═══════ FUNNEL EVENTS ═══════
  public createFunnelEvent(event: Omit<FunnelEvent, 'id' | 'created_at'>): FunnelEvent {
    const newEvent: FunnelEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString()
    };
    if (!this.data.funnel_events) this.data.funnel_events = [];
    this.data.funnel_events.unshift(newEvent);
    // Keep max 2000 events in memory
    if (this.data.funnel_events.length > 2000) {
      this.data.funnel_events = this.data.funnel_events.slice(0, 2000);
    }
    this.save();
    return newEvent;
  }

  public findEventsByFunnelId(funnelId: string): FunnelEvent[] {
    return (this.data.funnel_events || []).filter((e) => e.funnel_id === funnelId);
  }

  public getAllFunnelEvents(): FunnelEvent[] {
    return this.data.funnel_events || [];
  }

  // ═══════ ANALYTICS DAILY ═══════
  public upsertAnalyticsDaily(record: Omit<AnalyticsDaily, 'id' | 'created_at' | 'updated_at'>): AnalyticsDaily {
    if (!this.data.analytics_daily) this.data.analytics_daily = [];

    const existingIndex = this.data.analytics_daily.findIndex(
      (a) =>
        a.business_id === record.business_id &&
        (a.location_id || '') === (record.location_id || '') &&
        (a.funnel_id || '') === (record.funnel_id || '') &&
        a.date === record.date
    );

    const now = new Date().toISOString();

    if (existingIndex !== -1) {
      this.data.analytics_daily[existingIndex] = {
        ...this.data.analytics_daily[existingIndex],
        ...record,
        updated_at: now
      };
      this.save();
      return this.data.analytics_daily[existingIndex];
    } else {
      const newRecord: AnalyticsDaily = {
        ...record,
        id: `ad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        created_at: now,
        updated_at: now
      };
      this.data.analytics_daily.push(newRecord);
      this.save();
      return newRecord;
    }
  }

  public findAnalyticsDaily(filter: {
    business_id?: string;
    location_id?: string;
    funnel_id?: string;
    from?: string;
    to?: string;
  }): AnalyticsDaily[] {
    let records = this.data.analytics_daily || [];

    if (filter.business_id) {
      records = records.filter((r) => r.business_id === filter.business_id);
    }
    if (filter.location_id) {
      records = records.filter((r) => r.location_id === filter.location_id);
    }
    if (filter.funnel_id) {
      records = records.filter((r) => r.funnel_id === filter.funnel_id);
    }
    if (filter.from) {
      records = records.filter((r) => r.date >= filter.from!);
    }
    if (filter.to) {
      records = records.filter((r) => r.date <= filter.to!);
    }

    return records;
  }

  // ═══════ GOOGLE CONNECTIONS ═══════
  public findGoogleConnectionsByUserId(userId: string): GoogleConnection[] {
    if (!this.data.google_connections) this.data.google_connections = [];
    return this.data.google_connections.filter((c) => c.user_id === userId);
  }

  public findGoogleConnectionById(id: string): GoogleConnection | undefined {
    if (!this.data.google_connections) this.data.google_connections = [];
    return this.data.google_connections.find((c) => c.id === id);
  }

  public upsertGoogleConnection(conn: Omit<GoogleConnection, 'id' | 'created_at' | 'updated_at'>): GoogleConnection {
    if (!this.data.google_connections) this.data.google_connections = [];
    const now = new Date().toISOString();

    const existingIndex = this.data.google_connections.findIndex(
      (c) => c.user_id === conn.user_id && (
        (conn.google_account_id && c.google_account_id === conn.google_account_id) ||
        (conn.google_email && c.google_email === conn.google_email)
      )
    );

    if (existingIndex !== -1) {
      this.data.google_connections[existingIndex] = {
        ...this.data.google_connections[existingIndex],
        ...conn,
        status: 'active',
        disconnected_at: undefined,
        updated_at: now
      };
      this.save();
      return this.data.google_connections[existingIndex];
    } else {
      const newConn: GoogleConnection = {
        ...conn,
        id: `gconn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        status: 'active',
        created_at: now,
        updated_at: now
      };
      this.data.google_connections.push(newConn);
      this.save();
      return newConn;
    }
  }

  public updateGoogleConnection(id: string, updates: Partial<GoogleConnection>): GoogleConnection | null {
    if (!this.data.google_connections) return null;
    const index = this.data.google_connections.findIndex((c) => c.id === id);
    if (index === -1) return null;

    this.data.google_connections[index] = {
      ...this.data.google_connections[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.google_connections[index];
  }

  public disconnectGoogleConnection(id: string): boolean {
    if (!this.data.google_connections) return false;
    const conn = this.data.google_connections.find((c) => c.id === id);
    if (!conn) return false;

    const now = new Date().toISOString();
    conn.status = 'disconnected';
    conn.disconnected_at = now;
    conn.access_token = '';
    conn.refresh_token = '';
    conn.updated_at = now;

    // Also update any associated location links to idle
    if (this.data.google_location_links) {
      for (const link of this.data.google_location_links) {
        if (link.google_connection_id === id) {
          link.sync_status = 'idle';
          link.updated_at = now;
        }
      }
    }

    this.save();
    return true;
  }

  // ═══════ GOOGLE LOCATION LINKS ═══════
  public findGoogleLocationLinksByBusinessId(businessId: string): GoogleLocationLink[] {
    if (!this.data.google_location_links) this.data.google_location_links = [];
    return this.data.google_location_links.filter((l) => l.business_id === businessId);
  }

  public findGoogleLocationLinksByUserId(userId: string): GoogleLocationLink[] {
    const userBusinesses = this.findBusinessesByUserId(userId);
    const bizIds = new Set(userBusinesses.map((b) => b.id));
    if (!this.data.google_location_links) this.data.google_location_links = [];
    return this.data.google_location_links.filter((l) => bizIds.has(l.business_id));
  }

  public findGoogleLocationLinkById(id: string): GoogleLocationLink | undefined {
    if (!this.data.google_location_links) this.data.google_location_links = [];
    return this.data.google_location_links.find((l) => l.id === id);
  }

  public findGoogleLocationLinkByLocationId(businessLocationId: string): GoogleLocationLink | undefined {
    if (!this.data.google_location_links) this.data.google_location_links = [];
    return this.data.google_location_links.find((l) => l.business_location_id === businessLocationId);
  }

  public findGoogleLocationLinkByGoogleLocationId(googleLocationId: string): GoogleLocationLink | undefined {
    if (!this.data.google_location_links) this.data.google_location_links = [];
    return this.data.google_location_links.find((l) => l.google_location_id === googleLocationId);
  }

  public getAllGoogleLocationLinks(): GoogleLocationLink[] {
    return this.data.google_location_links || [];
  }

  public createGoogleLocationLink(link: Omit<GoogleLocationLink, 'id' | 'created_at' | 'updated_at'>): GoogleLocationLink {
    if (!this.data.google_location_links) this.data.google_location_links = [];
    const now = new Date().toISOString();

    // Check if link for this business_location_id already exists
    const existingIndex = this.data.google_location_links.findIndex(
      (l) => l.business_location_id === link.business_location_id
    );

    if (existingIndex !== -1) {
      this.data.google_location_links[existingIndex] = {
        ...this.data.google_location_links[existingIndex],
        ...link,
        updated_at: now
      };
      this.save();
      return this.data.google_location_links[existingIndex];
    }

    const newLink: GoogleLocationLink = {
      ...link,
      id: `gll_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sync_status: link.sync_status || 'idle',
      created_at: now,
      updated_at: now
    };
    this.data.google_location_links.push(newLink);
    this.save();
    return newLink;
  }

  public updateGoogleLocationLink(id: string, updates: Partial<GoogleLocationLink>): GoogleLocationLink | null {
    if (!this.data.google_location_links) return null;
    const index = this.data.google_location_links.findIndex((l) => l.id === id);
    if (index === -1) return null;

    this.data.google_location_links[index] = {
      ...this.data.google_location_links[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.google_location_links[index];
  }

  public deleteGoogleLocationLink(id: string): boolean {
    if (!this.data.google_location_links) return false;
    const index = this.data.google_location_links.findIndex((l) => l.id === id);
    if (index === -1) return false;

    this.data.google_location_links.splice(index, 1);
    this.save();
    return true;
  }

  // ═══════ GOOGLE REVIEWS ═══════
  public findGoogleReviewsByBusinessId(businessId: string): GoogleReview[] {
    if (!this.data.google_reviews) this.data.google_reviews = [];
    return this.data.google_reviews.filter((r) => r.business_id === businessId);
  }

  public findGoogleReviewById(id: string): GoogleReview | undefined {
    if (!this.data.google_reviews) this.data.google_reviews = [];
    return this.data.google_reviews.find((r) => r.id === id);
  }

  public findGoogleReviewByReviewId(googleReviewId: string): GoogleReview | undefined {
    if (!this.data.google_reviews) this.data.google_reviews = [];
    return this.data.google_reviews.find((r) => r.google_review_id === googleReviewId);
  }

  public upsertGoogleReview(review: Omit<GoogleReview, 'id' | 'created_at' | 'updated_at'>): GoogleReview {
    if (!this.data.google_reviews) this.data.google_reviews = [];
    const now = new Date().toISOString();

    const existingIndex = this.data.google_reviews.findIndex(
      (r) => r.google_review_id === review.google_review_id
    );

    if (existingIndex !== -1) {
      this.data.google_reviews[existingIndex] = {
        ...this.data.google_reviews[existingIndex],
        ...review,
        updated_at: now
      };
      this.save();
      return this.data.google_reviews[existingIndex];
    } else {
      const newRev: GoogleReview = {
        ...review,
        id: `grev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        created_at: now,
        updated_at: now
      };
      this.data.google_reviews.push(newRev);
      this.save();
      return newRev;
    }
  }

  public updateGoogleReview(id: string, updates: Partial<GoogleReview>): GoogleReview | null {
    if (!this.data.google_reviews) return null;
    const index = this.data.google_reviews.findIndex((r) => r.id === id);
    if (index === -1) return null;

    this.data.google_reviews[index] = {
      ...this.data.google_reviews[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.google_reviews[index];
  }

  public queryGoogleReviews(filter: {
    business_id?: string;
    location_id?: string;
    rating?: number;
    has_reply?: boolean;
    from?: string;
    to?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) {
    let list = this.data.google_reviews || [];

    if (filter.business_id) {
      list = list.filter((r) => r.business_id === filter.business_id);
    }
    if (filter.location_id) {
      list = list.filter((r) => r.business_location_id === filter.location_id);
    }
    if (filter.rating !== undefined && filter.rating > 0) {
      list = list.filter((r) => r.star_rating === filter.rating);
    }
    if (filter.has_reply !== undefined) {
      list = list.filter((r) => r.has_reply === filter.has_reply);
    }
    if (filter.from) {
      list = list.filter((r) => (r.review_created_at || r.created_at) >= filter.from!);
    }
    if (filter.to) {
      list = list.filter((r) => (r.review_created_at || r.created_at) <= filter.to!);
    }
    if (filter.search) {
      const term = filter.search.toLowerCase();
      list = list.filter(
        (r) =>
          (r.reviewer_name && r.reviewer_name.toLowerCase().includes(term)) ||
          (r.review_text && r.review_text.toLowerCase().includes(term)) ||
          (r.google_reply_text && r.google_reply_text.toLowerCase().includes(term))
      );
    }

    // Sort by review_created_at descending
    list.sort((a, b) => {
      const timeA = new Date(a.review_created_at || a.created_at).getTime();
      const timeB = new Date(b.review_created_at || b.created_at).getTime();
      return timeB - timeA;
    });

    const total = list.length;
    const page = Math.max(1, filter.page || 1);
    const per_page = Math.min(100, Math.max(1, filter.per_page || 20));
    const total_pages = Math.ceil(total / per_page) || 1;
    const paginated = list.slice((page - 1) * per_page, page * per_page);

    // Distribution
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let ratingSum = 0;
    let replied_count = 0;

    for (const rev of list) {
      const star = Math.min(5, Math.max(1, Math.round(rev.star_rating || 5)));
      distribution[star] = (distribution[star] || 0) + 1;
      ratingSum += rev.star_rating || 5;
      if (rev.has_reply) replied_count++;
    }

    const avg_rating = total > 0 ? Number((ratingSum / total).toFixed(1)) : 5.0;
    const unreplied_count = total - replied_count;

    return {
      reviews: paginated,
      total,
      page,
      per_page,
      total_pages,
      stats: {
        total_reviews: total,
        average_rating: avg_rating,
        replied_count,
        unreplied_count,
        rating_distribution: distribution
      }
    };
  }

  // ═══════ AI REVIEW ASSISTANT ═══════
  public findAIAnalysisByReviewId(reviewId: string): AIReviewAnalysis | undefined {
    if (!this.data.ai_review_analyses) this.data.ai_review_analyses = [];
    return this.data.ai_review_analyses.find((a) => a.review_id === reviewId);
  }

  public upsertAIAnalysis(analysis: Omit<AIReviewAnalysis, 'id' | 'created_at' | 'updated_at'>): AIReviewAnalysis {
    if (!this.data.ai_review_analyses) this.data.ai_review_analyses = [];
    const now = new Date().toISOString();

    const existingIndex = this.data.ai_review_analyses.findIndex(
      (a) => a.review_id === analysis.review_id && a.prompt_version === analysis.prompt_version
    );

    if (existingIndex !== -1) {
      this.data.ai_review_analyses[existingIndex] = {
        ...this.data.ai_review_analyses[existingIndex],
        ...analysis,
        updated_at: now
      };
      this.save();
      return this.data.ai_review_analyses[existingIndex];
    }

    const newAnalysis: AIReviewAnalysis = {
      ...analysis,
      id: `ana_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: now,
      updated_at: now
    };
    this.data.ai_review_analyses.push(newAnalysis);
    this.save();
    return newAnalysis;
  }

  public findAISuggestionsByReviewId(reviewId: string): AIReplySuggestion[] {
    if (!this.data.ai_reply_suggestions) this.data.ai_reply_suggestions = [];
    return this.data.ai_reply_suggestions
      .filter((s) => s.review_id === reviewId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public findAISuggestionById(id: string): AIReplySuggestion | undefined {
    if (!this.data.ai_reply_suggestions) this.data.ai_reply_suggestions = [];
    return this.data.ai_reply_suggestions.find((s) => s.id === id);
  }

  public createAISuggestion(suggestion: Omit<AIReplySuggestion, 'id' | 'created_at' | 'updated_at'>): AIReplySuggestion {
    if (!this.data.ai_reply_suggestions) this.data.ai_reply_suggestions = [];
    const now = new Date().toISOString();

    const newSuggestion: AIReplySuggestion = {
      ...suggestion,
      id: `sug_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      status: suggestion.status || 'generated',
      created_at: now,
      updated_at: now
    };
    this.data.ai_reply_suggestions.push(newSuggestion);
    this.save();
    return newSuggestion;
  }

  public updateAISuggestion(id: string, updates: Partial<AIReplySuggestion>): AIReplySuggestion | null {
    if (!this.data.ai_reply_suggestions) return null;
    const index = this.data.ai_reply_suggestions.findIndex((s) => s.id === id);
    if (index === -1) return null;

    this.data.ai_reply_suggestions[index] = {
      ...this.data.ai_reply_suggestions[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.ai_reply_suggestions[index];
  }

  // ═══════ AI USAGE LOGS & QUOTA ═══════
  public recordAIUsage(log: Omit<AIUsageLog, 'id' | 'created_at'>): AIUsageLog {
    if (!this.data.ai_usage_logs) this.data.ai_usage_logs = [];
    const newLog: AIUsageLog = {
      ...log,
      id: `ai_log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString()
    };
    this.data.ai_usage_logs.unshift(newLog);
    if (this.data.ai_usage_logs.length > 2000) {
      this.data.ai_usage_logs = this.data.ai_usage_logs.slice(0, 2000);
    }
    this.save();
    return newLog;
  }

  public getAIUsageStats(businessId: string): { monthlyCount: number; limit: number; remaining: number; logs: AIUsageLog[] } {
    if (!this.data.ai_usage_logs) this.data.ai_usage_logs = [];
    
    // Calculate start of current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const bizLogs = this.data.ai_usage_logs.filter(
      (l) => l.business_id === businessId && l.status === 'success' && l.created_at >= startOfMonth
    );

    const monthlyCount = bizLogs.length;

    // Resolve subscription plan limit
    const business = this.findBusinessById(businessId);
    let limit = 100; // default safe fallback limit

    if (business) {
      const subscription = this.data.subscriptions.find(
        (s) => s.user_id === business.user_id && (s.status === 'active' || s.status === 'trialing')
      );
      if (subscription) {
        const plan = this.data.plans.find((p) => p.id === subscription.plan_id);
        if (plan && typeof plan.ai_generations === 'number') {
          limit = plan.ai_generations;
        }
      }
    }

    const remaining = Math.max(0, limit - monthlyCount);

    return {
      monthlyCount,
      limit,
      remaining,
      logs: bizLogs.slice(0, 20)
    };
  }

  // ═══════ AUDIT LOGS ═══════
  public logAudit(log: Omit<AuditLog, 'id' | 'created_at'>): void {
    const newLog: AuditLog = {
      ...log,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString()
    };
    this.data.audit_logs.unshift(newLog);
    // Keep max 500 audit logs in memory
    if (this.data.audit_logs.length > 500) {
      this.data.audit_logs = this.data.audit_logs.slice(0, 500);
    }
    this.save();
  }

  public getAuditLogs(filters?: {
    admin_id?: string;
    user_id?: string;
    action?: string;
    entity_type?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
  }) {
    let logs = this.data.audit_logs || [];

    if (filters?.admin_id) {
      logs = logs.filter((l) => l.admin_id === filters.admin_id);
    }
    if (filters?.user_id) {
      logs = logs.filter((l) => l.user_id === filters.user_id);
    }
    if (filters?.action) {
      logs = logs.filter((l) => l.action.toLowerCase().includes(filters.action!.toLowerCase()));
    }
    if (filters?.entity_type) {
      logs = logs.filter((l) => l.entity_type === filters.entity_type);
    }
    if (filters?.date_from) {
      logs = logs.filter((l) => l.created_at >= filters.date_from!);
    }
    if (filters?.date_to) {
      logs = logs.filter((l) => l.created_at <= filters.date_to!);
    }

    const total = logs.length;
    const page = Math.max(1, filters?.page || 1);
    const per_page = Math.min(100, Math.max(1, filters?.per_page || 20));
    const paginated = logs.slice((page - 1) * per_page, page * per_page);

    return {
      logs: paginated,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page) || 1
    };
  }

  // ═══════ ADMIN USER QUERIES ═══════
  public getAllUsers(): User[] {
    return this.data.users || [];
  }

  public queryUsers(filters?: {
    search?: string;
    status?: string;
    role?: string;
    plan_id?: string;
    page?: number;
    per_page?: number;
  }) {
    let list = this.data.users || [];

    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone && u.phone.includes(q))
      );
    }

    if (filters?.status) {
      list = list.filter((u) => u.status === filters.status);
    }

    if (filters?.role) {
      list = list.filter((u) => u.role === filters.role || u.admin_role === filters.role);
    }

    // Attach enriched summary for admin table
    const enriched = list.map((user) => {
      const businesses = this.findBusinessesByUserId(user.id);
      let locationCount = 0;
      let funnelCount = 0;
      for (const b of businesses) {
        locationCount += this.findLocationsByBusinessId(b.id).length;
        funnelCount += this.findFunnelsByBusinessId(b.id).length;
      }
      const subscription = this.findSubscriptionByUserId(user.id);
      const plan = this.data.plans.find((p) => p.id === subscription?.plan_id) || this.data.plans[0];
      const googleConnections = this.findGoogleConnectionsByUserId(user.id);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        admin_role: user.admin_role,
        status: user.status,
        email_verified_at: user.email_verified_at,
        last_login_at: user.last_login_at,
        suspended_at: user.suspended_at,
        suspension_reason: user.suspension_reason,
        created_at: user.created_at,
        business_count: businesses.length,
        location_count: locationCount,
        funnel_count: funnelCount,
        plan_name: plan?.name || 'Free Plan',
        subscription_status: subscription?.status || 'none',
        google_connected: googleConnections.length > 0
      };
    });

    const total = enriched.length;
    const page = Math.max(1, filters?.page || 1);
    const per_page = Math.min(100, Math.max(1, filters?.per_page || 20));
    const paginated = enriched.slice((page - 1) * per_page, page * per_page);

    return {
      users: paginated,
      total,
      page,
      per_page,
      total_pages: Math.ceil(total / per_page) || 1
    };
  }

  // ═══════ ADMIN BUSINESS & ENTITY QUERIES ═══════
  public getAllBusinessesList() {
    const list = this.data.businesses || [];
    return list.map((b) => {
      const owner = this.findUserById(b.user_id);
      const locations = this.findLocationsByBusinessId(b.id);
      const funnels = this.findFunnelsByBusinessId(b.id);
      const qrs = this.findQrCodesByBusinessId(b.id);
      const reviews = this.findReviewsByBusinessId(b.id);
      const googleReviews = this.findGoogleReviewsByBusinessId(b.id);

      return {
        ...b,
        owner_name: owner?.name || 'Unknown',
        owner_email: owner?.email || '',
        location_count: locations.length,
        funnel_count: funnels.length,
        qr_count: qrs.length,
        review_count: reviews.length + googleReviews.length
      };
    });
  }

  public getAllFunnelsList() {
    const list = this.data.review_funnels || [];
    return list.map((f) => {
      const biz = this.findBusinessById(f.business_id);
      const events = this.findEventsByFunnelId(f.id);
      return {
        ...f,
        business_name: biz?.name || 'Unknown Business',
        views_count: events.filter((e: FunnelEvent) => e.event_type === 'page_view').length,
        scans_count: events.filter((e: FunnelEvent) => e.event_type === 'qr_scan').length
      };
    });
  }

  public getAllSubscriptionsList() {
    const list = this.data.subscriptions || [];
    return list.map((s) => {
      const user = this.findUserById(s.user_id);
      const plan = this.findPlanById(s.plan_id);
      return {
        ...s,
        user_name: user?.name || 'Unknown User',
        user_email: user?.email || '',
        plan_name: plan?.name || 'Custom Plan',
        plan_price: plan?.price || 0
      };
    });
  }

  public getAllPaymentsList(): Payment[] {
    return this.data.payments || [];
  }

  public getAllInvoicesList(): Invoice[] {
    return this.data.invoices || [];
  }

  public getAllWebhookEventsList(): WebhookEvent[] {
    return this.data.webhook_events || [];
  }

  // ═══════ FEATURE FLAGS ═══════
  public getFeatureFlags(): FeatureFlag[] {
    return this.data.feature_flags || [];
  }

  public findFeatureFlagById(id: string): FeatureFlag | undefined {
    return (this.data.feature_flags || []).find((f) => f.id === id || f.key === id);
  }

  public upsertFeatureFlag(flag: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at'> & { id?: string }): FeatureFlag {
    if (!this.data.feature_flags) this.data.feature_flags = [];
    const now = new Date().toISOString();

    const existingIndex = this.data.feature_flags.findIndex(
      (f) => (flag.id && f.id === flag.id) || f.key === flag.key
    );

    if (existingIndex !== -1) {
      this.data.feature_flags[existingIndex] = {
        ...this.data.feature_flags[existingIndex],
        ...flag,
        updated_at: now
      };
      this.save();
      return this.data.feature_flags[existingIndex];
    }

    const newFlag: FeatureFlag = {
      ...flag,
      id: `ff_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      created_at: now,
      updated_at: now
    };
    this.data.feature_flags.push(newFlag);
    this.save();
    return newFlag;
  }

  public toggleFeatureFlag(idOrKey: string): FeatureFlag | null {
    if (!this.data.feature_flags) return null;
    const index = this.data.feature_flags.findIndex((f) => f.id === idOrKey || f.key === idOrKey);
    if (index === -1) return null;

    this.data.feature_flags[index].enabled = !this.data.feature_flags[index].enabled;
    this.data.feature_flags[index].updated_at = new Date().toISOString();
    this.save();
    return this.data.feature_flags[index];
  }

  // ═══════ SYSTEM SETTINGS ═══════
  public getSystemSettings(): SystemSettings {
    if (!this.data.system_settings) {
      this.data.system_settings = {
        maintenance_mode: false,
        new_registration_enabled: true,
        default_timezone: 'Asia/Kolkata',
        default_currency: 'INR',
        support_email: 'support@reviewflowai.in',
        support_url: 'https://reviewflowai.in/support',
        billing_grace_period_days: 3,
        default_ai_provider: 'gemini',
        updated_at: new Date().toISOString()
      };
    }
    return this.data.system_settings;
  }

  public updateSystemSettings(updates: Partial<SystemSettings>, updatedBy?: string): SystemSettings {
    const current = this.getSystemSettings();
    this.data.system_settings = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
      updated_by: updatedBy || current.updated_by
    };
    this.save();
    return this.data.system_settings;
  }

  // ═══════ FAILED JOBS & QUEUES ═══════
  public getFailedJobs(): FailedJob[] {
    return this.data.failed_jobs || [];
  }

  public createFailedJob(job: Omit<FailedJob, 'id' | 'failed_at'>): FailedJob {
    if (!this.data.failed_jobs) this.data.failed_jobs = [];
    const newJob: FailedJob = {
      ...job,
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      failed_at: new Date().toISOString()
    };
    this.data.failed_jobs.unshift(newJob);
    if (this.data.failed_jobs.length > 500) {
      this.data.failed_jobs = this.data.failed_jobs.slice(0, 500);
    }
    this.save();
    return newJob;
  }

  public retryFailedJob(id: string): FailedJob | null {
    if (!this.data.failed_jobs) return null;
    const job = this.data.failed_jobs.find((j) => j.id === id);
    if (!job) return null;

    job.status = 'resolved';
    job.retried_at = new Date().toISOString();
    this.save();
    return job;
  }

  // ═══════ SCHEDULER TASKS ═══════
  public getSchedulerTasks(): SchedulerTask[] {
    return this.data.scheduler_tasks || [];
  }

  public recordSchedulerTaskRun(taskName: string, durationMs: number, status: 'success' | 'failed', error?: string): void {
    if (!this.data.scheduler_tasks) this.data.scheduler_tasks = [];
    const index = this.data.scheduler_tasks.findIndex((t) => t.task_name === taskName);
    const now = new Date().toISOString();

    if (index !== -1) {
      this.data.scheduler_tasks[index].last_run = now;
      this.data.scheduler_tasks[index].last_status = status;
      this.data.scheduler_tasks[index].last_duration_ms = durationMs;
      this.data.scheduler_tasks[index].error_message = error;
    } else {
      this.data.scheduler_tasks.push({
        id: `task_${Date.now()}`,
        task_name: taskName,
        interval_minutes: 15,
        last_run: now,
        last_status: status,
        last_duration_ms: durationMs,
        error_message: error
      });
    }
    this.save();
  }

  // ═══════ GLOBAL ADMIN SEARCH ═══════
  public globalAdminSearch(query: string) {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      return { users: [], businesses: [], subscriptions: [], payments: [], funnels: [] };
    }

    const matchedUsers = (this.data.users || [])
      .filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .slice(0, 5)
      .map((u) => ({ id: u.id, title: u.name, subtitle: u.email, type: 'user' }));

    const matchedBusinesses = (this.data.businesses || [])
      .filter((b) => b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q))
      .slice(0, 5)
      .map((b) => ({ id: b.id, title: b.name, subtitle: b.category, type: 'business' }));

    const matchedFunnels = (this.data.review_funnels || [])
      .filter((f) => f.name.toLowerCase().includes(q) || f.slug.toLowerCase().includes(q))
      .slice(0, 5)
      .map((f) => ({ id: f.id, title: f.name, subtitle: `/r/${f.slug}`, type: 'funnel' }));

    const matchedSubscriptions = (this.data.subscriptions || [])
      .filter((s) => s.id.toLowerCase().includes(q) || (s.razorpay_subscription_id && s.razorpay_subscription_id.toLowerCase().includes(q)))
      .slice(0, 5)
      .map((s) => ({ id: s.id, title: `Sub: ${s.plan_id}`, subtitle: s.status, type: 'subscription' }));

    const matchedPayments = (this.data.payments || [])
      .filter((p) => p.id.toLowerCase().includes(q) || (p.gateway_payment_id && p.gateway_payment_id.toLowerCase().includes(q)))
      .slice(0, 5)
      .map((p) => ({ id: p.id, title: `Payment ₹${p.amount}`, subtitle: p.status, type: 'payment' }));

    return {
      users: matchedUsers,
      businesses: matchedBusinesses,
      funnels: matchedFunnels,
      subscriptions: matchedSubscriptions,
      payments: matchedPayments
    };
  }
}

export const db = new DatabaseService();
