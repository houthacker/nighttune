import React, { ReactElement } from 'react'
import { Alert, Box, Button, CircularProgress, Collapse, Divider, Fade, Grid, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Modal, Typography } from '@mui/material'
import { CheckCircleOutline, DownloadOutlined, ErrorOutline, HourglassEmptyOutlined, KeyboardDoubleArrowRight } from '@mui/icons-material'
import { tz } from '@date-fns/tz'
import { format, parseISO } from 'date-fns'

import { fetchJobs, fetchJobResults } from '../utils/nightscout'
import { Store } from '../utils/localStore'
import FormGrid from './FormGrid'

import type { Snapshot } from '../utils/localStore'
import type { AutotuneResult, Job, JobStatus } from '../utils/nightscout'
import AutotuneJobResults from './AutotuneJobResults'

const DEFAULT_SUBMIT_STATUS = {
    error: false, 
    status: 0,
    hint: undefined as string | undefined
}

export function InfoText() {
    return (
        <List sx={{ bgcolor: 'background.paper' }}>
            <ListItem alignItems='flex-start'>
                <ListItemText
                    primary="Actions"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary'}} >
                            If there is no currently running job, you can submit a new one by 
                            clicking on the <code>Submit new job &gt;&gt;</code> button.<br />
                            The job will then be executed. Once it has finished, its results can be
                            viewed using the <code>Get results</code> button. 
                            Once <Link href='https://github.com/houthacker/nighttune-backend/issues/15'>nighttune-backend #15</Link>
                            has been implemented and you provided your email address, you'll receive an email containing the results
                            as well.
                        </Typography>
                    }
                ></ListItemText>
            </ListItem>
            <Divider variant='inset' component='li' />
            <ListItem alignItems='flex-start'>
                <ListItemText
                    primary="Previous jobs"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary'}} >
                            This shows a list of the last 30 jobs that have been executed
                            against your Nightscout instance. Although you can view the results here,
                            it is recommended that you provide an email address to send the results to
                            if you want to be able to view job results earlier than the last 30.
                        </Typography>
                    }
                ></ListItemText>
            </ListItem>
        </List>
    )
}

export default function AutotuneJobStatus({ store }: { store: Store }): ReactElement<any, any> {
    const snapshot: Snapshot = React.useSyncExternalStore(store.subscribe, store.getSnapshot)
    const [jobs, setJobs] = React.useState<Job[] | undefined>(undefined)
    const [haveActiveJob, setHaveActiveJob] = React.useState(false)
    const [intervalHandle, setIntervalHandle] = React.useState(undefined as any)
    const [jobResults, setJobResults] = React.useState(undefined as AutotuneResult | undefined)
    const [modalOpen, setModalOpen] = React.useState(false)
    const [submitStatus, setSubmitStatus] = React.useState(DEFAULT_SUBMIT_STATUS)

    async function _fetchJobs() {
        const jobs = await fetchJobs()
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
        try {
            const result = await fetch(new URL('job', process.env.NEXT_PUBLIC_BACKEND_BASE_URL!), {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({
                    nightscout_url: snapshot.url!,
                    nightscout_access_token: snapshot.access_token,
                    settings: snapshot.conversion_settings
                }, (k, v) => {
                    if (k === "email_address" && v === "") {
                        return undefined
                    } else if (k === "nightscout_access_token" && v === undefined) {
                        return undefined
                    }
                    
                    return v
                })
            })

            if (result.ok) {
                setHaveActiveJob(true)
                setSubmitStatus(DEFAULT_SUBMIT_STATUS)
            } else {
                console.error(result)
                setHaveActiveJob(false)
                setSubmitStatus({
                    error: true,
                    status: result.status,
                    hint: `HTTP ${result.status}`
                })
            }
        } catch (error: any) {
            setHaveActiveJob(false)
            setSubmitStatus({
                error: true,
                status: 0,
                hint: error instanceof Error ? error.message : 'Unknown error'
            })
        }
    }

    const onGetResultsClicked = async (id: string) => {
        const results = await fetchJobResults(id)
        setJobResults(results)
        setModalOpen(!!results)
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
            <Modal
                open={modalOpen}
                onClose={() => { setModalOpen(false) }}
                sx={{ overflow: 'scroll' }}
                draggable={true}
            >
                <AutotuneJobResults 
                    result={jobResults}
                />
            </Modal>
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
            <Collapse in={submitStatus.error}>
                <Alert 
                    severity='error'
                >Could not submit job: <code>{submitStatus.hint}</code> 
                    {(submitStatus.status === 0 || submitStatus.status >= 500) && 
                    <><br /><Link target='_blank' rel='noopener' href={process.env.NEXT_PUBLIC_NT_BUGS_OVERVIEW_URL!}>Explore current issues at github.</Link></>}
                </Alert>
            </Collapse>
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