import React, { useEffect, useState } from 'react'
import { Paper, Grid, Button, Container } from '@material-ui/core'
import { Typography, makeStyles, Link, Card } from '@material-ui/core'
import { useLocation, useHistory } from 'react-router-dom'

import { getLocation } from 'services/api_new'
const useStyles = makeStyles((theme) => ({
    root: {
        alignContent: 'center',
    },
    // title: {
    //     fontSize: 20,
    //     color: '#000',
    //     backgroundColor: '#b300b3',
    //     height: '3rem',
    //     textAlign: 'center',
    //     alignSelf: 'center',
    // },
    pos: {
        marginBottom: 12,
    },
    content: {
        textAlign: 'center',
        backgroundColor: '#d9d9d9',
        height: '10rem',
    },
}))

export default function Form() {
    const classes = useStyles()

    const history = useHistory()
    const route = useLocation()

    let locationId = route.pathname.split('/').slice(-1)[0]
    // console.log(locationId)
    useEffect(() => {
        // getLocation(locationId).then((location) => {
        //     if (location == '404') {
        //         if (cookies.type == 'Facility-Admin') {
        //             setFacilityButton(true)
        //             setUserButton(false)
        //         } else {
        //             setUserButton(true)
        //             setFacilityButton(false)
        //         }
        //     } else if (location.status == '200') {
        //         if (location['data'].hasOwnProperty('gsi1sk')) {
        //             setUserButton(true)
        //             setFacilityButton(false)
        //         } else {
        //             setFacilityButton(true)
        //             setUserButton(false)
        //         }
        //     }
        // })
    }, [])

    return (
        <Container fixed maxWidth="sm">
            <Grid container direction="column" spacing={3} className={classes.root}>
                <Grid item xs={9}>
                    <Card className={classes.content}>
                        <Typography>Checkout</Typography>
                        <Typography>Thank you for using Project Soteria. </Typography>

                        {/* <Typography className={classes.content}>Have a good day!</Typography> */}
                    </Card>
                </Grid>
            </Grid>
        </Container>
    )
}
