import React from 'react';
import { Alert, AlertTitle, Box, Button, CircularProgress, Divider, Fade, Grid, InputAdornment, List, ListItem, ListItemText, TextField, Typography } from '@mui/material';
import { Cached } from '@mui/icons-material';
import { BarPlot, ChartContainer, ChartsAxisHighlight, ChartsTooltip, ChartsXAxis, ChartsYAxis, lineElementClasses, LineHighlightPlot, LinePlot } from '@mui/x-charts';
import { timeParse, timeFormat } from 'd3-time-format';

import FormGrid from './FormGrid';
import { convertNightscoutProfile, createCrChartSeries, createISFChartSeries } from '../utils/profile';

export function InfoText() {
    return (
        <List sx={{ bgcolor: 'background.paper' }}>
            <ListItem alignItems="flex-start">
                <ListItemText
                    primary="Carb Ratio"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary'}} >
                            The Carb Ratio or CR is a measure of how many grams of carbohydrate are covered
                            by one unit of insulin. Some people also use I:C (Insulin:Carb) as an abbreviation
                            or talk about ICR (Insulin to Carb Ratio).<br /><br />
                            For example, a 1-to-10 (1:10) CR means that you take 1U insulin for every 10
                            grams of carbs eaten. A meal of 25g carbs would need 2.5U of insulin.
                        </Typography>
                    }
                />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems="flex-start">
                <ListItemText
                    primary="Insulin Sensitivity Factor"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary'}} >
                            The Insulin Sensitivity Factor (sometimes called Correction Factor) is a measure of 
                            how much blood glucose level will be reduced by 1 unit of insulin.<br /><br />
                            
                            <b>In mmol/L units:</b> If you have an ISF of 1.5, each unit of insulin will reduce 
                            your blood glucose by approximately 1.5 mmol/L (for example from 8 mmol/L to 6.5 mmol/L).<br /><br />

                            <b>In mg/dL units:</b> If you have an ISF of 40, each unit of insulin will reduce
                            your blood glucose by approximately 40 mg/DL (for example your blood glucose will
                            fall from 140 mg/DL to 100 mg/DL)
                        </Typography>
                    }
                />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems="flex-start">
                <ListItemText
                    primary="Single-valued CR/ISF"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary'}} >
                            If your profile uses a single Carb Ratio or Insulin Sensitivity Factor, 
                            its graph on the right will show values that are the same for every hour.
                            You're free to use a different value by setting it in the boxes below the graphs.
                        </Typography>
                    }
                />
            </ListItem>
            <Divider variant="inset" component="li" />
            <ListItem alignItems="flex-start">
                <ListItemText
                    primary="Multi-valued CR/ISF"
                    slotProps={{
                        primary: { color: 'text.primary' }
                    }}
                    secondary={
                        <Typography variant='body2' sx={{ color: 'text.secondary'}} >
                            If your profile uses a multiple Carb Ratios or Insulin Sensitivity Factors, 
                            their graph on the right will show their values for every hour of the day.<br />
                            By default, their weighted average will be used to run Autotune. If you want
                            Autotune to use a different value, either click a value in the graph to use it
                            or adjust the value manually.
                        </Typography>
                    }
                />
            </ListItem>
        </List>
    );
};

/** @import { Store } from '../utils/localStore' */
/** @import { Component } from 'react' */

/**
 * 
 * @param {Store} store - The storage interface.
 * @returns {Component} 
 */
