import { tz } from '@date-fns/tz'
import { format, parseISO } from 'date-fns'
import { ReactElement } from 'react'

import { Box, List, ListItem, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { AutotuneResult } from '../utils/nightscout'

const style = {
    position: 'absolute',
    marginTop: '10%',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40%',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
}

export type AutotuneJobResultsProps = {
    result: AutotuneResult | undefined
}

export default function AutotuneJobResults(props: AutotuneJobResultsProps): ReactElement<any, any> {
    return props.result === undefined ? 
    <Box sx={style}>
        <Typography variant='body2'>
            No results available.
        </Typography>
    </Box> :
    <Box sx={style}>
        <Typography variant='h5'>
            Autotune results for <code>{props.result.options.nsHost}</code>
        </Typography>
        <Typography variant='h6'>
            Settings
        </Typography>
        <Box key='autotune-options'>
            <List key='autotune-options-list' dense={true} disablePadding={true} sx={{ width: '100%'}}>
                <ListItem key='date-from' divider={true}>
                    <ListItemText primary='from' secondary={format(parseISO(props.result.options.dateFrom), 'yyyy-MM-dd', {
                        in: tz(props.result.options.timeZone)
                    })} />
                </ListItem>
                <ListItem key='date-to' divider={true}>
                    <ListItemText primary='to' secondary={format(parseISO(props.result.options.dateTo), 'yyyy-MM-dd', {
                        in: tz(props.result.options.timeZone)
                    })} />
                </ListItem>
                <ListItem key='uam' divider={true}>
                    <ListItemText primary='UAM as basal' secondary={props.result.options.uam ? 'true' : 'false'} />
                </ListItem>
            </List>
        </Box>
        <Typography variant='h6'>
            Recommendations
        </Typography>
        <TableContainer component={Paper}>
            <Table size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell>Parameter</TableCell>
                        <TableCell>Original value</TableCell>
                        <TableCell>Autotune result</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {[props.result.find_isf()].map(isf => (
                        <TableRow key='isf'>
                            <TableCell>ISF</TableCell>
                            <TableCell>{isf.currentValue}</TableCell>
                            <TableCell>{isf.recommendedValue}</TableCell>
                        </TableRow>
                    ))}
                    {[props.result.find_cr()].map(cr => (
                        <TableRow key='cr'>
                            <TableCell component='th' scope='row'>CR (g/U)</TableCell>
                            <TableCell>{cr.currentValue}</TableCell>
                            <TableCell>{cr.recommendedValue}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        <Typography variant='h6'>
            Basal recommendations
        </Typography>
        <TableContainer component={Paper}>
            <Table size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell>Original value</TableCell>
                        <TableCell>Autotune result</TableCell>
                        <TableCell>Rounded to {props.result.options.basalIncrement || 'pump increment'}</TableCell>
                        <TableCell>Days missing</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {props.result.find_basal().map(row => (
                        <TableRow key={`basal-${format(parseISO(row.when), 'HHmm')}`}>
                            <TableCell>{format(parseISO(row.when), 'HH:mm', 
                                {
                                    in: tz(props.result!.options.timeZone)
                                })}
                            </TableCell>
                            <TableCell>{row.currentValue}</TableCell>
                            <TableCell>{row.recommendedValue}</TableCell>
                            <TableCell>{row.roundedRecommendation}</TableCell>
                            <TableCell>{row.daysMissing}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </Box>
}