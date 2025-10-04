import { Typography } from '@mui/material';
import React from 'react';

export default function Info({ steps, activeStep }) {
    return ( 
        <React.Fragment>
            <Typography variant='subtitle2' sx={{ color: 'text.secondary'}} >
                { steps[activeStep].display_name } (more text to come)
            </Typography>
        </React.Fragment>
    );
}