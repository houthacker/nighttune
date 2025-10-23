import React, { ChangeEvent } from 'react';

import { Cached, ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon, WarningAmber as WarningAmberIcon } from '@mui/icons-material';
import { Box, Button, CircularProgress, Collapse, Divider, Fade, FormControl, Grid, InputAdornment, InputLabel, List, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import { ErrorInfo, INITIAL_CONVERSION_SETTINGS, InsulinType, isInsulinType, NightscoutProfile, NightscoutProfiles } from '../utils/constants';
import { fetchNightscoutProfiles } from '../utils/profile';
import FormGrid from './FormGrid';
import { ConversionSettings, Snapshot, Store } from '../utils/localStore';

export function InfoText() {
    const [advancedSettingsOpened, openAdvancedSettings] = React.useState(false);

    const onAdvancedClicked = () => {
        openAdvancedSettings(!advancedSettingsOpened);
    };

    return (
        <List sx={{ bgcolor: 'background.paper' }}>
            <ListItem alignItems="flex-start">
                <ListItemText
                    primary="Nightscout profile"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary'}} >
                            To run Autotune, your Nightscout profile must be converted to an OpenAPS
                            profile. Some additional information is required to customize Autotune and this is
                            also requested on this page. <br /><br />
                            If you have multiple profiles, you can choose here which of them to use.
                        </Typography>
                    }
                />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems='flex-start'>
                <ListItemText 
                    primary="Reloading profiles"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary' }} >
                            If you notice that some profile details are not what you expect, you can update your profile
                            and reload the profiles from your Nightscout instance.
                        </Typography>
                    }
                />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems='flex-start'>
                <ListItemText 
                    primary="Min. 5 minutes Carb Impact"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary' }} >
                            When carb absorption can't be dynamically worked out based on your blood's reactions,
                            the minimum 5-minute carb impact will be used as a failasfe.<br />
                            It's used only when there are gaps in CGM readings or when physical activity 'uses up'
                            all the blood glucose rise that would otherwise cause a <dfn><abbr>COB</abbr> (Carbs On Board)</dfn> decay.
                            <br /><br />

                            <em>Note:</em> If you use AndroisAPS in simple mode, this setting is hidden there.
                        </Typography>
                    }
                />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems='flex-start'>
                <ListItemText 
                    primary="Pump Basal Increment"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary' }} >
                            Autotune will likely recommend basals in fractions of a unit that you can't
                            program into your pump, so enter here what increments your pump can handle (0.1, 0.5 etc.) 
                            to get your results rounded for you.
                        </Typography>
                    }
                />
            </ListItem>
            <ListItem alignItems='flex-start'>
                <ListItemText 
                    primary="Days of data"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary' }} >
                            Configure the amount of days of treatment data autotune will use for this job.
                            If you don't know what to choose, 7 days is a good one to start with.
                        </Typography>
                    }
                />
            </ListItem>
            <ListItem alignItems='flex-start'>
                <ListItemText 
                    primary="Insulin type"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary' }} >
                            Select your insulin type to let autotune know how fast it acts and decays.
                        </Typography>
                    }
                />
            </ListItem>
            <ListItem alignItems='flex-start'>
                <ListItemText 
                    primary="Categorize UAM as basal"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary' }} >
                            This setting is for the users using AndroidAPS without any carbs 
                            entered (full UAM). It will prevent (when <code>off</code>) to
                            count sudden blood glucose rises due to UAM towards basal.<br /><br />
                            <em>Note:</em> if you have at least one hour of carbs absorption detected
                            during one day, then all data categorized as UAM will be categorized as basal,
                            regardless of this setting.
                        </Typography>
                    }
                />
            </ListItem>
            <ListItem alignItems='flex-start'>
                <ListItemText 
                    primary="Email address"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary' }} >
                            Autotune can take a few minutes to run, depending on the amount of days you chose
                            and how many jobs are queued. <br />
                            If you don't want to watch this site for that long, leave your email address here and you'll
                            receive the results there once the job has finished.<br /><br />
                            <em>Please note that you'll get a verification email first if your email address hasn't between
                            verified yet. Autotune will be run once you click the verification link.</em>
                            <br /><br />
                            
                            If you don't like to leave you email address here, you can always return at 
                            a later time after submitting the job and inspect the results then.
                        </Typography>
                    }
                />
            </ListItem>
            <ListItemButton onClick={onAdvancedClicked}>
                <ListItemIcon>
                    {advancedSettingsOpened ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </ListItemIcon>
                <ListItemText primary="Advanced settings" />
            </ListItemButton>
            <Collapse
                in={advancedSettingsOpened}
                timeout='auto'
                unmountOnExit
            >
                <List dense={true} disablePadding={true} sx={{ width: '90%'}}>
                    <ListItem alignItems='flex-start'>
                        <ListItemText
                            primary="Autosens min"
                            slotProps={{
                                primary: { color: 'text.primary'}
                            }}
                            secondary={
                                <Typography variant='body2' sx={{ color: 'text.secondary' }} >
                                    <Typography variant='overline' sx={{ color: 'red', lineHeight: '1em' }} >
                                        Unless you absolutely know what you're doing, leave this value at 
                                        its default of 0.7. You'll get a warning sign if the value has changed.<br /><br />
                                    </Typography>
                                    Autosens is an algorithm that adjusts your basal and ISF based
                                    on the sensitivity or resistance it calculates. This calculation
                                    is ran off the more sensitive of a combination of 24 and 8 hours 
                                    worth of data.<br />
                                    <code>autosens_min</code> is used to limit the algorithm so it
                                    doesn't use a too low percentage.
                                </Typography>
                            }
                        >
                        </ListItemText>
                    </ListItem>
                    <ListItem alignItems='flex-start'>
                        <ListItemText
                            primary="Autosens max"
                            slotProps={{
                                primary: { color: 'text.primary'}
                            }}
                            secondary={
                                <Typography variant='body2' sx={{ color: 'text.secondary' }} >
                                    <Typography variant='overline' sx={{ color: 'red', lineHeight: '1em' }}>
                                        Unless you absolutely know what you're doing, leave this value at 
                                        its default of 1.2. You'll get a warning sign if the value has changed.<br /><br />
                                    </Typography>
                                    Autosens is an algorithm that adjusts your basal and ISF based
                                    on the sensitivity or resistance it calculates. This calculation
                                    is ran off the more sensitive of a combination of 24 and 8 hours 
                                    worth of data.<br />
                                    <code>autosens_max</code> is used to limit the algorithm so it
                                    doesn't use a too high percentage.
                                </Typography>
                            }
                        >
                        </ListItemText>
                    </ListItem>
                </List>
            </Collapse>
        </List>
    );
}

