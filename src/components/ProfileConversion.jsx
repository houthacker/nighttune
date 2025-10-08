import React from 'react';
import { Alert, AlertTitle, CircularProgress, Fade, Grid, Typography } from '@mui/material';
import FormGrid from './FormGrid';
import { convertNightscoutProfile as convertProfile } from '../utils/profile';

/** @import { Store } from '../utils/localStore' */
/** @import { Component } from 'react' */

/**
 * 
 * @param {Store} store - The storage interface.
 * @returns {Component} 
 */
export default function ProfileConversion({ store }) {
    const snapshot = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
    const [oapsProfile, setOapsProfile] = React.useState(undefined);
    const [isConverting, setIsConverting] = React.useState(false);

    React.useEffect(() => {
        if (Object.keys(snapshot.conversion_settings.profile_data).length > 0) {
            setIsConverting(true);
            let convertedProfile = convertProfile(
                snapshot.conversion_settings.profile_data,
                snapshot.conversion_settings.min_5m_carbimpact,
                snapshot.conversion_settings.autosens_min,
                snapshot.conversion_settings.autosens_max,
                snapshot.conversion_settings.insulin_type
            );
            
            setOapsProfile(convertedProfile);
            store.setOpenAPSProfile(convertedProfile);
            setIsConverting(false);
        }
    }, [ store, snapshot ]);

    return (
        <>
            <Fade
                in={isConverting === true}
                style={{
                    transitionDelay: isConverting ? '500ms' : '0ms',
                }}
                unmountOnExit
            >
                <Grid
                    container
                    spacing={3}
                    direction='column'
                    alignItems='center'
                >
                    <FormGrid size={2}>
                        <CircularProgress />
                    </FormGrid>
                    <FormGrid size={6}>
                        <Typography variant='body2' sx={{ color: 'text.secondary' }} >
                            Converting Nightscout profile to an OpenAPS profile...
                        </Typography>
                    </FormGrid>
                </Grid>
            </Fade>
            <Fade
                in={Object.keys(snapshot.conversion_settings.profile_data).length === 0}
                style={{
                    transitionDelay: '0ms',
                }}
                unmountOnExit
            >
                <Grid
                    container
                    spacing={3}
                    direction='column'
                    alignItems='center'
                >
                    <Alert severity='error' color='error'>
                        <AlertTitle>Profile</AlertTitle>
                        No Nightscout profile loaded. Please go to the previous page to select a Nightscout profile.
                    </Alert>
                </Grid>
            </Fade>
            <Fade
                in={oapsProfile !== undefined}
                style={{
                    transitionDelay: '0ms',
                }}
                unmountOnExit
            >
                <Grid
                    container
                    spacing={3}
                    direction='column'
                    alignItems='center'
                >
                    <Alert severity='info'>
                        <AlertTitle>Conversion</AlertTitle>
                        Your profile has successfully been converted. Please choose the ISF and CR to use
                        and continue to the next step if you're satisfied.
                    </Alert>
                </Grid>
            </Fade>
        </>
    );
}