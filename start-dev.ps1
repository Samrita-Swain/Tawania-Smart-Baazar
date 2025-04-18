# Start the backend server
Start-Process -FilePath "powershell" -ArgumentList "-Command cd server && npm run dev"

# Start the frontend server
Start-Process -FilePath "powershell" -ArgumentList "-Command npm run dev"

Write-Host "Both servers are running!"
Write-Host "Backend: http://localhost:5000"
Write-Host "Frontend: http://localhost:5173"
