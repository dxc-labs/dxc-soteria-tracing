import React from 'react'
import { Typography, Grid, MenuItem, MenuList, Divider } from '@material-ui/core'
import { Link } from 'react-router-dom'

import slugid from 'slugid'

const Welcome = () => {
    console.log(process.env)
    console.log(process.env.NODE_ENV)
    let slug = slugid.v4()

    return (
        <>
            <Typography variant="h5">Project Soteria Neighborhoods</Typography>

            <Typography variant="subtitle1" gutterBottom>
                Welcome to Project Soteria Neighborhoods.
            </Typography>

            <Grid container justify="center">
                <Grid item xs={10}>
                    <MenuList>
                        <Divider />
                        <MenuItem component={Link} to={'/q'}>
                            Generate QR Codes
                        </MenuItem>
                        <MenuItem component={Link} to={'/l'}>
                            View Locations
                        </MenuItem>
                        <Divider />
                        <MenuItem component={Link} to={`/s/${slug}`}>
                            {`Simulate Scan Workflow (https://example.com/tracing/${slug})`}
                        </MenuItem>
                    </MenuList>
                </Grid>
            </Grid>
        </>
    )
}

export default Welcome
