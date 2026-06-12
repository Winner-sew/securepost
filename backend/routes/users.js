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

module.exports = router;