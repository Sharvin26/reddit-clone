import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import React, { useState } from 'react';
import { EditDeletePostButtons } from '../components/EditDeletePostButtons';
import { Layout } from '../components/Layout';
import { UpdootSection } from '../components/UpdootSection';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
    const [variables, setVariables] = useState({
        limit: 15,
        cursor: null as string | null,
    });
    const [{ data, error, fetching }] = usePostsQuery({
        variables,
    });

    if (!fetching && !data) {
        return (
            <div>
                <div>You got query failed for some reason</div>
                <div>{error?.message}</div>
            </div>
        );
    }

    return (
        <Layout>
            {!data && fetching ? (
                <div>loading....</div>
            ) : (
                <Stack spacing={8}>
                    {data!.posts.posts.map((p) =>
                        !p ? null : (
                            <Flex
                                key={p.id}
                                p={5}
                                shadow="md"
                                borderWidth="1px"
                            >
                                <UpdootSection post={p} />
                                <Box flex={1}>
                                    <NextLink
                                        href="/post/[id]"
                                        as={`/post/${p.id}`}
                                    >
                                        <Link>
                                            <Heading fontSize="xl">
                                                {p.title}
                                            </Heading>
                                        </Link>
                                    </NextLink>
                                    <Text>Posted by: {p.creator.username}</Text>
                                    <Flex align="center">
                                        <Text flex={1} mt={4}>
                                            {p.textSnippet}
                                        </Text>
                                        <Box ml="auto">
                                            <EditDeletePostButtons
                                                creatorId={p.creator.id}
                                                id={p.id}
                                            />
                                        </Box>
                                    </Flex>
                                </Box>
                            </Flex>
                        )
                    )}
                </Stack>
            )}
            {data && data.posts.hasMore ? (
                <Flex>
                    <Button
                        isLoading={fetching}
                        m="auto"
                        my={8}
                        onClick={() =>
                            setVariables({
                                limit: variables.limit,
                                cursor:
                                    data.posts.posts[
                                        data.posts.posts.length - 1
                                    ].createdAt,
                            })
                        }
                    >
                        Load More
                    </Button>
                </Flex>
            ) : null}
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
