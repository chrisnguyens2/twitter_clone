import { InferGetStaticPropsType, type GetStaticProps, type NextPage, GetStaticPropsContext } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;
const ProfilePage: NextPage<PageProps> = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username
  });

  if (isLoading) console.log("Is Loading!!!");

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout>
        <div className="relative h-36 bg-slate-600">
          <Image
            src={data.profileImageUrl}
            alt={`${data.username ?? ""}'s profile pic`}
            width={128}
            height={128}
            className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-black bg-black"
            priority={true}
          />         
        </div>
        <div className="h-[64px]"></div>
        <div className="p-4 text-2xl font-bold">{`@${data.username}`}</div>
        <div className="w-full border-b border-slate-400"></div>
      </PageLayout>
    </>
  );
};

import { createServerSideHelpers } from "@trpc/react-query/server";
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { PageLayout } from "~/components/layout";

export const getStaticProps = async (
  context: GetStaticPropsContext<{ slug: string }>,
) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, currentUserId: null },
    transformer: superjson, // optional - adds superjson serialization
  });
  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug"); //probably should return to a different page instead

  const username = slug.replace("@", "");


  await helpers.profile.getUserByUsername.prefetch({ username });
  return {
    props: {
      trpcState: helpers.dehydrate(),
      username,
    },
    revalidate: 1,
  };
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
