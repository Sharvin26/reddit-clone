import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useIsAuth } from '../utils/useIsAuth';

interface createPostProps {}

const createPost: React.FC<createPostProps> = ({}) => {
    const router = useRouter();
    useIsAuth();
    const [, createPost] = useCreatePostMutation();
    return (
        <Layout variant="small">
            <Formik
                initialValues={{ title: '', text: '' }}
                onSubmit={async (values, { setErrors }) => {
                    const { error } = await createPost({ input: values });
                    if (!error) {
                        router.push('/');
                    }

                    // const response = await login(values);
                    // if (response.data?.login.errors) {
                    //     setErrors(toErrorMap(response.data.login.errors));
                    // } else if (response.data?.login.user) {
                    //     router.push('/');
                    // }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="title"
                            label="Title"
                            placeholder="title"
                        />
                        <Box mt={4}>
                            <InputField
                                name="text"
                                label="Body"
                                placeholder="text......"
                                textarea
                            />
                        </Box>
                        <Button
                            mt={4}
                            type="submit"
                            isLoading={isSubmitting}
                            variantColor="teal"
                        >
                            Create Post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(createPost);
