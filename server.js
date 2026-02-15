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

app.prepare().then(() => {
    createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url, true)

            // Health check endpoint
            if (parsedUrl.pathname === '/health') {
                res.statusCode = 200
                res.end('System Online')
                return
            }

            await handle(req, res, parsedUrl)
        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    })
        .once('error', (err) => {
            console.error(err)
            process.exit(1)
        })
        .listen(port, hostname, () => {
            console.log(`> Ready on http://${hostname}:${port}`)
        })
})
