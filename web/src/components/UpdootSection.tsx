import { ApolloCache } from '@apollo/client';
import { Flex, IconButton } from '@chakra-ui/core';
import gql from 'graphql-tag';
import { useState } from 'react';
import {
    PostSnippetFragment,
    useVoteMutation,
    VoteMutation,
} from '../generated/graphql';

interface UpdootSectionProps {
    post: PostSnippetFragment;
}

type loading = 'updooting-loading' | 'downdoot-loading' | 'not-loading';

const updateAfterVote = (
    value: number,
    postId: number,
    cache: ApolloCache<VoteMutation>
) => {
    const data = cache.readFragment<{
        id: number;
        points: number;
        voteStatus: number | null;
    }>({
        id: 'Post:' + postId,
        fragment: gql`
            fragment _ on Post {
                id
                points
                voteStatus
            }
        `,
    });
    if (data) {
        if (data.voteStatus === value) {
            return;
        }
        const newPoints =
            (data.points as number) + (!data.voteStatus ? 1 : 2) * value;
        cache.writeFragment({
            id: 'Post:' + postId,
            fragment: gql`
                fragment __ on Post {
                    points
                    voteStatus
                }
            `,
            data: {
                points: newPoints,
                voteStatus: value,
            },
        });
    }
};
export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [loadingState, setLoadingState] = useState<loading>('not-loading');
    const [vote] = useVoteMutation();
    return (
        <Flex
            direction="column"
            justifyContent="center"
            alignItems="center"
            mr={4}
        >
            <IconButton
                aria-label="Updoot Post"
                icon="chevron-up"
                isLoading={loadingState === 'updooting-loading'}
                onClick={async () => {
                    if (post.voteStatus === 1) {
                        return;
                    }
                    setLoadingState('updooting-loading');
                    await vote({
                        variables: {
                            postId: post.id,
                            value: 1,
                        },
                        update: (cache) => updateAfterVote(1, post.id, cache),
                    });
                    setLoadingState('not-loading');
                }}
                variantColor={post.voteStatus === 1 ? 'green' : undefined}
            />
            {post.points}
            <IconButton
                aria-label="Downdoot Post"
                icon="chevron-down"
                isLoading={loadingState === 'downdoot-loading'}
                onClick={async () => {
                    if (post.voteStatus === -1) {
                        return;
                    }
                    setLoadingState('downdoot-loading');
                    await vote({
                        variables: {
                            postId: post.id,
                            value: -1,
                        },
                        update: (cache) => updateAfterVote(-1, post.id, cache),
                    });
                    setLoadingState('not-loading');
                }}
                variantColor={post.voteStatus === -1 ? 'red' : undefined}
            />
        </Flex>
    );
};
