import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControlLabel, FormLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material'
import { FormEvent, Fragment, ReactElement } from 'react'

type ProfileUploadDialogProps = {
    open: boolean
    allowRecommendationChooser: boolean
    onClose: () => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>
}
export default function ProfileUploadDialog({ open, allowRecommendationChooser, onClose, onSubmit }: ProfileUploadDialogProps): ReactElement<any, any> {
    return (<Fragment>
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Upload as profile</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    To upload the autotune results as a new Nightscout profile, enter the name for the new profile 
                    and - if autotune ran using basal smoothing - choose whether to use smoothed or default recommendations. 
                    If you don't know what to choose, use the preselected "Autotune (default)".<br />
                    The profile name must be unique and no profile with the same name is allowed to exist.
                    <br /><br />
                    <Typography variant='caption' sx={{ color: 'red' }}>
                        This is a new feature and although it has been tested, it can contain bugs.
                        Review the created profile carefully before activating it in your app of choice.
                        <br /><br />
                    </Typography>
                </DialogContentText>
                <form onSubmit={onSubmit} id="frm-upload-profile">
                    {allowRecommendationChooser && <FormLabel id="lbl-recommendations-chooser">Choose the recommendation type to use:</FormLabel>}
                    {allowRecommendationChooser && <RadioGroup
                        id="rg-recommendation-type"
                        name="recommendation_type"
                        aria-labelledby="lbl-recommendations-chooser"
                        defaultValue="autotune"
                        aria-required={allowRecommendationChooser}
                        aria-disabled={!allowRecommendationChooser}
                    >
                        <FormControlLabel 
                            disabled={!allowRecommendationChooser} 
                            value="autotune" 
                            control={<Radio size='small' />} 
                            label="Autotune (default)" />
                        <FormControlLabel 
                            disabled={!allowRecommendationChooser}
                            value="smoothed" 
                            control={<Radio size='small' />} 
                            label="Smoothed" />
                    </RadioGroup>}
                    <Divider />
                    <TextField 
                        autoFocus
                        required
                        margin='dense'
                        id='profile_name'
                        name='profile_name'
                        label='Profile name'
                        fullWidth
                        variant='standard'
                    />
                </form>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button type="submit" form="frm-upload-profile">Upload</Button>
            </DialogActions>
        </Dialog>
    </Fragment>)
}