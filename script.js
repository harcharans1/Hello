// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize 3D Scene
    init3DScene();
    
    // Initialize Audio Visualizer
    initAudioVisualizer();
    
    // Initialize Player Controls
    initPlayerControls();
    
    // Initialize 3D Knobs
    init3DKnobs();
    
    // Initialize Theme Toggle
    initThemeToggle();
    
    // Initialize Channel Switching
    initChannelSwitching();
    
    // Initialize Extra Controls
    initExtraControls();
});

// 3D Scene with Three.js
function init3DScene() {
    // Check if Three.js is available
    if (typeof THREE === 'undefined') {
        console.log('Three.js not loaded');
        return;
    }
    
    try {
        // Scene setup
        const scene = new THREE.Scene();
        scene.background = null;
        
        // Camera
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        camera.position.z = 5;
        
        // Renderer
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        const container = document.getElementById('three-container');
        if (container) {
            container.appendChild(renderer.domElement);
        }
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xff9900, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = true;
        scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0xff9900, 0.5, 50);
        pointLight.position.set(-5, 5, 5);
        scene.add(pointLight);
        
        // Create floating geometric shapes
        const shapes = [];
        const geometryTypes = [
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.ConeGeometry(0.5, 1, 16),
            new THREE.TorusGeometry(0.5, 0.2, 16, 32)
        ];
        
        for (let i = 0; i < 15; i++) {
            const geometry = geometryTypes[Math.floor(Math.random() * geometryTypes.length)];
            const material = new THREE.MeshPhongMaterial({
                color: new THREE.Color(`hsl(${Math.random() * 60 + 20}, 100%, 50%)`),
                transparent: true,
                opacity: 0.3,
                shininess: 100
            });
            
            const shape = new THREE.Mesh(geometry, material);
            
            shape.position.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
            
            shape.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            shape.userData = {
                speed: Math.random() * 0.02 + 0.01,
                rotationSpeed: Math.random() * 0.02 + 0.01,
                amplitude: Math.random() * 2 + 1
            };
            
            scene.add(shape);
            shapes.push(shape);
        }
        
        // Audio reactive particles
        const particles = [];
        const particleCount = 100;
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(`hsl(${Math.random() * 60 + 20}, 100%, 50%)`),
                transparent: true,
                opacity: 0.6
            });
            
            const particle = new THREE.Mesh(geometry, material);
            
            particle.position.set(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
            
            particle.userData = {
                originalY: particle.position.y,
                speed: Math.random() * 0.02 + 0.01,
                amplitude: Math.random() * 2 + 1
            };
            
            scene.add(particle);
            particles.push(particle);
        }
        
        // Animation loop
        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.01;
            
            // Animate shapes
            shapes.forEach(shape => {
                shape.rotation.x += shape.userData.rotationSpeed * 0.5;
                shape.rotation.y += shape.userData.rotationSpeed;
                shape.rotation.z += shape.userData.rotationSpeed * 0.3;
                
                shape.position.y = shape.position.y + 
                    Math.sin(time * shape.userData.speed) * 0.05;
                
                // Pulsing effect
                const scale = 1 + Math.sin(time * shape.userData.speed * 2) * 0.1;
                shape.scale.set(scale, scale, scale);
            });
            
            // Animate particles
            particles.forEach((particle, index) => {
                particle.position.y = particle.userData.originalY + 
                    Math.sin(time * particle.userData.speed) * particle.userData.amplitude;
                
                // Color cycling
                const hue = (index * 10 + time * 20) % 360;
                particle.material.color.setHSL(hue / 360, 1, 0.5);
            });
            
            // Slow camera rotation
            camera.position.x = Math.sin(time * 0.1) * 3;
            camera.position.y = 2 + Math.sin(time * 0.05) * 0.5;
            camera.lookAt(0, 0, 0);
            
            renderer.render(scene, camera);
        }
        
        // Handle resize
        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Start animation
        animate();
        
    } catch (error) {
        console.error('Three.js initialization error:', error);
    }
}

