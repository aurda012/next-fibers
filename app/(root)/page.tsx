import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import FiberCard from "@/components/cards/FiberCard";
import Pagination from "@/components/shared/Pagination";

import { fetchFibers } from "@/lib/actions/fiber.actions";
import { fetchUser } from "@/lib/actions/user.actions";

async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const results = await fetchFibers(
    searchParams.page ? +searchParams.page : 1,
    30
  );

  return (
    <>
      <h1 className="head-text text-left">Home</h1>

      <section className="mt-9 flex flex-col gap-10">
        {results.fibers.length === 0 ? (
          <p className="no-result">No fibers found</p>
        ) : (
          <>
            {results.fibers.map((fiber) => (
              <FiberCard
                key={fiber._id}
                id={fiber._id}
                currentUserId={user.id}
                parentId={fiber.parentId}
                content={fiber.text}
                author={fiber.author}
                community={fiber.community}
                createdAt={fiber.createdAt}
                comments={fiber.children}
              />
            ))}
          </>
        )}
      </section>

      <Pagination
        path="/"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={results.isNext}
      />
    </>
  );
}

export default Home;
