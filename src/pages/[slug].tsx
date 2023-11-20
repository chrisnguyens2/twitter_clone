import { type GetStaticProps, type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

const ProfilePage: NextPage = () => {
  const router = useRouter();
  
  const { data } = api.profile.getUserByUsername.useQuery({
    username: router.query.slug as string
  });

  if (!data) return <div>404</div>

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <main className="flex justify-center h-screen">
        <div>
          {data.username}
        </div>
      </main>
    </>
  );
}

import { createServerSideHelpers } from '@trpc/react-query/server';
import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import superjson from "superjson";
import { useRouter } from "next/router";

export const getStaticProps: GetStaticProps = async (context) => {
  const helpers = createServerSideHelpers({
    router: appRouter,
    ctx: { prisma, currentUserId: null },
    transformer: superjson, // optional - adds superjson serialization
  });

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("no slug"); //probably should return to a different page instead

  const username = slug.replace("@", "");

  console.log(username);

  await helpers.profile.getUserByUsername.prefetch({ username });

  return {
    props: {
      trpcState: helpers.dehydrate(),
    },
  };
};

export const getStaticPaths = () => {
  return {paths: [], fallback: "blocking"};
}


export default ProfilePage;