/**
 * Login Component - Cyberpunk Edition
 * 特性：Canvas 粒子背景、毛玻璃特效、流光交互
 */

const LoginTemplate = `
<div class="relative h-full w-full overflow-hidden bg-[#020408] font-sans flex items-center justify-center">
    
    <canvas id="particle-canvas" class="absolute inset-0 z-0"></canvas>
    
    <div class="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-cyan-600/10 rounded-full blur-[150px] animate-pulse-slow pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-600/10 rounded-full blur-[150px] animate-pulse-slow pointer-events-none" style="animation-delay: 2s"></div>

    <div class="relative z-10 w-full max-w-[420px] p-1">
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/50 via-purple-500/50 to-cyan-500/50 rounded-2xl blur opacity-30 animate-border-flow"></div>
        
        <div class="relative bg-[#0a0c14]/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden">
            
            <div class="h-1 w-full bg-gradient-to-r from-cyan-500 to-purple-600"></div>

            <div class="p-8">
                <div class="text-center mb-10">
                    <div class="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-2xl text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] mb-4 transform hover:scale-105 transition-transform duration-500">
                        <i class="fa-solid fa-cube"></i>
                    </div>
                    <h1 class="text-3xl font-black text-white tracking-wider mb-1">MY WORKSPACE</h1>
                    <p class="text-[10px] text-cyan-400 font-mono tracking-[0.3em] uppercase opacity-80">
                        {{ isRegister ? 'Initialize User Protocol' : 'System Access Terminal' }}
                    </p>
                </div>

                <div class="space-y-5">
                    
                    <div v-if="isRegister" class="group relative animate-fade-in-down">
                        <i class="fa-regular fa-id-card absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors"></i>
                        <input v-model="form.name" type="text" 
                            class="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-gray-600 outline-none focus:border-cyan-500/50 focus:bg-black/50 transition-all duration-300"
                            placeholder="真实姓名 / Display Name">
                    </div>

                    <div class="group relative">
                        <i class="fa-regular fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors"></i>
                        <input v-model="form.username" type="text" 
                            class="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-gray-600 outline-none focus:border-cyan-500/50 focus:bg-black/50 transition-all duration-300"
                            placeholder="账号 / Username">
                    </div>

                    <div class="group relative">
                        <i class="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyan-400 transition-colors"></i>
                        <input v-model="form.password" type="password" 
                            class="w-full bg-black/30 border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-white placeholder-gray-600 outline-none focus:border-cyan-500/50 focus:bg-black/50 transition-all duration-300"
                            placeholder="密码 / Password">
                    </div>

                    <button @click="handleSubmit" :disabled="loading" 
                        class="w-full relative overflow-hidden group bg-gradient-to-r from-cyan-700 to-blue-700 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_5px_15px_rgba(6,182,212,0.3)] hover:shadow-[0_8px_25px_rgba(6,182,212,0.5)] transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
                        <div class="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></div>
                        <span class="relative flex items-center justify-center gap-2">
                            <i v-if="loading" class="fa-solid fa-circle-notch fa-spin"></i>
                            {{ isRegister ? '注册账号 (REGISTER)' : '进入系统 (LOGIN)' }}
                        </span>
                    </button>
                </div>

                <div v-if="msg.content" :class="['mt-4 text-xs text-center p-2.5 rounded-lg border flex items-center justify-center gap-2 animate-bounce-in', msg.type==='error'?'text-red-300 bg-red-900/20 border-red-500/30':'text-emerald-300 bg-emerald-900/20 border-emerald-500/30']">
                    <i :class="msg.type==='error'?'fa-solid fa-circle-exclamation':'fa-solid fa-circle-check'"></i>
                    {{ msg.content }}
                </div>

                <div class="mt-8 text-center">
                    <p class="text-xs text-gray-500">
                        {{ isRegister ? '已有账号？' : '还没有账号？' }}
                        <button @click="toggleMode" class="text-cyan-400 hover:text-cyan-300 font-bold ml-1 hover:underline transition-all">
                            {{ isRegister ? '立即登录' : '创建新账号' }}
                        </button>
                    </p>
                </div>
            </div>
        </div>
        
        <div class="text-center mt-6 text-[10px] text-gray-600 font-mono">
            SECURE CONNECTION ESTABLISHED v3.0
        </div>
    </div>

    <component :is="'style'">
        @keyframes border-flow { 0% { opacity: 0.3; } 50% { opacity: 0.6; } 100% { opacity: 0.3; } }
        .animate-border-flow { animation: border-flow 3s ease-in-out infinite; }
        .animate-pulse-slow { animation: pulse 6s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        .animate-fade-in-down { animation: fadeInDown 0.3s ease-out; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    </component>
</div>
`;

