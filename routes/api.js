const { default: axios } = require('axios');
const express = require('express');

const { sqlite } = require('../db');

const router = express.Router();

router.get('/search/:query', async (req, res, next) => {
    // Set default limit to 10 items
    const limit = (+req.query.limit > 60 ? 60 : +req.query.limit <= 0 ? 10 : +req.query.limit) || 10;

    // Extract user query from URL
    const query = req.params.query;

    try {
        // Wait for the database to open.
        const db = await sqlite;

        // Get data
        const { data: { data: { items } } } = await axios.get(`https://api.imgur.com/3/gallery/t/${query}`, {
            headers: {
                Authorization: `Client-ID ${process.env.IMGUR_API_CLIENT_ID}`
            }
        });

        // Send filtered data to client
        res.json(
            items.slice(0, limit).map(({ description, id, link, title }) => ({
                title: title || 'No Title',
                description: description || 'No Description',
                link,
                thumbnail: `http://i.imgur.com/${id}s.png`
            }))
        );

        // Save term to database.
        await db.run(`INSERT INTO searches (term) VALUES ($term);`, { $term: query });
    } catch (e) {
        next(e);
    }
});

router.get('/latest', async (req, res, next) => {
    try {
        // Wait for the database to open.
        const db = await sqlite;

        // Get last 10 records from database.
        const latest = await db.all(`SELECT term FROM searches ORDER BY id DESC LIMIT 10;`);

        // Extract the `term` key from each returned row.
        res.json(latest.map(({ term }) => term));
    } catch (e) {
        next(e);
    }
});

module.exports = router;
