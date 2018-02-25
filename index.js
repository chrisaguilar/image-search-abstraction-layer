const fs = require('fs');
const { join } = require('path');
const { promisify } = require('util');

const axios = require('axios');
const express = require('express');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const app = express();
const searchFile = join(__dirname, 'recent-searches.json');

app.set('port', parseInt(process.env.PORT, 10));

app.get('/', (req, res) => res.sendFile(join(__dirname, 'index.html')));

app.get('/api/search/:query', async (req, res) => {
    const limit = (+req.query.limit > 60 ? 60 : +req.query.limit <= 0 ? 10 : +req.query.limit) || 10;
    const query = req.params.query;
    try {
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

        // Save at most 10 array items to ./recent-searches.json
        const recentSearches = JSON.parse(await readFile(searchFile, 'utf8'));

        recentSearches.unshift({
            term: query,
            timestamp: Date.now()
        });

        await writeFile(searchFile, JSON.stringify(recentSearches.slice(0, 10)), 'utf8');
    } catch (e) {
        console.error(e);
    }
});

app.get('/api/latest', async (req, res) => {
    try {
        const recentSearches = JSON.parse(await readFile(searchFile, 'utf8'));
        res.json(recentSearches);
    } catch (e) {
        console.error(e);
    }
});

app.listen(app.get('port'), async () => {
    console.log(`/image-search listening on port ${app.get('port')}`);

    try {
        await readFile(searchFile, 'utf8');
    } catch (e) {
        await writeFile(searchFile, '[]', 'utf8');
    }
});
