import { redirect } from "next/navigation";

import { fetchCommunityPosts } from "@/lib/actions/community.actions";
import { fetchUserPosts } from "@/lib/actions/user.actions";

import FiberCard from "../cards/FiberCard";

interface Result {
  name: string;
  image: string;
  id: string;
  fibers: {
    _id: string;
    text: string;
    parentId: string | null;
    author: {
      name: string;
      image: string;
      id: string;
    };
    community: {
      id: string;
      name: string;
      image: string;
    } | null;
    createdAt: string;
    children: {
      author: {
        image: string;
      };
    }[];
  }[];
}

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

async function ThreadsTab({ currentUserId, accountId, accountType }: Props) {
  let result: Result;

  if (accountType === "Community") {
    result = await fetchCommunityPosts(accountId);
  } else {
    result = await fetchUserPosts(accountId);
  }

  if (!result) {
    redirect("/");
  }

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.fibers.map((fiber) => (
        <FiberCard
          key={fiber._id}
          id={fiber._id}
          currentUserId={currentUserId}
          parentId={fiber.parentId}
          content={fiber.text}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: fiber.author.name,
                  image: fiber.author.image,
                  id: fiber.author.id,
                }
          }
          community={
            accountType === "Community"
              ? { name: result.name, id: result.id, image: result.image }
              : fiber.community
          }
          createdAt={fiber.createdAt}
          comments={fiber.children}
        />
      ))}
    </section>
  );
}

export default ThreadsTab;
