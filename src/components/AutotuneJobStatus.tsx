import React, { ReactElement } from 'react'
import { Box, Button, CircularProgress, Divider, Fade, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material'
import { CheckCircleOutline, DownloadOutlined, ErrorOutline, HourglassEmptyOutlined, KeyboardDoubleArrowRight } from '@mui/icons-material'
import { tz } from '@date-fns/tz'
import { format, parseISO } from 'date-fns'

import * as ns from '../utils/nightscout'
import { Store } from '../utils/localStore'
import FormGrid from './FormGrid'

import type { Snapshot } from '../utils/localStore'
import type { Job, JobStatus } from '../utils/nightscout'

export function InfoText() {
    return <Box />
}

export default function AutotuneJobStatus({ store }: { store: Store }): ReactElement<any, any> {
    const snapshot: Snapshot = React.useSyncExternalStore(store.subscribe, store.getSnapshot)
    const [jobs, setJobs] = React.useState<Job[] | undefined>(undefined)
    const [haveActiveJob, setHaveActiveJob] = React.useState(false)
    const [intervalHandle, setIntervalHandle] = React.useState(undefined as any)

    async function _fetchJobs() {
        const jobs = await ns.fetchJobs()
        setJobs(jobs)
        setHaveActiveJob(jobs.length > 0 && ['submitted', 'processing'].includes(jobs[0].status))
    }

    React.useEffect(() => {
        _fetchJobs()
    }, [setJobs, setHaveActiveJob])

    React.useEffect(() => {
        if (haveActiveJob && intervalHandle === undefined) {
            _fetchJobs()
            setIntervalHandle(setInterval(async () => {
                if (haveActiveJob) {
                    await _fetchJobs()
                }
            }, 10 * 1000))
        } else {
            if (!haveActiveJob && intervalHandle !== undefined) {
                clearInterval(intervalHandle)
                setIntervalHandle(undefined)
            }
        }
    }, [haveActiveJob])

    const onSubmitClicked = async () => {
        const result = await fetch(new URL('job', process.env.NEXT_PUBLIC_BACKEND_BASE_URL!), {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                nightscout_url: snapshot.url!,
                nightscout_access_token: snapshot.access_token,
                settings: snapshot.conversion_settings
            }, (k, v) => {
                return v === undefined && k === "nightscout_access_token" ? undefined : v
            })
        })

        setHaveActiveJob(result.ok)
    }

    const onGetResultsClicked = async (id: string) => {
        const result = await ns.fetchJobResults(id)
        console.log(result)
    }

    const JobIcon = (status: JobStatus) => {
        switch (status) {
            case 'submitted':
            case 'processing':
                return <HourglassEmptyOutlined />
            case 'success':
                return <CheckCircleOutline />
            case 'error':
                return <ErrorOutline />
        }
    }
    
    return (
        <>
            <Fade
                in={jobs === undefined}
                style={{
                    transitionDelay: jobs ? '0ms' : '800ms',
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
                            Retrieving autotune job details...
                        </Typography>
                    </FormGrid>
                </Grid>
            </Fade>
            <React.Activity mode={haveActiveJob  ? 'hidden' : 'visible'}>
                <Grid container spacing={3}>
                    <FormGrid>
                        <Typography variant='h5' sx={{ color: 'text.primary' }}>
                            Actions
                        </Typography>
                        <Divider sx={{ opacity: 0.6 }} />
                        <Button sx={{
                            marginTop: '20px'
                        }} variant="outlined" endIcon={<KeyboardDoubleArrowRight />} onClick={onSubmitClicked}>Submit new job</Button>
                    </FormGrid>
                </Grid>
            </React.Activity>
            <React.Activity mode={jobs === undefined ? 'hidden' : 'visible'}>
                <Box>
                    <Typography variant='h5' sx={{ color: 'text.primary' }}>
                        Previous jobs
                    </Typography>
                    <Divider sx={{ opacity: 0.6 }} />
                    <List dense={true} disablePadding={true} sx={{ width: '100%'}} >
                        {(jobs || []).map(job =>
                        <ListItem 
                            divider={true}
                            key={job.id}
                            secondaryAction={
                                job.status === 'success' ? 
                                    <ListItemButton onClick={async () => {
                                        await onGetResultsClicked(job.id)
                                    }}>
                                        <ListItemIcon><DownloadOutlined sx={{ alignSelf: 'center'}}  /></ListItemIcon>
                                        <ListItemText primary="Get results" />
                                    </ListItemButton> 
                                : undefined
                            }>
                            <Grid container spacing={2} sx={{ width: '100%'}}>
                                <Grid size={1} sx={{ alignContent: 'center'}}>
                                    <ListItemIcon>
                                        {JobIcon(job.status)}
                                    </ListItemIcon>
                                </Grid>
                                <Grid size={4} sx={{ marginLeft: '2em', marginTop: '.5em' }}>
                                    <ListItemText >{format(parseISO(job.submittedAt), 'yyyy-MM-dd HH:mm', {
                                        in: tz(Intl.DateTimeFormat().resolvedOptions().timeZone)
                                    })}</ListItemText>
                                </Grid>
                            </Grid>
                        </ListItem>
                        )}
                    </List>
                </Box>
            </React.Activity>
        </>
    )
}