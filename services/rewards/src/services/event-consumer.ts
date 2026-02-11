// SQS event consumer for game events

import { logger } from '../utils/logger';

export interface GameEvent {
  type: string;
  userId: string;
  gameId: string;
  partnerId?: string | null;
  timestamp: string;
  data: Record<string, unknown>;
}

export type EventHandler = (event: GameEvent) => Promise<void>;

export class EventConsumer {
  private handlers: Map<string, EventHandler[]> = new Map();
  private running = false;
  private pollIntervalMs: number;

  constructor(
    private queueUrl: string,
    pollIntervalMs = 1000,
  ) {
    this.pollIntervalMs = pollIntervalMs;
  }

  on(eventType: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventType) || [];
    existing.push(handler);
    this.handlers.set(eventType, existing);
  }

  async processEvent(event: GameEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    const wildcardHandlers = this.handlers.get('*') || [];
    const all = [...handlers, ...wildcardHandlers];

    for (const handler of all) {
      try {
        await handler(event);
      } catch (err) {
        logger.error('Event handler error', {
          eventType: event.type,
          userId: event.userId,
          error: (err as Error).message,
        });
      }
    }
  }

  start(): void {
    this.running = true;
    logger.info('Event consumer started', { queueUrl: this.queueUrl });
    this.poll();
  }

  stop(): void {
    this.running = false;
    logger.info('Event consumer stopped');
  }

  private async poll(): Promise<void> {
    while (this.running) {
      try {
        // In production: use AWS SDK to receive messages from SQS
        // For now, this is a stub that will be called directly in tests
        await new Promise((resolve) => setTimeout(resolve, this.pollIntervalMs));
      } catch (err) {
        logger.error('Poll error', { error: (err as Error).message });
      }
    }
  }
}
