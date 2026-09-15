// Mobile fetches only the requested neighborhood, retaining the original WebP bytes.
export function createMobileFrameSource(manifest, signal) {
  const blobs = new Map(), requests = new Map();
  let center = 0, enabled = true;
  const source = async index => {
    signal.throwIfAborted();
    if (!enabled || Math.abs(index - center) > 12) throw new DOMException('Outside active story', 'AbortError');
    if (blobs.has(index)) return blobs.get(index);
    if (requests.has(index)) return requests.get(index).promise;
    const controller = new AbortController();
    const promise = (async () => {
      try {
        const response = await fetch(`${manifest.base}/${String(index).padStart(4, '0')}.webp`, {signal: controller.signal});
        if (!response.ok) throw Error(response.status);
        const blob = await response.blob();
        controller.signal.throwIfAborted();
        if (enabled && Math.abs(index - center) <= 12) blobs.set(index, blob);
        return blob;
      } finally { requests.delete(index); }
    })();
    requests.set(index, {controller, promise});
    return promise;
  };
  source.setWindow = (index, visible = true) => {
    center = index; enabled = visible;
    for (const [i, request] of requests) if (!visible || Math.abs(i - index) > 12) request.controller.abort();
    for (const i of blobs.keys()) if (!visible || Math.abs(i - index) > 12) blobs.delete(i);
  };
  signal.addEventListener('abort', () => source.setWindow(center, false), {once:true});
  return source;
}

export function createFrameSource(manifest, signal, {mobile = false} = {}) {
  if (mobile) return createMobileFrameSource(manifest, signal);
  // Retain compressed images; decoded bitmaps stay in the bounded story cache.
  const blobs = new Map(), waiting = new Map();
  const streams = manifest.streams ?? (manifest.stream ? [manifest.stream] : []);
  let finished = streams.length === 0;
  signal.addEventListener('abort', () => {
    blobs.clear();
    for (const resolve of waiting.values()) resolve(null);
    waiting.clear();
  }, {once: true});
  function release(index, blob) {
    blobs.set(index, blob);
    waiting.get(index)?.(blob);
    waiting.delete(index);
  }
  async function stream() {
    let reader;
    try {
      async function* chunks() {
        for (const url of streams) {
          const response = await fetch(url, {signal});
          if (!response.ok || !response.body) throw Error('Sequence stream unavailable');
          reader = response.body.getReader();
          while (true) {
            const {done, value} = await reader.read();
            if (done) break;
            yield value;
          }
          reader.releaseLock();
          reader = null;
        }
      }
      let buffer = new Uint8Array(), headerLength, sizes, index = 0;
      for await (const value of chunks()) {
        const next = new Uint8Array(buffer.length + value.length);
        next.set(buffer); next.set(value, buffer.length); buffer = next;
        if (headerLength === undefined && buffer.length >= 4) {
          headerLength = new DataView(buffer.buffer).getUint32(0, true);
          if (headerLength > 65536) throw Error('Invalid sequence header');
          buffer = buffer.slice(4);
        }
        if (!sizes && headerLength !== undefined && buffer.length >= headerLength) {
          sizes = JSON.parse(new TextDecoder().decode(buffer.subarray(0, headerLength)));
          if (!Array.isArray(sizes) || sizes.length !== manifest.count || sizes.some(size => !Number.isInteger(size) || size <= 0)) throw Error('Invalid sequence sizes');
          buffer = buffer.slice(headerLength);
        }
        while (sizes && index < sizes.length && buffer.length >= sizes[index]) {
          const size = sizes[index];
          release(index++, new Blob([buffer.slice(0, size)], {type: 'image/webp'}));
          buffer = buffer.slice(size);
        }
      }
    } catch {
      // Existing individual frames remain a fallback for interrupted or older deployments.
      await reader?.cancel().catch(() => {});
    } finally {
      finished = true;
      for (const resolve of waiting.values()) resolve(null);
      waiting.clear();
    }
  }
  if (streams.length) void stream();
  return async index => {
    signal.throwIfAborted();
    let blob = blobs.get(index);
    // A jump to the finale must not wait for every preceding frame to download.
    if (!blob && !finished) blob = await new Promise(resolve => {
      const timer = setTimeout(() => {waiting.delete(index); resolve(null);}, 600);
      waiting.set(index, value => {clearTimeout(timer); resolve(value);});
    });
    signal.throwIfAborted();
    if (blob) return blob;
    const response = await fetch(`${manifest.base}/${String(index).padStart(4, '0')}.webp`, {signal});
    if (!response.ok) throw Error(response.status);
    blob = await response.blob();
    blobs.set(index, blob);
    return blob;
  };
}
