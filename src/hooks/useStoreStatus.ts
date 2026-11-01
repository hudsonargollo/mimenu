import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStoreStatus = () => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoreStatus();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('store_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'store_settings',
        },
        (payload) => {
          console.log('Store status changed:', payload);
          if (payload.new && 'is_open' in payload.new) {
            setIsOpen(payload.new.is_open as boolean);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadStoreStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('is_open')
        .limit(1)
        .single();

      if (error) throw error;
      
      setIsOpen(data?.is_open ?? true);
    } catch (error) {
      console.error('Error loading store status:', error);
      // Default to open if there's an error
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleStoreStatus = async () => {
    const newStatus = !isOpen;
    
    try {
      // Call the RPC function to update status
      const { data, error } = await supabase.rpc('update_store_status', {
        new_status: newStatus
      });

      if (error) throw error;

      setIsOpen(newStatus);
      
      toast.success(
        newStatus 
          ? '✅ ¡Local abierto! Los clientes pueden hacer pedidos.'
          : '🔒 ¡Local cerrado! Los nuevos pedidos están bloqueados.',
        {
          duration: 3000,
        }
      );
    } catch (error) {
      console.error('Error updating store status:', error);
      toast.error('Error al actualizar el estado del local');
    }
  };

  return {
    isOpen,
    loading,
    toggleStoreStatus,
  };
};
