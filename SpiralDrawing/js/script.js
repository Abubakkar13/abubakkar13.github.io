const canvas = document.getElementById('mandalaCanvas');
        const ctx = canvas.getContext('2d');

        const axesSelector = document.getElementById('axesSelector');
        const brushSizeSlider = document.getElementById('brushSizeSlider');
        const brushSizeValueSpan = document.getElementById('brushSizeValue');
        const undoButton = document.getElementById('undoButton');
        const clearButton = document.getElementById('clearButton');
        const exportPngButton = document.getElementById('exportPngButton');
        const exportTransparentPngButton = document.getElementById('exportTransparentPngButton');

        let isDrawing = false;
        let currentBrushSize = 5;
        let numAxes = 6;

        let strokes = []; // Array of stroke objects: { points: [{x, y}, ...], brushSize: size }
        let currentStroke = null; // { points: [], brushSize: 0 }

        // --- Setup ---
        function setupCanvas() {
            const dpr = window.devicePixelRatio || 1;

            // Set canvas physical pixel size
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            // Set canvas logical CSS size
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';

            // Scale the context to draw in logical pixels
            ctx.scale(dpr, dpr);

            // Set default line styles (will be applied to logical units)
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            redrawCanvas();
        }

        // --- Drawing Logic ---
        function rotatePoint(point, angle) {
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            return {
                x: point.x * cosA - point.y * sinA,
                y: point.x * sinA + point.y * cosA
            };
        }

        function drawMirroredSegments(targetContext, p1, p2, brushSize, color, axesCount) {
            // Center calculation based on logical canvas dimensions
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            targetContext.strokeStyle = color;
            targetContext.lineWidth = brushSize;

            // Original points relative to center
            const p1_orig_center = { x: p1.x - centerX, y: p1.y - centerY };
            const p2_orig_center = { x: p2.x - centerX, y: p2.y - centerY };

            // Reflected points (across local X-axis of the segment before rotation)
            const p1_refl_center = { x: p1_orig_center.x, y: -p1_orig_center.y };
            const p2_refl_center = { x: p2_orig_center.x, y: -p2_orig_center.y };

            for (let i = 0; i < axesCount; i++) {
                const angle = (Math.PI * 2 / axesCount) * i;

                // Rotate original segment
                const p1_rot = rotatePoint(p1_orig_center, angle);
                const p2_rot = rotatePoint(p2_orig_center, angle);

                targetContext.beginPath();
                targetContext.moveTo(p1_rot.x + centerX, p1_rot.y + centerY);
                targetContext.lineTo(p2_rot.x + centerX, p2_rot.y + centerY);
                targetContext.stroke();

                // Rotate reflected segment
                if (axesCount > 0) { // Should always be true based on selector
                    const p1_refl_rot = rotatePoint(p1_refl_center, angle);
                    const p2_refl_rot = rotatePoint(p2_refl_center, angle);

                    targetContext.beginPath();
                    targetContext.moveTo(p1_refl_rot.x + centerX, p1_refl_rot.y + centerY);
                    targetContext.lineTo(p2_refl_rot.x + centerX, p2_refl_rot.y + centerY);
                    targetContext.stroke();
                }
            }
        }

        function drawGuides(targetContext, axesCount) {
            if (axesCount <= 0) return;
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            const radius = Math.max(centerX, centerY) * 1.5;

            targetContext.save();
            targetContext.strokeStyle = 'rgba(200, 200, 200, 0.7)';
            targetContext.lineWidth = 0.5; // Thin logical pixels for guides
            targetContext.setLineDash([4, 4]);

            for (let i = 0; i < axesCount; i++) {
                const angle = (Math.PI * 2 / axesCount) * i;
                targetContext.beginPath();
                targetContext.moveTo(centerX, centerY);
                targetContext.lineTo(
                    centerX + radius * Math.cos(angle),
                    centerY + radius * Math.sin(angle)
                );
                targetContext.stroke();
            }
            targetContext.restore();
        }

        function redrawCanvas() {
            // Clear canvas using logical coordinates
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            drawGuides(ctx, numAxes);

            // Redraw all committed strokes
            strokes.forEach(stroke => {
                if (stroke.points.length < 2 && stroke.points.length > 0) { // Draw single point as a small circle
                     drawMirroredSegments(ctx, stroke.points[0], stroke.points[0], stroke.brushSize, 'black', numAxes);
                } else {
                    for (let i = 1; i < stroke.points.length; i++) {
                        drawMirroredSegments(ctx, stroke.points[i-1], stroke.points[i], stroke.brushSize, 'black', numAxes);
                    }
                }
            });

            // Draw current stroke in progress
            if (isDrawing && currentStroke && currentStroke.points.length > 0) {
                 if (currentStroke.points.length < 2) { // Draw single point as a small circle
                     drawMirroredSegments(ctx, currentStroke.points[0], currentStroke.points[0], currentStroke.brushSize, 'black', numAxes);
                 } else {
                    for (let i = 1; i < currentStroke.points.length; i++) {
                        drawMirroredSegments(ctx, currentStroke.points[i-1], currentStroke.points[i], currentStroke.brushSize, 'black', numAxes);
                    }
                 }
            }
        }

        // --- Event Handlers ---
        function getPointerPos(evt) {
            const rect = canvas.getBoundingClientRect(); // rect is in CSS pixels
            let clientX, clientY;
            if (evt.touches && evt.touches.length > 0) {
                clientX = evt.touches[0].clientX;
                clientY = evt.touches[0].clientY;
            } else {
                clientX = evt.clientX;
                clientY = evt.clientY;
            }
            // Returned coordinates are in CSS pixels, matching logical canvas coordinates
            return {
                x: clientX - rect.left,
                y: clientY - rect.top
            };
        }

        function startDraw(evt) {
            // evt.preventDefault(); // Already handled by touch-action CSS for scrolling/zooming
            if (evt.type === 'touchstart') evt.preventDefault(); // Specifically for touchstart to prevent canvas drag on some devices

            isDrawing = true;
            const pos = getPointerPos(evt);
            currentStroke = { points: [pos], brushSize: currentBrushSize };
            redrawCanvas(); // Draw the first dot immediately
        }

        function draw(evt) {
            if (!isDrawing) return;
            // evt.preventDefault();
            if (evt.type === 'touchmove') evt.preventDefault();

            const pos = getPointerPos(evt);
            currentStroke.points.push(pos);
            redrawCanvas(); // Redraw on every point for live feedback
        }

        function endDraw(evt) {
            if (!isDrawing) return;
            // evt.preventDefault();
            if (evt.type === 'touchend' || evt.type === 'touchcancel') evt.preventDefault();

            isDrawing = false;
            if (currentStroke && currentStroke.points.length > 0) {
                strokes.push(currentStroke);
            }
            currentStroke = null;
            // redrawCanvas(); // Already drawn in draw() or startDraw()
        }

        // --- Controls Handlers ---
        axesSelector.addEventListener('change', (e) => {
            numAxes = parseInt(e.target.value);
            redrawCanvas();
        });

        brushSizeSlider.addEventListener('input', (e) => {
            currentBrushSize = parseInt(e.target.value);
            brushSizeValueSpan.textContent = currentBrushSize;
        });

        clearButton.addEventListener('click', () => {
            strokes = [];
            currentStroke = null;
            redrawCanvas();
        });

        undoButton.addEventListener('click', () => {
            if (strokes.length > 0) {
                strokes.pop();
                redrawCanvas();
            }
        });

        function exportCanvasImage(transparentBg) {
            const exportCanvas = document.createElement('canvas');
            const exportCtx = exportCanvas.getContext('2d');
            const dpr = window.devicePixelRatio || 1;

            // Set export canvas dimensions based on logical size * DPR for high-res
            exportCanvas.width = window.innerWidth * dpr;
            exportCanvas.height = window.innerHeight * dpr;

            exportCtx.scale(dpr, dpr); // Scale context to draw with logical coordinates

            if (!transparentBg) {
                exportCtx.fillStyle = 'white';
                exportCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);
            }
            // Guides are not drawn on export

            exportCtx.lineCap = 'round';
            exportCtx.lineJoin = 'round';

            strokes.forEach(stroke => {
                 if (stroke.points.length < 2 && stroke.points.length > 0) {
                     drawMirroredSegments(exportCtx, stroke.points[0], stroke.points[0], stroke.brushSize, 'black', numAxes);
                } else {
                    for (let i = 1; i < stroke.points.length; i++) {
                        drawMirroredSegments(exportCtx, stroke.points[i-1], stroke.points[i], stroke.brushSize, 'black', numAxes);
                    }
                }
            });

            const dataURL = exportCanvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.download = transparentBg ? 'mandala_transparent.png' : 'mandala.png';
            link.href = dataURL;
            document.body.appendChild(link); // Required for Firefox
            link.click();
            document.body.removeChild(link);
        }

        exportPngButton.addEventListener('click', () => exportCanvasImage(false));
        exportTransparentPngButton.addEventListener('click', () => exportCanvasImage(true));

        // --- Initialize ---
        window.addEventListener('resize', setupCanvas);

        // Mouse events
        canvas.addEventListener('mousedown', startDraw);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', endDraw);
        canvas.addEventListener('mouseleave', endDraw); // Stop drawing if mouse leaves canvas

        // Touch events
        // passive: false is important to allow preventDefault() for touchmove/start
        canvas.addEventListener('touchstart', startDraw, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', endDraw, { passive: false });
        canvas.addEventListener('touchcancel', endDraw, { passive: false });


        // Initial setup values from controls
        numAxes = parseInt(axesSelector.value);
        currentBrushSize = parseInt(brushSizeSlider.value);
        brushSizeValueSpan.textContent = currentBrushSize;

        setupCanvas(); // Initial canvas setup and first draw