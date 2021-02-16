CREATE DATABASE library_test;

CREATE TABLE IF NOT EXISTS books(
    id SERIAL PRIMARY KEY,
    title TEXT UNIQUE,
    author TEXT);

CREATE TABLE IF NOT EXISTS articles(
    id SERIAL PRIMARY KEY,
    book TEXT REFERENCES books(title),
    author TEXT,
    title TEXT,
    section_serial REAL,
    content TEXT
);