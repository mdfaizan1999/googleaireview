import { db } from '../database';

interface AggregationOptions {
  date?: string;
  from?: string;
  to?: string;
  business_id?: string;
}

export class AnalyticsAggregationService {
  /**
   * Aggregates raw funnel events into daily performance buckets (analytics_daily).
   * Idempotent: Can safely rerun without duplicating counts.
   */
  public static aggregate(options: AggregationOptions = {}): {
    processedEvents: number;
    dailyRecordsUpserted: number;
    datesCovered: string[];
  } {
    const allEvents = db.getAllFunnelEvents();
    if (!allEvents || allEvents.length === 0) {
      return { processedEvents: 0, dailyRecordsUpserted: 0, datesCovered: [] };
    }

    // Filter events by date range and business
    let targetEvents = allEvents;

    if (options.date) {
      targetEvents = targetEvents.filter((e) => e.created_at.startsWith(options.date!));
    } else {
      if (options.from) {
        targetEvents = targetEvents.filter((e) => e.created_at.slice(0, 10) >= options.from!);
      }
      if (options.to) {
        targetEvents = targetEvents.filter((e) => e.created_at.slice(0, 10) <= options.to!);
      }
    }

    // Grouping map: `${date}::${business_id}::${location_id}::${funnel_id}`
    const buckets: Record<
      string,
      {
        date: string;
        business_id: string;
        location_id?: string;
        funnel_id?: string;
        page_views: number;
        qr_scans: number;
        visitors: Set<string>;
        rating_selected: number;
        feedback_started: number;
        feedback_completed: number;
        google_clicks: number;
      }
    > = {};

    let processedCount = 0;

    for (const evt of targetEvents) {
      const funnel = db.findFunnelById(evt.funnel_id);
      if (!funnel) continue;

      const businessId = funnel.business_id;
      if (options.business_id && businessId !== options.business_id) continue;

      const locationId = funnel.location_id || undefined;
      const date = evt.created_at.slice(0, 10); // YYYY-MM-DD

      const key = `${date}::${businessId}::${locationId || ''}::${funnel.id}`;

      if (!buckets[key]) {
        buckets[key] = {
          date,
          business_id: businessId,
          location_id: locationId,
          funnel_id: funnel.id,
          page_views: 0,
          qr_scans: 0,
          visitors: new Set<string>(),
          rating_selected: 0,
          feedback_started: 0,
          feedback_completed: 0,
          google_clicks: 0
        };
      }

      processedCount++;
      const bucket = buckets[key];

      // Track unique visitor
      if (evt.visitor_id) {
        bucket.visitors.add(evt.visitor_id);
      }

      switch (evt.event_type) {
        case 'page_view':
          bucket.page_views++;
          break;
        case 'qr_scan':
          bucket.qr_scans++;
          break;
        case 'rating_selected':
          bucket.rating_selected++;
          break;
        case 'feedback_started':
          bucket.feedback_started++;
          break;
        case 'feedback_completed':
          bucket.feedback_completed++;
          break;
        case 'google_clicked':
          bucket.google_clicks++;
          break;
        default:
          break;
      }
    }

    const uniqueDates = new Set<string>();
    let upsertedCount = 0;

    // Upsert aggregated records into analytics_daily
    for (const key of Object.keys(buckets)) {
      const b = buckets[key];
      uniqueDates.add(b.date);

      db.upsertAnalyticsDaily({
        business_id: b.business_id,
        location_id: b.location_id,
        funnel_id: b.funnel_id,
        date: b.date,
        page_views: b.page_views,
        qr_scans: b.qr_scans,
        unique_visitors: b.visitors.size,
        rating_selected: b.rating_selected,
        feedback_started: b.feedback_started,
        feedback_completed: b.feedback_completed,
        google_clicks: b.google_clicks
      });

      upsertedCount++;
    }

    return {
      processedEvents: processedCount,
      dailyRecordsUpserted: upsertedCount,
      datesCovered: Array.from(uniqueDates)
    };
  }

  /**
   * Runs a rolling re-aggregation window (previous 3 days through today)
   * to guarantee that late events are seamlessly synchronized.
   */
  public static runRollingWindow(business_id?: string) {
    const today = new Date();
    const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);

    const from = threeDaysAgo.toISOString().slice(0, 10);
    const to = today.toISOString().slice(0, 10);

    return this.aggregate({ from, to, business_id });
  }
}
