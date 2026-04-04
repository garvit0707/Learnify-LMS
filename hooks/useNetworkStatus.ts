import * as Network from "expo-network";
import { useEffect, useState } from "react";

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const check = async () => {
      try {
        const state = await Network.getNetworkStateAsync();
        setIsConnected(state.isConnected ?? true);
      } catch {
        setIsConnected(true);
      } finally {
        setIsChecking(false);
      }
    };

    check();
    interval = setInterval(check, 5000);

    return () => clearInterval(interval);
  }, []);

  return { isConnected, isChecking };
}
