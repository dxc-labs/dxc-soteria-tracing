import React, { useEffect, useState, forwardRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'
import { getLocations } from 'services/api_new'
import { useHistory } from 'react-router-dom'
import { getIdAsSlug } from 'services/urlParser'
import Table from 'components/Table'

import { Pageview } from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
    paper: {
        margin: theme.spacing(3),
        padding: theme.spacing(2),
    },
}))

const Facilities = () => {
    const classes = useStyles()
    const history = useHistory()

    const [locations, setLocations] = useState([])

    useEffect(() => {
        getLocations().then((locations) => {
            setLocations(locations)
        })
    }, [])

    const columns = [
        { title: 'pk', field: 'pk' },
        { title: 'sk', field: 'sk' },
        { title: 'd1', field: 'd1' },
    ]

    const actions = [
        {
            icon: Pageview,
            tooltip: 'Open Location',
            onClick: (event, rowData) => {
                const uuid = rowData.pk.split('LOCATION#')[1]
                getIdAsSlug(uuid).then((id) => {
                    history.push(`/locations/${id}`)
                })
            },
        },
    ]

    return (
        <>
            <Typography variant="h4">Facilities</Typography>
            <Table
                columns={columns}
                data={locations}
                actions={actions}
                title="Locations"
            />
        </>
    )
}

export default Facilities
