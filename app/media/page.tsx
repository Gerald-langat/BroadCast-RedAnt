import MediaFeed from '@/components/MediaFeed';
import connectDB from '@/mongodb/db';
import { Post } from '@/mongodb/models/post';
import React from 'react'

export default async function mediaPage() {
      await connectDB();
      const posts = await Post.getAllPosts();
    
  return (
    <div>
           <MediaFeed posts={posts} />
    </div>
  )
}
