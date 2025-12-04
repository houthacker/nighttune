import React from 'react'
import { Alert, AlertTitle, Divider, Grid, Fade, FormLabel, List, ListItem, ListItemText, Link, Typography, TextField } from '@mui/material'
import Turnstile, { useTurnstile } from 'react-turnstile'

import FormGrid from './FormGrid'
import { STORE_EVENT_TYPES } from '../utils/localStore'

import type { Snapshot, Store } from '../utils/localStore'
import type { ChangeEvent, FocusEvent } from 'react'
import { AlertInfo } from '../utils/constants'

const DEFAULT_ALERT_SETTINGS = new AlertInfo(false, undefined, undefined)

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
                <Divider variant="inset" component="li" />
                <ListItem alignItems='flex-start'>
                    <ListItemText 
                        primary="Bot protection"
                        slotProps={{
                            primary: { color: 'text.primary' }
                        }}
                        secondary={
                            <Typography variant='body2' sx={{ color: 'text.secondary' }} >
                                To prevent bots from messing around with this site, you might have to complete a challenge: click
                                the checkbox, indicating that you are human. That's it.
                            </Typography>
                        }
                    />
                </ListItem>
            </List>
    );
}

export function NightscoutInstance({ store, preventNext }: { store: Store, preventNext: (value: boolean) => void}) {
    const snapshot: Snapshot = React.useSyncExternalStore(store.subscribe, store.getSnapshot)
    const [url, setUrl] = React.useState(snapshot.url)
    const [turnstileValid, setTurnstileValid] = React.useState(false)
    const [alert, setAlert] = React.useState(new AlertInfo(false, undefined, undefined))
    const [urlError, setUrlError] = React.useState(false)
    const [token, setToken] = React.useState(snapshot.access_token)

    // With initial values, disable preventNext by validating url.
    let prevent = true
    if (url && turnstileValid) {
        try {
            new URL(url)
            prevent = false
        } catch {
            prevent = true
        }
    }

    React.useEffect(() => {
        preventNext(prevent)
    })

    const turnstile = useTurnstile()

    const handleUrlBlur = (event: FocusEvent<HTMLInputElement>) => {
        setUrl(event.target.value)
        store.setUrl(event.target.value)
    }

    const handleTokenBlur = (event: FocusEvent<HTMLInputElement>) => {
        setToken(event.target.value)
        store.setToken(event.target.value)
    }

    const store_unsubcribe = store.subscribe((event_type) => {
        if (event_type === STORE_EVENT_TYPES.CLEAR) {
            setUrl('')
            setToken('')
        }
    })

    const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value)
        let haveError = !(e.target.value && e.target.validity.valid)
        
        setUrlError(haveError)
        if (haveError) {
            preventNext(haveError)
        }
    }

    // Unsubscribe from store when unmounting
    React.useEffect(() => {
        return () => {
            store_unsubcribe()
        }
    })

    return (
        <>
        <Fade
            in={alert.show}
            style={{
                transitionDelay: alert.show ? '0ms' : '800ms',
            }}
            unmountOnExit
        >
            <Grid
                container
                spacing={3}
                direction='column'
                alignItems='left'
            >
                <Alert severity='error' color='error'>
                    <AlertTitle>{alert.title}</AlertTitle>
                    {alert.description}
                </Alert>
            </Grid>
        </Fade>
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
                    defaultValue={url}
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
                    defaultValue={token}
                    onChange={(e) => setToken(e.target.value)}
                    size="small"
                />
            </FormGrid>
            <Divider sx={{ width: '100%' }} />
            <FormGrid size={{ xs: 21, md: 6}}>
                <Turnstile
                    sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITEKEY!}
                    onVerify={async (token) => {
                        try {
                            const response = await fetch(new URL('turnstile', process.env.NEXT_PUBLIC_BACKEND_BASE_URL!), {
                                method: 'POST',
                                body: JSON.stringify({ token }),
                                credentials: 'include'
                            })
                            
                            if (!response.ok) {
                                turnstile.reset()
                            }

                            setTurnstileValid(response.ok)
                            setAlert(DEFAULT_ALERT_SETTINGS)
                        } catch (error: any) {
                            console.error(error)
                            const msg = typeof error.message === 'string'
                                ? `Error while verifying you are human: ${error.message}`
                                : 'Error while verifying you are human.' 

                            setAlert(new AlertInfo(true, 'Turnstile verification', msg))

                            turnstile.reset()
                            setTurnstileValid(false)
                        }
                    }}
                    size='flexible'
                    refreshExpired='auto'
                    appearance='interaction-only'
                    theme='auto'
                />
            </FormGrid>
        </Grid>
        </>
    );
}