// Audio Visualizer
function initAudioVisualizer() {
    const waveformCanvas = document.getElementById('waveform-canvas');
    const frequencyCanvas = document.getElementById('frequency-canvas');
    const audioElement = document.getElementById('audioPlayer');
    
    if (!waveformCanvas || !frequencyCanvas || !audioElement) {
        console.log('Visualizer elements not found');
        return;
    }
    
    const waveformCtx = waveformCanvas.getContext('2d');
    const frequencyCtx = frequencyCanvas.getContext('2d');
    
    // Set canvas size
    function setCanvasSize() {
        const container = waveformCanvas.parentElement;
        if (!container) return;
        
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        waveformCanvas.width = width;
        waveformCanvas.height = height;
        frequencyCanvas.width = width;
        frequencyCanvas.height = height;
    }
    
    setCanvasSize();
    
    // Audio context setup
    let audioContext, analyser, dataArray, frequencyData;
    let isAudioInitialized = false;
    
    function initAudioContext() {
        if (isAudioInitialized) return;
        
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaElementSource(audioElement);
            analyser = audioContext.createAnalyser();
            
            analyser.fftSize = 2048;
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
            frequencyData = new Uint8Array(bufferLength);
            
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            
            isAudioInitialized = true;
            drawVisualizers();
        } catch (error) {
            console.error('Audio context error:', error);
        }
    }
    
    // Draw visualizers
    function drawVisualizers() {
        if (!isAudioInitialized || !analyser || !dataArray) {
            requestAnimationFrame(drawVisualizers);
            return;
        }
        
        analyser.getByteTimeDomainData(dataArray);
        analyser.getByteFrequencyData(frequencyData);
        
        // Clear canvases
        waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
        frequencyCtx.clearRect(0, 0, frequencyCanvas.width, frequencyCanvas.height);
        
        // Draw waveform
        waveformCtx.lineWidth = 2;
        waveformCtx.strokeStyle = '#FF9800';
        waveformCtx.beginPath();
        
        const sliceWidth = waveformCanvas.width / dataArray.length;
        let x = 0;
        
        for (let i = 0; i < dataArray.length; i++) {
            const v = dataArray[i] / 128.0;
            const y = v * waveformCanvas.height / 2;
            
            if (i === 0) {
                waveformCtx.moveTo(x, y);
            } else {
                waveformCtx.lineTo(x, y);
            }
            
            x += sliceWidth;
        }
        
        waveformCtx.stroke();
        
        // Draw frequency bars with glow effect
        const barCount = 64;
        const barWidth = frequencyCanvas.width / barCount;
        
        for (let i = 0; i < barCount; i++) {
            const barIndex = Math.floor(i * frequencyData.length / barCount);
            const magnitude = frequencyData[barIndex];
            const barHeight = (magnitude / 255) * frequencyCanvas.height;
            
            // Create gradient for each bar
            const gradient = frequencyCtx.createLinearGradient(
                i * barWidth, frequencyCanvas.height - barHeight,
                i * barWidth, frequencyCanvas.height
            );
            gradient.addColorStop(0, '#FF9800');
            gradient.addColorStop(0.5, '#FFD54F');
            gradient.addColorStop(1, '#FFF176');
            
            // Draw bar with shadow
            frequencyCtx.shadowColor = '#FF9800';
            frequencyCtx.shadowBlur = 15;
            frequencyCtx.fillStyle = gradient;
            frequencyCtx.fillRect(
                i * barWidth,
                frequencyCanvas.height - barHeight,
                barWidth - 1,
                barHeight
            );
            
            // Draw bar outline
            frequencyCtx.shadowBlur = 0;
            frequencyCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            frequencyCtx.lineWidth = 1;
            frequencyCtx.strokeRect(
                i * barWidth,
                frequencyCanvas.height - barHeight,
                barWidth - 1,
                barHeight
            );
        }
        
        // Draw center circle
        const centerX = frequencyCanvas.width / 2;
        const centerY = frequencyCanvas.height / 2;
        const avgMagnitude = frequencyData.reduce((a, b) => a + b, 0) / frequencyData.length;
        const radius = 20 + (avgMagnitude / 255 * 80);
        
        // Outer glow
        frequencyCtx.shadowColor = '#FF9800';
        frequencyCtx.shadowBlur = 30;
        frequencyCtx.beginPath();
        frequencyCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        frequencyCtx.fillStyle = 'rgba(255, 152, 0, 0.1)';
        frequencyCtx.fill();
        frequencyCtx.shadowBlur = 0;
        
        // Inner circle
        const radialGradient = frequencyCtx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius
        );
        radialGradient.addColorStop(0, 'rgba(255, 152, 0, 0.8)');
        radialGradient.addColorStop(0.7, 'rgba(255, 152, 0, 0.2)');
        radialGradient.addColorStop(1, 'rgba(255, 152, 0, 0)');
        
        frequencyCtx.beginPath();
        frequencyCtx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        frequencyCtx.fillStyle = radialGradient;
        frequencyCtx.fill();
        
        requestAnimationFrame(drawVisualizers);
    }
    
    // Initialize audio on first user interaction
    document.addEventListener('click', function initAudioOnce() {
        initAudioContext();
        document.removeEventListener('click', initAudioOnce);
    }, { once: true });
    
    // Handle resize
    window.addEventListener('resize', setCanvasSize);
    
    // Update rotating disc animation based on play state
    audioElement.addEventListener('play', function() {
        const disc = document.querySelector('.rotating-disc');
        if (disc) {
            disc.style.animation = 'rotate 10s linear infinite';
        }
    });
    
    audioElement.addEventListener('pause', function() {
        const disc = document.querySelector('.rotating-disc');
        if (disc) {
            disc.style.animation = 'rotate 20s linear infinite paused';
        }
    });
}

