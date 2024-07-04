import { configDotenv } from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

configDotenv({ path: "./.env" })

console.log(process.env.DB_USER);

const pool_postgres = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_DATABASE,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT || 5432,
});

const pool_url_shortener = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_CREATED_DATABASE,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT || 5432,
});

async function createDatabase() {
	try {
		// Creating new Database
		await pool_postgres.query('CREATE DATABASE "url-shortener"');
		const createTableQuery = `
			CREATE TABLE urls (
			id SERIAL PRIMARY KEY,
			original_url TEXT NOT NULL,
			shortened_url_code TEXT UNIQUE NOT NULL,
			creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
			)
		`;

		// Creating the table inside the new database
		await pool_url_shortener.query(createTableQuery);
		console.log("Project setup successfully!");
	} catch (error) {
		console.error("Error during setup:", error);
	}
}
createDatabase()