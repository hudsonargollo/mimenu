import { useEffect, useState, useRef } from 'react';
// REMOVED: supabase import - no longer using Supabase real-time

interface ConnectionMonitorProps {
  onConnectionChange?: (isConnected: boolean) => void;
}

// Simple client-side connection monitoring
// No external real-time subscriptions - local state management only
export function ConnectionMonitor({ onConnectionChange }: ConnectionMonitorProps) {
  const [isConnected, setIsConnected] = useState(true);
  const previousConnectionState = useRef(true);

  useEffect(() => {
    const handleConnectionChange = (connected: boolean) => {
      // Only trigger notifications and callbacks on actual state changes
      if (connected !== previousConnectionState.current) {
        setIsConnected(connected);
        onConnectionChange?.(connected);
        previousConnectionState.current = connected;
      }
    };

    // Simple connection monitoring using browser online/offline events
    const handleOnline = () => {
      handleConnectionChange(true);
    };

    const handleOffline = () => {
      handleConnectionChange(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onConnectionChange]);

  // This component doesn't render anything visible
  return null;
}

// Hook version for easier use in components
export function useConnectionMonitor() {
  const [isConnected, setIsConnected] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected');

  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
    };

    const handleOffline = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };

    const handleConnectivityChange = () => {
      if (navigator.onLine) {
        handleOnline();
      } else {
        handleOffline();
      }
    };

    // Check initial state
    handleConnectivityChange();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const reconnect = () => {
    setConnectionStatus('connecting');
    
    // Force a page reload as reconnection method
    setTimeout(() => {
      if (navigator.onLine) {
        setConnectionStatus('connected');
        setIsConnected(true);
      } else {
        setConnectionStatus('disconnected');
        setIsConnected(false);
      }
    }, 1000);
  };

  return {
    isConnected,
    connectionStatus,
    reconnect
  };
}