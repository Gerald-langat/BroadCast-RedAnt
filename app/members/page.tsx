import AllUsers from "@/components/AllUsers";
import connectDB from "@/mongodb/db";
import { Profile } from "@/mongodb/models/profile";

async function MemberPage() {
  await connectDB();

  const users = await Profile.find().lean(); // 🔑 convert docs to plain objects
  const safeUsers = JSON.parse(JSON.stringify(users)); // ensure no non-serializable values

  return (
    <div>
      <AllUsers users={safeUsers} />
    </div>
  );
}

export default MemberPage;
