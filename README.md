# University Research Opportunity Portal

**Demo video:** https://drive.google.com/file/d/1sotqQBVUdBqFZ41DSqxV7omy6-3q7Cis/view?usp=sharing

Faculty can create, list, view, update, close, and delete research opportunities. Every operation uses the REST API and MySQL; the frontend contains no hard-coded opportunity records.

## Technologies

- Node.js and Express
- MySQL / the MySQL-compatible MariaDB server included with XAMPP, using mysql2
- HTML, Bootstrap 5, CSS, and browser JavaScript
- An exported Postman collection with automated response assertions

## Prerequisites

- Node.js 20 or newer and npm (verified locally with Node.js 24)
- XAMPP with its MySQL module, or a configured MySQL server
- A browser; an internet connection loads the Bootstrap stylesheet from its CDN
- Postman for the required API demonstration

## Setup and run on Windows / PowerShell

1. In XAMPP Control Panel, start **MySQL**. Apache is optional; Node serves the frontend.
2. Open PowerShell in the project root and run:

```powershell
Set-Location backend
Copy-Item .env.example .env
npm ci
npm run db:setup
npm start
```

If `backend/.env` already exists, retain it and skip `Copy-Item`. The default example uses a local XAMPP root account with an empty password. If your MySQL account has a password, edit the private `.env` file before running database setup. Adjust `DB_HOST`, `DB_PORT`, `DB_USER`, and `DB_NAME` to match your installation.

Open **http://localhost:5000/**. The same server hosts both the frontend and the API. Open **http://localhost:5000/api/health** to see `database: "connected"`.

Database setup creates the database and table if absent and preserves existing data. You can instead import `database/schema.sql` with phpMyAdmin's Import/SQL page. Use `research_portal` for the database name when importing the schema manually.

For development, use `npm run dev`. Stop the Node server with Ctrl+C. If port 5000 is busy, stop your previous project server or set `PORT` in `.env`; when opening the frontend through that port, API URLs follow the same origin automatically.

## Using the frontend

- The home page fetches all stored opportunities, including their current Open/Closed status.
- **Post Opportunity** opens the required-fields form. Successful creation returns to the list with a success message.
- **View** displays the unique ID and every opportunity field.
- **Edit** loads existing values. Save changes to the title, skills, positions, deadline, or status.
- **Mark as Closed** on the detail page sends an update containing `status: "Closed"`.
- **Delete** asks for confirmation and removes the record from MySQL.
- Required fields and positive whole-number positions are checked in the browser and API. HTTP errors are shown as messages rather than mistaken for an empty list.

## API

| Method | Endpoint | Success |
| --- | --- | --- |
| POST | `/api/opportunities` | 201 Created |
| GET | `/api/opportunities` | 200 OK, array plus count |
| GET | `/api/opportunities/:id` | 200 OK, one complete record |
| PUT | `/api/opportunities/:id` | 200 OK, updated record |
| DELETE | `/api/opportunities/:id` | 200 OK, deletion message |
| GET | `/api/health` | 200 OK, database connection status |

All responses are JSON. Errors use `success: false` and a readable `message`: invalid input or malformed JSON returns **400**, a missing/deleted record or unknown route returns **404**, and database/internal failures return **500**. IDs must be positive integers. PUT supports partial updates, including a status-only close; each provided field is validated. An empty update is rejected.

POST requires `title`, `description`, `research_area`, `faculty_name`, `department`, `required_skills`, `available_positions`, and `application_deadline`. `status` defaults to `Open` and may only be `Open` or `Closed`. Positions must be a JSON integer greater than zero. Deadlines must be real dates in `YYYY-MM-DD` format. Past deadlines can be stored; this assignment does not require automatic expiration.

```json
{
  "title": "AI in Healthcare",
  "description": "Research machine learning methods for medical data.",
  "research_area": "Machine Learning",
  "faculty_name": "Dr. Ahmed Khan",
  "department": "Computer Science",
  "required_skills": "Python, Data Analysis",
  "available_positions": 3,
  "application_deadline": "2030-12-31",
  "status": "Open"
}
```

## Postman demonstration

Import `postman/research-portal.postman_collection.json`. Its `baseUrl` collection variable is `http://localhost:5000`; change it if you configured another port. Run requests **01-11 in order** with one iteration. The three POST requests automatically store their generated IDs for later requests.

| Requests | Required demonstration |
| --- | --- |
| 01-03 | Create at least three opportunities; 201 |
| 04 | Retrieve all, including all three new records; 200 |
| 05 | Retrieve one record using its ID; 200 |
| 06 | Update title, skills, and positions; 200 |
| 07 | Change Open to Closed, preserving other values; 200 |
| 08 | Delete the third record; 200 |
| 09 | Retrieve that deleted ID; 404 |
| 10 | Create with missing required fields; 400 |
| 11 | Reject an invalid update; 400 |

Expected 400 and 404 responses **pass** their negative-test assertions. Two `API Demo:` opportunities remain after the run. Repeated runs create new demonstration rows; delete unwanted demo rows through the frontend when preparing a clean recording. Production opportunity data is never seeded or hard-coded.

An optional command-line run is available from `backend`:

```powershell
npm run test:postman
```

This uses Newman to execute the same exported Postman collection. Use the Postman application in the video so the requests and response bodies are visible.

## Automated integration verification

With XAMPP MySQL running and `.env` configured:

```powershell
Set-Location backend
npm test
```

## Project structure

```text
backend/
  config/db.js
  controllers/opportunityController.js
  middleware/validate.js
  routes/opportunities.js
  scripts/              # database setup, integration test runner, collection export
  test/portal.test.js
  server.js
  package.json
  package-lock.json
  .env.example
frontend/
  index.html, create.html, detail.html, edit.html
  css/style.css
  js/common.js, main.js, create.js, detail.js, edit.js
database/schema.sql
postman/research-portal.postman_collection.json
docs/VIDEO_RECORDING_SCRIPT.md
docs/VERIFICATION.md
scripts/package-submission.ps1
submission/VIDEO_LINK.md
README.md
```

Keep real `.env` files, passwords, tokens, and local dependencies out of GitHub and the submission ZIP. The example environment file contains setup defaults only.
