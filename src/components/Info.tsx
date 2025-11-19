import React from 'react'
import { Typography } from '@mui/material'
import { InfoText as NightscoutInfoText } from './NightscoutInstance'
import { InfoText as ProfileDetailsInfoText } from './ProfileDetails'
import { InfoText as ProfileConversionInfoText } from './ProfileConversion'
import { InfoText as AutotuneJobStatusInfoText } from './AutotuneJobStatus'

export default function Info({ steps, activeStep }: { steps: { name: string, display_name: string}[], activeStep: number}) {
    return ( 
        <React.Fragment>
            <Typography variant='subtitle2' sx={{ color: 'text.secondary'}} >
                {activeStep === 0 && <NightscoutInfoText /> }
                {activeStep === 1 && <ProfileDetailsInfoText /> }
                {activeStep === 2 && <ProfileConversionInfoText /> }
                {activeStep === 3 && <AutotuneJobStatusInfoText /> }
                {activeStep > 3 &&  steps[activeStep].display_name && <React.Fragment>
                    (more text to come)
                </React.Fragment> } 
            </Typography>
        </React.Fragment>
    );
}