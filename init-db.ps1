# Set your Neon PostgreSQL connection string
$env:DATABASE_URL = "your_neon_postgresql_connection_string"

# Run the database initialization script
cd server
node ./config/initDb.js

Write-Host "Database initialized successfully!"
