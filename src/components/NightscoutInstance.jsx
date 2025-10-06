import React from 'react';
import { Divider, Grid, FormLabel, List, ListItem, ListItemText, Link, OutlinedInput, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const encoder = new TextEncoder();

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
 * @param {object} store - The Nightscout storage data.
 */
export function NightscoutInstance({ store }) {
    let nightscout = store.getSnapshot();
    const [url, setUrl] = React.useState(nightscout.url);
    const [token, setToken] = React.useState(nightscout.access_token);

    const handleUrlBlur = (event) => {
        setUrl(event.target.value);
        store.setUrl(event.target.value);
    };

    const handleTokenBlur = (event) => {
        setToken(event.target.value);
        store.setToken(event.target.value);
    };

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
                    onBlur={handleUrlBlur}
                    placeholder="https://my.nightscout.url"
                    required
                    defaultValue={url}
                    size="small"
                />
            </FormGrid>
            <FormGrid size={{ xs: 12, md: 6}}>
                <FormLabel htmlFor="ns-token">Nightscout Access token</FormLabel>
                <OutlinedInput 
                    id="ns-token"
                    name="ns-token"
                    type="password"
                    onBlur={handleTokenBlur}
                    placeholder="Put your Nightscout access token here"
                    defaultValue={token}
                    size="small"
                />
            </FormGrid>
        </Grid>
    );
}