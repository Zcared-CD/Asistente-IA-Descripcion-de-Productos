import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer as createViteServer } from 'vite'
import { renderToString } from 'react-dom/server'

const port = 3001

const vite = await createViteServer({
  server: {
    middlewareMode: true,
  },
  appType: 'custom',
})

const server = createServer(async (req, res) => {
  try {
    const url = req.url || '/'

    if (url !== '/') {
      res.statusCode = 404
      res.end('Página no encontrada')
      return
    }

    const template = await readFile(
      resolve(process.cwd(), 'ssr.html'),
      'utf-8',
    )

    const { default: SSRDemo } = await vite.ssrLoadModule(
      '/src/ssr/SSRDemo.jsx',
    )

    const appHtml = renderToString(SSRDemo())

    const html = template
      .replace(
        '<div id="root"></div>',
        `<div id="root">${appHtml}</div>`,
      )
      .replace(
        '<title>CarlSoft | Generador de descripciones de productos con IA</title>',
        '<title>CarlSoft - SSR</title>',
      )

    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')
    res.end(html)
  } catch (error) {
    vite.ssrFixStacktrace(error)

    console.error(error)

    res.statusCode = 500
    res.end('Error interno del servidor')
  }
})

server.listen(port, () => {
  console.log(`Servidor SSR ejecutándose en http://localhost:${port}`)
})