import { createHash, randomUUID } from "node:crypto";
import { createClient } from "redis";

// Compartilha notificações entre réplicas que atendem a mesma base.
// A entrega ao cliente local continua disponível durante uma reconexão.
export function createRealtimeBridge({url, database, deliver, connect = createClient}) {
  if (!url) return null;
  const channel = "steelcontrol:realtime:" + createHash("sha256").update(database).digest("hex");
  const origin = randomUUID();
  const publisher = connect({url, disableOfflineQueue: true});
  const subscriber = publisher.duplicate();
  let stopped = false;
  for (const client of [publisher, subscriber]) client.on("error", () => {});
  async function start() {
    await Promise.all([publisher.connect(), subscriber.connect()]);
    if (stopped) return;
    await subscriber.subscribe(channel, raw => {
      let msg;
      try { msg = JSON.parse(raw); } catch { return; }
      if (!msg || msg.origin === origin || !/^(empresa|maquina):[1-9]\d*$/.test(msg.topic) ||
          typeof msg.event?.tipo !== "string") return;
      deliver(msg.topic, msg.event);
    });
  }
  return {
    start,
    publish(topic, event) {
      if (!stopped && publisher.isReady) {
        publisher.publish(channel, JSON.stringify({origin,topic,event})).catch(() => {});
      }
    },
    close() {
      stopped = true;
      for (const client of [subscriber,publisher]) if (client.isOpen) client.destroy();
    }
  };
}
