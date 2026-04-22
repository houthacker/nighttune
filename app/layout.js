import '../src/index.css'

export const metadata = {
    title: 'Nighttune',
    description: 'Nighttune provides a simple way to run OpenAPS Autotune against Nightscout profiles.',
    openGraph: {
        description: 'Nighttune provides a simple way to run OpenAPS Autotune against Nightscout profiles.'
    }
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <meta charSet='UTF-8' />
            <body>
                <div id="root">{children}</div>
            </body>
        </html>
    )
}