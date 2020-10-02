import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { TextField, Button, CssBaseline, Container, MenuItem } from '@material-ui/core'

import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

import { signIn } from 'services/Authentication'

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    header: {
        marginBottom: theme.spacing(4),
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}))

const Signin = () => {
    const classes = useStyles()
    const [email, setEmail] = useState('')
    const history = useHistory()
    const params = new URLSearchParams(window.location.search)

    async function handleSignIn() {
        let result = await signIn(email)

        let redirect = params.get('redirect')
        if (result) {
            history.push(`/tracing/challenge?redirect=${redirect}`)
        } else {
            // User Not Exist
            history.push(`/tracing/register?email=${email}&redirect=${redirect}`)
        }
    }

    return (
        <>
            <Container component="main" maxWidth="xs">
                <CssBaseline />
                <div className={classes.paper}>
                    <Typography className={classes.header} component="h1" variant="h3">
                        Tracing
                    </Typography>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>
                    <form className={classes.form} noValidate>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            onClick={(e) => {
                                e.preventDefault()
                                handleSignIn(email)
                            }}
                        >
                            Sign In
                        </Button>
                    </form>
                </div>
            </Container>
        </>
    )
}

export default Signin
