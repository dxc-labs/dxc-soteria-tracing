import React from 'react'
import { Typography, Grid, MenuItem, MenuList, Divider } from '@material-ui/core'
import { Link } from 'react-router-dom'

import slugid from 'slugid'

const Scan = () => {
    let slug = slugid.v4()

    // console.log(process.env.REACT_APP_COGNTIO)
    // console.log(process.env.REACT_APP_ACCOUNT_ID)
    // console.log(process.env.REACT_APP_VAR)

    return (
        <>
            <Typography variant="h3">{process.env.REACT_APP_ACCOUNTID}</Typography>

            <Typography variant="subtitle1" gutterBottom>
                This is not a supported page. Did you mean to go to one of the following instead?
            </Typography>

            <Grid container justify="center">
                <Grid item xs={10}>
                    <MenuList>
                        <MenuItem component={Link} to={'/tracing/welcome'}>
                            Getting Started - Instructions
                        </MenuItem>
                        <Divider />
                        <MenuItem component={Link} to={'/tracing/qr'}>
                            Generate QR Codes
                        </MenuItem>
                        <MenuItem component={Link} to={'/tracing/updatelocations'}>
                            Update Location
                        </MenuItem>
                        <MenuItem component={Link} to={'/tracing/viewlocations'}>
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

export default Scan
