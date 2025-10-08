import React from 'react';
import { Alert, AlertTitle, CircularProgress, Fade, Grid, Typography } from '@mui/material';
import FormGrid from './FormGrid';
import { convert_ns_profile as convertProfile } from '../utils/profileConverter';

/** @import { Snapshot, Store } from '../utils/localStore' */
/** @import { Component } from 'react' */

/**
 * 
 * @param {Store} store - The storage interface.
 * @returns {Component} 
 */
export default function ProfileConversion({ store }) {
    const snapshot = store.getSnapshot();
    const [settings, setSettings] = React.useState(snapshot.conversion_settings);
    const [isConverting, setIsConverting] = React.useState(false);

    return (
        <>
            <Fade
                in={isConverting === true}
                style={{
                    transitionDelay: isConverting ? '800ms' : '0ms',
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
                in={Object.keys(settings.profile_data).length === 0}
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
        </>
    );
}