import { Flex, IconButton } from '@chakra-ui/core';
import { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
    post: PostSnippetFragment;
}

type loading = 'updooting-loading' | 'downdoot-loading' | 'not-loading';

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
    const [loadingState, setLoadingState] = useState<loading>('not-loading');
    const [, vote] = useVoteMutation();
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
                        postId: post.id,
                        value: 1,
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
                        postId: post.id,
                        value: -1,
                    });
                    setLoadingState('not-loading');
                }}
                variantColor={post.voteStatus === -1 ? 'red' : undefined}
            />
        </Flex>
    );
};
