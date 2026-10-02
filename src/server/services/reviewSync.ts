import { db } from '../database';
import { GoogleBusinessProfileService, GoogleRawReview } from './google';

function parseStarRating(rating: string | number): number {
  if (typeof rating === 'number') {
    return Math.min(5, Math.max(1, rating));
  }
  switch (rating) {
    case 'FIVE':
      return 5;
    case 'FOUR':
      return 4;
    case 'THREE':
      return 3;
    case 'TWO':
      return 2;
    case 'ONE':
      return 1;
    default:
      return 5;
  }
}

export class GoogleReviewSyncService {
  /**
   * Synchronizes reviews for a single linked Google location.
   * Idempotent: Never duplicates reviews on repeat runs.
   */
  public static async syncLocationLink(linkId: string): Promise<{
    syncedCount: number;
    updatedCount: number;
    error?: string;
  }> {
    const link = db.findGoogleLocationLinkById(linkId);
    if (!link) {
      throw new Error(`Location link ${linkId} not found.`);
    }

    const business = db.findBusinessById(link.business_id);
    if (!business) {
      throw new Error(`Associated business ${link.business_id} not found.`);
    }

    db.updateGoogleLocationLink(linkId, {
      sync_status: 'syncing',
      last_sync_error: undefined
    });

    let syncedCount = 0;
    let updatedCount = 0;
    let nextPageToken: string | undefined = undefined;
    let pageCount = 0;
    const maxPages = 5; // Protect against infinite loops / quotas

    try {
      do {
        pageCount++;
        const res = await GoogleBusinessProfileService.getReviews(
          link.google_connection_id,
          link.google_location_id,
          nextPageToken
        );

        const reviews = res.reviews || [];

        for (const r of reviews) {
          const starRating = parseStarRating(r.starRating);
          const reviewId = r.reviewId;
          const reviewerName = r.reviewer?.displayName || 'Google Reviewer';
          const reviewerPhoto = r.reviewer?.profilePhotoUrl;
          const reviewText = r.comment || '';
          const createTime = r.createTime || new Date().toISOString();
          const updateTime = r.updateTime || createTime;
          const replyText = r.reviewReply?.comment;
          const replyUpdateTime = r.reviewReply?.updateTime;
          const hasReply = Boolean(replyText && replyText.trim().length > 0);

          const existing = db.findGoogleReviewByReviewId(reviewId);

          db.upsertGoogleReview({
            business_id: link.business_id,
            business_location_id: link.business_location_id,
            google_location_link_id: link.id,
            google_review_id: reviewId,
            reviewer_name: reviewerName,
            reviewer_photo_url: reviewerPhoto,
            star_rating: starRating,
            review_text: reviewText,
            review_created_at: createTime,
            review_updated_at: updateTime,
            google_reply_text: replyText,
            google_reply_updated_at: replyUpdateTime,
            has_reply: hasReply,
            synced_at: new Date().toISOString()
          });

          if (existing) {
            updatedCount++;
          } else {
            syncedCount++;
          }
        }

        nextPageToken = res.nextPageToken;
      } while (nextPageToken && pageCount < maxPages);

      db.updateGoogleLocationLink(linkId, {
        sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
        last_sync_error: undefined
      });

      db.logAudit({
        user_id: business.user_id,
        action: 'review.sync_completed',
        entity_type: 'google_location_link',
        entity_id: linkId
      });

      return { syncedCount, updatedCount };
    } catch (err: any) {
      console.error(`[ReviewSync] Error syncing location link ${linkId}:`, err);

      db.updateGoogleLocationLink(linkId, {
        sync_status: 'failed',
        last_sync_error: err.message || 'Review synchronization failed.'
      });

      db.logAudit({
        user_id: business.user_id,
        action: 'review.sync_failed',
        entity_type: 'google_location_link',
        entity_id: linkId
      });

      throw err;
    }
  }

  /**
   * Synchronizes all active location links across the system.
   * Called by periodic scheduler.
   */
  public static async syncAllActiveLinks(): Promise<{ linksProcessed: number; totalSynced: number }> {
    const allLinks = db.getAllGoogleLocationLinks();
    let processed = 0;
    let totalSynced = 0;

    for (const link of allLinks) {
      // Skip links whose connection is disconnected
      const conn = db.findGoogleConnectionById(link.google_connection_id);
      if (!conn || conn.status === 'disconnected') continue;

      try {
        const result = await this.syncLocationLink(link.id);
        processed++;
        totalSynced += result.syncedCount;
      } catch (err) {
        console.warn(`[ReviewSync Scheduler] Skipping failed link ${link.id}:`, err);
      }
    }

    return { linksProcessed: processed, totalSynced };
  }
}

/**
 * In-memory background queue for review sync jobs
 */
export class SyncGoogleReviewsJob {
  private static activeJobs = new Set<string>();

  /**
   * Dispatches review sync job asynchronously without blocking user response
   */
  public static dispatch(linkId: string): { queued: boolean; message: string } {
    if (this.activeJobs.has(linkId)) {
      return {
        queued: false,
        message: 'A review synchronization job is already running for this location.'
      };
    }

    this.activeJobs.add(linkId);

    // Run in background on next event loop tick
    setImmediate(async () => {
      try {
        await GoogleReviewSyncService.syncLocationLink(linkId);
      } catch (err) {
        console.error(`[SyncGoogleReviewsJob] Background job failed for ${linkId}:`, err);
      } finally {
        this.activeJobs.delete(linkId);
      }
    });

    return {
      queued: true,
      message: 'Review sync started in background.'
    };
  }

  public static isRunning(linkId: string): boolean {
    return this.activeJobs.has(linkId);
  }
}
