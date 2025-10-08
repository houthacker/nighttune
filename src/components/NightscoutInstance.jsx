import React from 'react';
import { Divider, Grid, FormLabel, List, ListItem, ListItemText, Link, OutlinedInput, Typography, TextField } from '@mui/material';

import FormGrid from './FormGrid';
import { STORE_EVENT_TYPES } from '../utils/localStore';


export function InfoText() {
    return ( 
            <List sx={{ bgcolor: 'background.paper' }}>
                <ListItem alignItems="flex-start">
                    <ListItemText
                        primary="Nightscout URL"
                        slotProps={{
                            primary: { color: 'text.primary' }
                        }}
                        secondary={
                            <Typography variant='body2' sx={{ color: 'text.secondary'}} >
                                Enter the URL to your Nightscout instance.
                            </Typography>
                        }
                    />
                </ListItem>
                <Divider variant="inset" component="li" />
                <ListItem alignItems='flex-start'>
                    <ListItemText 
                        primary="Nightscout Access token"
                        slotProps={{
                            primary: { color: 'text.primary' }
                        }}
                        secondary={
                            <Typography variant='body2' sx={{ color: 'text.secondary' }} >
                                If your Nightscout instance is locked down, you can use an access token 
                                to let this site access your instance. Note that using <code>API_SECRET</code> will <em>not</em> work. 
                                <br /><br />
                                It is <em>strongly</em> recommended that you create a token just for this site to keep your
                                Nightscout instance safe. If that token would ever leak, you would only need to invalidate it
                                instead of securing your whole Nightscout instance again.
                                <br /><br />
                                Instructions on how to add an access token are located at <Link target="_blank" rel="noopener" href="https://nightscout.github.io/nightscout/admin_tools/#create-a-token">https://nightscout.github.io/nightscout/admin_tools/#create-a-token</Link>
                                
                            </Typography>
                        }
                    />
                </ListItem>
            </List>
    );
}

/**
 * 
 * @param {object} store - The Nightscout storage data.
 */
export function NightscoutInstance({ store, preventNext }) {
    let nightscout = store.getSnapshot();
    const [url, setUrl] = React.useState(nightscout.url);
    const [urlError, setUrlError] = React.useState(false);
    const [token, setToken] = React.useState(nightscout.access_token);

    // With initial values, disable preventNext by validating url.
    let prevent = true;
    if (url) {
        try {
            new URL(url);
            prevent = false;
        } catch {
            prevent = true;
        }
    }

    React.useEffect(() => {
        preventNext(prevent);
    })

    

    const handleUrlBlur = (event) => {
        setUrl(event.target.value);
        store.setUrl(event.target.value);
    };

    const handleTokenBlur = (event) => {
        setToken(event.target.value);
        store.setToken(event.target.value);
    };

    const store_unsubcribe = store.subscribe((event_type) => {
        if (event_type === STORE_EVENT_TYPES.CLEAR) {
            setUrl('');
            setToken('');
        }
    });

    const handleUrlChange = (e) => {
        setUrl(e.target.value);
        let haveError = !(e.target.value && e.target.validity.valid);
        
        setUrlError(haveError);
        preventNext(haveError);
    }

    // Unsubscribe from store when unmounting
    React.useEffect(() => {
        return () => {
            store_unsubcribe();
        }
    });

    return (
        <Grid container spacing={3}>
            <FormGrid size={{ xs: 21, md: 6}}>
                <FormLabel htmlFor="ns-url" required>
                    Nightscout URL
                </FormLabel>
                <TextField 
                    id="ns-url"
                    name="ns-url"
                    type="url"
                    onBlur={handleUrlBlur}
                    onChange={handleUrlChange}
                    error={urlError}
                    placeholder="https://my.nightscout.url"
                    required
                    value={url}
                    size="small"
                    helperText={urlError ? 'Invalid URL' : ''}
                    variant='outlined'
                >{url}</TextField>
            </FormGrid>
            <FormGrid size={{ xs: 12, md: 6}}>
                <FormLabel htmlFor="ns-token">Nightscout Access token</FormLabel>
                <TextField 
                    id="ns-token"
                    name="ns-token"
                    type="password"
                    onBlur={handleTokenBlur}
                    placeholder="Put your Nightscout access token here"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    size="small"
                />
            </FormGrid>
        </Grid>
    );
}