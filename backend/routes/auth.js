const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

router.post('/login', async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 AND actif = true',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ 
                message: '❌ Email ou mot de passe incorrect' 
            });
        }

        const user = result.rows[0];

        const motDePasseValide = mot_de_passe === user.mot_de_passe;
        
        if (!motDePasseValide) {
            return res.status(401).json({ 
                message: '❌ Email ou mot de passe incorrect' 
            });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                role: user.role,
                nom: user.nom,
                prenom: user.prenom
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        await pool.query(
            'INSERT INTO audit_logs (user_id, action, table_cible, details, ip_address) VALUES ($1, $2, $3, $4, $5)',
            [user.id, 'CONNEXION', 'users', `Connexion de ${user.prenom} ${user.nom}`, req.ip]
        );

        res.json({
            message: '✅ Connexion réussie',
            token,
            user: {
                id: user.id,
                nom: user.nom,
                prenom: user.prenom,
                role: user.role,
                matricule: user.matricule
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '❌ Erreur serveur' });
    }
});

module.exports = router;