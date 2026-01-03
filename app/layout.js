import '../src/index.css'

export const metadata = {
    title: 'Nighttune',
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