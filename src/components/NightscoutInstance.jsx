import React from 'react';
import { Divider, Grid, FormLabel, List, ListItem, ListItemText, Link, OutlinedInput, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import nsLocalStore from '../utils/localStore';

const FormGrid = styled(Grid)(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

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
                                Nightscout instance safe if that token would ever leak, despite all measures taken to prevent that.
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
 * @param {Snapshot} nightsocut - A Nightscout storage snapshot
 */
export function NightscoutInstance({ nightscout }) {

    return (
        <Grid container spacing={3}>
            <FormGrid size={{ xs: 21, md: 6}}>
                <FormLabel htmlFor="ns-url" required>
                    Nightscout URL
                </FormLabel>
                <OutlinedInput 
                    id="ns-url"
                    name="ns-url"
                    type="url"
                    onBlur={(event) => { nsLocalStore.setUrl(event.target.value) }}
                    placeholder="https://my.nightscout.url"
                    required
                    value={nightscout.url}
                    size="small"
                />
            </FormGrid>
            <FormGrid size={{ xs: 12, md: 6}}>
                <FormLabel htmlFor="ns-token">Nightscout Access token</FormLabel>
                <OutlinedInput 
                    id="ns-token"
                    name="ns-token"
                    type="password"
                    onBlur={(event) => { nsLocalStore.setToken(event.target.value) }}
                    placeholder="Put your Nightscout access token here"
                    value={nightscout.access_token}
                    size="small"
                />
            </FormGrid>
        </Grid>
    );
}