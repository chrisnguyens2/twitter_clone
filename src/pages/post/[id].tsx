import {
  type InferGetStaticPropsType,
  type NextPage,
  type GetStaticPropsContext,
} from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import { PageLayout } from "~/components/layout";
import { PostView } from "~/components/postview";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

type PageProps = InferGetStaticPropsType<typeof getStaticProps>;
const SinglePostPage: NextPage<PageProps> = ({ id }) => {
  const { data, isLoading } = api.posts.getById.useQuery({
    id,
  });

  if (isLoading) console.log("Is Loading!!!");

  if (!data) return <div>404</div>;

  return (
    <>
      <Head>
        <title>{`${data.post.content} - @${data.author.username}`}</title>
      </Head>
      <PageLayout>
        <PostView {...data} />
      </PageLayout>
    </>
  );
};

export const getStaticProps = async (
  context: GetStaticPropsContext<{ id: string }>
) => {
  const helpers = generateSSGHelper();
  const id = context.params?.id;

  if (typeof id !== "string") throw new Error("no id"); //probably should return to a different page instead

  await helpers.posts.getById.prefetch({ id });
  return {
    props: {
      trpcState: helpers.dehydrate(),
      id,
    },
    revalidate: 1,
  };
};

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
