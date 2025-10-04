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
  createTheme,
} from "@mui/material";

import AutotuneJobStatus from './components/AutotuneJobStatus';
import NightscoutInstance from './components/NightscoutInstance';
import ProfileDetails from './components/ProfileDetails';

import AppTheme from './components/shared-theme/AppTheme';
import ColorModeIconDropdown from './components/shared-theme/ColorModeIconDropdown';

const theme = createTheme({
  palette: {
    primary: { main: "#1565c0" }, // blue darken-3
    secondary: { main: "#009688" }, // teal
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
  },
});

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

      </Grid>
      <Footer />
    </AppTheme>
  );
}