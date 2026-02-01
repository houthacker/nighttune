import { KeyboardDoubleArrowRight, NightShelter } from '@mui/icons-material'
import {
    Alert,
    AlertTitle,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Fade,
    Grid,
    Link,
    List,
    ListItem,
    ListItemText,
    Typography
} from '@mui/material'
import React, { ReactElement } from 'react'
import { Store } from '../utils/localStore'

import { AlertInfo } from '../utils/constants'
import FormGrid from './FormGrid'

import * as logger from '../utils/logger'

export function InfoText() {
    return (
        <List sx={{ bgcolor: 'background.paper' }}>
            <ListItem alignItems="flex-start">
                <ListItemText
                    primary="Your data"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary'}} >
                            On this page you can excercise your GDPR rights to retrieve your data as a JSON file.
                            You can also delete all your data that Nighttune has retained. 
                            To do either, click the corresponding button.<br /><br />

                            When you delete all retained data, Nighttune also provides you with an export for 
                            your personal administration.
                        </Typography>
                    }
                />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems='flex-start'>
                <ListItemText secondary={
                    <Typography variant='body2' >
                        <em>Note: deleting your data is a permanent action which cannot be recovered from.</em>
                    </Typography>
                } />
            </ListItem>
        </List>
    )
}

export default function GDPROverview({ store }: { store: Store }): ReactElement<any, any> {
    const [alert, setAlert] = React.useState(new AlertInfo(false, undefined, undefined))
    const [dialogOpen, setDialogOpen] = React.useState(false)

    const onRetrieveClicked = async () => {
        fetch(new URL('gdpr', process.env.NEXT_PUBLIC_BACKEND_BASE_URL!), {
            method: 'GET',
            credentials: 'include',
        }).then(async (response) => {
            if (response.ok) {
                setAlert({
                    show: false,
                    title: undefined,
                    description: undefined
                })

                const url = window.URL.createObjectURL(new Blob([await response.bytes()], {
                    type: 'application/octet-stream'
                }))

                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `nighttune-data-${Date.now()}.json`)
                document.body.appendChild(link)
                link.click()

                document.body.removeChild(link)
            } else {
                setAlert({
                    show: true,
                    title: 'Data export',
                    description: (
                    <Typography>
                        Exporting your data failed; the request returned status ${response.status}. Please try again later or report an issue 
                        &nbsp;<Link target="_blank" rel="noopener" href={process.env.NEXT_PUBLIC_NT_BUGS_OVERVIEW!}>here</Link>&nbsp;
                        if the problem persists.
                    </Typography>
                )
                })
            }
        }, (_) => {
            setAlert({
                show: true,
                title: 'Data export',
                description: (
                    <Typography>
                        Exporting your data failed. Please try again later or report an issue
                        &nbsp;<Link target="_blank" rel="noopener" href={process.env.NEXT_PUBLIC_NT_BUGS_OVERVIEW!}>here</Link>&nbsp;
                        if the problem persists.
                    </Typography>
                )
            })
        })
    }

    const onDeleteClicked = async () => {
        setDialogOpen(true)
    }

    const handleDeleteDeclined = () => {
        setDialogOpen(false)
        setAlert({
            show: false,
            title: undefined,
            description: undefined
        })
    }

    const handleDeleteConfirmed = () => {
        setDialogOpen(false)
        fetch(new URL('gdpr', process.env.NEXT_PUBLIC_BACKEND_BASE_URL!), {
            method: 'DELETE',
            credentials: 'include',
        }).then(async (response) => {
            
            if (response.ok) {
                logger.info('GDPR delete request execution successful')

                setAlert({
                    show: false,
                    title: undefined,
                    description: undefined
                })

                const url = window.URL.createObjectURL(new Blob([await response.bytes()], {
                    type: 'application/octet-stream'
                }))

                const link = document.createElement('a')
                link.href = url
                link.setAttribute('download', `nighttune-data${Date.now()}.json`)
                document.body.appendChild(link)
                link.click()

                document.body.removeChild(link)

                // Clear browser data as well.
                store.clear()
                location.reload()
            } else {
                logger.error('GDPR delete request execution failed', {
                    'http.status': response.status
                })
                setAlert({
                    show: true,
                    title: 'Data deletion',
                    description: (
                        <Typography>
                            Could not delete your data; the request returned status ${response.status}
                            Please try again later or report an issue 
                            &nbsp;<Link target="_blank" rel="noopener" href={process.env.NEXT_PUBLIC_NT_BUGS_OVERVIEW!}>here</Link>&nbsp;
                            if the problem persists.
                        </Typography>
                    )
                })
            }
        }, (_) => {
            logger.error('GDPR delete request failed')
            setAlert({
                show: true,
                title: 'Data deletion',
                description: (
                    <Typography>
                        Deleting your data failed.
                        Please try again later or report an issue 
                        &nbsp;<Link target="_blank" rel="noopener" href={process.env.NEXT_PUBLIC_NT_BUGS_OVERVIEW!}>here</Link>&nbsp;
                        if the problem persists.
                    </Typography>
                )
            })
        })
    }

    return <>
    <Dialog
        open={dialogOpen}
        onClose={handleDeleteConfirmed}
        >
        <DialogTitle color='error'>
            Danger zone &#x26a0;
        </DialogTitle>
        <DialogContent>
            <DialogContentText color='error'>
            Do you want to remove all your Nighttune data?<br /><br />
            <em>Removing your Nighttune data is permanent. You'll get an export of your data, but your data 
            cannot be recovered afterwards.<br />
            Removing nighttune data does not influence any data in your own Nightscout instance.</em><br /><br />
            After successful removal of your data, you will be redirected to the main page of Nighttune.
            </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={handleDeleteDeclined} autoFocus>No</Button>
            <Button onClick={handleDeleteConfirmed}>Yes</Button>
        </DialogActions>
        </Dialog>
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
            alignItems='center'
        >
            <Alert severity='error' color='error'>
                <AlertTitle>{alert.title}</AlertTitle>
                {alert.description}
            </Alert>
        </Grid>
    </Fade>
    <Grid container spacing={3}>
        <FormGrid>
            <Typography variant='h5' sx={{ color: 'text.primary' }}>
                Actions
            </Typography>
            <Divider sx={{ opacity: 0.6 }} />
            <Button sx={{
                marginTop: '20px'
            }} variant="outlined" endIcon={<KeyboardDoubleArrowRight />} onClick={onRetrieveClicked}>Retrieve all your data</Button><br />
            <Button sx={{
                marginTop: '20px'
            }} variant="outlined" endIcon={<KeyboardDoubleArrowRight />} onClick={onDeleteClicked}>Retrieve &amp; delete all your data</Button>
        </FormGrid>
    </Grid>
    </>
}