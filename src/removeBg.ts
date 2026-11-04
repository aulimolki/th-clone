// Lightweight client-side background removal via canvas flood fill from the image edges.
// No external dependencies; tolerance is 0–255 color distance.

export function removeBackground(dataUrl: string, tolerance = 32): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const w = canvas.width;
        const h = canvas.height;

        // Flood fill from all edge pixels using BFS; mark visited via alpha=0 sentinel.
        const visited = new Uint8Array(w * h);
        const queue: number[] = [];

        const colorDist = (i: number, r: number, g: number, b: number) => {
          const dr = data[i] - r;
          const dg = data[i + 1] - g;
          const db = data[i + 2] - b;
          return Math.sqrt(dr * dr + dg * dg + db * db);
        };

        // Seed all edge pixels
        const pushEdge = (x: number, y: number) => {
          const idx = y * w + x;
          if (visited[idx]) return;
          visited[idx] = 1;
          queue.push(idx);
        };
        for (let x = 0; x < w; x++) {
          pushEdge(x, 0);
          pushEdge(x, h - 1);
        }
        for (let y = 0; y < h; y++) {
          pushEdge(0, y);
          pushEdge(w - 1, y);
        }

        // Process in waves so the seed color adapts as we go.
        let head = 0;
        while (head < queue.length) {
          const idx = queue[head++];
          const px = idx % w;
          const py = Math.floor(idx / w);
          const di = idx * 4;
          const seed = [data[di], data[di + 1], data[di + 2]];

          // Set transparent
          data[di + 3] = 0;

          // 4-neighbors
          const neighbors = [
            px > 0 ? idx - 1 : -1,
            px < w - 1 ? idx + 1 : -1,
            py > 0 ? idx - w : -1,
            py < h - 1 ? idx + w : -1,
          ];
          for (const nIdx of neighbors) {
            if (nIdx < 0 || visited[nIdx]) continue;
            const ni = nIdx * 4;
            if (colorDist(ni, seed[0], seed[1], seed[2]) <= tolerance) {
              visited[nIdx] = 1;
              queue.push(nIdx);
            }
          }
        }

        // Also clean up near-transparent feathering for smoother edges
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 16) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}
