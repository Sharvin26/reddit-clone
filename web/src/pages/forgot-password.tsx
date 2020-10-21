import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

interface ForgotPasswordProps {}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({}) => {
    const [complete, setComplete] = useState(false);
    const [forgotPassword] = useForgotPasswordMutation();

    return (
        <Wrapper variant="small">
            <Formik
                initialValues={{ email: '' }}
                onSubmit={async (values) => {
                    await forgotPassword({ variables: values });
                    setComplete(true);
                }}
            >
                {({ isSubmitting }) =>
                    complete ? (
                        <Box>
                            If an account with that email exists we sent you
                            email
                        </Box>
                    ) : (
                        <Form>
                            <Box mt={4}>
                                <InputField
                                    name="email"
                                    label="Email"
                                    type="email"
                                />
                            </Box>
                            <Button
                                mt={4}
                                type="submit"
                                isLoading={isSubmitting}
                                variantColor="teal"
                            >
                                Forgot password
                            </Button>
                        </Form>
                    )
                }
            </Formik>
        </Wrapper>
    );
};

export default withApollo({ ssr: false })(ForgotPassword);