// Player Controls
function initPlayerControls() {
    const audioPlayer = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const playIcon = document.getElementById('playIcon');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    const progressThumb = document.getElementById('progressThumb');
    const currentTimeDisplay = document.getElementById('currentTimeDisplay');
    const totalTimeDisplay = document.getElementById('totalTimeDisplay');
    
    if (!audioPlayer || !playBtn) return;
    
    let isPlaying = false;
    
    // Play/Pause
    playBtn.addEventListener('click', function() {
        if (isPlaying) {
            audioPlayer.pause();
            playIcon.className = 'fas fa-play';
            this.classList.remove('playing');
        } else {
            audioPlayer.play().catch(e => {
                console.log('Play failed:', e);
                // If audio context is suspended, resume it
                if (audioPlayer.context && audioPlayer.context.state === 'suspended') {
                    audioPlayer.context.resume();
                }
            });
            playIcon.className = 'fas fa-pause';
            this.classList.add('playing');
        }
        isPlaying = !isPlaying;
        
        // Animation
        gsap.to(this, {
            scale: 1.2,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });
    });
    
    // Previous
    prevBtn.addEventListener('click', function() {
        gsap.to(this, {
            rotation: -360,
            duration: 0.5,
            ease: "power2.out"
        });
        
        // Simulate track change
        const channels = document.querySelectorAll('.channel-card');
        const currentChannel = document.querySelector('.channel-card.active');
        let nextChannel;
        
        if (currentChannel) {
            const index = Array.from(channels).indexOf(currentChannel);
            nextChannel = channels[(index - 1 + channels.length) % channels.length];
        } else {
            nextChannel = channels[0];
        }
        
        if (nextChannel) {
            simulateChannelSwitch(nextChannel);
        }
    });
    
    // Next
    nextBtn.addEventListener('click', function() {
        gsap.to(this, {
            rotation: 360,
            duration: 0.5,
            ease: "power2.out"
        });
        
        // Simulate track change
        const channels = document.querySelectorAll('.channel-card');
        const currentChannel = document.querySelector('.channel-card.active');
        let nextChannel;
        
        if (currentChannel) {
            const index = Array.from(channels).indexOf(currentChannel);
            nextChannel = channels[(index + 1) % channels.length];
        } else {
            nextChannel = channels[0];
        }
        
        if (nextChannel) {
            simulateChannelSwitch(nextChannel);
        }
    });
    
    // Progress Bar
    let isDragging = false;
    
    progressBar.addEventListener('click', function(e) {
        const rect = this.getBoundingClientRect();
        const percentage = (e.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percentage * audioPlayer.duration;
        updateProgress(percentage);
    });
    
    progressThumb.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isDragging = true;
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
    });
    
    progressThumb.addEventListener('touchstart', function(e) {
        e.preventDefault();
        isDragging = true;
        document.addEventListener('touchmove', handleDrag);
        document.addEventListener('touchend', stopDrag);
    });
    
    function handleDrag(e) {
        if (!isDragging) return;
        
        const rect = progressBar.getBoundingClientRect();
        let clientX;
        
        if (e.type.includes('mouse')) {
            clientX = e.clientX;
        } else {
            clientX = e.touches[0].clientX;
        }
        
        let percentage = (clientX - rect.left) / rect.width;
        percentage = Math.max(0, Math.min(1, percentage));
        
        audioPlayer.currentTime = percentage * audioPlayer.duration;
        updateProgress(percentage);
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', handleDrag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', handleDrag);
        document.removeEventListener('touchend', stopDrag);
    }
    
    // Update progress
    function updateProgress(percentage) {
        progressFill.style.width = `${percentage * 100}%`;
        progressThumb.style.left = `${percentage * 100}%`;
    }
    
    // Time updates
    audioPlayer.addEventListener('timeupdate', function() {
        if (isDragging) return;
        
        const percentage = audioPlayer.currentTime / audioPlayer.duration;
        updateProgress(percentage);
        
        // Update time displays
        currentTimeDisplay.textContent = formatTime(audioPlayer.currentTime);
        totalTimeDisplay.textContent = formatTime(audioPlayer.duration);
        
        // Update visualizer time
        const currentTimeElement = document.getElementById('currentTime');
        const totalTimeElement = document.getElementById('totalTime');
        if (currentTimeElement && totalTimeElement) {
            currentTimeElement.textContent = formatTime(audioPlayer.currentTime);
            totalTimeElement.textContent = formatTime(audioPlayer.duration);
        }
    });
    
    // Format time helper
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Simulate channel switch
    function simulateChannelSwitch(channelElement) {
        const channel = channelElement.dataset.channel;
        const channelInfo = {
            kirtan: {
                title: 'ਗੁਰਬਾਣੀ ਕੀਰਤਨ',
                artist: 'ਭਾਈ ਰਕਿਹ੍ਬਰ ਸਿੰਘ',
                channel: 'ਕੀਰਤਨ ਚੈਨਲ'
            },
            katha: {
                title: 'ਸੁਖਮਨੀ ਸਾਹਿਬ ਕਥਾ',
                artist: 'ਗਿਆਨੀ ਗੁਰਬਚਨ ਸਿੰਘ',
                channel: 'ਕਥਾ ਚੈਨਲ'
            },
            history: {
                title: 'ਸਿੱਖ ਇਤਿਹਾਸ',
                artist: 'ਪ੍ਰੋਫੈਸਰ ਕਿਰਪਾਲ ਸਿੰਘ',
                channel: 'ਇਤਿਹਾਸ ਚੈਨਲ'
            },
            live: {
                title: 'ਲਾਈਵ ਹਰਿਮੰਦਰ ਸਾਹਿਬ',
                artist: 'ਅੰਮ੍ਰਿਤਸਰ',
                channel: 'ਲਾਈਵ ਚੈਨਲ'
            }
        };
        
        if (channelInfo[channel]) {
            updateTrackInfo(channelInfo[channel]);
            
            // Animation
            gsap.from(channelElement, {
                scale: 0.8,
                rotationY: -180,
                duration: 0.5,
                ease: "back.out(1.7)"
            });
            
            // Set active channel
            document.querySelectorAll('.channel-card').forEach(card => {
                card.classList.remove('active');
            });
            channelElement.classList.add('active');
        }
    }
    
    // Update track info with animation
    function updateTrackInfo(info) {
        const titleElement = document.getElementById('trackTitle');
        const artistElement = document.getElementById('trackArtist');
        const channelElement = document.getElementById('channelName');
        
        if (titleElement && artistElement && channelElement) {
            // Fade out
            gsap.to([titleElement, artistElement, channelElement], {
                opacity: 0,
                y: -10,
                duration: 0.2,
                onComplete: function() {
                    // Update text
                    titleElement.textContent = info.title;
                    artistElement.textContent = info.artist;
                    channelElement.textContent = info.channel;
                    
                    // Fade in
                    gsap.to([titleElement, artistElement, channelElement], {
                        opacity: 1,
                        y: 0,
                        duration: 0.3
                    });
                }
            });
        }
    }
}

