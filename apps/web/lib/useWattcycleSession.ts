"use client";

import { useCallback, useRef, useState } from "react";
import { endSession, getMachineByScanToken, postPowerSample, startMachineSession } from "./api";
import { WattcycleBleClient } from "./wattcycle/bleClient";

export type WattcycleStatus = "idle" | "looking-up" | "connecting" | "streaming" | "disconnected" | "error";

const POLL_INTERVAL_MS = 500;

export function useWattcycleSession(accessToken: string | undefined) {
  const [status, setStatus] = useState<WattcycleStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const clientRef = useRef<WattcycleBleClient | null>(null);
  const runningRef = useRef(false);
  const sessionIdRef = useRef<string | null>(null);

  const stopPolling = useCallback(() => {
    runningRef.current = false;
    clientRef.current?.disconnect();
    clientRef.current = null;
  }, []);

  const poll = useCallback(async (client: WattcycleBleClient, sid: string, streamStart: number, token: string) => {
    while (runningRef.current) {
      try {
        const data = await client.readAnalogQuantity();
        if (data) {
          const powerW = Math.abs(data.moduleVoltage * data.current);
          const tMs = Math.round(performance.now() - streamStart);
          await postPowerSample(token, sid, tMs, powerW);
        }
      } catch (err) {
        console.error("wattcycle poll error:", err);
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }, []);

  const connect = useCallback(
    async (scanToken: string) => {
      if (!accessToken) return;
      setError(null);
      setStatus("looking-up");

      let client: WattcycleBleClient | null = null;
      try {
        const machine = await getMachineByScanToken(accessToken, scanToken);
        if (!machine.bleDeviceName) {
          throw new Error(`${machine.model || "This machine"} isn't set up for a real Bluetooth connection.`);
        }

        // Known hardware quirk (WattCycle rig specifically): connecting over
        // BLE resets the battery's charge/discharge switch to its default
        // (discharge ON), which feeds power back into the generator and
        // spins it. There's no write support for that switch anywhere in
        // this connect flow (undocumented payload, see PROTOCOL.md at
        // https://github.com/qume/wattcycle_ble) -- turn discharge off
        // manually via the vendor phone app after each connect.
        setStatus("connecting");
        client = await WattcycleBleClient.requestDevice(machine.bleDeviceName);
        client.onDisconnect(() => {
          // Unexpected drop (out of range, powered off) -- if we're not
          // already mid-Stop (which clears clientRef itself), reflect it.
          if (clientRef.current === client) {
            runningRef.current = false;
            clientRef.current = null;
            setStatus("disconnected");
          }
        });

        await client.connect();
        const headDetected = await client.detectFrameHead();
        if (!headDetected) {
          throw new Error("Connected, but couldn't communicate with the machine -- check it's powered on.");
        }

        const { session } = await startMachineSession(accessToken, scanToken);

        clientRef.current = client;
        sessionIdRef.current = session.id;
        setSessionId(session.id);
        setStatus("streaming");

        runningRef.current = true;
        void poll(client, session.id, performance.now(), accessToken);
      } catch (err) {
        client?.disconnect();
        const message = err instanceof Error ? err.message : "Failed to connect to machine";
        setStatus("error");
        setError(message);
        throw new Error(message);
      }
    },
    [accessToken, poll]
  );

  const stop = useCallback(async () => {
    stopPolling();
    const endingSessionId = sessionIdRef.current;
    sessionIdRef.current = null;
    setSessionId(null);
    setStatus("idle");

    if (endingSessionId && accessToken) {
      await endSession(accessToken, endingSessionId);
    }
  }, [accessToken, stopPolling]);

  return { status, error, sessionId, connect, stop };
}
