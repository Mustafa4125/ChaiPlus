import { useState, useEffect } from 'react';
import { delay } from '@/lib/utils';

export function useSimulatedLoading(ms = 800) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    delay(ms).then(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [ms]);

  return loading;
}
