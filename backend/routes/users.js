const express = require('express');
const router = express.Router();
const pool = require('../db');

const verifierToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'Token manquant' });
    const jwt = require('jsonwebtoken');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ message: 'Token invalide' });
    }
};

const verifierCommissaire = (req, res, next) => {
    if (req.user.role !== 'commissaire') {
        return res.status(403).json({ message: 'Accès réservé au commissaire' });
    }
    next();
};

router.get('/', verifierToken, verifierCommissaire, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.*, w.nom as workspace_nom
            FROM users u
            LEFT JOIN workspaces w ON u.workspace_id = w.id
            ORDER BY u.id ASC
        `);
        res.json({ users: result.rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.post('/', verifierToken, verifierCommissaire, async (req, res) => {
    try {
        const { nom, prenom, matricule, email, mot_de_passe, role, workspace_id } = req.body;

        const result = await pool.query(
            `INSERT INTO users (nom, prenom, matricule, email, mot_de_passe, role, workspace_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [nom, prenom, matricule, email, mot_de_passe, role, workspace_id]
        );

        res.status(201).json({ message: 'Agent ajouté', user: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.patch('/:id/desactiver', verifierToken, verifierCommissaire, async (req, res) => {
    try {
        await pool.query('UPDATE users SET actif = false WHERE id = $1', [req.params.id]);
        res.json({ message: 'Agent désactivé' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
router.get('/me', verifierToken, async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.nom, u.prenom, u.matricule, u.email, u.role, u.date_creation, w.nom as workspace_nom
            FROM users u
            LEFT JOIN workspaces w ON u.workspace_id = w.id
            WHERE u.id = $1
        `, [req.user.id]);

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

router.patch('/me', verifierToken, async (req, res) => {
    try {
        const { email, mot_de_passe } = req.body;

        if (mot_de_passe) {
            await pool.query('UPDATE users SET email = $1, mot_de_passe = $2 WHERE id = $3', [email, mot_de_passe, req.user.id]);
        } else {
            await pool.query('UPDATE users SET email = $1 WHERE id = $2', [email, req.user.id]);
        }

        await pool.query(
            'INSERT INTO audit_logs (user_id, action, table_cible, details, ip_address) VALUES ($1, $2, $3, $4, $5)',
            [req.user.id, 'MODIFICATION', 'users', 'Mise a jour du profil personnel', req.ip]
        );

        res.json({ message: 'Profil mis a jour avec succes' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});
module.exports = router;