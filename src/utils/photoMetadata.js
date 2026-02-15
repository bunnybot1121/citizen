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
    // Top gradient (for location tag)
    const topGradient = ctx.createLinearGradient(0, 0, 0, 150);
    topGradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    topGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = topGradient;
    ctx.fillRect(0, 0, width, 150);

    // Bottom gradient (for details)
    const bottomGradient = ctx.createLinearGradient(0, height - 200, 0, height);
    bottomGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    bottomGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = bottomGradient;
    ctx.fillRect(0, height - 200, width, 200);
}

function addTopMetadata(ctx, width, metadata) {
    const padding = 30;
    const topY = 40;

    // Location tag with rounded background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(padding, topY, 200, 40, 20);
    } else {
        ctx.rect(padding, topY, 200, 40); // Fallback
    }
    ctx.fill();

    // Location icon (simplified)
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.fillText('📍', padding + 10, topY + 27);

    // Location name (shortened if too long)
    ctx.font = 'bold 14px Arial';
    ctx.fillStyle = '#ffffff';
    const locationText = shortenText(metadata.address ? metadata.address.split(',')[0] : 'Unknown Location', 20);
    ctx.fillText(locationText, padding + 40, topY + 27);

    // Mini map placeholder (small rectangle)
    ctx.fillStyle = 'rgba(100, 150, 255, 0.3)';
    ctx.fillRect(width - padding - 80, topY, 80, 60);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(width - padding - 80, topY, 80, 60);

    // Add location pin on mini map
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(width - padding - 40, topY + 30, 5, 0, Math.PI * 2);
    ctx.fill();
}

function addBottomMetadata(ctx, width, height, metadata) {
    const padding = 30;
    const bottomY = height - 150;

    // White rounded background for metadata
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(padding, bottomY, width - (padding * 2), 120, 20);
    } else {
        ctx.rect(padding, bottomY, width - (padding * 2), 120); // Fallback
    }
    ctx.fill();

    // Address icon + text
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('📍', padding + 20, bottomY + 30);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#000000';
    const addressLines = wrapText(metadata.address || 'Address unavailable', 40);
    addressLines.slice(0, 2).forEach((line, i) => {
        ctx.fillText(line, padding + 50, bottomY + 28 + (i * 20));
    });

    // Timestamp section
    const timestampY = bottomY + 75;

    // Date
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 11px Arial';
    ctx.fillText('📅', padding + 20, timestampY);
    ctx.font = '12px Arial';
    const dateStr = formatDate(metadata.timestamp);
    ctx.fillText(dateStr, padding + 45, timestampY);

    // Time
    const timeX = width / 2 - 50;
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 11px Arial';
    ctx.fillText('🕐', timeX, timestampY);
    ctx.font = 'bold 16px Arial';
    const timeStr = formatTime(metadata.timestamp);
    ctx.fillText(timeStr, timeX + 30, timestampY);

    // Coordinates
    const coordY = bottomY + 100;
    ctx.fillStyle = '#666666';
    ctx.font = '10px Arial';
    const coordText = `Lat: ${metadata.location.latitude.toFixed(6)}  Long: ${metadata.location.longitude.toFixed(6)}`;
    ctx.fillText(coordText, padding + 20, coordY);

    // Accuracy badge
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 10px Arial';
    const accuracyText = `±${Math.round(metadata.location.accuracy)}m`;
    ctx.fillText(accuracyText, width - padding - 80, coordY);

    // "NAGARSEVAK" watermark
    ctx.save();
    ctx.translate(width - padding - 100, bottomY + 40);
    ctx.rotate(-Math.PI / 12);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.15)';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('NAGARSEVAK', 0, 0);
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
