import { EventConsumer, GameEvent } from '../../src/services/event-consumer';

describe('Event Consumer', () => {
  let consumer: EventConsumer;

  beforeEach(() => {
    consumer = new EventConsumer('test-queue-url', 100);
  });

  afterEach(() => {
    consumer.stop();
  });

  it('calls registered handler for matching event type', async () => {
    const handler = jest.fn();
    consumer.on('GAME_ACTION_COMPLETED', handler);

    const event: GameEvent = {
      type: 'GAME_ACTION_COMPLETED',
      userId: 'user-1',
      gameId: 'game-1',
      timestamp: new Date().toISOString(),
      data: { action: 'advance_day' },
    };

    await consumer.processEvent(event);
    expect(handler).toHaveBeenCalledWith(event);
  });

  it('does not call handler for non-matching event type', async () => {
    const handler = jest.fn();
    consumer.on('GAME_ACTION_COMPLETED', handler);

    const event: GameEvent = {
      type: 'MONTH_END_PROCESSED',
      userId: 'user-1',
      gameId: 'game-1',
      timestamp: new Date().toISOString(),
      data: {},
    };

    await consumer.processEvent(event);
    expect(handler).not.toHaveBeenCalled();
  });

  it('calls wildcard handler for all events', async () => {
    const handler = jest.fn();
    consumer.on('*', handler);

    await consumer.processEvent({
      type: 'ANY_EVENT',
      userId: 'user-1',
      gameId: 'game-1',
      timestamp: new Date().toISOString(),
      data: {},
    });

    expect(handler).toHaveBeenCalled();
  });

  it('calls multiple handlers for same event type', async () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    consumer.on('GAME_ACTION_COMPLETED', handler1);
    consumer.on('GAME_ACTION_COMPLETED', handler2);

    await consumer.processEvent({
      type: 'GAME_ACTION_COMPLETED',
      userId: 'user-1',
      gameId: 'game-1',
      timestamp: new Date().toISOString(),
      data: {},
    });

    expect(handler1).toHaveBeenCalled();
    expect(handler2).toHaveBeenCalled();
  });

  it('continues processing if a handler throws', async () => {
    const failHandler = jest.fn().mockRejectedValue(new Error('fail'));
    const successHandler = jest.fn();
    consumer.on('TEST', failHandler);
    consumer.on('TEST', successHandler);

    await consumer.processEvent({
      type: 'TEST',
      userId: 'user-1',
      gameId: 'game-1',
      timestamp: new Date().toISOString(),
      data: {},
    });

    expect(failHandler).toHaveBeenCalled();
    expect(successHandler).toHaveBeenCalled();
  });

  it('includes partnerId in event', async () => {
    const handler = jest.fn();
    consumer.on('TEST', handler);

    const event: GameEvent = {
      type: 'TEST',
      userId: 'user-1',
      gameId: 'game-1',
      partnerId: 'partner-1',
      timestamp: new Date().toISOString(),
      data: {},
    };

    await consumer.processEvent(event);
    expect(handler).toHaveBeenCalledWith(expect.objectContaining({ partnerId: 'partner-1' }));
  });
});
