import { addMediaAnalysisJob, addTranscriptionJob, addExportJob } from './producers';
import { MediaAnalysisJobData, TranscriptionJobData, ExportJobData } from './types';

export interface OutboxEventRecord {
  id: string;
  type: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  attempts: number;
  publishedAt: Date | null;
  availableAt: Date;
  createdAt: Date;
}

export interface IOutboxPrismaClient {
  outboxEvent: {
    create(args: { data: { type: string; aggregateId: string; payload: Record<string, unknown> } }): Promise<OutboxEventRecord>;
    findMany(args: {
      where: { publishedAt: null; availableAt: { lte: Date } };
      take?: number;
      orderBy?: { createdAt: 'asc' };
    }): Promise<OutboxEventRecord[]>;
    update(args: { where: { id: string }; data: Partial<OutboxEventRecord> }): Promise<OutboxEventRecord>;
  };
}

/**
 * Transactional Outbox Dispatcher
 * Guarantees zero lost queue jobs even if Redis or the worker crashes mid-request.
 */
export class OutboxDispatcher {
  constructor(private prisma: IOutboxPrismaClient) {}

  /**
   * Dispatches a single event to the appropriate BullMQ queue
   */
  async dispatchEvent(event: OutboxEventRecord): Promise<void> {
    const payload = event.payload as unknown;

    switch (event.type) {
      case 'MEDIA_ANALYSIS':
      case 'DISPATCH_MEDIA_ANALYSIS':
        await addMediaAnalysisJob(payload as MediaAnalysisJobData);
        break;

      case 'TRANSCRIPTION':
      case 'DISPATCH_TRANSCRIPTION':
        await addTranscriptionJob(payload as TranscriptionJobData);
        break;

      case 'EXPORT':
      case 'DISPATCH_EXPORT':
        await addExportJob(payload as ExportJobData);
        break;

      default:
        console.warn(`[OutboxDispatcher] Unrecognized event type: ${event.type}`);
    }
  }

  /**
   * Processes all pending outbox events that are available for publishing
   */
  async processPendingEvents(batchSize = 50): Promise<{ published: number; failed: number }> {
    const events = await this.prisma.outboxEvent.findMany({
      where: {
        publishedAt: null,
        availableAt: { lte: new Date() },
      },
      take: batchSize,
      orderBy: { createdAt: 'asc' },
    });

    let published = 0;
    let failed = 0;

    for (const event of events) {
      try {
        await this.dispatchEvent(event);

        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: { publishedAt: new Date() },
        });

        published++;
      } catch (err) {
        failed++;
        const nextAttempt = event.attempts + 1;
        // Exponential backoff: 2s, 4s, 8s, up to 60s
        const backoffMs = Math.min(60000, 1000 * Math.pow(2, nextAttempt));

        await this.prisma.outboxEvent.update({
          where: { id: event.id },
          data: {
            attempts: nextAttempt,
            availableAt: new Date(Date.now() + backoffMs),
          },
        });

        console.error(
          `[OutboxDispatcher] Failed to dispatch outbox event ${event.id} (Attempt ${nextAttempt}):`,
          err instanceof Error ? err.message : err
        );
      }
    }

    return { published, failed };
  }
}

