import { useCallback, useEffect, useState } from 'react';
import { useChatContext } from 'stream-chat-react';

export const useWatchers = () => {
  const [watchers, setWatchers] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const { channel } = useChatContext();

  const queryWatchers = useCallback(async () => {
    setError(null);

    try {
         if (!channel) return;
         
      const result = await channel.query({ watchers: { limit: 5, offset: 0 } });
      setWatchers(result?.watchers?.map((watcher) => watcher.id) || []);
      return;
    } catch (err) {
      setError(err as Error);
    }
  }, [channel]);

  useEffect(() => {
    queryWatchers();
  }, [queryWatchers]);

  useEffect(() => {
    if (!channel) return;

    const watchingStartListener = channel.on('user.watching.start', (event) => {
      const userId = event?.user?.id;
      if (userId && userId.startsWith('ai-bot')) {
        setWatchers((prevWatchers) => [
          userId,
          ...(prevWatchers || []).filter((watcherId) => watcherId !== userId),
        ]);
      }
    });

    const watchingStopListener = channel.on('user.watching.stop', (event) => {
      const userId = event?.user?.id;
      if (userId && userId.startsWith('ai-bot')) {
        setWatchers((prevWatchers) =>
          (prevWatchers || []).filter((watcherId) => watcherId !== userId)
        );
      }
    });

    return () => {
      watchingStartListener.unsubscribe();
      watchingStopListener.unsubscribe();
    };
  }, [channel]);

  return { watchers, error };
};