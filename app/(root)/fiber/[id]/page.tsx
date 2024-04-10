import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs";

import Comment from "@/components/forms/Comment";
import FiberCard from "@/components/cards/FiberCard";

import { fetchUser } from "@/lib/actions/user.actions";
import { fetchFiberById } from "@/lib/actions/fiber.actions";

export const revalidate = 0;

async function FiberDetails({ params }: { params: { id: string } }) {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const fiber = await fetchFiberById(params.id);

  return (
    <section className="relative">
      <div>
        <FiberCard
          id={fiber._id}
          currentUserId={user.id}
          parentId={fiber.parentId}
          content={fiber.text}
          author={fiber.author}
          community={fiber.community}
          createdAt={fiber.createdAt}
          comments={fiber.children}
        />
      </div>

      <div className="mt-7">
        <Comment
          fiberId={params.id}
          currentUserImg={user.imageUrl}
          currentUserId={JSON.stringify(userInfo._id)}
        />
      </div>

      <div className="mt-10">
        {fiber.children.map((childItem: any) => (
          <FiberCard
            key={childItem._id}
            id={childItem._id}
            currentUserId={user.id}
            parentId={childItem.parentId}
            content={childItem.text}
            author={childItem.author}
            community={childItem.community}
            createdAt={childItem.createdAt}
            comments={childItem.children}
            isComment
          />
        ))}
      </div>
    </section>
  );
}

export default FiberDetails;
