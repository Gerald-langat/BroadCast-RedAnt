
import connectDB from '@/mongodb/db';
import MarketFeed from "@/components/MarketFeed";
import { Market } from '@/mongodb/models/marketpost';

export const revalidate = 0;

export default async function marketPlace() {
     await connectDB();
      const posts = await Market.getAllMarketPosts();
  return (
    <div>
        <MarketFeed posts={posts} />
    </div>
  )
}
