/**
 * Embed metadata overlay on photo similar to uploaded image
 */
export async function embedMetadataOnPhoto(photoDataUrl, metadata) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                // Create canvas
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set canvas size to image size
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw original photo
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Add dark gradient overlays for better text visibility
                addOverlays(ctx, canvas.width, canvas.height);

                // Add metadata overlays
                addTopMetadata(ctx, canvas.width, metadata);
                addBottomMetadata(ctx, canvas.width, canvas.height, metadata);

                // Convert to data URL
                const finalPhoto = canvas.toDataURL('image/jpeg', 0.9);
                resolve(finalPhoto);
            } catch (error) {
                reject(error);
            }
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = photoDataUrl;
    });
}

function addOverlays(ctx, width, height) {
    // Bottom gradient (stronger for visibility)
    const bottomGradient = ctx.createLinearGradient(0, height - 250, 0, height);
    bottomGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    bottomGradient.addColorStop(0.3, 'rgba(0, 0, 0, 0.5)');
    bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, height - 250, width, 250);
}

function addTopMetadata(ctx, width, metadata) {
    // Removed top metadata to match professional style
}

function addBottomMetadata(ctx, width, height, metadata) {
    const padding = 20;
    const bottomY = height - 130; // Base line for metadata

    // 1. Two-column layout
    // Left: Map Placeholder
    // Right: Details

    const mapSize = 100;
    const mapX = padding;
    const mapY = height - mapSize - padding;

    // --- Map Placeholder (Simulated) ---
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(mapX, mapY, mapSize, mapSize);

    // Grid lines for map look
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i < 4; i++) {
        ctx.moveTo(mapX + i * 25, mapY);
        ctx.lineTo(mapX + i * 25, mapY + mapSize);
        ctx.moveTo(mapX, mapY + i * 25);
        ctx.lineTo(mapX + mapSize, mapY + i * 25);
    }
    ctx.stroke();

    // Map Pin
    ctx.fillStyle = '#ef4444'; // Red-500
    ctx.beginPath();
    ctx.arc(mapX + mapSize / 2, mapY + mapSize / 2 - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    // Pin triange
    ctx.beginPath();
    ctx.moveTo(mapX + mapSize / 2, mapY + mapSize / 2);
    ctx.lineTo(mapX + mapSize / 2 - 4, mapY + mapSize / 2 - 2);
    ctx.lineTo(mapX + mapSize / 2 + 4, mapY + mapSize / 2 - 2);
    ctx.fill();

    // --- Text Details (Right of Map) ---
    const textX = mapX + mapSize + 15;
    let currentY = mapY + 15;

    // Location Name (City/Area)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Inter, Roboto, Arial';
    const locationParts = (metadata.address || '').split(', ');
    const shortLocation = locationParts.length > 2 ? `${locationParts[1] || ''}, ${locationParts[locationParts.length - 1] || ''}` : metadata.address;
    ctx.fillText(shortenText(shortLocation, 25), textX, currentY);

    // Full Address
    currentY += 25;
    ctx.font = '14px Inter, Roboto, Arial';
    ctx.fillStyle = '#e5e7eb'; // Gray-200
    const addressLines = wrapText(metadata.address || 'Address unavailable', 45);
    addressLines.slice(0, 2).forEach((line, i) => {
        ctx.fillText(line, textX, currentY + (i * 18));
    });
    currentY += (addressLines.length > 0 ? addressLines.length * 18 : 18) + 10;

    // Lat / Long
    ctx.font = 'bold 13px Monospace';
    ctx.fillStyle = '#ffffff';
    const lat = typeof metadata.location.latitude === 'number' ? metadata.location.latitude : parseFloat(metadata.location.latitude);
    const lng = typeof metadata.location.longitude === 'number' ? metadata.location.longitude : parseFloat(metadata.location.longitude);
    const coords = `Lat ${lat.toFixed(6)}  Long ${lng.toFixed(6)}`;
    ctx.fillText(coords, textX, currentY);

    // Date & Time
    currentY += 20;
    const dateStr = formatDate(metadata.timestamp);
    const timeStr = formatTime(metadata.timestamp);
    ctx.font = '13px Inter, Roboto, Arial';
    ctx.fillStyle = '#d1d5db'; // Gray-300
    ctx.fillText(`${dateStr} ${timeStr} GMT+05:30`, textX, currentY);

    // --- Branding / Watermark ---
    // Right side or Background
    ctx.save();
    ctx.textAlign = 'right';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = 'bold italic 24px Arial';
    ctx.fillText('CITIZENZ', width - padding, mapY + 25);

    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText('GPS Map Camera', width - padding, mapY + 40);
    ctx.restore();
}

// Helper functions
function shortenText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

function wrapText(text, maxLength) {
    if (!text) return [];
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
        if ((currentLine + word).length > maxLength) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    });

    if (currentLine) lines.push(currentLine.trim());
    return lines;
}

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(date) {
    const d = new Date(date);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Polyfill for roundRect if not available
if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}
