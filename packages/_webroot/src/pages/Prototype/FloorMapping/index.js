import FloorMap from 'assets/images/floorplan-collins-19.png'

import React, { useEffect, useState } from 'react'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { makeStyles } from '@material-ui/core/styles'
import {
    Typography,
    Grid,
    Paper,
    MenuItem,
    TextField,
    InputAdornment,
    CircularProgress,
    Backdrop,
    Button,
    Icon,
} from '@material-ui/core'

import { getLocations, addLocation } from './api'

import {
    ErrorTwoTone,
    CheckCircleTwoTone,
    CancelTwoTone,
    Room,
    FiberManualRecord,
} from '@material-ui/icons'

import { useLocation } from 'react-router-dom'
import slugid from 'slugid'
import Table from 'components/Table'
const useStyles = makeStyles((theme) => ({
    paper: {
        margin: theme.spacing(3),
        padding: theme.spacing(2),
    },
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
        width: '100%',
    },
    parent: {
        position: 'relative',
    },
    title: {
        margin: '1rem',
    },
    baseImage: {
        width: '100%',
        position: 'relative',
    },
    overImg: {
        position: 'absolute',
        fontSize: '5vw',
    },
}))

const AutocompleteLocation = () => {
    const classes = useStyles()
    const [mappingLocations, setMappingLocations] = useState([])

    const handleOnClick = (e) => {
        const statusOptions = ['red', 'amber', 'green']

        const randomItem =
            statusOptions[Math.floor(Math.random() * statusOptions.length)]

        var rect = e.target.getBoundingClientRect()

        var x = e.clientX - rect.left //x position within the element.
        var y = e.clientY - rect.top

        var xPer = Math.round((x / rect.width) * 100)
        var yPer = Math.round((y / rect.height) * 100)

        const location = {
            uuid: '8f488984-3ffa-4ca2-a7e8-efc95a0955a0',
            x: `${xPer}%`,
            y: `${yPer}%`,
            status: randomItem,
        }

        setMappingLocations((locations) => [...locations, location])
        console.log(location)
    }

    const Overlay = (props) => {
        const { x, y, uuid, status } = props.location

        const style = {
            left: x,
            top: y,
            color: status,
        }

        return (
            <CancelTwoTone
                style={style}
                className={classes.overImg}
                key={uuid}
            />
        )
    }

    return (
        <>
            <Grid container justify="center" alignItems="center">
                <Grid item xs={12}>
                    <Paper className={classes.paper} elevation={5}>
                        <Typography variant="h3">
                            Example 1 - Floor Mapping
                        </Typography>

                        <div className={classes.parent}>
                            <img
                                src={FloorMap}
                                onClick={(e) => handleOnClick(e)}
                                className={classes.baseImage}
                            />
                            {mappingLocations.map((location, index) => (
                                <Overlay key={index} location={location} />
                            ))}
                        </div>
                    </Paper>
                </Grid>
            </Grid>
        </>
    )
}

export default AutocompleteLocation
