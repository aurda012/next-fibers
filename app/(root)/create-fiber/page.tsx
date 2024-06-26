import PostFiber from "@/components/forms/PostFiber";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const CreateFiber = async () => {
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");

  return (
    <>
      <h1 className="head-text">Create Fiber</h1>

      <PostFiber userId={userInfo._id} />
    </>
  );
};
export default CreateFiber;
