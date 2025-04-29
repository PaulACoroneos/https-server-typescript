import express, { NextFunction, Request, Response } from 'express';
import { config } from './config.js';

const app = express();
const PORT = 8080;

const middlewareLogResponses = (req:Request,res:Response,next: NextFunction) => {
  res.on("finish", () => {
    const statusCode = res.statusCode
    if(statusCode < 200 || statusCode >=400) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`)
    }
  })
  next();
}

const middlewareMetricsInc = (req:Request,res:Response,next:NextFunction) => {
  config['fileserverHits'] += 1
  next();
}

app.use(middlewareLogResponses)

app.use('/app', middlewareMetricsInc, express.static('./src/app'))

app.get('/api/metrics',(req,res) => {
  res.send(`Hits: ${config['fileserverHits']}`)
})

app.get('/api/reset', (req,res) => {
  config['fileserverHits'] = 0
  res.sendStatus(200)
})

app.get('/api/healthz',(req,res) => {
  res.setHeader('content-type','text/plain; charset=utf-8');
  res.send('OK');
})

app.listen(PORT, () => console.log('Server is running on port 8080')).on('error', (err) => {
  console.error('Server failed to start:', err);
});