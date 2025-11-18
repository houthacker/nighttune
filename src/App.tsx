import * as React from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Link,
} from '@mui/material';

import AutotuneJobStatus from './components/AutotuneJobStatus';
import { NightscoutInstance } from './components/NightscoutInstance';
import ProfileDetails from './components/ProfileDetails';

import AppTheme from './components/shared-theme/AppTheme';
import ColorModeIconDropdown from './components/shared-theme/ColorModeIconDropdown';
import NightscoutIcon from "./components/NightscoutIcon";
import Info from "./components/Info";
import InfoMobile from "./components/InfoMobile";
import VersionLink from './components/VersionLink';

import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

import store from './utils/localStore';
import ProfileConversion from './components/ProfileConversion';

import type { Dispatch, SetStateAction } from 'react';
import type { Store } from './utils/localStore';

// The steps to successfully queue an autotune job
const steps = [
  { name: 'ns_instance', display_name: 'Nightscout instance' }, 
  { name: 'profile_details', display_name: 'Profile details' }, 
  { name: 'profile_conversion', display_name: 'Profile conversion' },
  { name: 'autotune_job_status', display_name: 'Autotune job status' }
];

/**
 * @typedef {Object} ErrorInfo
 * @property {boolean} isError - If there is a current error.
 * @property {string} errorText - The error description.
 * @property {number} errorStep - The step at which the error occurred.
 */

/**
 * Gets the UI element for the given step name.
 * @param {number} step The index of the step to get the content of.
 * @param {object} store The app data store.
 * @throws Error if the step is unknown.
 */
function getStepContent(step: number, store: Store, preventNext: Dispatch<SetStateAction<boolean>>, errorInfo: any, setErrorInfo: (_: any) => void) {
  switch (step) {
    case 0:
      return <NightscoutInstance store={store} preventNext={preventNext} />;
    case 1:
      return <ProfileDetails 
        store={store} 
        setErrorInfo={setErrorInfo}
        preventNext={preventNext}
      />;
    case 2:
      return <ProfileConversion
        store={store}
      />
    case 3:
      return <AutotuneJobStatus
        store={store}
      />;  
    default:
      throw new Error(`Unknown step index '${step}'`)   ;
  }
}

export default function App(props: any) {
  // Error state shared with child components
  const [preventNext, setPreventNext] = React.useState(true);
  const [alertOpen, setAlertOpen] = React.useState(false);
  const [activeStep, setActiveStep] = React.useState(0);
  const [errorInfo, setErrorInfo] = React.useState({
    isError: false,
    errorText: '',
    errorStep: -1,
  });

  // Read data from local storage into ns store if it is not initialized yet.
  store.init();
  
  const handleNext = () => {
    setActiveStep(activeStep + 1);
  };
  const handlePrevious = () => {
    setActiveStep(activeStep - 1);
  };
  const handleResetData = () => {
    setAlertOpen(true);
  };
  const handleResetDeclined = () => {
    setAlertOpen(false);
  }
  const handleResetConfirmed = () => {
    setAlertOpen(false);
    store.clear();
    location.reload();
  }
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Box sx={{ position: 'fixed', top: '1rem', right: '1rem' }}>
        <ColorModeIconDropdown />
      </Box>

      <Dialog
        open={alertOpen}
        onClose={handleResetConfirmed}
      >
        <DialogTitle>
          Reset nighttune data?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you want to reset all your nighttune data?<br /><br />
            If you reset the nighttune data, you have to re-enter the details of your Nightscout instance and
            any conversion data you have entered before.<br /><br />
            Resetting nighttune data does not influence any data in your Nightscout instance.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetDeclined} autoFocus>No</Button>
          <Button onClick={handleResetConfirmed}>Yes</Button>
        </DialogActions>
      </Dialog>

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
                    <StepLabel
                      error={errorInfo.isError && step.name === steps[errorInfo.errorStep].name}
                      optional={errorInfo.isError  && step.name === steps[errorInfo.errorStep].name 
                        ? <Typography variant='caption' color='error'>{errorInfo.errorText}</Typography> 
                        : undefined
                      }
                    >
                      {step.display_name}
                    </StepLabel>
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
                    error={errorInfo.isError && step.name === steps[errorInfo.errorStep].name}
                    optional={errorInfo.isError  && step.name === steps[errorInfo.errorStep].name 
                      ? <Typography variant='caption' color='error'>{errorInfo.errorText}</Typography> 
                      : undefined
                    }
                    sx={{ '.MuiStepLabel-labelContainer': { maxWidth: '70px' } }}
                  >
                    {step.display_name}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
            <React.Fragment>
              {getStepContent(activeStep, store, setPreventNext, errorInfo, setErrorInfo)}
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
                  { justifyContent: 'space-between' }
                ]}
              >
                {activeStep === 0 && (
                  <Button
                    startIcon={<HighlightOffOutlinedIcon />}
                    onClick={handleResetData}
                    variant="text"
                    sx={{ display: { xs: 'none', sm: 'flex' } }}
                  >
                    Reset
                  </Button>
                )}
                {activeStep === 0 && (
                  <Button
                    startIcon={<HighlightOffOutlinedIcon />}
                    onClick={handleResetData}
                    variant="outlined"
                    fullWidth
                    sx={{ display: { xs: 'flex', sm: 'none' } }}
                  >
                    Reset
                  </Button>
                )}
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
                    sx={{ width: { xs: '100%', sm: 'fit-content', display: preventNext ? 'none' : 'flex' } }}
                  >
                    Next
                  </Button>
                )}
              </Box>
            </React.Fragment>
          </Box>
          <Box sx={{ py: 3, mt: 'auto' }}>
            <Grid container>
                <Typography variant='body2' color='text.secondary'>
                  Nighttune version: <VersionLink />
                </Typography>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </AppTheme>
  );
}