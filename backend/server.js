import express from 'express';
import bodyParser from 'body-parser';
import { Low, JSONFile } from 'lowdb';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const adapter = new JSONFile(path.join(__dirname, 'db.json'));
const db = new Low(adapter);

async function initDB() {
  await db.read();
  db.data = db.data || { users: [] };
  await db.write();
}
initDB();

const corsOptions = {
  origin: '*', // Permetti tutte le origini per il debug. Cambialo in produzione.
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions)); // Configura CORS con opzioni specifiche
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../')));

function generateUniqueId() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function validatePassword(password) {
  const regex = /^(?=.*[0-9]).{8,}$/;
  return regex.test(password);
}

app.post('/api/register', async (req, res) => {
  const { name, surname, email, birthdate, password } = req.body;
  console.log('Dati ricevuti:', req.body);
  
  if (!name || !surname || !email || !birthdate || !password) {
    console.log('Errore: dati mancanti');
    return res.status(400).json({ success: false, message: 'Tutti i campi sono obbligatori' });
  }

  if (!validatePassword(password)) {
    console.log('Errore: password non valida');
    return res.status(400).json({ success: false, message: 'La password deve essere di almeno 8 caratteri e contenere almeno un numero' });
  }

  const existingUser = db.data.users.find(user => user.email === email);
  if (existingUser) {
    console.log('Errore: email già registrata');
    return res.status(400).json({ success: false, message: 'Email già registrata' });
  }

  const user = { id: generateUniqueId(), name, surname, email, birthdate, password, selections: [] };
  db.data.users.push(user);
  
  try {
    await db.write();
    console.log('Utente registrato con successo:', user);
    res.json({ success: true, message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error('Errore durante la scrittura del database:', error);
    res.status(500).json({ success: false, message: 'Errore del server durante la registrazione' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Dati di login ricevuti:', req.body);
  
  const user = db.data.users.find(user => user.email === email);
  if (!user) {
    return res.status(400).json({ success: false, message: 'Email non trovata' });
  }
  
  if (user.password !== password) {
    return res.status(400).json({ success: false, message: 'Password errata' });
  }

  res.json({ success: true, message: 'Login effettuato con successo', userId: user.id, name: user.name, surname: user.surname });
});

app.post('/api/submit-selection', async (req, res) => {
  const { userId, selections } = req.body;
  console.log('Dati ricevuti per il pronostico:', req.body);

  const user = db.data.users.find(user => user.id === userId);
  if (!user) {
    return res.status(400).json({ success: false, message: 'Utente non trovato' });
  }

  user.selections = selections;

  try {
    await db.write();
    console.log('Pronostico salvato con successo:', user);
    res.json({ success: true, message: 'Pronostico salvato con successo' });
  } catch (error) {
    console.error('Errore durante la scrittura del database:', error);
    res.status(500).json({ success: false, message: 'Errore del server durante il salvataggio del pronostico' });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});







