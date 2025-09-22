 // Данные треков
        const tracks = [
            { id: 1, title: "Электронная мелодия", artist: "DJ Soundwave", duration: "3:45", cover: "🎶" },
            { id: 2, title: "Летний бит", artist: "Beat Maker", duration: "4:12", cover: "🌞" },
            { id: 3, title: "Ночной город", artist: "City Sounds", duration: "5:30", cover: "🌃" },
            { id: 4, title: "Танцевальный микс", artist: "Dance Master", duration: "3:22", cover: "💃" },
            { id: 5, title: "Релакс волны", artist: "Chill Vibes", duration: "6:15", cover: "🌊" },
            { id: 6, title: "Рок энергия", artist: "Electric Band", duration: "4:33", cover: "⚡" },
            { id: 7, title: "Джазовый вечер", artist: "Smooth Jazz", duration: "5:45", cover: "🎷" },
            { id: 8, title: "Поп хит", artist: "Pop Star", duration: "3:28", cover: "⭐" }
        ];

        let currentTrackIndex = 0;
        let isPlaying = false;
        let currentTime = 0;
        let totalTime = 225; // 3:45 в секундах

        // Создание анимированного фона
        function createAnimatedBackground() {
            const canvas = document.getElementById('animatedBg');
            const ctx = canvas.getContext('2d');
            
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            const particles = [];
            const particleCount = 50;
            
            class Particle {
                constructor() {
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.vx = (Math.random() - 0.5) * 1;
                    this.vy = (Math.random() - 0.5) * 1;
                    this.size = Math.random() * 2 + 1;
                    this.opacity = Math.random() * 0.3 + 0.1;
                }
                
                update() {
                    this.x += this.vx;
                    this.y += this.vy;
                    
                    if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
                    if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
                }
                
                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 85, 0, ${this.opacity})`;
                    ctx.fill();
                }
            }
            
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
            
            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                particles.forEach(particle => {
                    particle.update();
                    particle.draw();
                });
                
                requestAnimationFrame(animate);
            }
            
            animate();
            
            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });
        }

        // Создание волновой формы
        function createWaveform() {
            const container = document.getElementById('waveContainer');
            const barsCount = 200;
            
            for (let i = 0; i < barsCount; i++) {
                const bar = document.createElement('div');
                bar.className = 'wave-bar';
                bar.style.height = Math.random() * 80 + 20 + '%';
                bar.style.animationDelay = Math.random() * 2 + 's';
                container.appendChild(bar);
            }
        }

        // Создание списка треков
        function createTracksList() {
            const tracksList = document.getElementById('tracksList');
            
            tracks.forEach((track, index) => {
                const trackItem = document.createElement('div');
                trackItem.className = 'track-item';
                trackItem.innerHTML = `
                    <div class="track-number">${index + 1}</div>
                    <div class="track-cover-small">${track.cover}</div>
                    <div class="track-details">
                        <h4>${track.title}</h4>
                        <p>${track.artist}</p>
                    </div>
                    <div class="track-duration">${track.duration}</div>
                    <button class="play-track-btn" onclick="playTrack(${index})">▶</button>
                `;
                tracksList.appendChild(trackItem);
            });
        }

        // Воспроизведение трека
        function playTrack(index) {
            currentTrackIndex = index;
            const track = tracks[index];
            
            document.getElementById('currentTrack').textContent = track.title;
            document.getElementById('currentArtist').textContent = track.artist;
            
            // Обновление активного трека в списке
            document.querySelectorAll('.track-item').forEach((item, i) => {
                if (i === index) {
                    item.style.background = 'rgba(255, 85, 0, 0.2)';
                } else {
                    item.style.background = 'rgba(255, 255, 255, 0.05)';
                }
            });
            
            if (!isPlaying) {
                togglePlay();
            }
        }

        // Переключение воспроизведения
        function togglePlay() {
            isPlaying = !isPlaying;
            const playBtn = document.getElementById('playBtn');
            
            if (isPlaying) {
                playBtn.textContent = '⏸';
                startProgressAnimation();
            } else {
                playBtn.textContent = '▶';
            }
        }

        // Анимация прогресса
        function startProgressAnimation() {
            if (!isPlaying) return;
            
            const progressLine = document.getElementById('progressLine');
            const currentTimeEl = document.getElementById('currentTime');
            
            currentTime++;
            if (currentTime >= totalTime) {
                currentTime = 0;
                nextTrack();
                return;
            }
            
            const progress = (currentTime / totalTime) * 100;
            progressLine.style.width = progress + '%';
            
            const minutes = Math.floor(currentTime / 60);
            const seconds = currentTime % 60;
            currentTimeEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            setTimeout(startProgressAnimation, 1000);
        }

        // Следующий трек
        function nextTrack() {
            currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
            playTrack(currentTrackIndex);
        }

        // Предыдущий трек
        function prevTrack() {
            currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
            playTrack(currentTrackIndex);
        }

        // Обработчики событий
        document.getElementById('playBtn').addEventListener('click', togglePlay);
        document.getElementById('nextBtn').addEventListener('click', nextTrack);
        document.getElementById('prevBtn').addEventListener('click', prevTrack);

        // Клик по волновой форме
        document.getElementById('waveform').addEventListener('click', (e) => {
            const rect = e.target.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const progress = clickX / rect.width;
            
            currentTime = Math.floor(totalTime * progress);
            const progressLine = document.getElementById('progressLine');
            progressLine.style.width = (progress * 100) + '%';
            
            const minutes = Math.floor(currentTime / 60);
            const seconds = currentTime % 60;
            document.getElementById('currentTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        });

        // Контроль громкости
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            const volume = e.target.value;
            console.log('Громкость:', volume + '%');
        });

        // Инициализация
        document.addEventListener('DOMContentLoaded', () => {
            createAnimatedBackground();
            createWaveform();
            createTracksList();
            playTrack(0);
        });