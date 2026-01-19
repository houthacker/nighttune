import { tz } from '@date-fns/tz'
import { CheckCircleOutline, CloseOutlined, DownloadOutlined, ErrorOutline, HourglassEmptyOutlined, KeyboardDoubleArrowRight, UploadFileOutlined } from '@mui/icons-material'
import { Alert, Box, Button, CircularProgress, Collapse, Divider, Fade, Grid, IconButton, Link, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Modal, styled, Typography } from '@mui/material'
import { format, parseISO } from 'date-fns'
import React, { ReactElement } from 'react'

import { Store } from '../utils/localStore'
import { BasalSmoothing, fetchJobResults, fetchJobs } from '../utils/nightscout'
import FormGrid from './FormGrid'

import type { Snapshot } from '../utils/localStore'
import type { AutotuneResult, Job, JobStatus } from '../utils/nightscout'
import AutotuneJobResults from './AutotuneJobResults'
import ProfileUploadDialog from './ProfileUploadDialog'

const DEFAULT_STATUS_MESSAGE = {
    status: 0,
    severity: 'error' as 'error' | 'success',
    message: undefined as string | undefined
}

const browserTimezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone

const BottomMarginCollapse = styled(Collapse)({
    transition: 'all',
    "&.MuiCollapse-entered": {
        marginBottom: "50px"
    }
})

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
                            viewed using the <code>Get results</code> button. <br />
                            You'll receive an email containing the results if you provided your email address.
                        </Typography>
                    }
                />
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
                            against your Nightscout instance. 
                        </Typography>
                    }
                />
            </ListItem>
            <Divider variant='inset' component='li' />
            <ListItem alignItems='flex-start'>
                <ListItemText 
                    primary="Upload as profile"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                            If an autotune job was successful, you can upload its recommendations as a new 
                            Nightscout profile. This is done by taking the <em>current</em> version of the profile
                            that was autotuned and replacing the <code>CR</code>, <code>ISF</code> and <code>basal</code> 
                            values with those from the autotune recommendations. <br /><br />

                            The profile is (intentionally) not activated, so you have to select and activate it 
                            yourself using the app of your choice.
                        </Typography>
                    }
                />
            </ListItem>
            <Divider variant='inset' component='li' />
            <ListItem alignItems='flex-start'>
                <ListItemText
                    primary="Time zones"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary'}} >
                            The job submit time is shown in the timezone of your browser,
                            which is "<code>{browserTimezone}</code>". <br />
                            When viewing the results of a previous job, the timezone of the Nightscout
                            profile at that time is used.<br /><br />
                            If you're at home, there probably will be no difference between these two, but 
                            if you're travelling to a different time zone it's important to know these 
                            time zones can be different.
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
    const [statusMessage, setStatusMessage] = React.useState(DEFAULT_STATUS_MESSAGE)
    const [showStatusMessage, setShowStatusMessage] = React.useState(false)
    const [uploadDialogOpen, setUploadDialogOpen] = React.useState(false)
    const [selectedJobId, setSelectedJobId] = React.useState('')
    const [allowRecommendationChooser, setAllowRecommendationChooser] = React.useState(false)

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
                setStatusMessage(DEFAULT_STATUS_MESSAGE)
            } else {
                console.error(result)
                setHaveActiveJob(false)
                setStatusMessage({
                    status: result.status,
                    severity: 'error',
                    message: `Could not submit job: HTTP ${result.status}`
                })
                setShowStatusMessage(true)
            }
        } catch (error: any) {
            setHaveActiveJob(false)
            setStatusMessage({
                status: 0,
                severity: 'error',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
            setShowStatusMessage(true)
        }
    }

    const onGetResultsClicked = async (id: string) => {
        const results = await fetchJobResults(id)
        setJobResults(results)
        setModalOpen(!!results)
    }

    const onUploadProfileClicked = (id: string, allowRecommendationChooser: boolean) => {
        setSelectedJobId(id)
        setAllowRecommendationChooser(allowRecommendationChooser)
        setUploadDialogOpen(true)
    }

    const onUploadProfileConfirmed = async(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setUploadDialogOpen(false)

        const form = Object.fromEntries((new FormData(e.currentTarget) as any).entries())
        const response = await fetch(new URL(`job/id/${selectedJobId}/create-ns-profile`, process.env.NEXT_PUBLIC_BACKEND_BASE_URL!), {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({
                name: form.profile_name
            })
        })

        switch (response.status) {
            case 200:
                setStatusMessage({
                    status: 200,
                    severity: 'success',
                    message: 'Profile successfully created.'
                })
                setShowStatusMessage(true)
                break
            case 401:
                setStatusMessage({
                    status: 401,
                    severity: 'error',
                    message: 'Cannot create profile: unauthorized. Maybe you\'re using a read-only access token?'
                })
                setShowStatusMessage(true)
                break
            case 404:
                setStatusMessage({
                    status: 404,
                    severity: 'error',
                    message: `Cannot create profile: related job ${selectedJobId} not found.`
                })
                setShowStatusMessage(true)
                break
            case 409:
                setStatusMessage({
                    status: 409,
                    severity: 'error',
                    message: 'Cannot create profile: a profile with the same name already exists.'
                })
                setShowStatusMessage(true)
                break
            case 410:
                setStatusMessage({
                    status: 410,
                    severity: 'error',
                    message: 'Profile used to run autotune job is missing from Nightscout profile list.'
                })
                setShowStatusMessage(true)
                break
            case 500:
                setStatusMessage({
                    status: 500,
                    severity: 'error',
                    message: `Error while creating profile for job ${selectedJobId}.`
                })
                setShowStatusMessage(true)
                break
            default:
                setStatusMessage(DEFAULT_STATUS_MESSAGE)
                setShowStatusMessage(false)
        }
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
            <ProfileUploadDialog 
                open={uploadDialogOpen} 
                onClose={() => {
                    setUploadDialogOpen(false)
                }}
                onSubmit={onUploadProfileConfirmed}
                allowRecommendationChooser={allowRecommendationChooser}
            />
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
            <BottomMarginCollapse in={showStatusMessage}>
                <Alert 
                    severity={statusMessage.severity}
                    action={<IconButton
                        size='small'
                        color='inherit'
                        onClick={() => {
                            setStatusMessage(DEFAULT_STATUS_MESSAGE)
                            setShowStatusMessage(false)
                        }}
                    sx={{ mb: 2 }}
                    >
                        <CloseOutlined />
                    </IconButton>}
                ><code>{statusMessage.message}</code> 
                    {(statusMessage.status === 0 || statusMessage.status >= 500) && 
                    <><br /><Link target='_blank' rel='noopener' href={process.env.NEXT_PUBLIC_NT_BUGS_OVERVIEW_URL!}>Explore current issues at github.</Link></>}
                </Alert>
            </BottomMarginCollapse>
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
                            sx={{ width: '100%'}}
                            secondaryAction={
                                job.status === 'success' ? 
                                <>
                                    <ListItemButton onClick={async () => {
                                        await onGetResultsClicked(job.id)
                                    }}>
                                        <ListItemIcon><DownloadOutlined sx={{ alignSelf: 'end'}}  /></ListItemIcon>
                                        <ListItemText primary="Get results" />
                                    </ListItemButton> 
                                </>
                                : undefined
                            }>
                            <Grid container spacing={1} sx={{ width: '100%'}}>
                                <Grid size={1} sx={{ alignContent: 'center', marginRight: job.status === 'success' ? '0' : '-2px' }}>
                                    <ListItemIcon>
                                        {JobIcon(job.status)}
                                    </ListItemIcon>
                                </Grid>
                                <Grid size={4} sx={{ paddingLeft: 0, marginTop: '.5em' }}>
                                    <ListItemText>{format(parseISO(job.submittedAt), 'yyyy-MM-dd HH:mm', {
                                        in: tz(browserTimezone)
                                    })}</ListItemText>
                                </Grid>
                                {job.status === 'success' && <Grid size={5} sx={{marginLeft: '0', marginTop: '.5em' }}>
                                    <ListItemButton onClick={() => onUploadProfileClicked(job.id, job.smoothing !== BasalSmoothing.NONE)}>
                                        <ListItemIcon><UploadFileOutlined /></ListItemIcon>
                                        <ListItemText primary="Upload as profile" />
                                    </ListItemButton>
                                </Grid>}
                            </Grid>
                        </ListItem>
                        )}
                    </List>
                </Box>
            </React.Activity>
        </>
    )
}