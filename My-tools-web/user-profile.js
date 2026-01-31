/**
 * User Profile Component - V2.1 (Avatar Selector Upgrade)
 * 更新：新增头像选择器弹窗，内置40+系统头像，支持本地上传
 */

const UserProfileTemplate = `
<div class="h-full flex flex-col bg-[#0b0c15] text-gray-100 font-sans selection:bg-blue-500/30">
    <div class="px-8 py-6 border-b border-white/10 bg-[#0b0c15]/90 backdrop-blur-xl flex justify-between items-center shrink-0">
        <h2 class="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
            <i class="fa-solid fa-user-astronaut text-blue-500"></i> 个人中心
        </h2>
        
        <div class="flex gap-2 bg-white/5 p-1 rounded-lg">
            <button @click="currentTab = 'profile'" :class="['px-4 py-1.5 rounded-md text-sm font-bold transition-all', currentTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white']">
                <i class="fa-solid fa-id-card mr-1"></i> 基础资料
            </button>
            <button @click="currentTab = 'skills'" :class="['px-4 py-1.5 rounded-md text-sm font-bold transition-all', currentTab === 'skills' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white']">
                <i class="fa-solid fa-tree mr-1"></i> 技能树
            </button>
            <button @click="currentTab = 'security'" :class="['px-4 py-1.5 rounded-md text-sm font-bold transition-all', currentTab === 'security' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white']">
                <i class="fa-solid fa-shield-halved mr-1"></i> 账号安全
            </button>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
        
        <div v-if="currentTab === 'profile'" class="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
            <div class="flex flex-col items-center gap-4">
                <div class="relative group cursor-pointer" @click="showAvatarModal = true">
                    <div class="w-32 h-32 rounded-full p-1 border-4 border-blue-500/30 group-hover:border-blue-500 transition-all shadow-2xl relative overflow-hidden">
                        <img :src="form.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed='+form.name" class="w-full h-full rounded-full object-cover">
                        <div class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                            <i class="fa-solid fa-camera text-white text-2xl mb-1"></i>
                            <span class="text-[10px] text-gray-300 font-bold uppercase tracking-wider">更换头像</span>
                        </div>
                    </div>
                    <div class="absolute bottom-2 right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-[#0b0c15] text-white shadow-lg">
                        <i class="fa-solid fa-pen text-xs"></i>
                    </div>
                </div>
                
                <div class="text-center">
                    <h3 class="text-xl font-bold text-white">{{ user.name }}</h3>
                    <p class="text-sm text-gray-500 font-mono">@{{ user.username }}</p>
                </div>
            </div>

            <div class="bg-[#13151f] border border-white/10 rounded-xl p-6 space-y-4">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-2">昵称 / 姓名</label>
                    <div class="flex items-center bg-black/30 border border-white/10 rounded-lg px-4 focus-within:border-blue-500 transition-colors">
                        <i class="fa-regular fa-user text-gray-500 mr-3"></i>
                        <input v-model="form.name" type="text" class="w-full bg-transparent py-3 text-white outline-none">
                    </div>
                </div>
                <button @click="updateProfile" class="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2">
                    <i v-if="loading" class="fa-solid fa-spinner fa-spin"></i> 保存修改
                </button>
            </div>
        </div>

        <div v-else-if="currentTab === 'skills'" class="max-w-5xl mx-auto animate-fade-in-up">
            <div class="flex justify-between items-end mb-6">
                <div>
                    <h3 class="text-xl font-bold text-white">我的技能树</h3>
                    <p class="text-xs text-gray-500 mt-1">点亮你的天赋，展示你的实力</p>
                </div>
                <button @click="openSkillModal()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2 transition-all">
                    <i class="fa-solid fa-plus"></i> 添加技能
                </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-4">
                    <div class="flex items-center gap-2 pb-2 border-b border-white/10">
                        <div class="w-8 h-8 rounded bg-blue-900/20 text-blue-400 flex items-center justify-center border border-blue-500/30"><i class="fa-solid fa-code"></i></div>
                        <span class="font-bold text-blue-400 uppercase tracking-wider text-sm">职业技能 (Hard Skills)</span>
                    </div>
                    <div v-if="hardSkills.length === 0" class="text-center py-10 border border-dashed border-white/10 rounded-xl text-gray-600 text-sm">暂无职业技能，快去添加吧</div>
                    <div v-for="(skill, index) in hardSkills" :key="index" @click="openSkillModal(skill)" class="bg-[#13151f] border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all cursor-pointer group relative overflow-hidden">
                        <div class="flex justify-between items-center mb-2">
                            <div class="flex items-center gap-2">
                                <span class="font-bold text-white">{{ skill.name }}</span>
                                <i v-if="skill.isCore" class="fa-solid fa-star text-yellow-400 text-xs" title="核心技能"></i>
                                <i v-if="skill.isLearning" class="fa-solid fa-rocket text-pink-400 text-xs" title="正在提升"></i>
                            </div>
                            <div class="text-xs font-mono font-bold" :class="getLevelColorText(skill.level)">Lv.{{ skill.level }}</div>
                        </div>
                        <div class="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                            <div class="h-full transition-all duration-1000 relative" :class="getLevelColorBg(skill.level)" :style="{ width: skill.level + '%' }">
                                <div class="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                            </div>
                        </div>
                        <button @click.stop="deleteSkill(skill)" class="absolute right-2 top-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="flex items-center gap-2 pb-2 border-b border-white/10">
                        <div class="w-8 h-8 rounded bg-emerald-900/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30"><i class="fa-solid fa-comments"></i></div>
                        <span class="font-bold text-emerald-400 uppercase tracking-wider text-sm">服务技能 (Soft Skills)</span>
                    </div>
                    <div v-if="softSkills.length === 0" class="text-center py-10 border border-dashed border-white/10 rounded-xl text-gray-600 text-sm">暂无服务技能</div>
                    <div v-for="(skill, index) in softSkills" :key="index" @click="openSkillModal(skill)" class="bg-[#13151f] border border-white/5 rounded-xl p-4 hover:border-emerald-500/30 transition-all cursor-pointer group relative overflow-hidden">
                        <div class="flex justify-between items-center mb-2">
                            <div class="flex items-center gap-2">
                                <span class="font-bold text-white">{{ skill.name }}</span>
                                <i v-if="skill.isCore" class="fa-solid fa-star text-yellow-400 text-xs" title="核心技能"></i>
                                <i v-if="skill.isLearning" class="fa-solid fa-rocket text-pink-400 text-xs" title="正在提升"></i>
                            </div>
                            <div class="text-xs font-mono font-bold" :class="getLevelColorText(skill.level)">Lv.{{ skill.level }}</div>
                        </div>
                        <div class="h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                            <div class="h-full transition-all duration-1000 relative" :class="getLevelColorBg(skill.level)" :style="{ width: skill.level + '%' }">
                                <div class="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                            </div>
                        </div>
                        <button @click.stop="deleteSkill(skill)" class="absolute right-2 top-2 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="max-w-2xl mx-auto bg-[#13151f] border border-white/10 rounded-xl p-8 space-y-6 animate-fade-in-up">
            <h3 class="text-lg font-bold text-red-400 flex items-center gap-2"><i class="fa-solid fa-lock"></i> 修改密码</h3>
            <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">旧密码</label>
                <input v-model="pwdForm.oldPassword" type="password" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none transition-colors">
            </div>
            <div>
                <label class="block text-xs font-bold text-gray-500 uppercase mb-2">新密码</label>
                <input v-model="pwdForm.newPassword" type="password" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-red-500 outline-none transition-colors">
            </div>
            <button @click="updatePassword" class="w-full bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-bold transition-all shadow-lg">提交修改</button>
        </div>
    </div>

    <div v-if="showAvatarModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
        <div class="bg-[#1a1c26] w-full max-w-4xl h-[80vh] rounded-2xl border border-white/10 flex flex-col shadow-2xl relative overflow-hidden animate-bounce-in">
            <div class="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    <i class="fa-solid fa-palette text-blue-500"></i> 选择头像
                </h3>
                <button @click="showAvatarModal = false" class="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors">
                    <i class="fa-solid fa-xmark text-lg"></i>
                </button>
            </div>

            <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
                <div class="w-full md:w-1/3 bg-black/20 border-r border-white/5 p-6 flex flex-col items-center justify-center gap-4 text-center">
                    <div class="w-32 h-32 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center bg-white/5 cursor-pointer hover:border-blue-500 hover:bg-blue-500/10 transition-all group" @click="triggerUpload">
                        <div class="flex flex-col items-center gap-2 text-gray-500 group-hover:text-blue-400">
                            <i class="fa-solid fa-cloud-arrow-up text-3xl"></i>
                            <span class="text-xs font-bold">上传本地图片</span>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 px-4">支持 JPG, PNG 格式<br>建议尺寸 200x200px</p>
                    <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileUpload">
                </div>

                <div class="flex-1 flex flex-col bg-[#0f111a]">
                    <div class="px-6 py-3 border-b border-white/5 text-xs font-bold text-gray-500 uppercase tracking-widest bg-black/20">
                        系统推荐 (System Presets)
                    </div>
                    <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        <div class="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4">
                            <div v-for="(avatarUrl, idx) in systemAvatars" :key="idx" 
                                @click="selectSystemAvatar(avatarUrl)"
                                class="aspect-square rounded-full border-2 border-white/5 hover:border-blue-500 hover:scale-110 cursor-pointer transition-all relative group bg-gray-800">
                                <img :src="avatarUrl" class="w-full h-full rounded-full object-cover">
                                <div v-if="form.avatar === avatarUrl" class="absolute inset-0 bg-blue-500/50 rounded-full flex items-center justify-center animate-fade-in">
                                    <i class="fa-solid fa-check text-white font-bold text-xl drop-shadow-md"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showSkillModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-[#1a1c26] w-full max-w-md rounded-2xl border border-indigo-500/30 p-6 flex flex-col gap-5 animate-bounce-in shadow-2xl">
            <h3 class="text-lg font-bold text-white">{{ isEditingSkill ? '编辑技能' : '添加新技能' }}</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1.5">技能名称</label>
                    <input v-model="skillForm.name" placeholder="例如: Vue.js, 沟通技巧..." class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-1.5">分类</label>
                    <div class="flex gap-2">
                        <button @click="skillForm.category = 'hard'" :class="['flex-1 py-2 rounded-lg text-xs font-bold border transition-all', skillForm.category === 'hard' ? 'bg-blue-600/20 text-blue-400 border-blue-500' : 'bg-black/20 text-gray-500 border-white/10 hover:border-white/30']">🔵 职业技能</button>
                        <button @click="skillForm.category = 'soft'" :class="['flex-1 py-2 rounded-lg text-xs font-bold border transition-all', skillForm.category === 'soft' ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500' : 'bg-black/20 text-gray-500 border-white/10 hover:border-white/30']">🟢 服务技能</button>
                    </div>
                </div>
                <div>
                    <div class="flex justify-between mb-2">
                        <label class="block text-xs font-bold text-gray-500 uppercase">熟练度</label>
                        <span :class="['text-xs font-bold font-mono', getLevelColorText(skillForm.level)]">{{ getLevelLabel(skillForm.level) }} ({{ skillForm.level }}%)</span>
                    </div>
                    <input type="range" v-model.number="skillForm.level" min="0" max="100" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400">
                    <div class="h-1.5 mt-2 rounded-full overflow-hidden bg-black/50">
                        <div class="h-full transition-all duration-300" :class="getLevelColorBg(skillForm.level)" :style="{width: skillForm.level + '%'}"></div>
                    </div>
                </div>
                <div class="flex gap-4 pt-2">
                    <label class="flex items-center gap-2 cursor-pointer group select-none">
                        <input type="checkbox" v-model="skillForm.isCore" class="w-4 h-4 rounded bg-gray-700 accent-yellow-500">
                        <span class="text-sm text-gray-400 group-hover:text-yellow-400 transition-colors"><i class="fa-solid fa-star mr-1"></i> 核心技能</span>
                    </label>
                    <label class="flex items-center gap-2 cursor-pointer group select-none">
                        <input type="checkbox" v-model="skillForm.isLearning" class="w-4 h-4 rounded bg-gray-700 accent-pink-500">
                        <span class="text-sm text-gray-400 group-hover:text-pink-400 transition-colors"><i class="fa-solid fa-rocket mr-1"></i> 正在提升</span>
                    </label>
                </div>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button @click="showSkillModal = false" class="text-gray-400 hover:text-white text-sm px-4">取消</button>
                <button @click="saveSkill" class="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg">保存</button>
            </div>
        </div>
    </div>

    <div v-if="toast.show" class="fixed top-6 left-1/2 -translate-x-1/2 z-[150] bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg border border-blue-400/50 animate-bounce-in font-bold text-sm">
        {{ toast.message }}
    </div>
</div>
`;

