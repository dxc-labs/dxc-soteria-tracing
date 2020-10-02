import React, { useEffect, useState } from 'react'
import { Paper, Grid, Button, Container } from '@material-ui/core'
import { Typography, makeStyles, Link, Card, createMuiTheme, withStyles, ThemeProvider } from '@material-ui/core'
import { useLocation, useHistory } from 'react-router-dom'

import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import AddLocationIcon from '@material-ui/icons/AddLocation'
import BeenhereIcon from '@material-ui/icons/Beenhere'
import { green, purple, red, blue } from '@material-ui/core/colors'
import { useCookies } from 'react-cookie'
import { getLocation, addUserCheckins, addUserCheckouts, addCleaners } from 'services/api_new'
import { ThumbUp, ThumbDown } from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
    root: {
        alignContent: 'center',
        marginTop: '1rem',
    },
    titleLanding: {
        color: '#000',
        backgroundColor: '#ff9933',
        height: '3rem',
        textAlign: 'center',
        alignSelf: 'center',
    },
    titleIn: {
        color: '#000',
        backgroundColor: '#33cc33',
        height: '3rem',
        textAlign: 'center',
        alignSelf: 'center',
    },
    titleOut: {
        color: '#000',
        backgroundColor: '#005ce6',
        height: '3rem',
        textAlign: 'center',
        alignSelf: 'center',
    },
    titleCleaner: {
        color: '#000',
        backgroundColor: '#ffff33',
        height: '3rem',
        textAlign: 'center',
        alignSelf: 'center',
    },
    pos: {
        marginBottom: 12,
    },
    content: {
        textAlign: 'center',
        paddingLeft: '10px',
        paddingRight: '10px',
    },
    button: {
        margin: theme.spacing(1),
        width: '8rem',
    },
    buttons: {
        textAlign: 'center',
        alignItems: 'center',
        margin: 'auto',
    },
    checks: {
        justify: 'center',
    },
}))
const ColorButton = withStyles((theme) => ({
    root: {
        color: purple[500],
        borderColor: purple[500],
    },
}))(Button)