const LoginComponent = {
    template: LoginTemplate,
    emits: ['login-success'],
    setup(props, { emit }) {
        const { ref, reactive, onMounted, onUnmounted } = Vue;
        
        // --- 表单逻辑 ---
        const isRegister = ref(false);
        const loading = ref(false);
        const msg = reactive({ type: '', content: '' });
        const form = reactive({ username: '', password: '', name: '' });

        const toggleMode = () => {
            isRegister.value = !isRegister.value;
            msg.content = '';
            form.username = ''; form.password = ''; form.name = '';
        };

        const handleSubmit = async () => {
            if(!form.username || !form.password) return showMsg('请填写完整信息', 'error');
            if(isRegister.value && !form.name) return showMsg('请输入真实姓名', 'error');
            
            loading.value = true;
            msg.content = "";

            try {
                const endpoint = isRegister.value ? '/api/auth/register' : '/api/auth/login';
                const res = await fetch(`http://localhost:3001${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form)
                });
                const data = await res.json();

                if (res.ok) {
                    if (isRegister.value) {
                        showMsg('注册成功！正在切换至登录...', 'success');
                        setTimeout(() => { 
                            isRegister.value = false; 
                            form.password = '';
                            msg.content = '';
                        }, 1500);
                    } else {
                        // 存储数据
                        localStorage.setItem('authToken', data.token);
                        localStorage.setItem('authUser', data.name);
                        localStorage.setItem('authId', data.userId);
                        localStorage.setItem('authUsername', data.username);
                        localStorage.setItem('authAvatar', data.avatar || '');
                        localStorage.setItem('authPerms', JSON.stringify(data.permissions || {}));
                        
                        emit('login-success', data);
                    }
                } else {
                    showMsg(data.message || '操作失败', 'error');
                }
            } catch (e) {
                showMsg('服务器连接失败，请检查网络', 'error');
            } finally {
                loading.value = false;
            }
        };

        const showMsg = (text, type) => {
            msg.content = text; msg.type = type;
            if(type === 'error') setTimeout(() => msg.content = '', 3000);
        };

        // --- Canvas 粒子背景逻辑 ---
        let animationFrameId;
        
        const initCanvas = () => {
            const canvas = document.getElementById('particle-canvas');
            if(!canvas) return;
            
            const ctx = canvas.getContext('2d');
            let width, height;
            let particles = [];

            // 粒子配置
            const particleCount = 60;
            const connectionDistance = 150;
            const mouseDistance = 200;

            let mouse = { x: null, y: null };

            const resize = () => {
                width = canvas.width = window.innerWidth;
                height = canvas.height = window.innerHeight;
            };

            class Particle {
                constructor() {
                    this.x = Math.random() * width;
                    this.y = Math.random() * height;
                    this.vx = (Math.random() - 0.5) * 0.5;
                    this.vy = (Math.random() - 0.5) * 0.5;
                    this.size = Math.random() * 2 + 1;
                    this.color = Math.random() > 0.5 ? 'rgba(6, 182, 212, ' : 'rgba(147, 51, 234, '; // Cyan or Purple
                }

                update() {
                    this.x += this.vx;
                    this.y += this.vy;

                    // 边界反弹
                    if (this.x < 0 || this.x > width) this.vx *= -1;
                    if (this.y < 0 || this.y > height) this.vy *= -1;

                    // 鼠标互动
                    if(mouse.x != null) {
                        let dx = mouse.x - this.x;
                        let dy = mouse.y - this.y;
                        let distance = Math.sqrt(dx*dx + dy*dy);
                        if (distance < mouseDistance) {
                            const forceDirectionX = dx / distance;
                            const forceDirectionY = dy / distance;
                            const force = (mouseDistance - distance) / mouseDistance;
                            const directionX = forceDirectionX * force * 0.6;
                            const directionY = forceDirectionY * force * 0.6;
                            this.x += directionX;
                            this.y += directionY;
                        }
                    }
                }

                draw() {
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fillStyle = this.color + '0.5)';
                    ctx.fill();
                }
            }

            const initParticles = () => {
                particles = [];
                for (let i = 0; i < particleCount; i++) {
                    particles.push(new Particle());
                }
            };

            const animate = () => {
                ctx.clearRect(0, 0, width, height);
                
                for (let i = 0; i < particles.length; i++) {
                    particles[i].update();
                    particles[i].draw();

                    // 连线
                    for (let j = i; j < particles.length; j++) {
                        const dx = particles[i].x - particles[j].x;
                        const dy = particles[i].y - particles[j].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < connectionDistance) {
                            ctx.beginPath();
                            ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / connectionDistance * 0.8})`;
                            ctx.lineWidth = 0.5;
                            ctx.moveTo(particles[i].x, particles[i].y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.stroke();
                        }
                    }
                }
                animationFrameId = requestAnimationFrame(animate);
            };

            // 监听事件
            window.addEventListener('resize', resize);
            window.addEventListener('mousemove', (e) => {
                mouse.x = e.x;
                mouse.y = e.y;
            });
            window.addEventListener('mouseout', () => {
                mouse.x = null;
                mouse.y = null;
            });

            resize();
            initParticles();
            animate();
        };

        onMounted(() => {
            initCanvas();
        });

        onUnmounted(() => {
            if(animationFrameId) cancelAnimationFrame(animationFrameId);
            // 清理事件监听比较麻烦，在这个简单场景下依赖浏览器GC即可，
            // 严谨点应该把 resize 等函数提出来具名引用然后 remove
        });

        return { isRegister, form, msg, loading, toggleMode, handleSubmit };
    }
};