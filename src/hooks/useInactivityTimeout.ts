"use client";

import { useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
const WARNING_TIMEOUT = 14 * 60 * 1000; // 14 minutes - show warning 1 minute before logout

export function useInactivityTimeout() {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningTimeoutRef = useRef<NodeJS.Timeout>();

  const resetTimer = () => {
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    // Set warning timer (1 minute before logout)
    warningTimeoutRef.current = setTimeout(() => {
      console.log('Session will expire in 1 minute due to inactivity');
      // You could show a toast notification here
    }, WARNING_TIMEOUT);

    // Set logout timer
    timeoutRef.current = setTimeout(() => {
      console.log('Session expired due to inactivity');
      signOut({ callbackUrl: '/signin?timeout=true' });
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    // Events that indicate user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timer on any user activity
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Start the timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, []);
}
