import { configDotenv } from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

configDotenv({ path: "./.env" })

console.log(process.env.DB_USER);

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB_DATABASE,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT || 5432, // default PostgreSQL port
});

const client = await pool.connect();

async function createDatabase() {
	try {
		await client.query('CREATE DATABASE "url-shortener"');
		const createTableQuery = `
			CREATE TABLE "urls" (
			id SERIAL PRIMARY KEY,
			original_url TEXT NOT NULL,
			shortened_url TEXT NOT NULL,
			creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
			)
			`;
		await client.query(createTableQuery);

		client.release();
		console.log("Project setup successfully!");
	} catch (error) {
		console.error("Error during setup:", error);
		client.release();
	}
}
createDatabase()