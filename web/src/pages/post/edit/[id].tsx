import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../../../components/InputField';
import { Layout } from '../../../components/Layout';
import {
    usePostQuery,
    useUpdatePostMutation,
} from '../../../generated/graphql';
import { useGetIntId } from '../../../utils/useGetIntId';
import { withApollo } from '../../../utils/withApollo';

interface editPostProps {}

const EditPost: React.FC<editPostProps> = ({}) => {
    const router = useRouter();
    const intId = useGetIntId();
    const { data, loading } = usePostQuery({
        skip: intId === -1,
        variables: {
            id: intId,
        },
    });
    const [updatePost] = useUpdatePostMutation();

    if (loading) {
        return (
            <Layout>
                <div>Loading..</div>
            </Layout>
        );
    }

    if (!data?.post) {
        return (
            <Layout>
                <Box>Could not find the post</Box>
            </Layout>
        );
    }

    return (
        <Layout variant="small">
            <Formik
                initialValues={{ title: data.post.title, text: data.post.text }}
                onSubmit={async (values) => {
                    await updatePost({ variables: { id: intId, ...values } });
                    router.back();
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
                            Update Post
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};

export default withApollo({ ssr: false })(EditPost);
