// Set current year in footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Initialize color picker
document.addEventListener('DOMContentLoaded', function() {
	// Color variables
	let red = 0.5;
	let green = 0.5;
	let blue = 0.5;
	let alpha = 1.0;
	let hue = 0;
	let saturation = 1;
	let brightness = 1;

	// DOM elements
	const colorPreview = document.getElementById('colorPreview');
	const hexValue = document.getElementById('hexValue');
	const rgbaValue = document.getElementById('rgbaValue');
	const redSlider = document.getElementById('redSlider');
	const greenSlider = document.getElementById('greenSlider');
	const blueSlider = document.getElementById('blueSlider');
	const alphaSlider = document.getElementById('alphaSlider');
	const redInput = document.getElementById('redInput');
	const greenInput = document.getElementById('greenInput');
	const blueInput = document.getElementById('blueInput');
	const alphaInput = document.getElementById('alphaInput');
	const copyHex = document.getElementById('copyHex');
	const copyRgba = document.getElementById('copyRgba');
	const eyedropperBtn = document.getElementById('eyedropperBtn');
	const gradientPicker = document.getElementById('gradientPicker');
	const pickerCircle = document.getElementById('pickerCircle');
	const gradientCanvas = document.getElementById('gradientCanvas');

	// Initialize values
	redInput.value = red;
	greenInput.value = green;
	blueInput.value = blue;
	alphaInput.value = alpha;

	// Create canvas for gradient picker
	const canvas = document.createElement('canvas');
	canvas.width = gradientPicker.offsetWidth;
	canvas.height = gradientPicker.offsetHeight;
	gradientCanvas.appendChild(canvas);
	const ctx = canvas.getContext('2d');

	// Update color preview and values
	function updateColor() {
		// Update preview
		colorPreview.style.backgroundColor = `rgba(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)}, ${alpha})`;

		// Update hex value
		const hex = rgbToHex(Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255));
		hexValue.value = hex;

		// Update rgba value
		rgbaValue.value = `rgba(${Math.round(red * 255)}, ${Math.round(green * 255)}, ${Math.round(blue * 255)}, ${alpha})`;

		// Update gradient picker
		updateGradientPicker();

		// Convert RGB to HSV for the gradient picker
		const hsv = rgbToHsv(red, green, blue);
		hue = hsv.h;
		saturation = hsv.s;
		brightness = hsv.v;

		// Position picker circle
		pickerCircle.style.left = `${saturation * 100}%`;
		pickerCircle.style.top = `${(1 - brightness) * 100}%`;
		pickerCircle.style.borderColor = brightness > 0.5 ? '#fff' : '#000';
	}

	// Update gradient picker
	function updateGradientPicker() {
		const width = canvas.width;
		const height = canvas.height;

		// Create gradient
		const gradient = ctx.createLinearGradient(0, 0, width, 0);
		gradient.addColorStop(0, `hsl(${hue * 360}, 0%, ${brightness * 100}%)`);
		gradient.addColorStop(1, `hsl(${hue * 360}, 100%, ${brightness * 100}%)`);

		// Fill with gradient
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, width, height);

		// Add brightness gradient
		const brightnessGradient = ctx.createLinearGradient(0, 0, 0, height);
		brightnessGradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
		brightnessGradient.addColorStop(1, 'rgba(0, 0, 0, 1)');

		ctx.fillStyle = brightnessGradient;
		ctx.fillRect(0, 0, width, height);
	}

	// Convert RGB to Hex
	function rgbToHex(r, g, b) {
		return '#' + [r, g, b].map(x => {
			const hex = x.toString(16);
			return hex.length === 1 ? '0' + hex : hex;
		}).join('');
	}

	// Convert RGB to HSV
	function rgbToHsv(r, g, b) {
		const max = Math.max(r, g, b);
		const min = Math.min(r, g, b);
		const delta = max - min;

		let h = 0;
		if (delta !== 0) {
			if (max === r) h = (g - b) / delta % 6;
			else if (max === g) h = (b - r) / delta + 2;
			else h = (r - g) / delta + 4;
			h = h / 6;
			if (h < 0) h += 1;
		}

		const s = max === 0 ? 0 : delta / max;
		const v = max;

		return { h, s, v };
	}

	// Convert HSV to RGB
	function hsvToRgb(h, s, v) {
		let r, g, b;

		const i = Math.floor(h * 6);
		const f = h * 6 - i;
		const p = v * (1 - s);
		const q = v * (1 - f * s);
		const t = v * (1 - (1 - f) * s);

		switch (i % 6) {
			case 0: r = v; g = t; b = p; break;
			case 1: r = q; g = v; b = p; break;
			case 2: r = p; g = v; b = t; break;
			case 3: r = p; g = q; b = v; break;
			case 4: r = t; g = p; b = v; break;
			case 5: r = v; g = p; b = q; break;
		}

		return { r, g, b };
	}

	// Event listeners for sliders
	redSlider.addEventListener('input', function() {
		red = parseFloat(this.value);
		redInput.value = red;
		updateColor();
	});

	greenSlider.addEventListener('input', function() {
		green = parseFloat(this.value);
		greenInput.value = green;
		updateColor();
	});

	blueSlider.addEventListener('input', function() {
		blue = parseFloat(this.value);
		blueInput.value = blue;
		updateColor();
	});

	alphaSlider.addEventListener('input', function() {
		alpha = parseFloat(this.value);
		alphaInput.value = alpha;
		updateColor();
	});

	// Event listeners for input fields
	redInput.addEventListener('input', function() {
		let value = parseFloat(this.value);
		if (isNaN(value)) value = 0;
		if (value < 0) value = 0;
		if (value > 1) value = 1;
		red = value;
		redSlider.value = red;
		this.value = red;
		updateColor();
	});

	greenInput.addEventListener('input', function() {
		let value = parseFloat(this.value);
		if (isNaN(value)) value = 0;
		if (value < 0) value = 0;
		if (value > 1) value = 1;
		green = value;
		greenSlider.value = green;
		this.value = green;
		updateColor();
	});

	blueInput.addEventListener('input', function() {
		let value = parseFloat(this.value);
		if (isNaN(value)) value = 0;
		if (value < 0) value = 0;
		if (value > 1) value = 1;
		blue = value;
		blueSlider.value = blue;
		this.value = blue;
		updateColor();
	});

	alphaInput.addEventListener('input', function() {
		let value = parseFloat(this.value);
		if (isNaN(value)) value = 0;
		if (value < 0) value = 0;
		if (value > 1) value = 1;
		alpha = value;
		alphaSlider.value = alpha;
		this.value = alpha;
		updateColor();
	});

	// Copy to clipboard
	copyHex.addEventListener('click', function() {
		navigator.clipboard.writeText(hexValue.value).then(function() {
			const tooltip = this.querySelector('.tooltip-text');
			tooltip.textContent = 'Copied!';
			setTimeout(() => {
				tooltip.textContent = 'Copy to clipboard';
			}, 2000);
		}.bind(this));
	});

	copyRgba.addEventListener('click', function() {
		navigator.clipboard.writeText(rgbaValue.value).then(function() {
			const tooltip = this.querySelector('.tooltip-text');
			tooltip.textContent = 'Copied!';
			setTimeout(() => {
				tooltip.textContent = 'Copy to clipboard';
			}, 2000);
		}.bind(this));
	});

	// Eyedropper tool
	eyedropperBtn.addEventListener('click', function() {
		if (!window.EyeDropper) {
			alert('Eyedropper API is not supported in your browser. Try Chrome or Edge.');
			return;
		}

		const eyeDropper = new EyeDropper();
		eyeDropper.open()
			.then(result => {
				const hex = result.sRGBHex;
				// Convert hex to RGB
				const r = parseInt(hex.slice(1, 3), 16) / 255;
				const g = parseInt(hex.slice(3, 5), 16) / 255;
				const b = parseInt(hex.slice(5, 7), 16) / 255;

				red = r;
				green = g;
				blue = b;

				redSlider.value = red;
				greenSlider.value = green;
				blueSlider.value = blue;
				redInput.value = red;
				greenInput.value = green;
				blueInput.value = blue;

				updateColor();
			})
			.catch(e => {
				console.error('EyeDropper error:', e);
			});
	});

	// Gradient picker interaction
	let isDragging = false;

	gradientPicker.addEventListener('mousedown', function(e) {
		isDragging = true;
		handleGradientPick(e);
	});

	gradientPicker.addEventListener('mousemove', function(e) {
		if (isDragging) {
			handleGradientPick(e);
		}
	});

	document.addEventListener('mouseup', function() {
		isDragging = false;
	});

	gradientPicker.addEventListener('touchstart', function(e) {
		isDragging = true;
		handleGradientPick(e.touches[0]);
		e.preventDefault();
	});

	gradientPicker.addEventListener('touchmove', function(e) {
		if (isDragging) {
			handleGradientPick(e.touches[0]);
			e.preventDefault();
		}
	});

	document.addEventListener('touchend', function() {
		isDragging = false;
	});

	function handleGradientPick(e) {
		const rect = gradientPicker.getBoundingClientRect();
		let x = e.clientX - rect.left;
		let y = e.clientY - rect.top;

		// Constrain to bounds
		x = Math.max(0, Math.min(rect.width, x));
		y = Math.max(0, Math.min(rect.height, y));

		// Calculate saturation and brightness
		saturation = x / rect.width;
		brightness = 1 - (y / rect.height);

		// Convert HSV to RGB
		const rgb = hsvToRgb(hue, saturation, brightness);
		red = rgb.r;
		green = rgb.g;
		blue = rgb.b;

		// Update sliders and inputs
		redSlider.value = red;
		greenSlider.value = green;
		blueSlider.value = blue;
		redInput.value = red;
		greenInput.value = green;
		blueInput.value = blue;

		// Update color
		updateColor();

		// Position picker circle
		pickerCircle.style.left = `${saturation * 100}%`;
		pickerCircle.style.top = `${(1 - brightness) * 100}%`;
		pickerCircle.style.borderColor = brightness > 0.5 ? '#fff' : '#000';
	}

	// Initial update
	updateColor();

	 $('a[href^="#"]').on('click', function(event) {
		const target = $(this.getAttribute('href'));
		if( target.length ) {
			event.preventDefault();
			$('html, body').stop().animate({
				scrollTop: target.offset().top - 80 // Adjust 80px for fixed header height
			}, 800); // Smooth scroll duration
		}
	});
	// Scroll animations
	const animateOnScroll = function() {
		const elements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');

		elements.forEach(element => {
			const elementPosition = element.getBoundingClientRect().top;
			const windowHeight = window.innerHeight;

			if (elementPosition < windowHeight - 100) {
				element.style.opacity = '1';
				element.style.transform = 'translate(0) scale(1)';
			}
		});
	};

	window.addEventListener('scroll', animateOnScroll);
	animateOnScroll(); // Run once on load
});