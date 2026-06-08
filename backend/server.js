const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const actsRoutes = require('./routes/acts');
const statsRoutes = require('./routes/stats');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/acts', actsRoutes);
app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
    res.json({ 
        message: '🚔 SecurePost API - Commissariat de Pointe-Noire',
        version: '1.0.0',
        status: 'En ligne'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur SecurePost démarré sur http://localhost:${PORT}`);
});