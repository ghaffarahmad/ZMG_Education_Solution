const CDP_URL = "http://127.0.0.1:9224";

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.id = 0;
    this.pending = new Map();
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !this.pending.has(message.id)) return;
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      message.error ? reject(new Error(message.error.message)) : resolve(message.result);
    });
    await new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
}

(async () => {
  const tabs = await fetch(`${CDP_URL}/json/list`).then((res) => res.json());
  const tab = tabs.find((item) => item.type === "page" && item.url.startsWith("http://localhost:3000/"));
  const client = new CDPClient(tab.webSocketDebuggerUrl);
  await client.connect();
  await client.send("Runtime.enable");
  const result = await client.send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => ({
      href: location.href,
      width: innerWidth,
      buttons: Array.from(document.querySelectorAll('button')).map((button) => ({
        label: button.getAttribute('aria-label'),
        title: button.getAttribute('title'),
        text: button.textContent,
        rect: (() => { const rect = button.getBoundingClientRect(); return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }; })(),
        html: button.outerHTML.slice(0, 220)
      })),
      placeholders: Array.from(document.querySelectorAll('header div.h-10.w-10')).map((node) => node.outerHTML)
    }))()`,
  });
  console.log(JSON.stringify(result.result.value, null, 2));
  client.ws.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
