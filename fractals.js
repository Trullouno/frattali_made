// Wrap everything in an IIFE to avoid global scope pollution
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        try {
            // Get canvas elements and contexts
            const mandelbrotCanvas = document.getElementById('mandelbrotCanvas');
            const kochCurveCanvas = document.getElementById('kochCurveCanvas');
            const kochSnowflakeCanvas = document.getElementById('kochSnowflakeCanvas');
            const kochInvertedCanvas = document.getElementById('kochInvertedCanvas');
            const sierpinskiCanvas = document.getElementById('sierpinskiCanvas');    
            // Get iteration value displays
            const kochCurveIterationsValue = document.querySelector('#kochCurveIterations').previousElementSibling;
            const kochSnowflakeIterationsValue = document.querySelector('#kochSnowflakeIterations').previousElementSibling;
            const kochInvertedIterationsValue = document.querySelector('#kochInvertedIterations').previousElementSibling;
            const sierpinskiIterationsValue = document.querySelector('#sierpinskiIterations').previousElementSibling;
            const mandelbrotIterationsValue = document.querySelector('#mandelbrotIterations').previousElementSibling;
            
            const mandelbrotCtx = mandelbrotCanvas.getContext('2d');
            const kochCurveCtx = kochCurveCanvas.getContext('2d');
            const kochSnowflakeCtx = kochSnowflakeCanvas.getContext('2d');
            const kochInvertedCtx = kochInvertedCanvas.getContext('2d');
            const sierpinskiCtx = sierpinskiCanvas.getContext('2d');    
            // Track if each fractal has been rendered
            let mandelbrotRendered = false;
            let kochCurveRendered = false;
            let kochSnowflakeRendered = false;
            let kochInvertedRendered = false;
            let sierpinskiRendered = false;    
            // Function to mark canvas as rendered
            function markAsRendered(canvas) {
                canvas.closest('.fractal-canvas-container').classList.add('rendered');
            }

            // Common configuration
            const canvasConfig = {
                get width() {
                    return mandelbrotCanvas.width;
                },
                get height() {
                    return mandelbrotCanvas.height;
                }
            };
            
            // Initialize all configurations
            let mandelbrotConfig = {
                x: -2.5,
                y: -1.5,
                scale: 3,
                maxIterations: 100
            };
            
            let kochCurveConfig = {
                iterations: 4,
                scale: 1,
                x: 0,
                y: 0,
                zoomAreaX: 0,
                zoomAreaY: 0,
                isDraggingZoom: false
            };

            let kochSnowflakeConfig = {
                iterations: 4,
                scale: 1,
                x: 0,
                y: 0,
                zoomAreaX: 0,
                zoomAreaY: 0,
                isDraggingZoom: false
            };

            let kochInvertedConfig = {
                iterations: 4,
                scale: 1,
                x: 0,
                y: 0,
                zoomAreaX: 0,
                zoomAreaY: 0,
                isDraggingZoom: false
            };    let sierpinskiConfig = {
                iterations: 4
            };

            // Sierpinski Triangle rendering
            function drawSierpinski(x1, y1, x2, y2, x3, y3, iterations) {
                if (iterations === 0) {
                    sierpinskiCtx.beginPath();
                    sierpinskiCtx.moveTo(x1, y1);
                    sierpinskiCtx.lineTo(x2, y2);
                    sierpinskiCtx.lineTo(x3, y3);
                    sierpinskiCtx.closePath();
                    sierpinskiCtx.stroke();
                    return;
                }

                const mid1x = (x1 + x2) / 2;
                const mid1y = (y1 + y2) / 2;
                const mid2x = (x2 + x3) / 2;
                const mid2y = (y2 + y3) / 2;
                const mid3x = (x3 + x1) / 2;
                const mid3y = (y3 + y1) / 2;

                drawSierpinski(x1, y1, mid1x, mid1y, mid3x, mid3y, iterations - 1);
                drawSierpinski(mid1x, mid1y, x2, y2, mid2x, mid2y, iterations - 1);
                drawSierpinski(mid3x, mid3y, mid2x, mid2y, x3, y3, iterations - 1);
            }

            function drawKochLine(x1, y1, x2, y2, iterations, ctx) {
                if (iterations === 0) {
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                    return;
                }

                const dx = x2 - x1;
                const dy = y2 - y1;
                const length = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                const x3 = x1 + dx / 3;
                const y3 = y1 + dy / 3;
                const x4 = x2 - dx / 3;
                const y4 = y2 - dy / 3;

                const x5 = x3 + Math.cos(angle - Math.PI / 3) * length / 3;
                const y5 = y3 + Math.sin(angle - Math.PI / 3) * length / 3;

                drawKochLine(x1, y1, x3, y3, iterations - 1, ctx);
                drawKochLine(x3, y3, x5, y5, iterations - 1, ctx);
                drawKochLine(x5, y5, x4, y4, iterations - 1, ctx);
                drawKochLine(x4, y4, x2, y2, iterations - 1, ctx);
            }

            function drawKochSnowflake(x, y, size, iterations, inverted = false, ctx) {
                const height = size * Math.sqrt(3) / 2;
                
                // Calculate the three points of the equilateral triangle
                const x1 = x;
                const y1 = y;
                const x2 = x + size;
                const y2 = y;
                const x3 = x + size / 2;
                const y3 = inverted ? y - height : y + height;

                // Draw the three sides of the snowflake
                drawKochLine(x1, y1, x2, y2, iterations, ctx);
                drawKochLine(x2, y2, x3, y3, iterations, ctx);
                drawKochLine(x3, y3, x1, y1, iterations, ctx);
            }

            function renderSierpinski() {
                const width = sierpinskiCanvas.width;
                const height = sierpinskiCanvas.height;
                const dpr = window.devicePixelRatio || 1;
                
                sierpinskiCtx.clearRect(0, 0, width, height);
                sierpinskiCtx.strokeStyle = '#000000';
                sierpinskiCtx.lineWidth = 1;

                // Calculate the size to maintain aspect ratio
                const size = Math.min(width, height) * 0.8;
                
                // Calculate triangle points, accounting for dpr
                const x1 = width / (2 * dpr);
                const y1 = (height - size) / (2 * dpr);
                const x2 = (width - size) / (2 * dpr);
                const y2 = (height + size) / (2 * dpr);
                const x3 = (width + size) / (2 * dpr);
                const y3 = (height + size) / (2 * dpr);

                drawSierpinski(x1, y1, x2, y2, x3, y3, sierpinskiConfig.iterations);
            }

            // Event listeners for Sierpinski controls
            document.getElementById('sierpinskiIterations').addEventListener('input', function() {
                sierpinskiConfig.iterations = parseInt(this.value);
                sierpinskiIterationsValue.textContent = this.value;
                if (!sierpinskiRendered) {
                    sierpinskiRendered = true;
                    markAsRendered(sierpinskiCanvas);
                }
                renderSierpinski();
            });

            document.getElementById('sierpinskiReset').addEventListener('click', function() {
                sierpinskiConfig = {
                    iterations: 4
                };
                document.getElementById('sierpinskiIterations').value = 4;
                sierpinskiIterationsValue.textContent = '4';
                if (!sierpinskiRendered) {
                    sierpinskiRendered = true;
                    markAsRendered(sierpinskiCanvas);
                }
                renderSierpinski();
            });    // Render functions
            function renderMandelbrot() {
                const width = mandelbrotCanvas.width;
                const height = mandelbrotCanvas.height;
                const imageData = mandelbrotCtx.createImageData(width, height);
                const data = imageData.data;
                
                const maxIter = mandelbrotConfig.maxIterations;
                const scale = mandelbrotConfig.scale;
                const xOffset = mandelbrotConfig.x;
                const yOffset = mandelbrotConfig.y;
                
                for (let py = 0; py < height; py++) {
                    for (let px = 0; px < width; px++) {
                        const x0 = (px / width) * scale + xOffset;
                        const y0 = (py / height) * scale + yOffset;
                        
                        let x = 0;
                        let y = 0;
                        let iteration = 0;
                        
                        while (x*x + y*y < 4 && iteration < maxIter) {
                            const xTemp = x*x - y*y + x0;
                            y = 2*x*y + y0;
                            x = xTemp;
                            iteration++;
                        }
                        
                        const pixelIndex = (py * width + px) * 4;
                        
                        if (iteration === maxIter) {
                            data[pixelIndex] = 0;       // R
                            data[pixelIndex+1] = 0;     // G
                            data[pixelIndex+2] = 0;     // B
                        } else {
                            const smoothed = iteration + 1 - Math.log(Math.log(Math.sqrt(x*x + y*y))) / Math.log(2);
                            const intensity = smoothed / maxIter;
                            
                            const grayValue = Math.floor(255 * (1 - intensity));
                            data[pixelIndex] = grayValue;     // R
                            data[pixelIndex+1] = grayValue;   // G
                            data[pixelIndex+2] = grayValue;   // B
                        }
                        data[pixelIndex+3] = 255; // Alpha
                    }
                }
                
                mandelbrotCtx.putImageData(imageData, 0, 0);
            }
            
            function renderKochCurve() {
                const width = kochCurveCanvas.width;
                const height = kochCurveCanvas.height;
                const dpr = window.devicePixelRatio || 1;
                
                kochCurveCtx.clearRect(0, 0, width, height);
                kochCurveCtx.strokeStyle = '#000000';
                kochCurveCtx.lineWidth = 1;

                // Calculate the size to maintain aspect ratio
                const size = Math.min(width, height) * 0.8;
                
                // Calculate the starting and ending points, accounting for dpr
                const startX = (width - size) / (2 * dpr);
                const endX = (width + size) / (2 * dpr);
                const y = height / (2 * dpr);

                // Draw the Koch curve
                drawKochLine(startX, y, endX, y, kochCurveConfig.iterations, kochCurveCtx);
            }

            function renderKochSnowflake() {
                const width = kochSnowflakeCanvas.width;
                const height = kochSnowflakeCanvas.height;
                const dpr = window.devicePixelRatio || 1;
                
                kochSnowflakeCtx.clearRect(0, 0, width, height);
                kochSnowflakeCtx.strokeStyle = '#000000';
                kochSnowflakeCtx.lineWidth = 1;

                // Calculate the size to maintain aspect ratio
                const size = Math.min(width, height) * 0.5;
                
                // Calculate the center position
                const centerX = width / (2 * dpr);
                const centerY = height / (2 * dpr);
                
                // Calculate the starting point for the triangle
                const startX = centerX - size / (2 * dpr);
                const startY = centerY - (size * Math.sqrt(3) / 6) / dpr;

                // Draw the Koch snowflake
                drawKochSnowflake(startX, startY, size / dpr, kochSnowflakeConfig.iterations, false, kochSnowflakeCtx);
            }

            function renderKochInverted() {
                const width = kochInvertedCanvas.width;
                const height = kochInvertedCanvas.height;
                const dpr = window.devicePixelRatio || 1;
                
                kochInvertedCtx.clearRect(0, 0, width, height);
                kochInvertedCtx.strokeStyle = '#000000';
                kochInvertedCtx.lineWidth = 1;

                // Calculate the size to maintain aspect ratio
                const size = Math.min(width, height) * 0.5;
                
                // Calculate the center position
                const centerX = width / (2 * dpr);
                const centerY = height / (2 * dpr);
                
                // Calculate the starting point for the triangle
                const startX = centerX - size / (2 * dpr);
                const startY = centerY + (size * Math.sqrt(3) / 6) / dpr;

                // Draw the inverted Koch snowflake
                drawKochSnowflake(startX, startY, size / dpr, kochInvertedConfig.iterations, true, kochInvertedCtx);
            }

            // Event listeners for Koch curve controls
            document.getElementById('kochCurveIterations').addEventListener('input', function() {
                kochCurveConfig.iterations = parseInt(this.value);
                kochCurveIterationsValue.textContent = this.value;
                if (!kochCurveRendered) {
                    kochCurveRendered = true;
                    markAsRendered(kochCurveCanvas);
                }
                renderKochCurve();
            });

            document.getElementById('kochCurveReset').addEventListener('click', function() {
                kochCurveConfig = {
                    iterations: 4,
                    scale: 1,
                    x: 0,
                    y: 0,
                    zoomAreaX: 0,
                    zoomAreaY: 0,
                    isDraggingZoom: false
                };
                document.getElementById('kochCurveIterations').value = 4;
                kochCurveIterationsValue.textContent = '4';
                if (!kochCurveRendered) {
                    kochCurveRendered = true;
                    markAsRendered(kochCurveCanvas);
                }
                renderKochCurve();
            });

            // Event listeners for Koch snowflake controls
            document.getElementById('kochSnowflakeIterations').addEventListener('input', function() {
                kochSnowflakeConfig.iterations = parseInt(this.value);
                kochSnowflakeIterationsValue.textContent = this.value;
                if (!kochSnowflakeRendered) {
                    kochSnowflakeRendered = true;
                    markAsRendered(kochSnowflakeCanvas);
                }
                renderKochSnowflake();
            });

            document.getElementById('kochSnowflakeReset').addEventListener('click', function() {
                kochSnowflakeConfig = {
                    iterations: 4,
                    scale: 1,
                    x: 0,
                    y: 0,
                    zoomAreaX: 0,
                    zoomAreaY: 0,
                    isDraggingZoom: false
                };
                document.getElementById('kochSnowflakeIterations').value = 4;
                kochSnowflakeIterationsValue.textContent = '4';
                if (!kochSnowflakeRendered) {
                    kochSnowflakeRendered = true;
                    markAsRendered(kochSnowflakeCanvas);
                }
                renderKochSnowflake();
            });

            // Event listeners for inverted Koch snowflake controls
            document.getElementById('kochInvertedIterations').addEventListener('input', function() {
                kochInvertedConfig.iterations = parseInt(this.value);
                kochInvertedIterationsValue.textContent = this.value;
                if (!kochInvertedRendered) {
                    kochInvertedRendered = true;
                    markAsRendered(kochInvertedCanvas);
                }
                renderKochInverted();
            });

            document.getElementById('kochInvertedReset').addEventListener('click', function() {
                kochInvertedConfig = {
                    iterations: 4,
                    scale: 1,
                    x: 0,
                    y: 0,
                    zoomAreaX: 0,
                    zoomAreaY: 0,
                    isDraggingZoom: false
                };
                document.getElementById('kochInvertedIterations').value = 4;
                kochInvertedIterationsValue.textContent = '4';
                if (!kochInvertedRendered) {
                    kochInvertedRendered = true;
                    markAsRendered(kochInvertedCanvas);
                }
                renderKochInverted();
            });

            // Event listeners for Mandelbrot controls
            document.getElementById('mandelbrotIterations').addEventListener('input', function() {
                mandelbrotConfig.maxIterations = parseInt(this.value);
                mandelbrotIterationsValue.textContent = this.value;
                if (!mandelbrotRendered) {
                    mandelbrotRendered = true;
                    markAsRendered(mandelbrotCanvas);
                }
                renderMandelbrot();
            });
            
            document.getElementById('mandelbrotReset').addEventListener('click', function() {
                mandelbrotConfig = {
                    x: -2.5,
                    y: -1.5,
                    scale: 3,
                    maxIterations: 100
                };
                document.getElementById('mandelbrotIterations').value = 100;
                mandelbrotIterationsValue.textContent = '100';
                if (!mandelbrotRendered) {
                    mandelbrotRendered = true;
                    markAsRendered(mandelbrotCanvas);
                }
                renderMandelbrot();
            });

            // Mandelbrot zoom interaction
            let isDragging = false;
            let startX, startY, endX, endY;
            let selectionRect = null;

            function drawSelectionRect() {
                if (!selectionRect) {
                    selectionRect = document.createElement('div');
                    selectionRect.className = 'selection-rect';
                    mandelbrotCanvas.parentElement.appendChild(selectionRect);
                }

                const containerRect = mandelbrotCanvas.parentElement.getBoundingClientRect();
                const left = Math.min(startX, endX) - containerRect.left;
                const top = Math.min(startY, endY) - containerRect.top;
                const width = Math.abs(endX - startX);
                const height = Math.abs(endY - startY);

                selectionRect.style.left = left + 'px';
                selectionRect.style.top = top + 'px';
                selectionRect.style.width = width + 'px';
                selectionRect.style.height = height + 'px';
            }

            function removeSelectionRect() {
                if (selectionRect) {
                    selectionRect.remove();
                    selectionRect = null;
                }
            }

            mandelbrotCanvas.addEventListener('mousedown', function(e) {
                isDragging = true;
                const rect = mandelbrotCanvas.getBoundingClientRect();
                startX = e.clientX;
                startY = e.clientY;
                endX = startX;
                endY = startY;
                drawSelectionRect();
            });

            mandelbrotCanvas.addEventListener('mousemove', function(e) {
                if (!isDragging) return;
                endX = e.clientX;
                endY = e.clientY;
                drawSelectionRect();
            });

            mandelbrotCanvas.addEventListener('mouseup', function(e) {
                if (!isDragging) return;
                isDragging = false;
                endX = e.clientX;
                endY = e.clientY;
                removeSelectionRect();

                if (Math.abs(endX - startX) < 10 || Math.abs(endY - startY) < 10) {
                    return;
                }

                const rect = mandelbrotCanvas.getBoundingClientRect();
                const canvasStartX = (startX - rect.left) / rect.width;
                const canvasStartY = (startY - rect.top) / rect.height;
                const canvasEndX = (endX - rect.left) / rect.width;
                const canvasEndY = (endY - rect.top) / rect.height;

                const minX = mandelbrotConfig.x + Math.min(canvasStartX, canvasEndX) * mandelbrotConfig.scale;
                const maxX = mandelbrotConfig.x + Math.max(canvasStartX, canvasEndX) * mandelbrotConfig.scale;
                const minY = mandelbrotConfig.y + Math.min(canvasStartY, canvasEndY) * mandelbrotConfig.scale;
                const maxY = mandelbrotConfig.y + Math.max(canvasStartY, canvasEndY) * mandelbrotConfig.scale;

                const newScale = Math.max(maxX - minX, maxY - minY);
                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;

                mandelbrotConfig.scale = newScale;
                mandelbrotConfig.x = centerX - newScale / 2;
                mandelbrotConfig.y = centerY - newScale / 2;

                // Increase iterations when zooming in
                mandelbrotConfig.maxIterations = Math.min(500, Math.floor(100 * (3 / mandelbrotConfig.scale)));
                document.getElementById('mandelbrotIterations').value = mandelbrotConfig.maxIterations;

                renderMandelbrot();
            });

            mandelbrotCanvas.addEventListener('mouseleave', function() {
                if (isDragging) {
                    isDragging = false;
                    removeSelectionRect();
                }
            });

            mandelbrotCanvas.addEventListener('contextmenu', function(e) {
                e.preventDefault();
            });

            // Function to update canvas dimensions with high DPI support
            function updateCanvasDimensions() {
                const canvases = [mandelbrotCanvas, kochCurveCanvas, kochSnowflakeCanvas, kochInvertedCanvas, sierpinskiCanvas];
                canvases.forEach(canvas => {
                    const container = canvas.parentElement;
                    const containerStyle = window.getComputedStyle(container);
                    const width = parseInt(containerStyle.width);
                    const height = parseInt(containerStyle.height);
                    
                    const dpr = window.devicePixelRatio || 1;
                    
                    canvas.style.width = width + 'px';
                    canvas.style.height = height + 'px';
                    
                    canvas.width = Math.floor(width * dpr);
                    canvas.height = Math.floor(height * dpr);
                    
                    const ctx = canvas.getContext('2d');
                    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transformation
                    ctx.scale(dpr, dpr);
                });
            }    // Update dimensions on window resize
            window.addEventListener('resize', () => {
                updateCanvasDimensions();
                renderMandelbrot();
                renderKochCurve();
                renderKochSnowflake();
                renderKochInverted();
                renderSierpinski();
            });

            // Initial canvas size update and render
            updateCanvasDimensions();
            renderKochCurve();
            renderKochSnowflake();
            renderKochInverted();
            renderSierpinski();
            renderMandelbrot();

        } catch (error) {
            console.error('Error initializing fractals:', error);
            // Display error message on the page
            const containers = document.querySelectorAll('.fractal-canvas-container');
            containers.forEach(container => {
                container.innerHTML = '<div style="padding: 20px; color: red;">Error loading fractal visualization. Please check console for details.</div>';
            });
        }
    });
})();