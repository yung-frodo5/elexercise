// Web Bluetooth port of wattcycle_ble's WattcycleClient (client.py) --
// connection sequence, framing, and response reassembly are the same
// (see protocol.ts's header comment), swapping bleak for the browser's
// navigator.bluetooth GATT API.

import {
  AUTH_KEY,
  AUTH_UUID,
  DP_ANALOG_QUANTITY,
  DP_PRODUCT_INFO,
  FRAME_HEAD,
  FRAME_HEAD_ALT,
  NOTIFY_UUID,
  SERVICE_UUID,
  WRITE_UUID,
  buildReadFrame,
  expectedResponseLength,
  parseAnalogQuantity,
  parseFrame,
  type AnalogQuantity,
} from "./protocol";

export class WattcycleBleClient {
  private device: BluetoothDevice;
  private gattServer: BluetoothRemoteGATTServer | null = null;
  private writeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
  private frameHead: number = FRAME_HEAD;

  private responseBuffer: number[] = [];
  private expectedLength: number | null = null;
  private pendingResponse: { resolve: (data: Uint8Array | null) => void; timeoutId: ReturnType<typeof setTimeout> } | null = null;

  constructor(device: BluetoothDevice) {
    this.device = device;
  }

  static async requestDevice(bleDeviceName: string): Promise<WattcycleBleClient> {
    if (!navigator.bluetooth) {
      throw new Error("Web Bluetooth isn't supported in this browser -- try Chrome or Edge on desktop or Android.");
    }
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ name: bleDeviceName }],
      optionalServices: [SERVICE_UUID],
    });
    return new WattcycleBleClient(device);
  }

  get isConnected(): boolean {
    return this.gattServer?.connected ?? false;
  }

  onDisconnect(handler: () => void): void {
    this.device.addEventListener("gattserverdisconnected", handler);
  }

  async connect(): Promise<void> {
    if (!this.device.gatt) throw new Error("Device has no GATT server.");
    this.gattServer = await this.device.gatt.connect();

    const service = await this.gattServer.getPrimaryService(SERVICE_UUID);
    this.writeCharacteristic = await service.getCharacteristic(WRITE_UUID);
    const notifyCharacteristic = await service.getCharacteristic(NOTIFY_UUID);
    const authCharacteristic = await service.getCharacteristic(AUTH_UUID);

    await notifyCharacteristic.startNotifications();
    notifyCharacteristic.addEventListener("characteristicvaluechanged", this.handleNotification);

    // Cast: lib.dom's BufferSource requires an ArrayBuffer-backed view, but
    // TS's unparameterized `Uint8Array` return/param types widen to
    // ArrayBufferLike (which also covers SharedArrayBuffer) -- these are
    // always plain heap buffers at runtime, never shared.
    await authCharacteristic.writeValueWithoutResponse(AUTH_KEY as BufferSource);
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  disconnect(): void {
    this.device.gatt?.disconnect();
  }

  private handleNotification = (event: Event): void => {
    const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
    const value = characteristic.value;
    if (!value) return;

    for (let i = 0; i < value.byteLength; i++) {
      this.responseBuffer.push(value.getUint8(i));
    }

    if (this.expectedLength === null && this.responseBuffer.length >= 8) {
      this.expectedLength = expectedResponseLength(new Uint8Array(this.responseBuffer));
    }
    if (this.expectedLength !== null && this.responseBuffer.length >= this.expectedLength) {
      const response = new Uint8Array(this.responseBuffer);
      if (this.pendingResponse) {
        clearTimeout(this.pendingResponse.timeoutId);
        this.pendingResponse.resolve(response);
        this.pendingResponse = null;
      }
    }
  };

  private async sendCommand(cmd: Uint8Array, timeoutMs = 5000): Promise<Uint8Array | null> {
    if (!this.writeCharacteristic) throw new Error("Not connected.");
    this.responseBuffer = [];
    this.expectedLength = null;

    const responsePromise = new Promise<Uint8Array | null>((resolve) => {
      const timeoutId = setTimeout(() => {
        this.pendingResponse = null;
        resolve(null);
      }, timeoutMs);
      this.pendingResponse = { resolve, timeoutId };
    });

    await this.writeCharacteristic.writeValueWithoutResponse(cmd as BufferSource);
    return responsePromise;
  }

  /** Tries 0x7E then 0x1E (3s each) -- same detection sequence as the Python client. */
  async detectFrameHead(): Promise<boolean> {
    for (const head of [FRAME_HEAD, FRAME_HEAD_ALT]) {
      const cmd = buildReadFrame(DP_PRODUCT_INFO, head);
      const response = await this.sendCommand(cmd, 3000);
      if (response && response.length >= 11 && response[response.length - 1] === 0x0d) {
        this.frameHead = head;
        return true;
      }
    }
    return false;
  }

  async readAnalogQuantity(): Promise<AnalogQuantity | null> {
    const cmd = buildReadFrame(DP_ANALOG_QUANTITY, this.frameHead);
    const response = await this.sendCommand(cmd);
    if (!response) return null;
    const frame = parseFrame(response);
    if (!frame) return null;
    return parseAnalogQuantity(frame.data);
  }
}
