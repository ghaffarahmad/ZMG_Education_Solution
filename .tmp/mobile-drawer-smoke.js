import fs from "node:fs";
import { SignJWT } from "jose";

const BASE_URL = "http://localhost:3000";
const CDP_URL = "http://127.0.0.1:9224";
const HEIGHT = 900;
const WIDTHS = [375, 390, 430];
const PUBLIC_PATHS = ["/", "/about", "/services", "/admission-support", "/contact", "/student-portal"];
const ADMIN_PATHS = ["/admin/students", "/admin/notices", "/admin/settings"];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readEnvFile() {
  const env = {};
  const content = fs.existsSync(".env") ? fs.readFileSync(".env", "utf8") : "";

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  return env;
}

async function createAdminToken() {
  const env = readEnvFile();
  const secret = new TextEncoder().encode(env.JWT_SECRET || "fallback_secret_for_development_only");

  return new SignJWT({ id: "drawer-smoke-test", email: "smoke@example.com", name: "Smoke Test" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(secret);
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 0;
    this.pending = new Map();
    this.eventWaiters = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.addEventListener("message", (event) => this.handleMessage(event));

    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
  }

  handleMessage(event) {
    const message = JSON.parse(event.data);

    if (message.id && this.pending.has(message.id)) {
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);

      if (message.error) {
        reject(new Error(`${message.error.message}: ${message.error.data || ""}`));
      } else {
        resolve(message.result);
      }
      return;
    }

    const waiters = this.eventWaiters.get(message.method);
    if (!waiters?.length) return;

    const waiter = waiters.shift();
    clearTimeout(waiter.timer);
    waiter.resolve(message.params);
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));

    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (!this.pending.has(id)) return;
        this.pending.delete(id);
        reject(new Error(`Timed out waiting for ${method}`));
      }, 20000);
    });
  }

  waitEvent(method, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeout);
      const waiters = this.eventWaiters.get(method) || [];
      waiters.push({ resolve, timer });
      this.eventWaiters.set(method, waiters);
    });
  }

  close() {
    this.ws.close();
  }
}

async function createPage() {
  const response = await fetch(`${CDP_URL}/json/new?about:blank`, { method: "PUT" });
  if (!response.ok) throw new Error(`Could not create Chrome tab: ${response.status}`);

  const tab = await response.json();
  const client = new CDPClient(tab.webSocketDebuggerUrl);
  await client.connect();
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Network.enable");
  return client;
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });

  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || "Runtime evaluation failed");
  }

  return result.result.value;
}

async function setViewport(client, width) {
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height: HEIGHT,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await client.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
}

async function navigate(client, path) {
  const loaded = client.waitEvent("Page.loadEventFired").catch(() => null);
  await client.send("Page.navigate", { url: `${BASE_URL}${path}` });
  await loaded;
  await wait(800);
}

