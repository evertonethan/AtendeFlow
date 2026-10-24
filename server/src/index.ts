import 'dotenv/config'
import { app } from './app.js'

const port = Number(process.env.PORT ?? 3000)
if (!process.env.JWT_SECRET) {
  console.error('Configure JWT_SECRET no arquivo server/.env antes de iniciar a API.')
  process.exit(1)
}
app.listen(port, () => console.log(`AtendeFlow API disponível em http://localhost:${port}`))
