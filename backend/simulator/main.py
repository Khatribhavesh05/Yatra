import asyncio
import httpx
import signal
import sys
from simulator.config import VEHICLES, INGEST_ENDPOINT, INTERVAL_SECONDS
from simulator.vehicle_sim import VehicleSimulator


async def run_simulator():
    print(f"[+] Starting EV Fleet Simulator with {len(VEHICLES)} vehicles")
    print(f"[+] Sending telemetry to {INGEST_ENDPOINT}")
    print(f"[+] Interval: {INTERVAL_SECONDS}s")
    print("Press Ctrl+C to stop\n")
    
    simulators = [VehicleSimulator(cfg) for cfg in VEHICLES]
    running = True
    
    def stop(sig, frame):
        nonlocal running
        print("\n[*] Stopping simulator...")
        running = False
    
    signal.signal(signal.SIGINT, stop)
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        tick = 0
        while running:
            tick += 1
            tasks = []
            for sim in simulators:
                payload = sim.tick()
                tasks.append(_send(client, payload))
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            ok = sum(1 for r in results if r is True)
            err = len(results) - ok
            print(f"  Tick {tick}: {ok} sent, {err} errors", end="\r")
            
            await asyncio.sleep(INTERVAL_SECONDS)
    
    print("\nSimulator stopped.")


async def _send(client: httpx.AsyncClient, payload: dict) -> bool:
    try:
        resp = await client.post(INGEST_ENDPOINT, json=payload)
        return resp.status_code in (200, 422, 201)  # allow 201 too if ingest creates resource
    except Exception:
        return False


def main():
    asyncio.run(run_simulator())


if __name__ == "__main__":
    main()