export default function ProfileConversion({ store }) {
    const snapshot = React.useSyncExternalStore(store.subscribe, store.getSnapshot);
    const [oapsProfile, setOapsProfile] = React.useState(undefined);
    const [isConverting, setIsConverting] = React.useState(false);
    
    // CR graph state
    const [maxYAxisValueCR, setMaxYAxisValueCR] = React.useState(20);
    const [carbRatioSeries, setCarbRatioSeries] = React.useState({});
    const [selectedCr, setSelectedCarbRatio] = React.useState(0);
    const originalWeightedAvgCr = React.useRef(0);

    // ISF graph state
    const [maxYAxisValueISF, setMaxYAxisValueISF] = React.useState(20);
    const [isfSeries, setISFSeries] = React.useState({});
    const [selectedISF, setSelectedISF] = React.useState(0);
    const originalWeightedAvgISF = React.useRef(0);
    
    const timeFormatter = timeFormat('%H:%M');

    React.useEffect(() => {
        if (Object.keys(snapshot.conversion_settings.profile_data).length > 0) {
            setIsConverting(true);
            let convertedProfile = convertNightscoutProfile(
                snapshot.conversion_settings.profile_data,
                snapshot.conversion_settings.min_5m_carbimpact,
                snapshot.conversion_settings.autosens_min,
                snapshot.conversion_settings.autosens_max,
                snapshot.conversion_settings.insulin_type
            );
            
            setOapsProfile(convertedProfile);
            store.setOpenAPSProfile(convertedProfile);

            // Set selected CR to weighted avg
            originalWeightedAvgCr.current = convertedProfile.carb_ratio;
            setSelectedCarbRatio(convertedProfile.carb_ratio);

            // And do the same for ISF
            originalWeightedAvgISF.current = convertedProfile.isfProfile.sensitivities[0].sensitivity;
            setSelectedISF(convertedProfile.isfProfile.sensitivities[0].sensitivity);
            setIsConverting(false);
        }
    }, [ store, snapshot, setSelectedCarbRatio, originalWeightedAvgCr ]);

    // Set CR series data
    React.useEffect(() => {
        setCarbRatioSeries(createCrChartSeries(snapshot, setMaxYAxisValueCR));
    }, [snapshot, setCarbRatioSeries, setMaxYAxisValueCR]);

    // CR can be selected using the graph
    const onCRGraphClicked = (data) => {
        if (data) {
            const cr = data.seriesValues.cr;

            // Set selected CR in oaps profile
            let update = {...snapshot.conversion_settings};
            update.oaps_profile_data.carb_ratio = cr;
            update.oaps_profile_data.carb_ratios.schedule[0].ratio = cr;

            store.setConversionSettings(update);
            setSelectedCarbRatio(cr);
        }
    };

    // Or by entering it manually.
    const onCRUpdated = (event) => {
        const cr = parseFloat(event.target.value);

        // Set selected CR in oaps profile
        let update = {...snapshot.conversion_settings};
        update.oaps_profile_data.carb_ratio = cr;
        update.oaps_profile_data.carb_ratios.schedule[0].ratio = cr;

        store.setConversionSettings(update);
        setSelectedCarbRatio(cr);
    };

    // Set ISF series data
    React.useEffect(() => {
        setISFSeries(createISFChartSeries(snapshot, setMaxYAxisValueISF));
    }, [snapshot, setISFSeries, setMaxYAxisValueISF]);

    // ISF can be selected using the graph
    const onISFGraphClicked = (data) => {
        if (data) {
            const isf = data.seriesValues.isf;

            // Set selected CR in oaps profile
            let update = {...snapshot.conversion_settings};
            update.oaps_profile_data.isfProfile.sensitivities[0].sensitivity = isf;

            store.setConversionSettings(update);
            setSelectedISF(isf);
        }
    };

    // Or by entering it manually.
    const onISFUpdated = (event) => {
        const isf = parseFloat(event.target.value);

        // Set selected CR in oaps profile
        let update = {...snapshot.conversion_settings};
        update.oaps_profile_data.isfProfile.sensitivities[0].sensitivity = isf;

        store.setConversionSettings(update);
        setSelectedISF(isf);
    };    

    return (
        <>
            <Fade
                in={isConverting === true}
                style={{
                    transitionDelay: isConverting ? '500ms' : '0ms',
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
                            Converting Nightscout profile to an OpenAPS profile...
                        </Typography>
                    </FormGrid>
                </Grid>
            </Fade>
            <Fade
                in={Object.keys(snapshot.conversion_settings.profile_data).length === 0}
                style={{
                    transitionDelay: '0ms',
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
                        <AlertTitle>Profile</AlertTitle>
                        No Nightscout profile loaded. Please go to the previous page to select a Nightscout profile.
                    </Alert>
                </Grid>
            </Fade>
            <Fade
                in={oapsProfile !== undefined}
                style={{
                    transitionDelay: '0ms',
                }}
                unmountOnExit
            >
                <Grid
                    container
                    spacing={3}
                    direction='column'
                    alignItems='center'
                >
                    <Alert severity='info'>
                        <AlertTitle>Conversion</AlertTitle>
                        Your profile has successfully been converted. Please choose the CR and ISF 
                        for autotune to use and continue to the next step when you're satisfied.
                    </Alert>
                </Grid>
            </Fade>
            <Fade
                in={oapsProfile !== undefined}
                style={{ transitionDelay: '0ms' }}
                unmountOnExit
            >
                <Box sx={{ width: '100%' }}>
                    <Box>
                        <ChartContainer
                            series={carbRatioSeries}
                            onAxisClick={(e, d) => onCRGraphClicked(d)}
                            xAxis={[
                                {
                                    id: 'time',
                                    data: [...new Array(24).keys().map(key => timeFormatter(new Date(0, 0, 0, key, 0)))],
                                    scaleType: 'band',
                                    height: 40,
                                },
                            ]}
                            yAxis={[
                                {
                                    id: 'carb_ratio',
                                    scaleType: 'linear',
                                    position: 'left',
                                    min:0,
                                    max: maxYAxisValueCR,
                                    width: 55,
                                },
                                {
                                    id: 'carb_weighted_avg',
                                    scaleType: 'linear',
                                    position: 'right',
                                    min: 0,
                                    max: maxYAxisValueCR,
                                    width: 55
                                }
                            ]}
                            sx={{
                                [`& .${lineElementClasses.root}`]: {
                                    strokeDasharray: '10 2',
                                    strokeWidth: 2,
                                }
                            }}
                        >
                            <ChartsAxisHighlight x='line' />
                            <BarPlot />
                            <LinePlot />
                            <LineHighlightPlot />
                            <ChartsXAxis 
                                label="Time"
                                axisId='time'
                                tickInterval={(value, index) => {
                                    return index % 4 == 0;
                                }}
                                tickLabelStyle={{
                                    fontSize: 10,
                                }}
                            />
                            <ChartsYAxis 
                                label='CR'
                                axisId='carb_ratio'
                                tickLabelStyle={{ fontSize: 10 }}
                            />
                            <ChartsYAxis 
                                label='Weighted avg'
                                axisId='carb_weighted_avg'
                                tickLabelStyle={{ fontSize: 10 }}
                            />
                            <ChartsTooltip />
                        </ChartContainer>
                        <ChartContainer
                            series={isfSeries}
                            onAxisClick={(e, d) => onISFGraphClicked(d)}
                            xAxis={[
                                {
                                    id: 'time',
                                    data: [...new Array(24).keys().map(key => timeFormatter(new Date(0, 0, 0, key, 0)))],
                                    scaleType: 'band',
                                    height: 40,
                                },
                            ]}
                            yAxis={[
                                {
                                    id: 'isf',
                                    scaleType: 'linear',
                                    position: 'left',
                                    min:0,
                                    max: maxYAxisValueISF,
                                    width: 55,
                                },
                                {
                                    id: 'isf_weighted_avg',
                                    scaleType: 'linear',
                                    position: 'right',
                                    min: 0,
                                    max: maxYAxisValueISF,
                                    width: 55
                                }
                            ]}
                            sx={{
                                [`& .${lineElementClasses.root}`]: {
                                    strokeDasharray: '10 2',
                                    strokeWidth: 2,
                                }
                            }}
                        >
                            <ChartsAxisHighlight x='line' />
                            <BarPlot />
                            <LinePlot />
                            <LineHighlightPlot />
                            <ChartsXAxis 
                                label="Time"
                                axisId='time'
                                tickInterval={(value, index) => {
                                    return index % 4 == 0;
                                }}
                                tickLabelStyle={{
                                    fontSize: 10,
                                }}
                            />
                            <ChartsYAxis 
                                label='ISF'
                                axisId='isf'
                                tickLabelStyle={{ fontSize: 10 }}
                            />
                            <ChartsYAxis 
                                label='Weighted avg'
                                axisId='isf_weighted_avg'
                                tickLabelStyle={{ fontSize: 10 }}
                            />
                            <ChartsTooltip />
                        </ChartContainer>
                    </Box>
                    <Box>
                        <Typography key='choose-cr-isf-title' variant='h5' sx={{ color: 'text.primary' }}>
                                Choose CR and ISF
                        </Typography>
                        <Divider key='choose-cr-isf-divider' sx={{ opacity: 0.6 }} />
                        <Typography variant='body2'>
                                Click in the Carb Ratio or Insulin Sensitivity Factor graph to use that CR/ISF 
                                instead of the weighted average, or adjust the value manually.
                        </Typography>
                        <List dense={true} disablePadding={true} sx={{ width: '100%'}} >
                            <ListItem key='li-cr' divider={true}>
                                <Grid container spacing={2}>
                                    <TextField 
                                        label="Carb Ratio"
                                        id='cr'
                                        required
                                        type='number'
                                        value={selectedCr}
                                        onChange={e => onCRUpdated(e)}
                                        onBlur={e => onCRUpdated(e)}
                                        sx={{ m: 1, width: '25ch' }}
                                        slotProps={{
                                            input: {
                                                endAdornment: <InputAdornment position='end'>gr/Unit</InputAdornment>
                                            },
                                            htmlInput: {
                                                step: 0.1
                                            }
                                        }}
                                    />
                                    <Fade
                                        in={selectedCr !== originalWeightedAvgCr.current}
                                        style={{
                                            marginTop: '15px',
                                            transitionDelay:  '0ms',
                                        }}
                                        unmountOnExit
                                    >
                                        <Typography variant='body2'>
                                            The average CR after conversion was {originalWeightedAvgCr.current}.
                                        </Typography>
                                    </Fade>
                                </Grid>
                            </ListItem>
                            <ListItem key='li-isf' divider={true}>
                                <Grid container spacing={2}>
                                    <TextField 
                                        label="Insulin Sensitivity Factor"
                                        id='isf'
                                        required
                                        type='number'
                                        value={selectedISF}
                                        onChange={e => onISFUpdated(e)}
                                        onBlur={e => onISFUpdated(e)}
                                        sx={{ m: 1, width: '25ch' }}
                                        slotProps={{
                                            input: {
                                                endAdornment: <InputAdornment position='end'>{oapsProfile ? oapsProfile.out_units : '?'}/Unit {'\u21e3'}</InputAdornment>
                                            },
                                            htmlInput: {
                                                step: 0.1
                                            }
                                        }}
                                    />
                                    <Fade
                                        in={selectedISF !== originalWeightedAvgISF.current}
                                        style={{
                                            marginTop: '15px',
                                            transitionDelay:  '0ms',
                                        }}
                                        unmountOnExit
                                    >
                                        <Typography variant='body2'>
                                            The average ISF after conversion was {originalWeightedAvgISF.current}.
                                        </Typography>
                                    </Fade>
                                </Grid>
                            </ListItem>
                        </List>
                    </Box>
                </Box>
            </Fade>
        </>
    );
}