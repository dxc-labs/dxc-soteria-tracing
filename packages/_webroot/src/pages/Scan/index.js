import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, Grid, Backdrop, CircularProgress } from '@material-ui/core'
import { useLocation, useHistory } from 'react-router-dom'
import { useCookies } from 'react-cookie'
import { addUserCheckins } from 'services/api_new'

import { ThumbUp, ThumbDown } from '@material-ui/icons'
import { green, red } from '@material-ui/core/colors'

const useStyles = makeStyles((theme) => ({
    paper: {
        margin: theme.spacing(3),
        padding: theme.spacing(2),
    },
    icon: {
        fontSize: '5rem',
        margin: theme.spacing(5),
        padding: theme.spacing(5),
    },
    pre: {
        // whiteSpace: 'pre-wrap',
        width: '100%',
        // whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        width: '100%',
    },
}))

const Scan = () => {
    const classes = useStyles()
    const route = useLocation()
    const history = useHistory()
    const [cookies] = useCookies()
    const [isLoading, setIsLoading] = useState(true)
    const [result, setResult] = useState(true)
    const [response, setResponse] = useState({})

    useEffect(() => {
        // ! REVIEW THIS
        let locationId = route.pathname.split('=').slice(-1)[0]

        addUserCheckins(cookies.id, locationId).then((checkin) => {
            console.log(checkin)
            if (checkin == '404') {
                history.replace(`/tracing/addlocation=${locationId}`)
            } else if (checkin.status == '201') {
                setResult(true)
                setResponse(checkin)
                setIsLoading(false)
            } else {
                setResponse(checkin)
                setResult(false)
                setIsLoading(false)
            }
        })
    }, [])

    return (
        <>
            <Backdrop
                className={classes.backdrop}
                open={isLoading}
                // onClick={handleClose}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            {isLoading ? (
                <Typography variant="h3">Looking up location...</Typography>
            ) : result ? (
                <>
                    <Typography variant="h4">Success &#128515;</Typography>

                    <Typography variant="subtitle1" gutterBottom>
                        Thanks for participating. Your check-in was successful.
                    </Typography>

                    <Grid container justify="center">
                        <ThumbUp style={{ color: green[500] }} className={classes.icon} />
                    </Grid>
                </>
            ) : (
                <>
                    <Typography variant="h3">Whops :(</Typography>

                    <Typography variant="subtitle1" gutterBottom>
                        Something has gone wrong... Please try again
                    </Typography>

                    <Grid container justify="center">
                        <ThumbDown style={{ color: red[500] }} className={classes.icon} />
                    </Grid>

                    <Typography variant="subtitle1" gutterBottom>
                        <a
                            href={`mailto:xxx@example.com?subject=Project Soteria Neighborhoods: Checkin Error Report&body=${JSON.stringify(
                                response
                            )}`}
                        >
                            Click here to report error
                        </a>
                    </Typography>

                    <pre className={classes.pre}>{JSON.stringify(response.response, null, 4)}</pre>
                </>
            )}
        </>
    )
}

export default Scan
