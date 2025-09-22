// src/actions/submitCastAction.ts

export const submitCastAction = async (
  cast: string,
  imageUrl?: string,
  scope?: string
) => {
  try {
    const resProfile = await fetch("/api/profile");
    if (!resProfile.ok) throw new Error("Failed to fetch user profile");

    const user = await resProfile.json();

    // Map to match Mongoose schema
    const userForPost = {
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      nickName: user.nickName,
      userImg: user.userImg || "", // <-- must match schema
    };

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: userForPost,
        cast: cast,               // <-- must match schema
        imageUrl: imageUrl || null,
        scope: scope || "Home",
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error("API error:", errData.error);
      throw new Error(errData.error || "Failed to submit post");
    }

    const data = await res.json();
    return data.post;
  } catch (err) {
    console.error("submitCastAction error:", err);
    throw err;
  }
};
