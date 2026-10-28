# IoT Live Map

A Node.js gateway simulates 8 devices behind an unreliable network (delays, duplicates, reboots, offline periods). A React client draws them on a canvas in real time. It stays correct when messages arrive late or twice, stays smooth at 600+ msg/s, throttles per client and resumes after a reconnect without losing the gap.

## Stack

TypeScript everywhere, in an npm workspaces monorepo (`client`, `server`, `shared`). **Client:** React and Vite, canvas for the map and chart, CSS Modules.
**Server:** Node.js, Express and `ws`.
**Tests:** Vitest.

## Run

Requires Node 22+.

```bash
npm install
npm run dev        # gateway on :4000, client on http://localhost:5173
npm test           # unit tests for ordering / reconciliation
npm run typecheck
```

The client reaches the gateway through the Vite proxy, so no CORS setup is needed.

## Try it

**In the UI (Debug panel):**
- **Stress mode** toggle: about 650 msg/s in total.
- **Max Hz per device** slider: 1–30 Hz, the last position means no limit. It sends `subscribe` over the socket.
- **Drop all connections**: the server closes every socket, and the client reconnects and resumes.
- **Disconnect / Connect**: closes the socket without a reconnect, to test a long gap.

**Over HTTP:**

```bash
curl -X POST localhost:4000/debug/stress -H 'Content-Type: application/json' -d '{"enabled":true}'
curl -X POST localhost:4000/debug/drop-connections
curl -X POST localhost:4000/debug/chaos -H 'Content-Type: application/json' -d '{"delayProbability":0.5,"duplicateProbability":0.1}'
curl localhost:4000/debug/status   # sessions, maxHz, buffered bytes, coalesced states
```

**Resume, step by step:**
- **Short gap:** press "Drop all connections". In the overlay, *Replayed devices* grows, and the chart has no hole.
- **Long gap:** press "Disconnect", wait more than 10 s, press "Connect". *Resynced devices* grows instead.

**Env vars** (defaults): `PORT` (4000), `DEVICE_COUNT` (8), `STRESS` (false), `CHAOS_DELAY_PROBABILITY` (0.3), `CHAOS_MIN_DELAY_MS` (100), `CHAOS_MAX_DELAY_MS` (3000), `CHAOS_DUPLICATE_PROBABILITY` (0.05).

## How it works

```
devices ─► chaos ─┬─► gateway (latest state) ─► session per client ─► stateThrottle + outbox ──ws──►
                  └─► history (per device, for resume)

──► wsClient (backoff, watchdog) ─► store (reconcile, outside React) ─► one rAF loop ─► map, chart, overlay
```

- **`shared/`** holds the protocol types and `reconcile.ts`, the ordering rules used by both sides.
- **`server/`** follows models / services / views / controllers. Every instance is created in `app.ts` and passed down.
- **`client/`** is feature-sliced: `live-map`, `device-panel`, `diagnostics-overlay`, `connection-status`, `debug-controls`. The socket and the store are plain services created in `index.tsx` and injected through Context.

**Protocol:**
1. The client connects and sends `hello { subscription, lastSeen }`.
2. The server answers with `resume { snapshot, replay }` and then streams live `state` and `event` messages.
3. When the slider changes, the client sends `subscribe { deviceIds, maxHz }`.
4. The server sends a `heartbeat` every second.

## Decisions

### 1. Ordering: trust `(bootId, seq)` only

A message is newer if its `bootId` is higher, or if `bootId` is equal and `seq` is higher. A reboot raises `bootId` and restarts `seq` at 0. A message is identified by its `bootId` and `seq` together, e.g. boot 2, seq 17.

- **Device `ts` is not used for ordering.** Each device has its own clock offset. `ts` is only displayed and used to place points along one device's own track.
- **Server receive time is not used for ordering.** It measures network delay, not emission order.
- **Local receive time is used only for liveness.** It is the one clock the client controls.

Every message (live, snapshot or replay) goes through the same `reconcile`:

| Incoming message                     | What the client does                      |
|--------------------------------------|-------------------------------------------|
| Same `bootId` and `seq` pair already received | Dropped, counted as *duplicate*  |
| State newer than the current one     | Shown: the latest state wins              |
| Older state from the same boot       | Dropped, counted as *out of order*        |
| State from a previous boot           | Dropped, counted as *stale boot*          |
| Any new event, even a late one       | Kept, inserted in `(bootId, seq)` order   |

As a result, stale data is never shown as current, whatever order the network delivers it in.

### 2. Reconnect gap: hold the last position, never guess

