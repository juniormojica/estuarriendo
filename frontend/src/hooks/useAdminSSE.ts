'use client';
import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../store/hooks';

type SSEEventHandlers = {
  [eventName: string]: (data: any) => void;
};

export const useAdminSSE = (handlers: SSEEventHandlers) => {
  const { user, token } = useAppSelector((state) => state.auth);
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handlersRef = useRef(handlers);

  // Keep handlers ref up to date
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    // Only connect if user is admin or superAdmin
    if (!user || !token || (user.userType !== 'admin' && user.userType !== 'superAdmin')) {
      return;
    }

    const connect = () => {
      // Clear any pending reconnect ref so future errors can schedule new reconnects
      reconnectTimeoutRef.current = null;

      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // Connect DIRECTLY to the backend SSE endpoint.
      // We bypass the Next.js proxy (/api rewrite) because Next.js rewrites buffer
      // HTTP responses, which breaks SSE long-lived streaming connections.
      // The backend SSE endpoint already sets Access-Control-Allow-Origin: * so
      // CORS is not an issue from any origin (dev or production).
      const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const eventSource = new EventSource(`${backendBase}/sse/admin?token=${token}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('🔗 SSE Connection opened');
        setIsConnected(true);
      };

      eventSource.onerror = (error) => {
        console.error('❌ SSE Connection error', error);
        setIsConnected(false);
        eventSource.close();
        eventSourceRef.current = null;
        
        // Always schedule reconnect (previous ref was cleared at top of connect())
        reconnectTimeoutRef.current = setTimeout(connect, 5000);
      };

      const allEvents = ['connected', 'heartbeat', 'property_submitted', 'property_updated', 'container_submitted', 'verification_submitted', 'verification_doc_submitted', 'payment_submitted', 'payment_auto_verified', 'student_request_created', 'property_report_created'];
      
      allEvents.forEach(eventName => {
        eventSource.addEventListener(eventName, ((e: MessageEvent) => {
          let data;
          try {
            data = JSON.parse(e.data);
          } catch (err) {
            data = e.data;
          }

          // Use 'connected' event from server as definitive connection confirmation
          if (eventName === 'connected') {
            setIsConnected(true);
          }

          if (eventName !== 'heartbeat') {
             console.log(`[SSE Event: ${eventName}]`, data);
          }
          
          if (handlersRef.current[eventName]) {
            handlersRef.current[eventName](data);
          }
        }) as EventListener);
      });
    };

    connect();

    return () => {
      console.log('🔌 Cleaning up SSE connection');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user, token]); // Reconnect if user/token changes, but ideally stable. We shouldn't put handlers in dependency array to avoid infinite reconnects if they aren't memoized.

  return { isConnected };
};
