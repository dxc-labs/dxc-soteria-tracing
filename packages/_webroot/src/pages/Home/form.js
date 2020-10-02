import React, { useState } from 'react'
import {
    Grid,
    MenuItem,
    TextField,
    Typography,
    FormControlLabel,
    Checkbox,
    Button,
} from '@material-ui/core'

export default function Form({ handleSubmit }) {
    const [slug, setSlug] = useState('')

    return (
        <>
            <form>
                <Grid container direction="column" spacing={3}>
                    <Grid item xs={12} lg={6}>
                        <TextField
                            label="Slug"
                            fullWidth
                            placeholder="Slug"
                            variant="filled"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12} lg={6}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => handleSubmit(slug)}
                        >
                            Scan
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </>
    )
}
