import { CapWidget, type CapWidgetHandle } from "@better-captcha/react/provider/cap-widget"
import React from 'react'
import { Helmet } from 'react-helmet'

import { Alert, AlertTitle, Divider, Fade, FormLabel, Grid, InputLabel, Link, List, ListItem, ListItemText, MenuItem, Select, TextField, Typography } from '@mui/material'

import { STORE_EVENT_TYPES } from '../utils/localStore'
import FormGrid from './FormGrid'

import type { ChangeEvent, FocusEvent } from 'react'
import { AlertInfo, NightscoutApiVersion } from '../utils/constants'
import type { Snapshot, Store } from '../utils/localStore'

import * as logger from '../utils/logger'

const DEFAULT_ALERT_SETTINGS = new AlertInfo(false, undefined, undefined)

export function InfoText() {
    return ( 
        <>
            <Helmet>
                <meta name="description" content="Nighttune provides a simple way to run OpenAPS Autotune against Nightscout profiles." />
                <meta property="og:description" content="Nighttune provides a simple way to run OpenAPS Autotune against Nightscout profiles." />
            </Helmet>
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
        </>
    );
}

export function NightscoutInstance({ store, preventNext }: { store: Store, preventNext: (value: boolean) => void}) {
    const snapshot: Snapshot = React.useSyncExternalStore(store.subscribe, store.getSnapshot)
    const captchaRef = React.useRef<CapWidgetHandle | null>(null)
    
    const [url, setUrl] = React.useState(snapshot.url)
    const [captchaValid, setCaptchaValid] = React.useState(false)
    const [alert, setAlert] = React.useState(DEFAULT_ALERT_SETTINGS)
    const [urlError, setUrlError] = React.useState(false)
    const [token, setToken] = React.useState(snapshot.access_token)
    const [apiVersion, setApiVersion] = React.useState(snapshot.nightscout_api_version || NightscoutApiVersion.v1)

    // With initial values, disable preventNext by validating url.
    let prevent = true
    if (url && captchaValid) {
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

    const handleUrlBlur = (event: FocusEvent<HTMLInputElement>) => {
        const url = event.target.value
        setUrl(url)

        const storedUrl = store.storedUrl()
        if (storedUrl && url && storedUrl !== url) {
            store.prune()
        }

        store.setUrl(url)
    }

    const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
        setUrl(e.target.value)
        let haveError = !(e.target.value && e.target.validity.valid)
        
        setUrlError(haveError)
        if (haveError) {
            preventNext(haveError)
        }
    }

    const handleTokenBlur = (event: FocusEvent<HTMLInputElement>) => {
        setToken(event.target.value)
        store.setToken(event.target.value)
    }

    const onApiVersionSelected = (event: ChangeEvent<Omit<HTMLInputElement, "value"> & { value: NightscoutApiVersion }, Element> 
        | Event & { target: { value: NightscoutApiVersion, name: string}}) => {

            setApiVersion(event.target.value)
            store.setNightscoutApiVersion(event.target.value as NightscoutApiVersion)
    }

    const store_unsubcribe = store.subscribe((event_type) => {
        if (event_type === STORE_EVENT_TYPES.CLEAR) {
            setUrl('')
            setToken('')
        }
    })

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
            <FormGrid size={{ xs: 12, md: 6, lg: 5}}>
                <InputLabel id="lbl-ns-api-version">Nightscout API version</InputLabel>
                <Select
                    labelId="lbl-ns-api-version"
                    id="ns-api-version"
                    value={apiVersion}
                    label="Nightscout API version"
                    onChange={(e) => onApiVersionSelected(e)}
                >
                    <MenuItem value={1}>API v1 (old version)</MenuItem>
                    <MenuItem value={3}>API v3 (AAPS compatible)</MenuItem>
                </Select>
            </FormGrid>
            <FormGrid size={{ xs: 21, md: 6}}>
                <CapWidget 
                    ref={captchaRef}
                    endpoint={`https://captcha.nighttune.app/${encodeURIComponent(process.env.NEXT_PUBLIC_CAPTCHA_SITEKEY!)}/`}
                    autoRender={true}
                    onError={(error) => {
                        logger.error('Captcha verification failed', {
                            'error': typeof error === 'string' ? error : JSON.stringify(error)
                        })
                        setAlert(new AlertInfo(true, 'Captcha verification', 'Captcha verification failed'))
                        
                        // TODO Last resort, search for a better resolution to this.
                        location.reload()
                    }}
                    onSolve={async (token) => {
                        const response = await fetch(new URL('captcha', process.env.NEXT_PUBLIC_BACKEND_BASE_URL!), {
                            method: 'POST',
                            body: JSON.stringify({ token }),
                            credentials: 'include'
                        })

                        if (!response.ok) {
                            logger.error('Captcha site verification failed', {
                                'http.status': response.status
                            })
                            setAlert(new AlertInfo(true, 'Captcha verification', 'Captcha verification failed'))
                            
                            // TODO Last resort, search for a better resolution to this.
                            location.reload()
                        }

                        setCaptchaValid(response.ok)
                        if (response.ok) {
                            setAlert(DEFAULT_ALERT_SETTINGS)
                        }
                    }}
                />
            </FormGrid>
        </Grid>
        </>
    );
}