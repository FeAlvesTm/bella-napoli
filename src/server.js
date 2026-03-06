import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, 'config.env') });

import app from './app.js';
console.log('Arquivo server.js iniciado - teste log inicial');
const port = process.env.PORT || 4000;
app.listen(port, () => {});
