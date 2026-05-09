'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import apiClient from '../lib/axios';

/**
 * useAdminPolling — Activity-log based polling for the admin dashboard.
 *
 * Strategy:
 * 1. On mount, fetches the latest activity log entry ID (baseline).
 * 2. Every POLL_INTERVAL, fetches the latest entries again.
 * 3. Any new entries (id > lastSeenId) are dispatched to the matching handler.
 * 4. After firing handlers, also calls onRefresh() so UI data updates automatically.
 *
 * Why activity log:
 * - Single reliable source of truth for all admin-relevant events.
 * - Every property/container/verification/payment submission writes a log entry.
 * - Returns a consistent array — no pagination ambiguity.
 * - We already confirmed this endpoint works (returns 200 with data).
 */

const POLL_INTERVAL = 15_000; // 15 seconds

export type ActivityEventType =
  | 'property_submitted'
  | 'property_updated'
  | 'container_submitted'
  | 'verification_submitted'
  | 'verification_doc_submitted'
  | 'payment_submitted'
  | 'payment_auto_verified'
  | 'student_request_created'
  | 'property_report_created';

type ActivityEntry = {
  id: number;
  type: string;
  message: string;
  userId?: string;
  propertyId?: number;
  user?: { id: string; name: string; email: string } | null;
};

type EventHandlers = Partial<Record<ActivityEventType, (data: ActivityEntry) => void>>;

async function fetchLatestLogs(limit = 10): Promise<ActivityEntry[]> {
  try {
    const res = await apiClient.get('/activity-logs', { params: { limit, offset: 0 } });
    return Array.isArray(res.data) ? res.data : [];
  } catch {
    return [];
  }
}

export const useAdminPolling = (handlers: EventHandlers, onRefresh?: () => Promise<void>) => {
  const { user, token } = useAppSelector((state) => state.auth);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const lastSeenId = useRef<number>(-1);
  const handlersRef = useRef(handlers);
  const onRefreshRef = useRef(onRefresh);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isFirstPoll = useRef(true);

  useEffect(() => { handlersRef.current = handlers; }, [handlers]);
  useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

  const poll = useCallback(async () => {
    if (!token) return;

    const logs = await fetchLatestLogs(10);

    if (logs.length === 0) {
      // Could be an auth error or network issue — keep isConnected true
      // since the activity-logs 401 is suppressed in axios interceptor
      setIsConnected(true);
      return;
    }

    setIsConnected(true);
    setLastUpdated(new Date());

    const latestId = logs[0]?.id ?? -1;

    if (isFirstPoll.current) {
      // On the first poll, just establish the baseline — don't fire any handlers
      lastSeenId.current = latestId;
      isFirstPoll.current = false;
      return;
    }

    if (latestId <= lastSeenId.current) {
      // No new entries
      return;
    }

    // Find all new entries since our last seen id
    const newEntries = logs.filter((entry) => entry.id > lastSeenId.current);
    lastSeenId.current = latestId;

    let didRefresh = false;

    for (const entry of newEntries) {
      const type = entry.type as ActivityEventType;
      const handler = handlersRef.current[type];
      if (handler) {
        handler(entry);
        if (!didRefresh) {
          // Auto-refresh data once for all new entries in this batch
          didRefresh = true;
          onRefreshRef.current?.();
        }
      }
    }
  }, [token]);

  useEffect(() => {
    if (!user || !token || (user.userType !== 'admin' && user.userType !== 'superAdmin')) {
      return;
    }

    isFirstPoll.current = true;

    // First poll immediately (establishes baseline id, no handlers fired)
    poll();

    // Subsequent polls detect new entries
    intervalRef.current = setInterval(poll, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isFirstPoll.current = true;
    };
  }, [user, token, poll]);

  return { isConnected, lastUpdated };
};
