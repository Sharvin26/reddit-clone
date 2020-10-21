import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../components/InputField';
import { Layout } from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { useIsAuth } from '../utils/useIsAuth';
import { withApollo } from '../utils/withApollo';

interface createPostProps {}

const CreatePost: React.FC<createPostProps> = ({}) => {
    const router = useRouter();
    useIsAuth();
    const [createPost] = useCreatePostMutation();
    return (
        <Layout variant="small">
            <Formik
                initialValues={{ title: '', text: '' }}
                onSubmit={async (values) => {
                    const { errors } = await createPost({
                        variables: { input: values },
                        update: (cache) => {
                            cache.evict({ fieldName: 'posts:{}' });
                        },
                    });
                    if (!errors) {
                        router.push('/');
                    }
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

export default withApollo({ ssr: false })(CreatePost);