// 3D Knobs
function init3DKnobs() {
    const knobs = ['volumeKnob', 'bassKnob', 'trebleKnob'];
    const audioPlayer = document.getElementById('audioPlayer');
    
    knobs.forEach(knobId => {
        const knob = document.getElementById(knobId);
        if (!knob) return;
        
        const knobBase = knob.querySelector('.knob-base');
        const knobHandle = knob.querySelector('.knob-handle');
        
        if (!knobBase || !knobHandle) return;
        
        let isDragging = false;
        let startAngle = 0;
        let currentAngle = 45; // Start at 45 degrees
        
        // Set initial position
        knobHandle.style.transform = `rotate(${currentAngle}deg)`;
        
        knobBase.addEventListener('mousedown', startDrag);
        knobBase.addEventListener('touchstart', startDrag);
        
        function startDrag(e) {
            e.preventDefault();
            isDragging = true;
            
            const rect = knobBase.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            let clientX, clientY;
            
            if (e.type === 'mousedown') {
                clientX = e.clientX;
                clientY = e.clientY;
            } else {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }
            
            const startX = clientX - centerX;
            const startY = clientY - centerY;
            startAngle = Math.atan2(startY, startX) * (180 / Math.PI);
            
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', stopDrag);
            document.addEventListener('touchmove', drag);
            document.addEventListener('touchend', stopDrag);
        }
        
        function drag(e) {
            if (!isDragging) return;
            
            const rect = knobBase.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            let clientX, clientY;
            
            if (e.type === 'mousemove') {
                clientX = e.clientX;
                clientY = e.clientY;
            } else {
                clientX = e.touches[0].clientX;
                clientY = e.touches[0].clientY;
            }
            
            const currentX = clientX - centerX;
            const currentY = clientY - centerY;
            const currentDragAngle = Math.atan2(currentY, currentX) * (180 / Math.PI);
            
            let angleDiff = currentDragAngle - startAngle;
            
            // Normalize angle difference
            if (angleDiff > 180) angleDiff -= 360;
            if (angleDiff < -180) angleDiff += 360;
            
            currentAngle += angleDiff;
            currentAngle = Math.max(0, Math.min(270, currentAngle));
            
            knobHandle.style.transform = `rotate(${currentAngle}deg)`;
            startAngle = currentDragAngle;
            
            // Update audio based on knob
            const value = currentAngle / 270;
            
            switch (knobId) {
                case 'volumeKnob':
                    if (audioPlayer) {
                        audioPlayer.volume = value;
                    }
                    break;
                case 'bassKnob':
                    // Would control bass if we had Web Audio API equalizer
                    break;
                case 'trebleKnob':
                    // Would control treble if we had Web Audio API equalizer
                    break;
            }
            
            // Visual feedback
            knobBase.style.boxShadow = `
                0 15px 40px rgba(255, 152, 0, ${0.2 + value * 0.3}),
                inset 0 0 20px rgba(0, 0, 0, 0.5)
            `;
        }
        
        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
            document.removeEventListener('touchmove', drag);
            document.removeEventListener('touchend', stopDrag);
        }
        
        // Click to set specific value
        knobBase.addEventListener('click', function(e) {
            if (isDragging) return; // Don't trigger if we just dragged
            
            const rect = this.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            const clickX = e.clientX - centerX;
            const clickY = e.clientY - centerY;
            
            const targetAngle = Math.atan2(clickY, clickX) * (180 / Math.PI);
            const normalizedAngle = (targetAngle + 360) % 360;
            
            // Animate to clicked position
            gsap.to(knobHandle, {
                rotation: normalizedAngle,
                duration: 0.5,
                ease: "back.out(1.7)",
                onUpdate: function() {
                    currentAngle = normalizedAngle;
                    const value = currentAngle / 270;
                    
                    if (knobId === 'volumeKnob' && audioPlayer) {
                        audioPlayer.volume = value;
                    }
                }
            });
        });
    });
}

