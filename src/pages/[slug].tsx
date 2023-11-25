import {
  type InferGetStaticPropsType,
  type NextPage,
  type GetStaticPropsContext,
} from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import Image from "next/image";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { PageLayout } from "~/components/layout";
import { LoadingPage } from "~/components/loading";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

dayjs.extend(relativeTime);

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length == 0) return <div>User has not posted</div>;

  return (
    <div>
      {data.map((fullPost) => (
        <PostView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
};

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;
const ProfilePage: NextPage<PageProps> = ({ username }) => {
  const { data, isLoading } = api.profile.getUserByUsername.useQuery({
    username,
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
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps = async (
  context: GetStaticPropsContext<{ slug: string }>
) => {
  const helpers = generateSSGHelper();
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
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
