try {
    $body = @{ slug = 'sijenggung' } | ConvertTo-Json
    $r = Invoke-WebRequest 'http://localhost:3000/api/sync' -Method Post -UseBasicParsing -TimeoutSec 180 -Body $body -ContentType 'application/json'
    Write-Host "Status: $($r.StatusCode)"
    Write-Host $r.Content
} catch {
    Write-Host "Error: $_"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Body:" $reader.ReadToEnd()
    }
}
