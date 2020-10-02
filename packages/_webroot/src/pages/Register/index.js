import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Button, CssBaseline, Grid, Link, TextField, Typography, Container, MenuItem } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { signIn, signUp } from 'services/Authentication'

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

    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}))

const Register = () => {
    const classes = useStyles()
    const history = useHistory()
    const urlParams = new URLSearchParams(window.location.search)

    const [email, setEmail] = useState(urlParams.has('email') ? urlParams.get('email') : '')

    async function handleSignUp() {
        await signUp(email)
        await signIn(email)

        let redirect = urlParams.get('redirect')
        history.push(`/tracing/challenge?redirect=${redirect}`)
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
                        Register
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
                            autoFocus
                            value={email}
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
                                handleSignUp(email)
                            }}
                        >
                            Register
                        </Button>
                    </form>
                    <Grid container justify="flex-end">
                        <Grid item>
                            <Link href="/tracing/signin" variant="body2">
                                Already have an account? Sign in
                            </Link>
                        </Grid>
                    </Grid>
                </div>
            </Container>
        </>
    )
}

export default Register
