import { WSEvent } from '../../types';

let webSocket: WebSocket = null;

interface Props {
  url: string;
  protocols?: string;
  children: JSX.Element;
}
type Listener = (message: WSEvent) => boolean;
const listeners: Listener[] = [];

export function WebSocketProvider(props: Props): JSX.Element {
  if (webSocket === null) {
    webSocket = new WebSocket(`ws://${props.url}`, props.protocols);
    webSocket.onmessage = (event: MessageEvent) => {
      try {
        const json: WSEvent = JSON.parse(event.data);
        for (const listener of listeners) {
          if (listener(json)) {
            break;
          }
        }
      } catch (e) {}
    };
  }
  return props.children;
}

export function useWebsocket() {
  const { send, close } = webSocket;
  const addListener = (listener: Listener) => listeners.push(listener);

  return { send, close, addListener };
}
