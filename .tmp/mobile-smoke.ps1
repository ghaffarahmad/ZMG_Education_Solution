$ErrorActionPreference = "Stop"

$baseUrl = "http://localhost:3000"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$remotePort = 9337
$profile = "C:\tmp\zmg-mobile-smoke-profile"

function ConvertTo-Base64Url([byte[]] $bytes) {
  return [Convert]::ToBase64String($bytes).TrimEnd("=").Replace("+", "-").Replace("/", "_")
}

function Get-EnvValue([string] $name) {
  $line = Get-Content -LiteralPath ".env" | Where-Object { $_ -match "^$name=" } | Select-Object -First 1
  if (-not $line) { return $null }
  return $line.Substring($name.Length + 1)
}

function New-SmokeAdminToken {
  $secret = Get-EnvValue "JWT_SECRET"
  if (-not $secret) { $secret = "fallback_secret_for_development_only" }

  $now = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $header = @{ alg = "HS256"; typ = "JWT" } | ConvertTo-Json -Compress
  $payload = @{
    id = "smoke-test"
    email = "smoke@example.local"
    name = "Smoke Test"
    iat = $now
    exp = $now + 3600
  } | ConvertTo-Json -Compress

  $unsigned = "$(ConvertTo-Base64Url ([Text.Encoding]::UTF8.GetBytes($header))).$(ConvertTo-Base64Url ([Text.Encoding]::UTF8.GetBytes($payload)))"
  $hmac = [System.Security.Cryptography.HMACSHA256]::new([Text.Encoding]::UTF8.GetBytes($secret))
  $signature = ConvertTo-Base64Url ($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($unsigned)))
  return "$unsigned.$signature"
}

function Start-SmokeChrome {
  if (Test-Path -LiteralPath $profile) {
    Remove-Item -LiteralPath $profile -Recurse -Force -ErrorAction SilentlyContinue
  }

  $args = @(
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-first-run",
    "--no-default-browser-check",
    "--remote-debugging-address=127.0.0.1",
    "--remote-debugging-port=$remotePort",
    "--user-data-dir=$profile",
    "about:blank"
  )

  $process = Start-Process -FilePath $chrome -ArgumentList $args -WindowStyle Hidden -PassThru
  $versionUrl = "http://127.0.0.1:$remotePort/json/version"

  for ($i = 0; $i -lt 40; $i++) {
    try {
      Invoke-RestMethod -Uri $versionUrl -TimeoutSec 1 | Out-Null
      return $process
    } catch {
      Start-Sleep -Milliseconds 250
    }
  }

  throw "Chrome did not expose a DevTools endpoint."
}

$script:cdpId = 0
$script:socket = $null

