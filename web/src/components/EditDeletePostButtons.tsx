import { Box, IconButton } from '@chakra-ui/core';
import NextLink from 'next/link';
import React from 'react';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

interface EditDeletePostButtonsProps {
    id: number;
    creatorId: number;
}

export const EditDeletePostButtons: React.FC<EditDeletePostButtonsProps> = ({
    id,
    creatorId,
}) => {
    const { data: meData } = useMeQuery();
    const [deletePost] = useDeletePostMutation();
    if (meData?.me?.id !== creatorId) {
        return null;
    }

    return (
        <Box>
            <NextLink href="/post/edit/[id]" as={`/post/edit/${id}`}>
                <IconButton icon="edit" aria-label="delete post" mr={4} />
            </NextLink>

            <IconButton
                icon="delete"
                aria-label="delete post"
                onClick={() => {
                    deletePost({
                        variables: { id },
                        update: (cache) => {
                            cache.evict({ id: 'Post:' + id });
                        },
                    });
                }}
            />
        </Box>
    );
};