export default function ProfileDetails({ store, setErrorInfo, preventNext }: 
    { store: Store, setErrorInfo: (errorInfo: ErrorInfo) => void, preventNext: (prevent_it: boolean) => void}) {
    const snapshot: Snapshot = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
    const [advancedSettingsOpened, openAdvancedSettings] = React.useState(false);
    const [isLoaded, setLoaded] = React.useState(false);
    const [profiles, setProfiles] = React.useState({store: {}} as { store: NightscoutProfiles });
    const [defaultProfile, setDefaultProfile] = React.useState('');
    const [selectedProfile, setSelectedProfile] = React.useState('__default__');
    const [profileNames, setProfileNames] = React.useState([] as Array<string>);
    const [conversionSettings, setConversionSettings] = React.useState({
        ...INITIAL_CONVERSION_SETTINGS,
        ... snapshot.conversion_settings
    } as ConversionSettings);

    // Validation
    const [invalidFields, setInvalidFields] = React.useState([] as Array<string>);
    const validations = {
        insulin_type: (event: ChangeEvent<HTMLInputElement> | Event & { target: { name: string, value: string}}) => {
            return () => { 
                if (isInsulinType(event.target.value)) {
                    setInvalidFields(invalidFields.filter(field => field !== 'insulin_type'));
                    return true;
                } else {
                    setInvalidFields([...invalidFields, 'insulin_type']);
                }

                return false;
            }
        },
        email_address: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement> 
            | Event & { target: { name: string, value: string, validity: { valid: boolean}}}) => {
            return () => { 
                if (!event.target.value || event.target.validity.valid) {
                    setInvalidFields(invalidFields.filter(field => field !== 'email_address'));
                    return true;
                } else {
                    setInvalidFields([...invalidFields, 'email_address']);
                }

                return false;
            }
        }
    };
    
    // Remove the 'Next >' button if the form is initially invalid.
    React.useEffect(() => {
        preventNext(selectedProfile === '__default__' || conversionSettings.insulin_type === '__default__' || invalidFields.length > 0);
    })

    const setStates = React.useCallback(async (data: NightscoutProfile | undefined) => {
        if (data) {
            setProfiles(data);
            setProfileNames([...Object.keys(data.store)].reverse());
            setDefaultProfile(data.defaultProfile);

            if (snapshot.conversion_settings.profile_name) {
                setSelectedProfile(snapshot.conversion_settings.profile_name);
            }

            setLoaded(true);
        }
    }, [snapshot.conversion_settings.profile_name]);

    React.useEffect(() => {
        async function fetchData() {
            setStates(await fetchNightscoutProfiles(store, setErrorInfo));
        }

        // Load only once per Nightscout URL, except when the user
        // forces a reload using the reload button, which sets `isLoaded` to false.
        if (isLoaded === false) {
            fetchData();
        }
    }, [store, isLoaded, setErrorInfo, setStates]);

    const onAdvancedClicked = () => {
        openAdvancedSettings(!advancedSettingsOpened);
    };

    const onProfileSelected = (event: ChangeEvent<HTMLInputElement> | Event & { target: { value: string, name: string}}) => {

        let newSettings: ConversionSettings = {...conversionSettings, profile_name: event.target.value, profile_data: profiles.store[event.target.value]};

        setSelectedProfile(event.target.value);
        setConversionSettings({...newSettings});
        store.setConversionSettings({...newSettings});
    };

    const onReloadButtonClicked = async () => {
        // Cause the spinner to be visible
        setLoaded(false);

        // Set the rest of the states to their default values.
        setProfiles({store: {}});
        setDefaultProfile('');
        setSelectedProfile('__default__');
        setProfileNames([]);

        // And, to prevent inconsistend stored data: remove the converted profile from storage.
        let newSettings = {...conversionSettings, oaps_profile_data: undefined};
        setConversionSettings({...newSettings});
        store.setConversionSettings({...newSettings});

        // Set states to newly fetched data.
        setStates(await fetchNightscoutProfiles(store, setErrorInfo));
    };

    const onConversionSettingUpdated = (update: { [prop in keyof ConversionSettings]?: ConversionSettings[prop]}, validator?: any) => {
        let newSettings = {...conversionSettings, ...update};
        setConversionSettings({...newSettings});

        // Only store updates once they're valid. 
        // Current state must always reflect value, regardless of validity.
        let valid = validator === undefined || validator();
        if (valid) {
            store.setConversionSettings({...newSettings});
        }
    };
    
    return (
        <>
            <Fade
                in={isLoaded === false}
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
                            onChange={e => onProfileSelected(e)}
                        >
                            <MenuItem selected={true} value='__default__'>Select a profile...</MenuItem>
                            {profileNames.map((name) => 
                                <MenuItem value={name}>{name === defaultProfile ? `${name} (default)` : name}</MenuItem>
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
                                            DIA stands for <em>Duration of Insulin Activity</em>, and is the amount
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
            <React.Activity mode={selectedProfile === '__default__' ? 'hidden' : 'visible'}>
                <Box>
                    <Typography variant='h5' sx={{ color: 'text.primary' }}>
                        Conversion settings
                    </Typography>
                    <Typography variant='caption' color='textSecondary'>
                        To convert your Nightscout profile, some additional information is required.
                    </Typography>
                    <Divider sx={{ opacity: 0.6 }} />
                    <List dense={true} disablePadding={true} sx={{ width: '100%'}} >
                        <ListItem key='li-min-5m-carbimpact' divider={true}>
                            <Grid container spacing={2}>
                                <TextField 
                                    label="Min. 5 minutes Carb Impact"
                                    id='min-5m-carbimpact'
                                    required
                                    type='number'
                                    defaultValue={conversionSettings.min_5m_carbimpact}
                                    onChange={e => onConversionSettingUpdated({min_5m_carbimpact: parseFloat(e.target.value)})}
                                    sx={{ m: 1, width: '25ch' }}
                                    slotProps={{
                                        input: {
                                            endAdornment: <InputAdornment position='end'>gr</InputAdornment>
                                        }
                                    }}
                                />
                            </Grid>
                        </ListItem>
                        <ListItem key='li-pump-basal-increment' divider={true}>
                            <Grid container spacing={2}>
                                <TextField 
                                    label="Pump basal increment"
                                    id='pump-basal-increment'
                                    required
                                    type='number'
                                    defaultValue={conversionSettings.pump_basal_increment}
                                    onChange={e => onConversionSettingUpdated({pump_basal_increment: parseFloat(e.target.value)})}
                                    sx={{ m: 1, width: '25ch' }}
                                    slotProps={{
                                        input: {
                                            endAdornment: <InputAdornment position='end'>IE</InputAdornment>
                                        },
                                        htmlInput: {
                                            step: 0.01,
                                        },
                                    }}
                                />
                            </Grid>
                        </ListItem>
                        <ListItem key='li-autotune-days' divider={true}>
                            <Grid container spacing={2}>
                                <TextField 
                                    label="Days of data (max 30)"
                                    id='autotune-days'
                                    required
                                    type='number'
                                    defaultValue={conversionSettings.autotune_days}
                                    onChange={e => onConversionSettingUpdated({autotune_days: parseInt(e.target.value)})}
                                    sx={{ m: 1, width: '25ch' }}
                                    slotProps={{
                                        input: {
                                            endAdornment: <InputAdornment position='end'>days</InputAdornment>,
                                        },
                                        htmlInput: {
                                            min: 1,
                                            max: 30,
                                        },
                                    }}
                                />
                            </Grid>
                        </ListItem>
                        <ListItem key='li-insulin-type' divider={true}>
                            <FormControl sx={{ m: 1, minWidth: 200 }} size='small'>
                                <InputLabel id='lbl-insulin-type' error={invalidFields.includes('insulin_type')}> Insulin type</InputLabel>
                                <Select
                                    labelId='lbl-insulin-type'
                                    id='insulin-type'
                                    required
                                    value={conversionSettings.insulin_type}
                                    onChange={e => onConversionSettingUpdated({insulin_type: e.target.value}, validations.insulin_type(e))}
                                >
                                    <MenuItem selected={true} value='__default__'>Select a type...</MenuItem>
                                    <MenuItem value={InsulinType.RapidActing}>Rapid Acting (Humalog/Novolog/Novorapid)</MenuItem>
                                    <MenuItem value={InsulinType.UltraRapid}>Ultra Rapid (Fiasp)</MenuItem>
                                </Select>
                            </FormControl>
                        </ListItem>
                        <ListItem key='li-uam-as-basal' divider={true}>
                            <Grid container spacing={2}>
                                <input 
                                    id='uam-as-basal' 
                                    type='checkbox' 
                                    defaultChecked={true}
                                    onChange={e => onConversionSettingUpdated({uam_as_basal: e.target.checked})}
                                    style={{
                                        marginLeft: '10px'
                                    }}
                                />
                                <InputLabel 
                                    id='lbl-uam-as-basal' 
                                    htmlFor='uam-as-basal'
                                    sx={{
                                        marginTop: '5px',
                                        color: 'text.primary'
                                    }}
                                >Categorize UAM as basal</InputLabel>
                            </Grid>

                        </ListItem>
                        <ListItem key='li-email-address' divider={true}>
                            <Grid container spacing={2}>
                                <TextField 
                                    label="Email address"
                                    id='email-address'
                                    error={invalidFields.includes('email_address')}
                                    helperText={invalidFields.includes('email_address') ? 'Enter a valid email address' : ''}
                                    defaultValue={conversionSettings.email_address}
                                    onChange={e => onConversionSettingUpdated({email_address: e.target.value}, validations.email_address(e))}
                                    type='email'
                                    sx={{ m: 1, width: '35ch' }}
                                />
                            </Grid>
                        </ListItem>
                        <ListItemButton onClick={onAdvancedClicked}>
                            <ListItemIcon>
                                {advancedSettingsOpened ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </ListItemIcon>
                            <ListItemText primary="Advanced settings" />
                        </ListItemButton>
                        <Collapse
                            in={advancedSettingsOpened}
                            timeout='auto'
                            unmountOnExit
                        >
                            <List dense={true} disablePadding={true} sx={{ width: '90%'}}>
                                <ListItem key='li-autosens-min'>
                                    <Grid container spacing={2}>
                                        <TextField 
                                            label="Autosens min"
                                            id='autosens-min'
                                            defaultValue={conversionSettings.autosens_min}
                                            onChange={e => onConversionSettingUpdated({autosens_min: parseFloat(e.target.value)})}
                                            type='number'
                                            sx={{ m: 1, width: '35ch', }}
                                            slotProps={{
                                                input: {
                                                    startAdornment: conversionSettings.autosens_min !== 0.7 
                                                        ? <Tooltip 
                                                                placement='auto'
                                                                title='Warning: autosens_min has a non-default value.'
                                                          ><InputAdornment position='start' >
                                                            <WarningAmberIcon />
                                                          </InputAdornment></Tooltip> 
                                                        : ''
                                                },
                                                htmlInput: {
                                                    step: 0.1
                                                },
                                            }}
                                        />
                                    </Grid>
                                </ListItem>
                                <ListItem key='li-autosens-max'>
                                    <Grid container spacing={2}>
                                        <TextField 
                                            label="Autosens max"
                                            id='autosens-max'
                                            defaultValue={conversionSettings.autosens_max}
                                            onChange={e => onConversionSettingUpdated({autosens_max: parseFloat(e.target.value)})}
                                            type='number'
                                            sx={{ m: 1, width: '35ch', }}
                                            slotProps={{
                                                input: {
                                                    startAdornment: conversionSettings.autosens_max !== 1.2 
                                                        ? <Tooltip 
                                                                placement='auto'
                                                                title='Warning: autosens_max has a non-default value.'
                                                          ><InputAdornment position='start' >
                                                            <WarningAmberIcon />
                                                          </InputAdornment></Tooltip> 
                                                        : ''
                                                },
                                                htmlInput: {
                                                    step: 0.1
                                                }
                                            }}
                                        />
                                    </Grid>
                                </ListItem>
                            </List>
                        </Collapse>
                    </List>

                </Box>
            </React.Activity>
        </>
    );
}