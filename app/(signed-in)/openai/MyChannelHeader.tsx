import { useChannelStateContext } from 'stream-chat-react';
import { useWatchers } from './useWatchers';
import { Button } from '@/components/ui/button';

export default function MyChannelHeader() {
  const { channel } = useChannelStateContext();
  const { watchers } = useWatchers({ channel });

  const aiInChannel =
    (watchers ?? []).filter((watcher) => watcher.includes('ai-bot')).length > 0;
  return (
    <div className='my-channel-header'>

      <Button variant="outline" className="w-full" onClick={addOrRemoveAgent}>
        {aiInChannel ? 'Remove AI' : 'Chat with AI'}
      </Button>
    </div>
  );

  async function addOrRemoveAgent() {
    if (!channel) return;
    const endpoint = aiInChannel ? 'stop-ai-agent' : 'start-ai-agent';
    await fetch(`/api/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel_id: channel.id }),
    });
  }
}