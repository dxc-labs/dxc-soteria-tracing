import React, { useEffect, useState } from 'react'
import { Avatar, Button, CssBaseline, TextField, Typography, Container, MenuItem } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import { answerCustomChallenge, getCurrentUser } from 'services/Authentication'
import { useCookies } from 'react-cookie'
import { useHistory } from 'react-router-dom'
import Alert from '@material-ui/lab/Alert'

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
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

export default function Challenge() {
    const classes = useStyles()
    const [cookie, setCookie] = useCookies(['name'])
    const [answer, setAnswer] = useState('')
    const params = new URLSearchParams(window.location.search)
    const history = useHistory()
    const [error, setError] = useState(false)
    const [userOption, setUserOption] = useState(false)
    const [personType, setPersonType] = useState('')
    const userTypes = ['Employee', 'Visitor', 'Cleaner']
    // Move to cookie handler
    const maxAge = 365 * 24 * 60 * 60
    const expires = new Date()
    expires.setDate(expires.getDate() + 365)

    const handleUserType = () => {
        setCookie('type', personType, {
            path: '/',
            expires: expires,
            maxAge: maxAge,
            sameSite: true,
        })
        history.push(params.get('redirect'))
    }

    async function handleChallenge() {
        const loginSucceeded = await answerCustomChallenge(answer)

        console.log(loginSucceeded)
        if (loginSucceeded) {
            const user = await getCurrentUser()
            const { attributes, signInUserSession } = user
            // console.log(user)
            setCookie('id', attributes.sub, {
                path: '/',
                expires: expires,
                maxAge: maxAge,
                sameSite: true,
            })

            if (signInUserSession['idToken']['payload'].hasOwnProperty('cognito:groups')) {
                let groupType = signInUserSession['idToken']['payload']['cognito:groups']

                let groupList = 'facility-admins'

                for (var i = 0; i < groupType.length; i++) {
                    console.log(groupType[i])
                    if (groupType[i] == groupList) {
                        console.log(groupType[i])
                        setCookie('type', groupType[i], {
                            path: '/',
                            expires: expires,
                            maxAge: maxAge,
                            sameSite: true,
                        })
                        history.push(params.get('redirect'))
                    } else {
                    }
                }
            } else {
                // setCookie('type', 'Employee', {
                //     path: '/',
                //     expires: expires,
                //     maxAge: maxAge,
                //     sameSite: true,
                // })
                setUserOption(true)
                setError(false)
            }
        } else {
            console.log('error')
            setError(true)
        }
    }

    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <LockOutlinedIcon />
                </Avatar>

                {!userOption && (
                    <>
                        <Typography component="h1" variant="h5">
                            Challenge
                        </Typography>
                        <form className={classes.form} noValidate>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="Challenge"
                                label="Challenge"
                                name="Challenge"
                                autoComplete="Challenge"
                                autoFocus
                                onChange={(e) => setAnswer(e.target.value)}
                            />
                            {error && <Alert severity="error">Please enter the right challenge!</Alert>}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={(e) => {
                                    e.preventDefault()
                                    handleChallenge()
                                }}
                            >
                                Verify User
                            </Button>
                        </form>
                    </>
                )}
                {userOption && (
                    <>
                        <Typography component="h1" variant="h5">
                            User Role
                        </Typography>
                        <form className={classes.form} noValidate>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                id="type"
                                label="Type"
                                name="type"
                                select
                                onChange={(e) => setPersonType(e.target.value)}
                                value={personType}
                            >
                                {userTypes.map((type, index) => (
                                    <MenuItem key={index} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={(e) => {
                                    handleUserType()
                                }}
                            >
                                Sign In
                            </Button>
                        </form>
                    </>
                )}
            </div>
        </Container>
    )
}
