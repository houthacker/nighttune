import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import React from 'react';
import Info from './Info';
import { Drawer, Button, Box, IconButton } from '@mui/material';

export default function InfoMobile({ steps, activeStep }) {
    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (newOpen) => () => {
        setOpen(newOpen);
    }

    const DrawerList = (
        <Box sx={{ width: 'auto', px: 3, pb: 3, pt: 8 }} role="presentation">
            <IconButton
                onClick={toggleDrawer(false)}
                sx={{ position: 'absolute', right: 8, top: 8  }}
            >
                <CloseIcon />
            </IconButton>
            <Info steps={steps} activeStep={activeStep} />
        </Box>
    );

    return (
        <div>
            <Button
                variant="text"
                endIcon={<ExpandMoreRoundedIcon />}
                onClick={toggleDrawer(true)}
            >
                View help
            </Button>
            <Drawer
                open={open}
                anchor='top'
                onClose={toggleDrawer(false)}
                slotProps={{
                    paper: {
                        sx: {
                            top: 'var(--template-frame-height, 0px)',
                            backgroundImage: 'none',
                            backgroundColor: 'background.paper',
                        }
                    }
                }}
            >
                {DrawerList}
            </Drawer>
        </div>
    );
}