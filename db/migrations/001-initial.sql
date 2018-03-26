-- Up
CREATE TABLE searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term TEXT NOT NULL
);

-- Down
DROP TABLE searches;
