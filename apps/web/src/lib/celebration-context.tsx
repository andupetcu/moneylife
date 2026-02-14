'use client';

import React, { createContext, useContext, useCallback, useRef, useState } from 'react';

export type CelebrationType =
  | 'xp'
  | 'coins'
  | 'badge'
  | 'levelUp'
  | 'streak'
  | 'billPaid'
  | 'salary'
  | 'crisis'
  | 'netWorthHigh';

export interface CelebrationData {
  amount?: number;
  level?: number;
  label?: string;
  emoji?: string;
  streakDays?: number;
  multiplier?: number;
}

export interface CelebrationEvent {
  id: string;
  type: CelebrationType;
  data: CelebrationData;
  createdAt: number;
}

const DURATIONS: Record<CelebrationType, number> = {
  xp: 800,
  coins: 800,
  badge: 3000,
  levelUp: 4000,
  streak: 2500,
  billPaid: 500,
  salary: 1500,
  crisis: 2000,
  netWorthHigh: 1000,
};

interface CelebrationContextValue {
  celebrate: (type: CelebrationType, data?: CelebrationData) => void;
  current: CelebrationEvent | null;
  dismiss: () => void;
}

const CelebrationContext = createContext<CelebrationContextValue>({
  celebrate: () => {},
  current: null,
  dismiss: () => {},
});

export function useCelebration(): CelebrationContextValue {
  return useContext(CelebrationContext);
}

let celebrationCounter = 0;

export function CelebrationProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [current, setCurrent] = useState<CelebrationEvent | null>(null);
  const queueRef = useRef<CelebrationEvent[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playingRef = useRef(false);

  const playNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      playingRef.current = false;
      setCurrent(null);
      return;
    }
    playingRef.current = true;
    const next = queueRef.current.shift()!;
    setCurrent(next);
    const duration = DURATIONS[next.type];
    timerRef.current = setTimeout(() => {
      playNext();
    }, duration);
  }, []);

  const celebrate = useCallback((type: CelebrationType, data: CelebrationData = {}) => {
    const event: CelebrationEvent = {
      id: `cel-${++celebrationCounter}-${Date.now()}`,
      type,
      data,
      createdAt: Date.now(),
    };
    queueRef.current.push(event);
    if (!playingRef.current) {
      playNext();
    }
  }, [playNext]);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    playNext();
  }, [playNext]);

  return (
    <CelebrationContext.Provider value={{ celebrate, current, dismiss }}>
      {children}
    </CelebrationContext.Provider>
  );
}