// Theme Toggle
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;
    
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('.mode-text');
    
    let isDark = true;
    
    themeToggle.addEventListener('click', function() {
        isDark = !isDark;
        
        if (isDark) {
            document.body.classList.remove('light-theme');
            icon.className = 'fas fa-moon';
            text.textContent = 'ਨਾਈਟ ਮੋਡ';
        } else {
            document.body.classList.add('light-theme');
            icon.className = 'fas fa-sun';
            text.textContent = 'ਡੇ ਮੋਡ';
        }
        
        // Animation
        gsap.to(this, {
            rotation: 360,
            duration: 0.5,
            ease: "back.out(1.7)"
        });
    });
}

// Channel Switching
function initChannelSwitching() {
    const channelCards = document.querySelectorAll('.channel-card');
    
    channelCards.forEach(card => {
        card.addEventListener('click', function() {
            const channel = this.dataset.channel;
            
            // Remove active class from all cards
            channelCards.forEach(c => {
                c.classList.remove('active');
            });
            
            // Add active class to clicked card
            this.classList.add('active');
            
            // Animation
            gsap.fromTo(this,
                { scale: 0.9, rotationY: -90 },
                { scale: 1, rotationY: 0, duration: 0.5, ease: "back.out(1.7)" }
            );
            
            // Update player info based on channel
            const audioPlayer = document.getElementById('audioPlayer');
            const playBtn = document.getElementById('playBtn');
            const playIcon = document.getElementById('playIcon');
            
            if (audioPlayer && playBtn && playIcon) {
                // Start playing if not already playing
                if (audioPlayer.paused) {
                    audioPlayer.play().then(() => {
                        playIcon.className = 'fas fa-pause';
                        playBtn.classList.add('playing');
                    }).catch(e => {
                        console.log('Auto-play failed:', e);
                    });
                }
            }
            
            // Update track info
            const channelInfo = {
                kirtan: {
                    title: 'ਗੁਰਬਾਣੀ ਕੀਰਤਨ',
                    artist: 'ਭਾਈ ਰਵਿੰਦਰ ਸਿੰਘ',
                    channel: 'ਕੀਰਤਨ ਚੈਨਲ'
                },
                katha: {
                    title: 'ਸੁਖਮਨੀ ਸਾਹਿਬ ਕਥਾ',
                    artist: 'ਗਿਆਨੀ ਗੁਰਬਚਨ ਸਿੰਘ',
                    channel: 'ਕਥਾ ਚੈਨਲ'
                },
                history: {
                    title: 'ਸਿੱਖ ਇਤਿਹਾਸ',
                    artist: 'ਪ੍ਰੋਫੈਸਰ ਕਿਰਪਾਲ ਸਿੰਘ',
                    channel: 'ਇਤਿਹਾਸ ਚੈਨਲ'
                },
                live: {
                    title: 'ਲਾਈਵ ਹਰਿਮੰਦਰ ਸਾਹਿਬ',
                    artist: 'ਅੰਮ੍ਰਿਤਸਰ',
                    channel: 'ਲਾਈਵ ਚੈਨਲ'
                }
            };
            
            if (channelInfo[channel]) {
                const info = channelInfo[channel];
                const titleElement = document.getElementById('trackTitle');
                const artistElement = document.getElementById('trackArtist');
                const channelElement = document.getElementById('channelName');
                
                if (titleElement && artistElement && channelElement) {
                    // Animate text change
                    gsap.to([titleElement, artistElement, channelElement], {
                        opacity: 0,
                        y: -10,
                        duration: 0.2,
                        onComplete: function() {
                            titleElement.textContent = info.title;
                            artistElement.textContent = info.artist;
                            channelElement.textContent = info.channel;
                            
                            gsap.to([titleElement, artistElement, channelElement], {
                                opacity: 1,
                                y: 0,
                                duration: 0.3
                            });
                        }
                    });
                }
            }
        });
    });
}

