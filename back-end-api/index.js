import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
const { Pool } = pg;
import z from "zod";
import { nanoid } from "nanoid";

// Using dotenv
dotenv.config();

const app = express();
const port = 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Testing pool connection
try {
  pool.query("SELECT NOW()");
  console.log("Successfully connected to the database!");
} catch (error) {
  console.error("Error connecting to the database:", error);
  process.exit(1);
}

// Importing middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.post("/api/shorten", async (req, res) => {
  const { url } = req.body;

  // Using zod test if the url sent is appropriate.
  try {
    const urlSchema = z.string().url();
    urlSchema.parse(url);
  } catch (error) {
    return res.status(400).json({ error: "Not a valid URL." })
  }

  // Creates an unique and random url link string.
  async function generateUniqueString() {
    let str_length = 6
    let generated_string = nanoid(str_length);
    var isUnique = false;

    // Checking if the generated string is unique in the database.
    do {
      try {
        const result = await pool.query("SELECT * FROM urls WHERE shortened_url_code = $1", [generated_string]);
        
        // If true, the string is unique.
        isUnique = (result.rows.length === 0);
      }
      catch (error) {
        console.error("Error while generating new string:", error);
        return null;
      }
    } while (!isUnique);

    return generated_string;
  }

  const random_string = await generateUniqueString();

  // Inserting into database
  try {
    await pool.query("INSERT INTO urls(original_url, shortened_url_code) VALUES($1, $2)", [url, random_string]);
    return res.status(201).json({ message: 'URL shortened successfully!' });
  } catch (error) {
    console.error('Error during query operation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }

});

app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});