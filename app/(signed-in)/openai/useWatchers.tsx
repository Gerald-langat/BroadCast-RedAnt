import { useEffect, useState } from 'react';
import { Channel } from 'stream-chat';

interface Props {
  channel?: Channel;
}

export function useWatchers({ channel }: Props) {
  const [watchers, setWatchers] = useState<string[]>([]);

  useEffect(() => {
    if (!channel) return;

    // Initial watchers load
    const currentWatchers = Object.values(channel.state.watchers || {}).map(
      (user) => user.id
    );
    setWatchers(currentWatchers);

    const watchingStartListener = channel.on('user.watching.start', (event) => {
      const userId = event?.user?.id;
      if (userId && userId.startsWith('ai-bot')) {
        setWatchers((prev) => [
          userId,
          ...(prev || []).filter((w) => w !== userId),
        ]);
      }
    });

    const watchingStopListener = channel.on('user.watching.stop', (event) => {
      const userId = event?.user?.id;
      if (userId && userId.startsWith('ai-bot')) {
        setWatchers((prev) => (prev || []).filter((w) => w !== userId));
      }
    });

    return () => {
      watchingStartListener.unsubscribe?.();
      watchingStopListener.unsubscribe?.();
    };
  }, [channel]);

  return { watchers };
}
