import express, { NextFunction, Request, Response } from 'express';
import { config } from './config.js';
import { BadRequestError, ForbiddenRequestError, UnauthorizedRequestError } from './errors.js';
import { error } from 'console';
import { createUser } from './db/queries/users.js';

const app = express();
const PORT = 8080;
const OBSCENE_WORDS = new Set(['kerfuffle', 'sharbert', 'fornax']);

const middlewareLogResponses = (req: Request, res: Response, next: NextFunction) => {
  res.on('finish', () => {
    const statusCode = res.statusCode;
    if (statusCode < 200 || statusCode >= 400) {
      console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`);
    }
  });
  next();
};

const middlewareMetricsInc = (req: Request, res: Response, next: NextFunction) => {
  config['fileserverHits'] += 1;
  next();
};

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(err)
  if(err instanceof BadRequestError || err instanceof ForbiddenRequestError || err instanceof UnauthorizedRequestError)
    return res.status(err.statusCode).json({error: err.message})
  return res.status(500).json({error: 'Internal Server Error'})
}

app.use(express.json());
app.use(middlewareLogResponses);
app.use('/app', middlewareMetricsInc, express.static('./src/app'));

app.get('/admin/metrics', (req, res) => {
  res.send(`<html>
  <body>
    <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config['fileserverHits']} times!</p>
  </body>
</html>`);
});

app.post('/admin/reset', (req: Request, res: Response) => {
  config['fileserverHits'] = 0;
  res.sendStatus(200);
});

app.post('/api/validate_chirp', (req, res, next) => {
  try {
  const parsedBody: {body:string} = req.body;

  if (!parsedBody?.body) {
    return res.status(400).json({ error: 'Something went wrong' });
  }

  if (parsedBody.body.length > 140) {
    throw new BadRequestError('Chirp is too long. Max length is 140')
  }

  const cleanedBody = parsedBody.body
    .split(' ')
    .map((word) => (OBSCENE_WORDS.has(word.toLowerCase()) ? '****' : word))
    .join(' ');

  return res.json({ cleanedBody });
} catch(error) {
  next(error)
}});

app.post('/api/users', (req,res) => {
  if(req.body?.email) {
    const user = createUser(req.body.email)
    return res.status(201).json(user)
  }
})

// Uncomment for health check endpoint
app.get('/api/healthz', (req, res) => {
  res.setHeader('content-type', 'text/plain; charset=utf-8');
  res.send('OK');
});

app.use(errorHandler);

app.listen(PORT, () => console.log('Server is running on port 8080')).on('error', (err) => {
  console.error('Server failed to start:', err);
});