const UserProfileComponent = {
    template: UserProfileTemplate,
    setup() {
        const { ref, computed, onMounted } = Vue;
        const currentTab = ref('profile');
        const loading = ref(false);
        const user = ref({ name: '', username: '', avatar: '', skills: [] });
        const form = ref({ name: '', avatar: '' });
        const pwdForm = ref({ oldPassword: '', newPassword: '' });
        const fileInput = ref(null);
        const toast = ref({ show: false, message: '' });

        // Avatar Modal State
        const showAvatarModal = ref(false);
        
        // 生成 42 个系统预设头像 (Notion风格 + 冒险家风格)
        const systemAvatars = ref([]);
        const generateAvatars = () => {
            const arr = [];
            // Notionists (21个)
            for(let i=1; i<=21; i++) arr.push(`https://api.dicebear.com/7.x/notionists/svg?seed=user_${i}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`);
            // Adventurer (21个)
            for(let i=1; i<=21; i++) arr.push(`https://api.dicebear.com/7.x/adventurer/svg?seed=hero_${i}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`);
            systemAvatars.value = arr;
        };

        // Skill State
        const showSkillModal = ref(false);
        const isEditingSkill = ref(false);
        const editingSkillIndex = ref(-1);
        const skillForm = ref({ name: '', category: 'hard', level: 10, isCore: false, isLearning: false });

        const getH = () => ({ 'Authorization': `Bearer ${localStorage.getItem('authToken')}` });

        const init = () => {
            user.value.name = localStorage.getItem('authUser');
            user.value.username = localStorage.getItem('authUsername');
            user.value.avatar = localStorage.getItem('authAvatar');
            form.value.name = user.value.name;
            form.value.avatar = user.value.avatar;
            generateAvatars(); // 生成头像库
            fetchMySkills();
        };

        const fetchMySkills = async () => {
            try {
                const res = await fetch('/api/users/wall', { headers: getH() });
                if (res.ok) {
                    const allUsers = await res.json();
                    const myId = localStorage.getItem('authId');
                    const me = allUsers.find(u => u._id === myId);
                    if (me && me.skills) {
                        user.value.skills = me.skills;
                    }
                }
            } catch (e) { console.error(e); }
        };

        const hardSkills = computed(() => (user.value.skills || []).filter(s => s.category === 'hard'));
        const softSkills = computed(() => (user.value.skills || []).filter(s => s.category === 'soft'));

        const getLevelColorBg = (val) => {
            if (val <= 25) return 'bg-emerald-500';
            if (val <= 50) return 'bg-blue-500';
            if (val <= 75) return 'bg-purple-500';
            return 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]';
        };
        const getLevelColorText = (val) => {
            if (val <= 25) return 'text-emerald-400';
            if (val <= 50) return 'text-blue-400';
            if (val <= 75) return 'text-purple-400';
            return 'text-yellow-400';
        };
        const getLevelLabel = (val) => {
            if (val <= 25) return 'Novice';
            if (val <= 50) return 'Adept';
            if (val <= 75) return 'Expert';
            return 'Master';
        };

        // Profile & Avatar Methods
        const triggerUpload = () => fileInput.value.click();
        
        // 1. 选择系统头像
        const selectSystemAvatar = (url) => {
            form.value.avatar = url;
            updateProfile(); // 选中即保存
            showAvatarModal.value = false;
        };

        // 2. 上传本地图片
        const handleFileUpload = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const fd = new FormData(); fd.append('file', file);
            try {
                const res = await fetch('/api/auth/upload-avatar', { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }, body: fd });
                if (res.ok) {
                    const data = await res.json();
                    form.value.avatar = data.url;
                    updateProfile(); // 自动保存
                    showAvatarModal.value = false; // 关闭弹窗
                }
            } catch (e) { showToast('图片上传失败'); }
        };

        const updateProfile = async () => {
            loading.value = true;
            try {
                const res = await fetch('/api/auth/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getH() }, body: JSON.stringify(form.value) });
                if (res.ok) {
                    const data = await res.json();
                    user.value.name = data.name;
                    user.value.avatar = data.avatar;
                    localStorage.setItem('authUser', data.name);
                    localStorage.setItem('authAvatar', data.avatar);
                    window.dispatchEvent(new Event('profile-updated'));
                    showToast('资料已更新');
                }
            } catch (e) { showToast('更新失败'); } finally { loading.value = false; }
        };

        const updatePassword = async () => {
            if (!pwdForm.value.oldPassword || !pwdForm.value.newPassword) return showToast('请填写完整');
            try {
                const res = await fetch('/api/auth/password', { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getH() }, body: JSON.stringify(pwdForm.value) });
                const data = await res.json();
                showToast(res.ok ? '密码修改成功' : data.message);
                if (res.ok) pwdForm.value = { oldPassword: '', newPassword: '' };
            } catch (e) { showToast('网络错误'); }
        };

        // Skill Methods
        const openSkillModal = (skill = null) => {
            if (skill) {
                isEditingSkill.value = true;
                editingSkillIndex.value = user.value.skills.indexOf(skill);
                skillForm.value = JSON.parse(JSON.stringify(skill));
            } else {
                isEditingSkill.value = false;
                skillForm.value = { name: '', category: 'hard', level: 10, isCore: false, isLearning: false };
            }
            showSkillModal.value = true;
        };

        const saveSkill = async () => {
            if (!skillForm.value.name) return showToast('请输入技能名称');
            const newSkills = [...(user.value.skills || [])];
            if (isEditingSkill.value && editingSkillIndex.value > -1) {
                newSkills[editingSkillIndex.value] = skillForm.value;
            } else {
                newSkills.push(skillForm.value);
            }
            try {
                const res = await fetch('/api/auth/profile/skills', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', ...getH() },
                    body: JSON.stringify({ skills: newSkills })
                });
                if (res.ok) {
                    const data = await res.json();
                    user.value.skills = data.skills;
                    showSkillModal.value = false;
                    showToast('技能树已保存');
                } else { showToast('保存失败'); }
            } catch (e) { showToast('网络错误'); }
        };

        const deleteSkill = async (skill) => {
            if(!confirm(`确定删除技能 "${skill.name}" 吗？`)) return;
            const newSkills = user.value.skills.filter(s => s !== skill);
            try {
                const res = await fetch('/api/auth/profile/skills', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', ...getH() },
                    body: JSON.stringify({ skills: newSkills })
                });
                if (res.ok) {
                    user.value.skills = newSkills;
                    showToast('已删除');
                }
            } catch(e) { showToast('删除失败'); }
        };

        const showToast = (msg) => { toast.value = { show: true, message: msg }; setTimeout(() => toast.value.show = false, 2000); };

        onMounted(init);

        return {
            currentTab, user, form, pwdForm, loading, fileInput, toast,
            hardSkills, softSkills, showSkillModal, skillForm, isEditingSkill,
            triggerUpload, handleFileUpload, updateProfile, updatePassword,
            openSkillModal, saveSkill, deleteSkill,
            getLevelColorBg, getLevelColorText, getLevelLabel,
            showAvatarModal, systemAvatars, selectSystemAvatar // Avatar Vars
        };
    }
};