// Extra Controls
function initExtraControls() {
    const repeatBtn = document.getElementById('repeatBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const favoriteBtn = document.getElementById('favoriteBtn');
    const shareBtn = document.getElementById('shareBtn');
    const heartIcon = favoriteBtn?.querySelector('i');
    
    // Repeat button
    if (repeatBtn) {
        let repeatState = 0; // 0: off, 1: all, 2: one
        
        repeatBtn.addEventListener('click', function() {
            repeatState = (repeatState + 1) % 3;
            
            switch (repeatState) {
                case 0:
                    this.classList.remove('active');
                    break;
                case 1:
                    this.classList.add('active');
                    this.title = 'Repeat All';
                    break;
                case 2:
                    this.title = 'Repeat One';
                    break;
            }
            
            // Animation
            gsap.to(this, {
                rotation: 360,
                duration: 0.5,
                ease: "back.out(1.7)"
            });
        });
    }
    
    // Shuffle button
    if (shuffleBtn) {
        let isShuffle = false;
        
        shuffleBtn.addEventListener('click', function() {
            isShuffle = !isShuffle;
            
            if (isShuffle) {
                this.classList.add('active');
            } else {
                this.classList.remove('active');
            }
            
            // Animation
            gsap.to(this, {
                rotation: 360,
                duration: 0.5,
                ease: "back.out(1.7)"
            });
        });
    }
    
    // Favorite button
    if (favoriteBtn && heartIcon) {
        let isFavorite = false;
        
        favoriteBtn.addEventListener('click', function() {
            isFavorite = !isFavorite;
            
            if (isFavorite) {
                heartIcon.className = 'fas fa-heart';
                this.classList.add('active');
                
                // Particle effect
                createHeartParticles(this);
            } else {
                heartIcon.className = 'far fa-heart';
                this.classList.remove('active');
            }
            
            // Animation
            gsap.to(this, {
                scale: 1.3,
                duration: 0.2,
                yoyo: true,
                repeat: 1
            });
        });
    }
    
    // Share button
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            // Create share data
            const trackTitle = document.getElementById('trackTitle')?.textContent || 'Gurbani Radio';
            const trackArtist = document.getElementById('trackArtist')?.textContent || 'Spiritual Music';
            
            const shareData = {
                title: 'ਗੁਰਬਾਣੀ ਰੇਡੀਓ',
                text: `ਮੈਂ ਇਹ ਸੁਣ ਰਿਹਾ ਹਾਂ: "${trackTitle}" - ${trackArtist}`,
                url: window.location.href
            };
            
            // Try Web Share API
            if (navigator.share) {
                navigator.share(shareData).catch(console.error);
            } else {
                // Fallback: copy to clipboard
                const textToCopy = `${shareData.text}\n${shareData.url}`;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    alert('ਲਿੰਕ ਕਲਿੱਪਬੋਰਡ ਵਿੱਚ ਕਾਪੀ ਹੋ ਗਿਆ ਹੈ!');
                }).catch(console.error);
            }
            
            // Animation
            gsap.to(this, {
                rotation: 360,
                duration: 0.5,
                ease: "back.out(1.7)"
            });
        });
    }
    
    // Create heart particles animation
    function createHeartParticles(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        for (let i = 0; i < 10; i++) {
            const particle = document.createElement('div');
            particle.className = 'heart-particle';
            particle.innerHTML = '❤️';
            particle.style.position = 'fixed';
            particle.style.left = centerX + 'px';
            particle.style.top = centerY + 'px';
            particle.style.fontSize = '20px';
            particle.style.zIndex = '1000';
            particle.style.pointerEvents = 'none';
            
            document.body.appendChild(particle);
            
            // Animate particle
            gsap.to(particle, {
                x: (Math.random() - 0.5) * 100,
                y: -100,
                opacity: 0,
                rotation: Math.random() * 360,
                duration: 1,
                ease: "power2.out",
                onComplete: function() {
                    particle.remove();
                }
            });
        }
    }
}

