import serialport from 'serialport';

export async function findSerialPort(): Promise<string> {
  try {
    const ports = await serialport.list();
    const port = ports.find(item => item.manufacturer === 'Texas Instruments');
    if (port) {
      return port.path;
    }
  } catch (e) {
    throw new Error(`Unable to get serial port list (${e})`);
  }
  throw new Error('Unable to find ZigBee port');
}