async function setAdminCookie(client, token) {
  await client.send("Network.setCookie", {
    name: "admin_token",
    value: token,
    url: BASE_URL,
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
  });
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function openDrawer(client, buttonLabel) {
  const clicked = await evaluate(
    client,
    `(() => {
      const button = document.querySelector('button[aria-label="${buttonLabel}"]');
      if (!button) return false;
      button.click();
      return true;
    })()`
  );

  assert(clicked, `Could not find button: ${buttonLabel}`);
  await wait(900);
}

async function getDrawerState(client, label, checkSearchInput = false) {
  return evaluate(
    client,
    `(async () => {
      const portal = document.querySelector('[data-mobile-drawer-root]');
      const wrapper = portal?.firstElementChild;
      const overlay = wrapper?.children?.[0] || null;
      const drawer = document.querySelector('[role="dialog"][aria-label="${label}"]');
      const drawerRect = drawer?.getBoundingClientRect();
      const overlayStyle = overlay ? getComputedStyle(overlay) : null;
      const drawerStyle = drawer ? getComputedStyle(drawer) : null;
      const bodyChildren = Array.from(document.body.children).filter((child) => child !== portal && child instanceof HTMLElement);
      const focusables = drawer ? Array.from(drawer.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')) : [];
      const outsideX = drawerRect ? Math.min(window.innerWidth - 8, Math.ceil(drawerRect.right + 12)) : window.innerWidth - 8;
      const outsidePoint = document.elementFromPoint(outsideX, Math.floor(window.innerHeight / 2));
      let searchFocusBlocked = null;

      if (${checkSearchInput ? "true" : "false"}) {
        const search = document.querySelector('input[placeholder^="Search by name"]');
        search?.focus();
        await new Promise((resolve) => setTimeout(resolve, 60));
        searchFocusBlocked = !search || document.activeElement !== search;
      }

      if (focusables.length > 0) {
        focusables[focusables.length - 1].focus();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }));
        await new Promise((resolve) => setTimeout(resolve, 30));
      }

      return {
        hasPortal: Boolean(portal),
        hasDrawer: Boolean(drawer),
        drawerLeft: drawerRect?.left ?? null,
        drawerWidth: drawerRect?.width ?? null,
        maxAllowedWidth: Math.min(window.innerWidth * 0.86, 352),
        overlayOpacity: overlayStyle?.opacity ?? null,
        overlayZ: Number.parseInt(overlayStyle?.zIndex || "0", 10),
        drawerZ: Number.parseInt(drawerStyle?.zIndex || "0", 10),
        bodyLocked: document.body.style.position === "fixed" && document.body.style.overflow === "hidden",
        inertBackground: bodyChildren.some((child) => child.inert && child.getAttribute("aria-hidden") === "true"),
        outsidePointIsOverlay: outsidePoint === overlay,
        focusTrapKeptFocus: drawer ? drawer.contains(document.activeElement) : false,
        searchFocusBlocked,
        noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1 && document.body.scrollWidth <= window.innerWidth + 1,
      };
    })()`
  );
}

async function assertDrawerOpen(client, label, checkSearchInput = false) {
  const state = await getDrawerState(client, label, checkSearchInput);

  assert(state.hasPortal, `${label}: portal missing`);
  assert(state.hasDrawer, `${label}: drawer missing`);
  assert(Math.abs(state.drawerLeft) <= 2, `${label}: drawer is not aligned to the left (${JSON.stringify(state)})`);
  assert(state.drawerWidth <= state.maxAllowedWidth + 2, `${label}: drawer is too wide`);
  assert(Number(state.overlayOpacity) > 0.85, `${label}: overlay is not visible enough`);
  assert(state.drawerZ > state.overlayZ, `${label}: drawer z-index is not above overlay (${JSON.stringify(state)})`);
  assert(state.overlayZ >= 1000, `${label}: overlay z-index is too low`);
  assert(state.bodyLocked, `${label}: body is not scroll locked`);
  assert(state.inertBackground, `${label}: background is not inert`);
  assert(state.outsidePointIsOverlay, `${label}: overlay is not covering content outside drawer`);
  assert(state.focusTrapKeptFocus, `${label}: focus trap did not keep focus inside drawer`);
  assert(state.noHorizontalOverflow, `${label}: horizontal overflow detected while drawer is open`);

  if (checkSearchInput) {
    assert(state.searchFocusBlocked, `${label}: Student Directory search can still receive focus`);
  }
}

async function assertClosed(client, label) {
  const state = await evaluate(
    client,
    `(() => ({
      drawerStillMounted: Boolean(document.querySelector('[role="dialog"][aria-label="${label}"]')),
      bodyLocked: document.body.style.position === "fixed" || document.body.style.overflow === "hidden",
      noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1 && document.body.scrollWidth <= window.innerWidth + 1,
    }))()`
  );

  assert(!state.drawerStillMounted, `${label}: drawer did not unmount after close`);
  assert(!state.bodyLocked, `${label}: body stayed locked after close`);
  assert(state.noHorizontalOverflow, `${label}: horizontal overflow detected after close`);
}

async function closeWithEscape(client, label) {
  await evaluate(
    client,
    `(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })))()`
  );
  await wait(460);
  await assertClosed(client, label);
}

async function closeWithOverlay(client, label) {
  await evaluate(
    client,
    `(() => {
      const overlay = document.querySelector('[data-mobile-drawer-root]')?.firstElementChild?.children?.[0];
      overlay?.click();
      return Boolean(overlay);
    })()`
  );
  await wait(460);
  await assertClosed(client, label);
}

async function closeWithFirstLink(client, label) {
  await evaluate(
    client,
    `(() => {
      const drawer = document.querySelector('[role="dialog"][aria-label="${label}"]');
      const links = Array.from(drawer?.querySelectorAll('nav a[href]') || []);
      const link = links.find((item) => item.getAttribute('href') !== location.pathname) || links[0];
      link?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      return Boolean(link);
    })()`
  );
  await wait(900);
  await assertClosed(client, label);
}

async function verifyHeader(client) {
  const state = await evaluate(
    client,
    `(() => {
      const navButton = document.querySelector('button[aria-label="Open navigation"]');
      const themeButton = Array.from(document.querySelectorAll('button[aria-label^="Switch to"]')).find((button) => {
        const rect = button.getBoundingClientRect();
        return rect.width >= 40 && rect.height >= 40;
      });
      const navRect = navButton?.getBoundingClientRect();
      const themeRect = themeButton?.getBoundingClientRect();
      return {
        navVisible: Boolean(navButton && navRect.width >= 40 && navRect.height >= 40),
        themeVisible: Boolean(themeButton && themeRect.width >= 40 && themeRect.height >= 40),
        noHorizontalOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1 && document.body.scrollWidth <= window.innerWidth + 1,
      };
    })()`
  );

  assert(state.navVisible, "Public hamburger is not visible/clickable");
  assert(state.themeVisible, "Public theme toggle is not visible");
  assert(state.noHorizontalOverflow, "Public header created horizontal overflow");
}

async function testPublicPage(client, width, path) {
  await setViewport(client, width);
  await navigate(client, path);
  await verifyHeader(client);

  await openDrawer(client, "Open navigation");
  await assertDrawerOpen(client, "Website navigation");
  await closeWithEscape(client, "Website navigation");

  await openDrawer(client, "Open navigation");
  await assertDrawerOpen(client, "Website navigation");
  await closeWithOverlay(client, "Website navigation");

  await openDrawer(client, "Open navigation");
  await assertDrawerOpen(client, "Website navigation");
  await closeWithFirstLink(client, "Website navigation");
}

async function testAdminPage(client, width, path, token) {
  await setViewport(client, width);
  await setAdminCookie(client, token);
  await navigate(client, path);

  const isLogin = await evaluate(client, `location.pathname === "/admin/login"`);
  assert(!isLogin, `Admin smoke page redirected to login: ${path}`);

  await openDrawer(client, "Open admin menu");
  await assertDrawerOpen(client, "Admin navigation", path === "/admin/students");
  await closeWithEscape(client, "Admin navigation");

  await openDrawer(client, "Open admin menu");
  await assertDrawerOpen(client, "Admin navigation", path === "/admin/students");
  await closeWithOverlay(client, "Admin navigation");
}

async function main() {
  const adminToken = await createAdminToken();
  const client = await createPage();
  const passed = [];

  try {
    for (const width of WIDTHS) {
      for (const path of PUBLIC_PATHS) {
        await testPublicPage(client, width, path);
        passed.push(`public ${path} @ ${width}px`);
      }

      for (const path of ADMIN_PATHS) {
        await testAdminPage(client, width, path, adminToken);
        passed.push(`admin ${path} @ ${width}px`);
      }
    }
  } finally {
    client.close();
  }

  console.log(`Mobile drawer smoke checks passed (${passed.length}):`);
  for (const item of passed) console.log(`- ${item}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
