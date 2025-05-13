param(
  [string]$UserId,
  [string]$Role = "admin"
)

curl -Method POST http://localhost:3000/api/set-role `
  -ContentType "application/json" `
  -Body "{`"userId`": `"$UserId`", `"role`": `"$Role`"}"
