import { Box } from '@mui/material';
import { ReactElement } from 'react';
import { Store } from '../utils/localStore';
import React from 'react';

import type { Snapshot } from '../utils/localStore';

export function InfoText() {
    return <Box />
};

export default function AutotuneJobStatus({ store }: { store: Store }): ReactElement<any, any> {
    const snapshot: Snapshot = React.useSyncExternalStore(store.subscribe, store.getSnapshot);

    React.useEffect(() => {
        const jobRequest = {
            nightscout_url: snapshot.url!,
            nightscout_access_token: snapshot.access_token,
            settings: snapshot.conversion_settings,
        };

        async function sendJobRequest() {
            const response = await fetch(new URL('job', process.env.NEXT_PUBLIC_BACKEND_BASE_URL!), {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify(jobRequest, (k, v) => {
                    return v === undefined && k === "nightscout_access_token" ? undefined : v
                })
            });

            console.log(response);
        }

        sendJobRequest();
        
    }, [snapshot]);
    
    return <Box></Box>
}