import { db } from '../database';
import { AnalyticsDaily } from '../types';
import { AnalyticsAggregationService } from './aggregation';

export interface DateRangeOptions {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  business_id?: string;
  location_id?: string;
  funnel_id?: string;
  granularity?: 'day' | 'week' | 'month';
  include_comparison?: boolean;
}

export interface MetricOverview {
  page_views: number;
  qr_scans: number;
  unique_visitors: number;
  rating_selected: number;
  feedback_started: number;
  feedback_completed: number;
  google_clicks: number;
  conversion_rates: {
    qr_to_funnel: number;
    funnel_to_rating: number;
    rating_to_feedback: number;
    feedback_to_google: number;
    overall: number;
  };
  comparison?: {
    previous_period: { from: string; to: string };
    page_views_change: number | null;
    qr_scans_change: number | null;
    ratings_change: number | null;
    google_clicks_change: number | null;
  };
}

export class AnalyticsService {
  /**
   * Safe division helper that prevents division by zero and rounds to 2 decimals.
   */
  public static safeRate(numerator: number, denominator: number): number {
    if (!denominator || denominator <= 0) return 0;
    const rate = (numerator / denominator) * 100;
    return Math.round(rate * 100) / 100;
  }

  /**
   * Percentage change helper: ((current - previous) / previous) * 100.
   * Returns null if previous is 0.
   */
  public static safeChangePercent(current: number, previous: number): number | null {
    if (previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return Math.round(change * 10) / 10;
  }

  /**
   * Resolves date boundaries (defaults to last 30 days if not provided).
   */
  public static resolveDateRange(from?: string, to?: string) {
    const today = new Date();
    const resolvedTo = to || today.toISOString().slice(0, 10);

    let resolvedFrom = from;
    if (!resolvedFrom) {
      const thirtyDaysAgo = new Date(today.getTime() - 29 * 24 * 60 * 60 * 1000);
      resolvedFrom = thirtyDaysAgo.toISOString().slice(0, 10);
    }

    return { from: resolvedFrom, to: resolvedTo };
  }

  /**
   * Calculates previous comparison range of equal duration.
   */
  public static getPreviousDateRange(from: string, to: string) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const diffMs = toDate.getTime() - fromDate.getTime();
    const durationDays = Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)) + 1);

    const prevToDate = new Date(fromDate.getTime() - 24 * 60 * 60 * 1000);
    const prevFromDate = new Date(prevToDate.getTime() - (durationDays - 1) * 24 * 60 * 60 * 1000);

    return {
      from: prevFromDate.toISOString().slice(0, 10),
      to: prevToDate.toISOString().slice(0, 10)
    };
  }

  /**
   * Ensures today's live events are synchronized into analytics_daily before reading.
   */
  public static ensureAggregated(business_id?: string) {
    const todayStr = new Date().toISOString().slice(0, 10);
    AnalyticsAggregationService.aggregate({ date: todayStr, business_id });
  }

  /**
   * Overview metrics calculation.
   */
  public static getOverview(options: DateRangeOptions): MetricOverview {
    this.ensureAggregated(options.business_id);

    const { from, to } = this.resolveDateRange(options.from, options.to);

    const records = db.findAnalyticsDaily({
      business_id: options.business_id,
      location_id: options.location_id,
      funnel_id: options.funnel_id,
      from,
      to
    });

    let page_views = 0;
    let qr_scans = 0;
    let unique_visitors = 0;
    let rating_selected = 0;
    let feedback_started = 0;
    let feedback_completed = 0;
    let google_clicks = 0;

    for (const r of records) {
      page_views += r.page_views || 0;
      qr_scans += r.qr_scans || 0;
      unique_visitors += r.unique_visitors || 0;
      rating_selected += r.rating_selected || 0;
      feedback_started += r.feedback_started || 0;
      feedback_completed += r.feedback_completed || 0;
      google_clicks += r.google_clicks || 0;
    }

    const conversion_rates = {
      qr_to_funnel: this.safeRate(page_views, qr_scans),
      funnel_to_rating: this.safeRate(rating_selected, page_views),
      rating_to_feedback: this.safeRate(feedback_started, rating_selected),
      feedback_to_google: this.safeRate(google_clicks, feedback_completed),
      overall: this.safeRate(google_clicks, qr_scans || page_views)
    };

    let comparisonData: MetricOverview['comparison'] | undefined;

    if (options.include_comparison) {
      const prevRange = this.getPreviousDateRange(from, to);
      const prevRecords = db.findAnalyticsDaily({
        business_id: options.business_id,
        location_id: options.location_id,
        funnel_id: options.funnel_id,
        from: prevRange.from,
        to: prevRange.to
      });

      let prev_pv = 0;
      let prev_qr = 0;
      let prev_ratings = 0;
      let prev_gc = 0;

      for (const pr of prevRecords) {
        prev_pv += pr.page_views || 0;
        prev_qr += pr.qr_scans || 0;
        prev_ratings += pr.rating_selected || 0;
        prev_gc += pr.google_clicks || 0;
      }

      comparisonData = {
        previous_period: prevRange,
        page_views_change: this.safeChangePercent(page_views, prev_pv),
        qr_scans_change: this.safeChangePercent(qr_scans, prev_qr),
        ratings_change: this.safeChangePercent(rating_selected, prev_ratings),
        google_clicks_change: this.safeChangePercent(google_clicks, prev_gc)
      };
    }

    return {
      page_views,
      qr_scans,
      unique_visitors,
      rating_selected,
      feedback_started,
      feedback_completed,
      google_clicks,
      conversion_rates,
      ...(comparisonData && { comparison: comparisonData })
    };
  }

  /**
   * Time series data grouped by day, filling missing calendar dates with 0s.
   */
  public static getTimeSeries(options: DateRangeOptions) {
    this.ensureAggregated(options.business_id);

    const { from, to } = this.resolveDateRange(options.from, options.to);

    const records = db.findAnalyticsDaily({
      business_id: options.business_id,
      location_id: options.location_id,
      funnel_id: options.funnel_id,
      from,
      to
    });

    // Group records by date (summing across funnels / locations if not filtered)
    const dateMap: Record<
      string,
      {
        date: string;
        page_views: number;
        qr_scans: number;
        unique_visitors: number;
        rating_selected: number;
        feedback_started: number;
        feedback_completed: number;
        google_clicks: number;
      }
    > = {};

    for (const r of records) {
      if (!dateMap[r.date]) {
        dateMap[r.date] = {
          date: r.date,
          page_views: 0,
          qr_scans: 0,
          unique_visitors: 0,
          rating_selected: 0,
          feedback_started: 0,
          feedback_completed: 0,
          google_clicks: 0
        };
      }
      dateMap[r.date].page_views += r.page_views || 0;
      dateMap[r.date].qr_scans += r.qr_scans || 0;
      dateMap[r.date].unique_visitors += r.unique_visitors || 0;
      dateMap[r.date].rating_selected += r.rating_selected || 0;
      dateMap[r.date].feedback_started += r.feedback_started || 0;
      dateMap[r.date].feedback_completed += r.feedback_completed || 0;
      dateMap[r.date].google_clicks += r.google_clicks || 0;
    }

    // Generate full contiguous date list from `from` to `to`
    const result: Array<{
      date: string;
      page_views: number;
      qr_scans: number;
      unique_visitors: number;
      rating_selected: number;
      feedback_started: number;
      feedback_completed: number;
      google_clicks: number;
    }> = [];

    const cur = new Date(from);
    const end = new Date(to);

    while (cur <= end) {
      const dStr = cur.toISOString().slice(0, 10);
      if (dateMap[dStr]) {
        result.push(dateMap[dStr]);
      } else {
        result.push({
          date: dStr,
          page_views: 0,
          qr_scans: 0,
          unique_visitors: 0,
          rating_selected: 0,
          feedback_started: 0,
          feedback_completed: 0,
          google_clicks: 0
        });
      }
      cur.setDate(cur.getDate() + 1);
    }

    return result;
  }

  /**
   * Top Performing Funnels.
   */
  public static getTopFunnels(businessId?: string, limit: number = 10) {
    this.ensureAggregated(businessId);

    const allBusinesses = businessId ? [db.findBusinessById(businessId)].filter(Boolean) : [];
    const funnels = businessId
      ? db.findFunnelsByBusinessId(businessId)
      : [];

    const stats = funnels.map((f) => {
      const daily = db.findAnalyticsDaily({ funnel_id: f.id });
      let page_views = 0;
      let qr_scans = 0;
      let unique_visitors = 0;
      let feedback_completed = 0;
      let google_clicks = 0;

      for (const d of daily) {
        page_views += d.page_views || 0;
        qr_scans += d.qr_scans || 0;
        unique_visitors += d.unique_visitors || 0;
        feedback_completed += d.feedback_completed || 0;
        google_clicks += d.google_clicks || 0;
      }

      return {
        id: f.id,
        funnel_id: f.id,
        funnel_name: f.name,
        slug: f.slug,
        enabled: f.enabled,
        page_views,
        qr_scans,
        unique_visitors,
        feedback_completed,
        google_clicks,
        conversion_rate: this.safeRate(google_clicks, qr_scans || page_views)
      };
    });

    stats.sort((a, b) => b.google_clicks - a.google_clicks || b.page_views - a.page_views);
    return stats.slice(0, limit);
  }

  /**
   * Top Performing QR Codes.
   */
  public static getTopQr(businessId?: string, limit: number = 10) {
    this.ensureAggregated(businessId);

    const qrs = businessId ? db.findQrCodesByBusinessId(businessId) : [];

    const stats = qrs.map((q) => {
      const funnel = db.findFunnelById(q.funnel_id);
      return {
        id: q.id,
        qr_id: q.id,
        qr_name: q.name,
        short_code: q.short_code,
        destination_url: q.destination_url,
        funnel_name: funnel?.name || 'Unknown Funnel',
        scan_count: q.scan_count || 0,
        status: q.status
      };
    });

    stats.sort((a, b) => b.scan_count - a.scan_count);
    return stats.slice(0, limit);
  }
}
