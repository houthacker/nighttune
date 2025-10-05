// src/App.js
import * as React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  CssBaseline,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";

import AutotuneJobStatus from './components/AutotuneJobStatus';
import NightscoutInstance from './components/NightscoutInstance';
import ProfileDetails from './components/ProfileDetails';

import AppTheme from './components/shared-theme/AppTheme';
import ColorModeIconDropdown from './components/shared-theme/ColorModeIconDropdown';
import NightscoutIcon from "./components/NightscoutIcon";
import Info from "./components/Info";
import InfoMobile from "./components/InfoMobile";

// The steps to successfully queue an autotune job
const steps = [
  { name: 'ns_instance', display_name: 'Nightscout instance' }, 
  { name: 'profile_details', display_name: 'Profile details' }, 
  { name: 'autotune_job_status', display_name: 'Autotune job status' }
];

/**
 * Gets the UI element for the given step name.
 * @param {string} step The name of the step to get the content of.
 * @throws Error if the step is unknown.
 */
function getStepContent(step) {
  switch (step) {
    case steps[0].name:
      return <AutotuneJobStatus />;
    case steps[1].name:
      return <NightscoutInstance />;
    case steps[2].name:
      return <ProfileDetails />;
    default:
      throw new Error(`Unknown step name '${step}'`)   ;
  }
}

function NavBar() {
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          MySite
        </Typography>
        <Button color="inherit" href="#features">
          Features
        </Button>
        <Button color="inherit" href="#about">
          About
        </Button>
      </Toolbar>
    </AppBar>
  );
}

function Hero() {
  return (
    <Box
      sx={{
        py: 10,
        bgcolor: "secondary.light",
        textAlign: "center",
        boxShadow: "inset 0 -10px 20px rgba(0,0,0,.05)",
      }}
      id="hero"
    >
      <Container maxWidth="md">
        <Typography variant="h3" gutterBottom>
          Welcome to a Material‑Design Site
        </Typography>
        <Typography variant="h5" paragraph>
          Fast, responsive, and beautiful.
        </Typography>
        <Button
          variant="contained"
          size="large"
          color="secondary"
          href="#features"
        >
          Explore Features
        </Button>
      </Container>
    </Box>
  );
}

function FeatureCard({ title, description }) {
  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography>{description}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small">Learn More</Button>
      </CardActions>
    </Card>
  );
}

function Features() {
  const cards = [
    {
      title: "Responsive Layout",
      description: "Automatically adapts to any screen size.",
    },
    {
      title: "Rich Components",
      description: "Buttons, dialogs, tooltips, and more.",
    },
    {
      title: "Customizable Themes",
      description: "Easily tweak colors and typography.",
    },
  ];

  return (
    <Container sx={{ py: 5 }} id="features">
      <Grid container spacing={4}>
        {cards.map((c, i) => (
          <Grid item xs={12} md={4} key={i}>
            <FeatureCard {...c} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

function Footer() {
  return (
    <Box sx={{ bgcolor: "primary.main", py: 2, mt: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="common.white" align="center">
          © 2025 AutotuneWeb – All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

export default function App(props) {
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
                    sx={{ ':first-child': { pl: 0 }, ':last-child': { pr: 0} }}
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
          </Box>
        </Grid>
      </Grid>
    </AppTheme>
  );
}