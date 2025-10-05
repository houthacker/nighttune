import React from 'react';
import { Typography } from '@mui/material';
import { InfoText as NightscoutInfoText } from './NightscoutInstance';

export default function Info({ steps, activeStep }) {
    return ( 
        <React.Fragment>
            <Typography variant='subtitle2' sx={{ color: 'text.secondary'}} >
                {activeStep === 0 && <NightscoutInfoText /> }
                {activeStep !== 0 &&  steps[activeStep].display_name && <React.Fragment>
                    (more text to come)
                </React.Fragment> } 
            </Typography>
        </React.Fragment>
    );
}