- **While silent:** the dot stays at its last real position. It turns **stale** (2–10 s, faded, "4.2s ago") and then **offline** (more than 10 s, hollow grey). I don't extrapolate, because the real path is unknown.
- **When the device returns or reboots:** the dot **jumps** to the new position with a short pulse. It does not glide across the gap.
- **Between normal updates:** the map draws each device about 350 ms in the past and interpolates between two real points. Chaos makes arrivals irregular, and without this buffer about 19% of frames showed a stuck dot (now 1–2%). At a low maxHz the delay grows (`350 ms + 1000 / maxHz`), and a line under the slider tells the user. This delay applies only to the map: the chart and the event list update as soon as data arrives, and the device details (value, status, battery) refresh 4 times per second.
- **A silent device and a lost connection look different.** If the connection is lost, the header shows "Connection lost · retry in 0.4s", the map dims, and all devices turn **unknown** instead of offline: silence means nothing when we can't hear.
- **Reconnect:** exponential backoff (500 ms × 2ⁿ, up to 10 s) with jitter. It happens at once when the tab becomes visible or the network comes back. A heartbeat watchdog (4 s) catches a socket that looks open but is dead.

### 3. What to drop under load

| Data                         | Under load                                          |
|------------------------------|-----------------------------------------------------|
| States (position, sensor)    | Coalesced per device: only the latest one is kept   |
| Events (low battery, alert)  | Never dropped, never throttled, on either side      |

**Throttling happens on both sides, for different reasons:**
- **The server limits bandwidth.** Each client has a `stateThrottle` that keeps the newest state per device and flushes at most `maxHz` per device. In stress mode at 5 Hz the client gets about 30 msg/s instead of 650.
- **The client limits rendering.** Messages go into a mutable store outside React, and one `requestAnimationFrame` loop draws the map and chart once per frame. States overwritten before a frame are counted as *coalesced*. The UI holds 60 fps in stress mode.
- **The map and chart don't go through React.** React only mounts the `<canvas>`. A hook subscribes to the frame loop and draws the canvas directly from the store, so a message never triggers a React re-render.
- **The event list re-renders only on a new event.** The store notifies subscribers when a device gets an event, and the list reads it through `useSyncExternalStore`. The "new event" highlight is a CSS animation, so no timer is needed.

**No message batching on either side**: throttling and coalescing already bound the data, and requestAnimationFrame already draws once per frame, so batching would only add latency.

**Slow clients can't grow server memory.** While a socket buffer is above 512 KB, states stay in the throttle (one per device) and events wait in a queue capped at 1000. If that queue overflows, the server closes the socket with `4008 slow consumer`, and the client reconnects and resumes. The missed events come back through replay if the gap still fits in the history (Decision 4). Otherwise the device is resynced from a snapshot, the events in that gap are lost, and the overlay counts it under *Resynced devices*. Events are never dropped silently.

### 4. Resume vs. snapshot

The server keeps a history of up to 300 messages or 10 s per device. On `hello` it decides per device:

| Situation                                     | Server sends                              |
|-----------------------------------------------|-------------------------------------------|
| The client has never seen this device         | Snapshot entry                            |
| History still reaches the client's `lastSeen` | Replay of everything newer, events in full |
| The gap is older than the history             | Snapshot entry with the fresh state       |

**The cutoff is "does the gap still fit in the history".** Replay is lossless and cheap, so it is used whenever possible. The snapshot is the honest fallback: the picture becomes current again, but events inside a gap that is too long are lost.

### 5. Real mesh

Here one server (the gateway) sits between the devices and the clients and keeps the latest state and a short history. Without it, the client logic still works: ordering by `(bootId, seq)` and dropping duplicates don't depend on where a message came from, so data from several peers merges safely. What breaks is what only the server holds. The snapshot and the history for resume would have to live on every node, and a reconnecting client would ask the nodes it can reach for its gap. `bootId` would have to be stored on the device itself, because no server hands it out.

## Tests

`shared/src/utils/reconcile.test.ts` covers duplicates, out-of-order states, a seq gap, reboot, late events and the duplicate window. I tested only the major calculation logic (the ordering and reconciliation rules), because everything else depends on it. The rest of the client and server code is not covered by automated tests (see the list below).

## Might be enhanced with more time

- **Unit tests for the client logic**: interpolation, render delay, chart samples. Plus one e2e test (drop → resume).
- **A device filter** in the UI that subscribes only to the chosen devices.
- **Movement trails**: a fading line behind each dot showing its path over the last few seconds.
- **Skip timer re-renders**: the device details, the connection badge and the diagnostics overlay re-read the store on a timer, because statuses change with time. They re-render on every tick, even after Disconnect, and should update state only when the value differs.
- **Smaller re-render cases**, not worth it at this scale: picking a device re-renders the whole sidebar, and the debug controls re-render on every status change during a reconnect.
