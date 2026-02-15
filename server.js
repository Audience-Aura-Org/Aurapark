const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)
// when using middleware `hostname` and `port` must be provided below
const app = next({
    dev,
    hostname,
    port,
    dir: dev ? './apps/web' : './'
})
const handle = app.getRequestHandler()

console.log(`> Starting server in ${dev ? 'development' : 'production'} mode...`)
console.log(`> App directory set to: ${dev ? './apps/web' : './'}`)

if (!dev) {
    const fs = require('fs');
    if (!fs.existsSync('./.next')) {
        console.error('CRITICAL: .next directory not found in root. Build artifacts may be missing.');
    } else {
        console.log('--- .next directory verified in root ---');
    }
}

app.prepare()
    .then(() => {
        createServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url, true)

                // Health check endpoint
                if (parsedUrl.pathname === '/health') {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.end(JSON.stringify({
                        status: 'System Online',
                        env: process.env.NODE_ENV,
                        time: new Date().toISOString()
                    }))
                    return
                }

                await handle(req, res, parsedUrl)
            } catch (err) {
                console.error('Error occurred handling', req.url, err)
                res.statusCode = 500
                res.end('Internal Server Error')
            }
        })
            .once('error', (err) => {
                console.error('Server error:', err)
                process.exit(1)
            })
            .listen(port, hostname, () => {
                console.log(`> Ready on http://${hostname}:${port}`)
                console.log(`> Platform nodes synchronized. Node.js process: ${process.pid}`)
            })
    })
    .catch((err) => {
        console.error('FATAL ERROR: Failed to prepare Next.js app', err)
        // Attempt to start a basic error server to show the error
        createServer((req, res) => {
            res.statusCode = 500
            res.setHeader('Content-Type', 'text/plain')
            res.end(`FATAL INITIALIZATION ERROR: ${err.message}\n\nCheck server logs for details.`)
        }).listen(port, hostname)
    })
