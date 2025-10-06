import { Cached } from '@mui/icons-material';
import { Box, Button, CircularProgress, Divider, Fade, FormLabel, Grid, InputLabel, List, ListItem, ListItemText, MenuItem, OutlinedInput, Select, Tooltip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import React from 'react';

const encoder = new TextEncoder();

const FormGrid = styled(Grid)(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

async function loadProfiles({ store }) {
    let snapshot = store.getSnapshot();
    if (snapshot.url) {
        let url = new URL("api/v1/profile.json", snapshot.url);

        if (snapshot.access_token) {
            const data = encoder.encode(snapshot.access_token);
            const hash_buffer = await crypto.subtle.digest('SHA-1', data);
            const hash_array = Array.from(new Uint8Array(hash_buffer));
            url.searchParams.append('token', hash_array
                .map((b) => b.toString(16).padStart(2, "0"))
                .join("")
            );
        }

        // Retrieve the profile
        let response = await fetch(url);
        let data = await response.json();

        return data[0];
    }

    console.warn('Cannot load profiles: Nightscout URL has not been set.');
    return {};
}

export default function ProfileDetails({ store }) {
    const [isLoaded, setLoaded] = React.useState(false);
    const [profiles, setProfiles] = React.useState({store: {}});
    const [defaultProfile, setDefaultProfile] = React.useState('');
    const [selectedProfile, setSelectedProfile] = React.useState('__default__');
    const [profileNames, setProfileNames] = React.useState([]);

    const setStates = async (data) => {
        setProfiles(data);
        setProfileNames([...Object.keys(data.store)].reverse());
        setDefaultProfile(data.defaultProfile);

        setLoaded(true);
    };

    React.useEffect(() => {
        async function fetchData() {
            setStates(await loadProfiles({ store }));
        }

        // Load only once per Nightscout URL, except when the user
        // forces a reload using the reload button, which sets `isLoaded` to false.
        if (isLoaded === false) {
            fetchData();
        }
    }, [store, isLoaded]);

    const onProfileSelected = (event) => {
        setSelectedProfile(event.target.value);
        console.log(profiles.store[event.target.value]);
    };

    const onReloadButtonClicked = async () => {
        // Cause the spinner to be visible
        setLoaded(false);

        // Set the rest of the states to their default values.
        setProfiles({store: {}});
        setDefaultProfile('');
        setSelectedProfile('__default__');
        setProfileNames([]);

        // And then fetch the new data
        setStates(await loadProfiles({ store }));


    };

    // TODO: Add Grid that displays values of selected profile. And error-handling @:53 (networkerror)
    
    return (
        <>
            <Fade
                in={isLoaded===false}
                style={{
                    transitionDelay: isLoaded ? '0ms' : '800ms',
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
                            Retrieving Nightscout profile details...
                        </Typography>
                    </FormGrid>
                </Grid>
            </Fade>
            <React.Activity mode={isLoaded ? 'visible' : 'hidden'}>
                <Grid
                    container
                    spacing={3}
                    direction='column'
                    alignItems='center'
                >
                    <FormGrid>
                        <InputLabel id="profile-selector-label" htmlFor="profile-selector">Select a profile to use</InputLabel>
                        <Select
                            id="profile-selector"
                            value={selectedProfile}
                            onChange={onProfileSelected}
                        >
                            <MenuItem selected='true' value='__default__'>Select a profile...</MenuItem>
                            <MenuItem value={defaultProfile}>{defaultProfile} (default)</MenuItem>
                            {profileNames.filter(e => e !== defaultProfile).map((name) => 
                                <MenuItem value={name}>{name}</MenuItem>
                            )}
                        </Select>
                        <Tooltip title="If your profile changed after loading it, reload the profiles to use those changes.">
                            <Button sx={{
                                marginTop: '20px'
                            }} variant="outlined" startIcon={<Cached />} onClick={onReloadButtonClicked}>Reload profiles</Button>
                        </Tooltip>
                    </FormGrid>
                </Grid>
            </React.Activity>
            <React.Activity mode={selectedProfile === '__default__' ? 'hidden' : 'visible'}>
                {[profiles.store[selectedProfile]].filter(e => e !== undefined).map(profile =>

                    <Box key='profile-fields'>
                        <Typography key='profile-details-title' variant='h5' sx={{ color: 'text.primary' }}>
                            Profile details
                        </Typography>
                        <Divider key='profile-details-divider' sx={{ opacity: 0.6 }} />
                        <List key='profile-data-list' dense={true} disablePadding={true} sx={{ width: '100%', }}>
                            <ListItem key='dia' divider={true}>
                                <Grid container spacing={2}>
                                    <Grid size={3}>
                                        <ListItemText primary="DIA" secondary={`${profile.dia}h`} />
                                    </Grid>
                                    <Grid size={9}>
                                        <Typography variant='caption' color='textDisabled'>
                                            DIA stands for <em>Duration of Insulin Activity</em>, and is the length
                                            of time that insulin takes to decay to zero. In AndroidAPS, the minimum
                                            DIA is 5 hours.
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </ListItem>
                            <ListItem key='units' divider={true}>
                                <Grid container spacing={2}>
                                    <Grid size={3}>
                                        <ListItemText primary="Units" secondary={profile.units} />
                                    </Grid>
                                    <Grid size={9}>
                                        <Typography variant='caption' color='textDisabled'>
                                            The profile units can be either <code>mmol/L</code> or <code>mg/dL</code>. 
                                            As a rule of thumb, 1 <code>mmol/L</code> = 18 <code>mg/dL</code>.
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </ListItem>
                            <ListItem key='time-zone' divider={true}>
                                <Grid container spacing={2}>
                                    <Grid size={3}>
                                        <ListItemText primary="Time zone" secondary={profile.timezone} />
                                    </Grid>
                                    <Grid size={9}>
                                        <Typography variant='caption' color='textDisabled'>
                                            Depending on your pump type, you might have to adjust your profile
                                            if you're travelling to a different time zone to prevent double
                                            records. See the AndroidAPS documentation for details about this.
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </ListItem>
                        </List>
                    </Box>
                )}
            </React.Activity>
        </>
    );
}