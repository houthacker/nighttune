import '../src/index.css'

export const metadata = {
    title: 'nighttune',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <div id="root">{children}</div>
            </body>
        </html>
    )
}