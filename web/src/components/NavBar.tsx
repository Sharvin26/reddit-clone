import { useApolloClient } from '@apollo/client';
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
    const router = useRouter();
    const [logout, { loading: logoutFetching }] = useLogoutMutation();
    const apolloClient = useApolloClient();
    const { data, loading } = useMeQuery({
        skip: isServer(),
    });
    let body;

    if (loading) {
        body = null;
    } else if (!data?.me) {
        body = (
            <>
                <NextLink href="/login">
                    <Link mr={2}>Login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link>Register</Link>
                </NextLink>
            </>
        );
    } else {
        body = (
            <Flex align="center">
                <NextLink href="/create-post">
                    <Button size="sm" mr={4} as={Link}>
                        Create a Post
                    </Button>
                </NextLink>
                <Box mr={2}>{data.me.username}</Box>
                <Button
                    onClick={async () => {
                        await logout();
                        await apolloClient.resetStore();
                    }}
                    isLoading={logoutFetching}
                    variant="link"
                >
                    Logout
                </Button>
            </Flex>
        );
    }
    return (
        <Flex
            zIndex={1}
            position="sticky"
            top="0"
            bg="tan"
            p={4}
            align="center"
        >
            <Flex flex={1} m="auto" align="center" maxW={800}>
                <NextLink href="/">
                    <Link>
                        <Heading>LiReddit</Heading>
                    </Link>
                </NextLink>
                <Box ml="auto">{body}</Box>
            </Flex>
        </Flex>
    );
};
