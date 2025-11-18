import { Link } from '@mui/material'
import { ReactElement } from 'react'

export default function VersionLink(): ReactElement<any, any> {
    if (process.env.NODE_ENV === 'production') {
        const v: string = process.env.NEXT_PUBLIC_NT_VERSION!

        return <Link target="_blank" rel="noopener" href={'https://github.com/houthacker/nighttune/releases/tag/v' + v}><code>{v}</code></Link>
    }

    return <code>{process.env.NODE_ENV}</code>
}