const theme = createMuiTheme({
    palette: {
        primary: green,
        secondary: blue,
    },
})
export default function Form() {
    const classes = useStyles()
    const [cookies, setCookie, removeCookie] = useCookies(['cookie-name'])
    const history = useHistory()
    const route = useLocation()
    const [checkinButton, setCheckinButton] = useState(false)
    const [updateButton, setUpdateButton] = useState(false)
    const [checkoutButton, setCheckoutButton] = useState(false)
    const [cleanButton, setCleanButton] = useState(false)
    const [scan, setScan] = useState(false)
    const [error, setError] = useState(false)
    const [checkOutText, setCheckOutText] = useState(false)
    const [cleanerText, setCleanerText] = useState(false)
    const [response, setResponse] = useState({})
    const [capacity, setCapacity] = useState()
    const [checkedinLocation, setCheckedinLocation] = useState()

    const [LocationDetails, setLocationDetails] = useState({})

    var facilityError = 'Location needs to be mapped'
    var checkinError = 'Please try again later, the location is currently unmapped'
    var d = new Date()
    var toDate = d.getDate()
    var month = new Array()
    month[0] = 'January'
    month[1] = 'February'
    month[2] = 'March'
    month[3] = 'April'
    month[4] = 'May'
    month[5] = 'June'
    month[6] = 'July'
    month[7] = 'August'
    month[8] = 'September'
    month[9] = 'October'
    month[10] = 'November'
    month[11] = 'December'
    var toMonth = month[d.getMonth()]
    var toYear = d.getFullYear()
    var toHour = d.getHours()
    var toMins = d.getMinutes()
    let locationId = route.pathname.split('/').slice(-1)[0]
    let capacityError = 0
    // console.log(locationId)

    useEffect(() => {
        getLocation(locationId).then((location) => {
            setLocationDetails(location)

            if (location == '404') {
                if (cookies.type == 'facility-admins') {
                    setUpdateButton(true)
                    setCheckoutButton(false)
                    setCheckinButton(false)
                    setCleanButton(false)
                    setCheckedinLocation(facilityError)
                } else {
                    setCheckinButton(true)
                    setUpdateButton(false)
                    setCheckoutButton(false)
                    setCheckedinLocation(checkinError)
                    setCapacity(capacityError)
                    if (cookies.type == 'Cleaner') {
                        setCleanButton(true)
                    } else {
                        setCleanButton(false)
                    }
                }
            } else if (location.status == '200') {
                console.log(location)
                console.log(`PERSON#${cookies.id}`)
                if (location['data'].hasOwnProperty('gsi1sk')) {
                    setCheckedinLocation(location['data']['locationCode'].replace(/#/g, ' / '))

                    if (location['data'].hasOwnProperty('active')) {
                        setCapacity(location['data']['activeCount'])

                        if (location['data']['active'].includes(`PERSON#${cookies.id}`)) {
                            setCheckoutButton(true)
                            setCheckinButton(false)
                            setUpdateButton(false)
                            setCleanButton(false)
                        } else {
                            setCheckinButton(true)
                            if (cookies.type == 'Cleaner') {
                                setCleanButton(true)
                            } else {
                                setCleanButton(false)
                            }
                            setUpdateButton(false)
                            setCheckoutButton(false)
                        }
                    } else {
                        setCapacity(capacityError)

                        setCheckinButton(true)
                        setUpdateButton(false)
                        setCheckoutButton(true)
                    }
                } else {
                    if (cookies.type == 'facility-admins') {
                        setUpdateButton(true)
                        setCheckoutButton(false)
                        setCheckinButton(false)
                        setCleanButton(false)
                    } else {
                        setCheckedinLocation(checkinError)
                        setCapacity(capacityError)

                        setCheckinButton(true)
                        setUpdateButton(false)
                        setCheckoutButton(true)
                        if (cookies.type == 'Cleaner') {
                            setCleanButton(true)
                        } else {
                            setCleanButton(false)
                        }
                    }
                }
            }
        })
    }, [])

    const scanLocation = () => {
        console.log(LocationDetails)

        addUserCheckins(cookies.id, locationId).then((checkin) => {
            console.log(checkin)
            if (checkin.status == '201') {
                setScan(true)
                setResponse(checkin)
                setCheckoutButton(true)
                setCheckinButton(false)
                if (cookies.type == 'Cleaner') {
                    setCleanButton(true)
                } else {
                    setCleanButton(false)
                }

                console.log('201')
            } else {
                setError(true)
                setResponse(checkin)
            }
        })
        console.log(locationId)
    }
    const CheckoutLocation = () => {
        addUserCheckouts(cookies.id, locationId).then((checkout) => {
            console.log(checkout)
            setCheckOutText(true)
            setCheckinButton(false)
            setCleanButton(false)
            setScan(false)
            setCheckoutButton(false)
            setCleanerText(false)
        })
    }
    const Cleaner = () => {
        addCleaners(cookies.id, locationId).then((sanitizations) => {
            console.log(sanitizations)
            setCleanerText(true)
            setCheckinButton(false)
            setCleanButton(false)

            setCheckoutButton(false)
            setCheckOutText(false)
            setScan(false)
        })
    }
    return (
        <Container fixed maxWidth="sm">
            <Grid container direction="column" spacing={3} className={classes.root}>
                {!scan && !error && !checkOutText && !cleanerText && (
                    <Grid item xs={12}>
                        <Card className={classes.checks}>
                            <Typography variant="subtitle1" className={classes.titleLanding}>
                                <b>Location Details</b>
                            </Typography>
                            <Typography variant="subtitle1" gutterBottom color="primary" align="center">
                                Hello! Welcome
                            </Typography>

                            <Typography variant="body2" className={classes.content}>
                                <b> {checkedinLocation}</b>
                            </Typography>
                            <Typography className={classes.content}>
                                Current occupancy : <b>{capacity}</b>
                            </Typography>
                        </Card>
                    </Grid>
                )}
                {scan && !error && (
                    <Grid item xs={12}>
                        <Card className={classes.checks}>
                            <Typography varient="h4" className={classes.titleIn}>
                                <b>Check-In Status</b>
                            </Typography>
                            <Typography className={classes.content}>
                                <b>
                                    {toDate} {toMonth} {toYear},{toHour}:{toMins}
                                </b>
                            </Typography>
                            <Typography className={classes.content}>
                                <b> {checkedinLocation}</b>
                            </Typography>

                            <Typography color="textSecondary" className={classes.content}>
                                Thank you for keeping the company safe!
                            </Typography>
                        </Card>
                    </Grid>
                )}

                {checkOutText && (
                    <Grid item xs={12}>
                        <Card className={classes.checks}>
                            <Typography varient="h4" className={classes.titleOut}>
                                <b>Exit Status</b>
                            </Typography>
                            <Typography className={classes.content}>
                                <b>
                                    {toDate} {toMonth} {toYear},{toHour}:{toMins}
                                </b>
                            </Typography>
                            <Typography className={classes.content}>
                                <b> {checkedinLocation}</b>
                            </Typography>

                            <Typography color="textSecondary" className={classes.content}>
                                Thank you for keeping the company safe!
                            </Typography>
                        </Card>
                    </Grid>
                )}
                {cleanerText && (
                    <Grid item xs={12}>
                        <Card className={classes.checks}>
                            <Typography varient="h4" className={classes.titleCleaner}>
                                <b>Sanitization Status</b>
                            </Typography>
                            <Typography className={classes.content}>
                                <b>
                                    {toDate} {toMonth} {toYear},{toHour}:{toMins}
                                </b>
                            </Typography>
                            <Typography className={classes.content}>
                                <b> {checkedinLocation}</b>
                            </Typography>
                            <Typography className={classes.content}>The location has been cleaned</Typography>

                            <Typography color="textSecondary" className={classes.content}>
                                Thank you for keeping the company safe!
                            </Typography>
                        </Card>
                    </Grid>
                )}
                {error && (
                    <Grid item xs={12}>
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
                    </Grid>
                )}

                <Grid item xs={9} className={classes.buttons}>
                    <>
                        <ThemeProvider theme={theme}>
                            <Button
                                variant="outlined"
                                color="primary"
                                className={classes.button}
                                startIcon={<ArrowBackIosIcon />}
                                disabled={!checkinButton}
                                onClick={() => {
                                    scanLocation()
                                }}
                            >
                                CheckIn
                            </Button>
                        </ThemeProvider>
                    </>
                    <Button
                        variant="outlined"
                        color="secondary"
                        className={classes.button}
                        startIcon={<ArrowForwardIosIcon />}
                        disabled={!checkoutButton}
                        onClick={() => {
                            CheckoutLocation()
                        }}
                    >
                        CheckOut
                    </Button>
                    <ThemeProvider theme={theme}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            className={classes.button}
                            startIcon={<BeenhereIcon />}
                            disabled={!cleanButton}
                            onClick={() => {
                                Cleaner()
                            }}
                        >
                            Clean
                        </Button>
                    </ThemeProvider>

                    <ColorButton
                        variant="outlined"
                        color="primeColour"
                        className={classes.button}
                        startIcon={<AddLocationIcon />}
                        disabled={!updateButton}
                        onClick={() => {
                            history.replace(`/tracing/addlocation=${locationId}`)
                        }}
                    >
                        Update
                    </ColorButton>
                </Grid>
            </Grid>
        </Container>
    )
}
