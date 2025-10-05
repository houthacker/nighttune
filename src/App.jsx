// src/App.js
import * as React from 'react';
import { useSyncExternalStore } from 'react';
import {
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  CssBaseline,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';

import AutotuneJobStatus from './components/AutotuneJobStatus';
import { NightscoutInstance } from './components/NightscoutInstance';
import ProfileDetails from './components/ProfileDetails';

import AppTheme from './components/shared-theme/AppTheme';
import ColorModeIconDropdown from './components/shared-theme/ColorModeIconDropdown';
import NightscoutIcon from "./components/NightscoutIcon";
import Info from "./components/Info";
import InfoMobile from "./components/InfoMobile";

import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import nsLocalStore from './utils/localStore';

// The steps to successfully queue an autotune job
const steps = [
  { name: 'ns_instance', display_name: 'Nightscout instance' }, 
  { name: 'profile_details', display_name: 'Profile details' }, 
  { name: 'autotune_job_status', display_name: 'Autotune job status' }
];

/**
 * Gets the UI element for the given step name.
 * @param {number} step The index of the step to get the content of.
 * @param {Snapshot} snapshot The current state of the app.
 * @throws Error if the step is unknown.
 */
function getStepContent(step, snapshot) {
  switch (step) {
    case 0:
      return <NightscoutInstance nightscout={snapshot} />;
    case 1:
      return <ProfileDetails />;
    case 2:
      return <AutotuneJobStatus />;  
    default:
      throw new Error(`Unknown step index '${step}'`)   ;
  }
}

export default function App(props) {
  const nightscout = useSyncExternalStore(nsLocalStore.subscribe, nsLocalStore.getSnapshot);
  const [activeStep, setActiveStep] = React.useState(0);
  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };
  const handlePrevious = () => {
    setActiveStep(activeStep - 1);
  };
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <ColorModeIconDropdown />
      </Box>

      <Grid
        container
        sx={{
          height: {
            xs: '100%',
            sm: 'calc(100dvh - var(--template-frame-height, 0px))',
          },
          mt: {
            xs: 4,
            sm: 0,
          },
        }}
      >
        <Grid
          size={{ xs: 12, sm: 5, lg: 4 }}
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            backgroundColor: 'background.paper',
            borderRight: { sm: 'none', md: '1px solid' },
            borderColor: { sm: 'none', md: 'divider' },
            alignItems: 'start',
            pt: 16,
            px: 10,
            gap: 4,
          }}
        >
          <NightscoutIcon />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: '100%',
              maxWidth: 500,
            }}
          >
            <Info steps={steps} activeStep={activeStep} />
          </Box>
        </Grid>

        <Grid
          size={{ sm: 12, md: 7, lg: 8 }}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
            width: '100%',
            backgroundColor: { xs: 'transparent', sm: 'background.default' },
            alignItems: 'start',
            pt: { xs: 0, sm: 16 },
            px: { xs: 2, sm: 10 },
            gap: { xs: 4, md: 8 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: { sm: 'space-between', md: 'flex-end' },
              alignItems: 'center',
              width: ' 100%',
              maxWidth: { sm: '100%', md: 600 },
            }}
          >
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                flexGrow: 1,
              }}
            >
              <Stepper
                id='desktop-stepper'
                activeStep={activeStep}
                sx={{ width: '100%', height: 40 }}
              >
                {steps.map((step) => (
                  <Step
                    sx={{ ':first-of-type': { pl: 0 }, ':last-of-type': { pr: 0} }}
                    key={step.name}
                  >
                    <StepLabel>{step.display_name}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>
          </Box>
          <Card sx={{ display: { xs: 'flex', md: 'none' }, width: '100%' }}>
            <CardContent
              sx={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <Typography variant="subtitle2" gutterBottom>
                  Step {activeStep + 1}/{steps.length}
                </Typography>
              </div>
              <InfoMobile steps={steps} activeStep={activeStep} />
            </CardContent>
          </Card>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexGrow: 1,
              width: '100%',
              maxWidth: { sm: '100%', md: 600 },
              maxHeight: '720px',
              gap: { xs: 5, md: 'none' },
            }}
          >
            <Stepper
              id="mobile-stepper"
              activeStep={activeStep}
              alternativeLabel
              sx={{ display: { sm: 'flex', md: 'none' } }}
            >
              {steps.map((step) => (
                <Step
                  sx={{
                    ':first-of-type': { pl: 0 },
                    ':last-of-type': { pr: 0 },
                    '& .MuiStepConnector-root': { top: { xs: 6, sm: 12 } },
                  }}
                  key={step.name}
                >
                  <StepLabel
                    sx={{ '.MuiStepLabel-labelContainer': { maxWidth: '70px' } }}
                  >
                    {step.display_name}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            <React.Fragment>
              {getStepContent(activeStep, nightscout)}
              <Box
                sx={[
                  {
                    display: 'flex',
                    flexDirection: { xs: 'column-reverse', sm: 'row' },
                    alignItems: 'end',
                    flexGrow: 1,
                    gap: 1,
                    pb: { xs: 12, sm: 0 },
                    mt: { xs: 2, sm: 0 },
                    mb: '60px',
                  },
                  activeStep !== 0
                    ? { justifyContent: 'space-between' }
                    : { justifyContent: 'flex-end' },
                ]}
              >
                {activeStep !== 0 && (
                  <Button
                    startIcon={<ChevronLeftRoundedIcon />}
                    onClick={handlePrevious}
                    variant="text"
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                  >
                    Previous
                  </Button>
                )}
                {activeStep !== 0 && (
                  <Button
                    startIcon={<ChevronLeftRoundedIcon />}
                    onClick={handlePrevious}
                    variant="outlined"
                    fullWidth
                    sx={{ display: { xs: 'flex', sm: 'none' } }}
                  >
                    Previous
                  </Button>
                )}
                {activeStep !== steps.length - 1 && (
                  <Button
                    variant="contained"
                    endIcon={<ChevronRightRoundedIcon />}
                    onClick={handleNext}
                    sx={{ width: { xs: '100%', sm: 'fit-content' } }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </React.Fragment>
          </Box>
        </Grid>
      </Grid>
    </AppTheme>
  );
}