function Connect-Cdp {
  $tabs = Invoke-RestMethod -Uri "http://127.0.0.1:$remotePort/json/list"
  $tab = $tabs | Where-Object { $_.type -eq "page" } | Select-Object -First 1
  if (-not $tab) { throw "Chrome did not expose a page target." }
  $wsUrl = $tab.webSocketDebuggerUrl
  $script:socket = [System.Net.WebSockets.ClientWebSocket]::new()
  $script:socket.ConnectAsync([Uri]$wsUrl, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
}

function Invoke-Cdp([string] $method, [hashtable] $params = @{}) {
  $script:cdpId += 1
  $id = $script:cdpId
  $payload = @{ id = $id; method = $method; params = $params } | ConvertTo-Json -Depth 20 -Compress
  $bytes = [Text.Encoding]::UTF8.GetBytes($payload)
  $segment = [ArraySegment[byte]]::new($bytes)
  $script:socket.SendAsync($segment, [System.Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()

  $buffer = New-Object byte[] 1048576
  while ($true) {
    $builder = [Text.StringBuilder]::new()
    do {
      $cts = [Threading.CancellationTokenSource]::new(20000)
      $result = $script:socket.ReceiveAsync([ArraySegment[byte]]::new($buffer), $cts.Token).GetAwaiter().GetResult()
      if ($result.MessageType -eq [System.Net.WebSockets.WebSocketMessageType]::Close) {
        throw "DevTools socket closed while waiting for $method."
      }
      [void] $builder.Append([Text.Encoding]::UTF8.GetString($buffer, 0, $result.Count))
    } while (-not $result.EndOfMessage)
    $json = $builder.ToString()
    $message = $json | ConvertFrom-Json
    if ($message.id -eq $id) {
      if ($message.error) {
        throw "$method failed: $($message.error.message)"
      }
      return $message.result
    }
  }
}

function Eval-Js([string] $expression) {
  $result = Invoke-Cdp "Runtime.evaluate" @{
    expression = $expression
    returnByValue = $true
    awaitPromise = $true
  }
  return $result.result.value
}

function Set-Viewport([int] $width) {
  Invoke-Cdp "Emulation.setDeviceMetricsOverride" @{
    width = $width
    height = 900
    deviceScaleFactor = 1
    mobile = $true
  } | Out-Null
}

function Open-Path([string] $path, [int] $width) {
  Set-Viewport $width
  Invoke-Cdp "Page.navigate" @{ url = "$baseUrl$path" } | Out-Null
  Start-Sleep -Milliseconds 3000
  Eval-Js "document.readyState" | Out-Null
}

function Test-MobileDrawer([string] $path, [int] $width) {
  Open-Path $path $width
  for ($i = 0; $i -lt 10; $i++) {
    $hasButton = Eval-Js "Boolean(document.querySelector('button[aria-label=`"Open navigation`"]'))"
    if ($hasButton) { break }
    Start-Sleep -Milliseconds 300
  }
  Eval-Js @"
(() => {
  const button = document.querySelector('button[aria-label="Open navigation"]');
  if (button) button.click();
  return Boolean(button);
})()
"@ | Out-Null
  Start-Sleep -Milliseconds 450
  return Eval-Js @"
(() => {
  const drawer = document.querySelector('[role="dialog"][aria-label="Website navigation"]');
  const labels = drawer
    ? Array.from(drawer.querySelectorAll('a, button'))
        .map((node) => (node.textContent || '').replace(/\s+/g, ' ').trim())
        .filter((text) => text && text !== 'Z.M.G Education')
    : [];
  const studentIndex = labels.findIndex((text) => text === 'Student Portal');
  const adminIndex = labels.findIndex((text) => text === 'Admin Dashboard' || text === 'Admin Login');
  const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  return {
    path: location.pathname,
    width: window.innerWidth,
    drawer: Boolean(drawer),
    labels,
    hasStudentPortal: studentIndex >= 0,
    hasAdminEntry: adminIndex >= 0,
    adminAfterStudent: studentIndex >= 0 && adminIndex > studentIndex,
    overflowX: scrollWidth - window.innerWidth
  };
})()
"@
}

function Test-Page([string] $path, [int] $width) {
  Open-Path $path $width
  return Eval-Js @"
(() => {
  const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  return {
    path: location.pathname,
    width: window.innerWidth,
    title: (document.querySelector('h1,h2')?.textContent || '').trim(),
    overflowX: scrollWidth - window.innerWidth,
    hasSkeleton: Boolean(document.querySelector('.skeleton-shimmer')),
    hasDrawerButton: Boolean(document.querySelector('button[aria-label="Open navigation"]'))
  };
})()
"@
}

function Test-StudentPortalDashboard([int] $width) {
  Open-Path "/student-portal" $width
  Eval-Js @"
(() => {
  const cnic = document.querySelector('input[name="cnicOrBform"]');
  const dob = document.querySelector('input[name="dob"]');
  if (!cnic || !dob) return false;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  setter.call(cnic, '42401-2709592-7');
  cnic.dispatchEvent(new Event('input', { bubbles: true }));
  cnic.dispatchEvent(new Event('change', { bubbles: true }));
  setter.call(dob, '2006-05-24');
  dob.dispatchEvent(new Event('input', { bubbles: true }));
  dob.dispatchEvent(new Event('change', { bubbles: true }));
  document.querySelector('button[type="submit"]')?.click();
  return true;
})()
"@ | Out-Null
  Start-Sleep -Milliseconds 6000
  return Eval-Js @"
(() => {
  const text = document.body.innerText;
  const scrollWidth = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  return {
    path: location.pathname,
    width: window.innerWidth,
    submitted: true,
    dashboardVisible: text.includes('Student Information') && text.includes('Fee Summary') && text.includes('Documents'),
    skeletonVisible: Boolean(document.querySelector('.skeleton-shimmer')),
    verifyFormVisible: text.includes('Verify Your Record'),
    overflowX: scrollWidth - window.innerWidth
  };
})()
"@
}

function Set-AdminCookie {
  Invoke-Cdp "Network.enable" @{} | Out-Null
  $token = New-SmokeAdminToken
  Invoke-Cdp "Network.setCookie" @{
    name = "admin_token"
    value = $token
    url = $baseUrl
    path = "/"
    httpOnly = $true
    sameSite = "Lax"
  } | Out-Null
}

function Test-AdminDrawerReturn([int] $width) {
  Open-Path "/" $width
  Eval-Js "document.querySelector('button[aria-label=`"Open navigation`"]')?.click(); true" | Out-Null
  Start-Sleep -Milliseconds 500
  $before = Eval-Js @"
(() => {
  const drawer = document.querySelector('[role="dialog"][aria-label="Website navigation"]');
  return drawer ? drawer.innerText.includes('Admin Dashboard') : false;
})()
"@
  Eval-Js @"
(() => {
  const buttons = Array.from(document.querySelectorAll('[role="dialog"] button'));
  const adminButton = buttons.find((button) => button.textContent.trim() === 'Admin Dashboard');
  if (adminButton) adminButton.click();
  return Boolean(adminButton);
})()
"@ | Out-Null
  Start-Sleep -Milliseconds 1200
  $after = Eval-Js @"
(() => ({
  hadAdminDashboard: $($before.ToString().ToLowerInvariant()),
  path: location.pathname,
  drawerStillOpen: Boolean(document.querySelector('[role="dialog"][aria-label="Website navigation"]')),
  overflowX: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - window.innerWidth
}))()
"@
  return $after
}

$chromeProcess = $null

try {
  $chromeProcess = Start-SmokeChrome
  Connect-Cdp
  Invoke-Cdp "Page.enable" @{} | Out-Null
  Invoke-Cdp "Runtime.enable" @{} | Out-Null

  $widths = if ($env:SMOKE_WIDTHS) { $env:SMOKE_WIDTHS.Split(",") | ForEach-Object { [int] $_ } } else { @(375, 390, 430) }
  $publicPaths = if ($env:SMOKE_PUBLIC_PATHS) { $env:SMOKE_PUBLIC_PATHS.Split(",") } else { @("/", "/about", "/services", "/admission-support", "/notices", "/contact") }
  $adminPaths = if ($env:SMOKE_ADMIN_PATHS) { $env:SMOKE_ADMIN_PATHS.Split(",") } else { @("/admin/dashboard", "/admin/students", "/admin/settings") }
  $results = [ordered]@{
    publicDrawers = @()
    studentPortal = @()
    adminPages = @()
    adminDrawerReturn = $null
  }

  foreach ($width in $widths) {
    foreach ($path in $publicPaths) {
      Write-Host "drawer $path $width"
      $results.publicDrawers += Test-MobileDrawer $path $width
    }
  }

  foreach ($width in $widths) {
    Write-Host "student page $width"
    $results.studentPortal += Test-Page "/student-portal" $width
  }
  Write-Host "student dashboard 390"
  $results.studentPortal += Test-StudentPortalDashboard 390

  Set-AdminCookie
  foreach ($width in $widths) {
    foreach ($path in $adminPaths) {
      Write-Host "admin $path $width"
      $results.adminPages += Test-Page $path $width
    }
  }
  Write-Host "admin drawer return"
  $results.adminDrawerReturn = Test-AdminDrawerReturn 390

  $results | ConvertTo-Json -Depth 8
} finally {
  try {
    if ($script:socket) {
      $script:socket.CloseAsync([System.Net.WebSockets.WebSocketCloseStatus]::NormalClosure, "done", [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    }
  } catch {}
  if ($chromeProcess -and -not $chromeProcess.HasExited) {
    Stop-Process -Id $chromeProcess.Id -Force -ErrorAction SilentlyContinue
  }
}