// Handle window resize
window.addEventListener('resize', function() {
    // Update visualizer canvas sizes
    const waveformCanvas = document.getElementById('waveform-canvas');
    const frequencyCanvas = document.getElementById('frequency-canvas');
    
    if (waveformCanvas && frequencyCanvas) {
        const container = waveformCanvas.parentElement;
        if (container) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            waveformCanvas.width = width;
            waveformCanvas.height = height;
            frequencyCanvas.width = width;
            frequencyCanvas.height = height;
        }
    }
});

// Initialize on load
window.addEventListener('load', function() {
    // Add loaded class for animations
    document.body.classList.add('loaded');
    
    // Initial animation for elements
    gsap.from('.app-header', {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power2.out"
    });
    
    gsap.from('.visualizer-panel', {
        x: -50,
        opacity: 0,
        duration: 1,
        delay: 0.2,
        ease: "power2.out"
    });
    
    gsap.from('.player-panel', {
        x: 50,
        opacity: 0,
        duration: 1,
        delay: 0.4,
        ease: "power2.out"
    });
    
    // Auto-play after a delay (if user interaction occurred)
    setTimeout(() => {
        const audioPlayer = document.getElementById('audioPlayer');
        const playBtn = document.getElementById('playBtn');
        const playIcon = document.getElementById('playIcon');
        
        if (audioPlayer && playBtn && playIcon) {
            // Try to play automatically
            audioPlayer.play().then(() => {
                playIcon.className = 'fas fa-pause';
                playBtn.classList.add('playing');
            }).catch(e => {
                console.log('Auto-play failed, waiting for user interaction');
            });
        }
    }, 1000);
});
