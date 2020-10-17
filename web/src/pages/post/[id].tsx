import { Box, Heading } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import { EditDeletePostButtons } from '../../components/EditDeletePostButtons';
import { Layout } from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';

interface PostProps {}

export const Post: React.FC<PostProps> = ({}) => {
    const [{ data, error, fetching }] = useGetPostFromUrl();

    if (fetching) {
        return (
            <Layout>
                <div>loading...</div>
            </Layout>
        );
    }

    if (error) {
        return <div>{error.message}</div>;
    }

    if (!data?.post) {
        return (
            <Layout>
                <Box>Could not find the post</Box>
            </Layout>
        );
    }

    return (
        <Layout>
            <Box mr={3} ml={3}>
                <Heading mb={4}>{data.post.title}</Heading>
                <Box mb={4}>{data.post.text}</Box>
                <EditDeletePostButtons
                    id={data.post.id}
                    creatorId={data.post.creator.id}
                />
            </Box>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
