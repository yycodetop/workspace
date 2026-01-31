/**
 * Skill Wall Component - V9.0 (Streamlined & 5-Level Skills)
 * 迭代：
 * 1. 精简：移除了图片插入功能 (本地上传/URL)。
 * 2. 视觉升级：技能掌握度改为 5 级颜色映射 (入门/掌握/熟练/精通/专家)。
 * 3. 保持：富文本(链接/图标)、搜索、打卡、管理等核心功能。
 */

const SkillWallTemplate = `
<div class="h-full flex flex-col bg-[#0b0c15] text-gray-100 font-sans selection:bg-indigo-500/30 relative overflow-hidden">
    <div class="absolute inset-0 pointer-events-none" style="background-image: radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%);"></div>
    
    <div class="shrink-0 bg-[#13151f]/90 border-b border-white/5 backdrop-blur-md z-20 flex flex-col md:flex-row justify-between items-center px-6 py-4 gap-4">
        
        <div class="flex-1 overflow-hidden w-full md:w-auto">
            <h2 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <i class="fa-solid fa-users text-indigo-500"></i> Team Members
            </h2>
            <div class="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
                <div v-for="user in sortedUsers" :key="user._id" 
                     @click="openMemberModal(user)"
                     class="group flex flex-col items-center gap-2 cursor-pointer min-w-[60px]">
                    <div class="relative w-10 h-10">
                        <div class="absolute inset-0 bg-indigo-500 rounded-full blur opacity-0 group-hover:opacity-50 transition-opacity"></div>
                        <img :src="user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed='+user.name" 
                             class="relative w-full h-full rounded-full border-2 border-white/10 bg-gray-800 object-cover group-hover:scale-110 group-hover:border-indigo-400 transition-all duration-300">
                    </div>
                    <span class="text-[10px] text-gray-400 font-medium group-hover:text-white truncate max-w-full transition-colors">{{ user.name }}</span>
                </div>
            </div>
        </div>
        
        <div class="flex items-center gap-3 shrink-0 border-l border-white/10 pl-4 h-full">
            <div class="relative group">
                <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors"></i>
                <input v-model="searchQuery" placeholder="搜索..." class="bg-black/20 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:border-indigo-500 focus:bg-black/40 outline-none w-40 transition-all">
            </div>
            
            <button @click="toggleMyFilter" 
                    :class="['p-2 rounded-lg transition-all text-xs font-bold border flex items-center gap-2', 
                             onlyMe ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10']"
                    title="只看我的打卡">
                <i class="fa-solid fa-user"></i>
                <span class="hidden md:inline">回顾自己</span>
            </button>

            <button v-if="isAdmin" @click="showTypeConfig = true" class="text-gray-500 hover:text-indigo-400 transition-colors p-2 rounded-lg hover:bg-white/5" title="配置类型">
                <i class="fa-solid fa-sliders text-lg"></i>
            </button>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-4 md:px-10 py-8">
        <div class="max-w-3xl mx-auto">
            
            <div class="bg-[#1a1c26] border border-white/10 rounded-2xl p-1 mb-10 shadow-2xl relative overflow-hidden group focus-within:border-indigo-500/50 transition-colors">
                
                <div class="flex items-center gap-1 px-3 py-2 border-b border-white/5 bg-[#151721]">
                    <button @click="openInsertModal('link')" class="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded flex items-center gap-1 text-xs" title="插入链接">
                        <i class="fa-solid fa-link"></i> 链接
                    </button>
                    <div class="w-px h-4 bg-white/10 mx-1"></div>
                    <div class="relative">
                        <button @click="showInputIconPicker = !showInputIconPicker" class="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded flex items-center gap-1 text-xs" title="插入图标">
                            <i class="fa-solid fa-icons"></i> 图标
                        </button>
                        <div v-if="showInputIconPicker" class="absolute top-full left-0 mt-2 w-64 bg-[#252630] border border-white/10 rounded-lg shadow-xl p-3 grid grid-cols-6 gap-2 z-50 animate-fade-in">
                            <button v-for="icon in availableIcons" :key="icon" @click="insertIcon(icon)" class="w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-white/10 rounded transition-all hover:scale-110">
                                <i :class="icon"></i>
                            </button>
                        </div>
                    </div>
                    <div class="flex-1"></div>
                    <span class="text-[10px] text-gray-600 font-mono">支持 Markdown</span>
                </div>

                <div class="p-4 flex gap-4">
                    <div class="shrink-0 w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </div>
                    <div class="flex-1">
                        <textarea ref="checkInInput" v-model="newCheckIn.content" rows="3" 
                            placeholder="今天学了什么新知识？..." 
                            class="w-full bg-transparent border-none outline-none text-sm text-gray-200 placeholder-gray-600 resize-none font-mono leading-relaxed"></textarea>
                        
                        <div class="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                            <div class="flex gap-2 flex-wrap">
                                <button v-for="type in checkInTypes" :key="type._id" 
                                        @click="newCheckIn.type = type.label"
                                        :class="['text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-2', 
                                                 newCheckIn.type === type.label ? (type.styleClass || 'bg-indigo-500 text-white border-indigo-500') : 'border-white/10 text-gray-500 hover:bg-white/10']">
                                    <i :class="type.icon"></i> {{ type.label }}
                                </button>
                            </div>
                            <button @click="submitCheckIn" :disabled="!newCheckIn.content.trim() || submitting"
                                    class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                <i v-if="submitting" class="fa-solid fa-circle-notch fa-spin"></i>
                                <span>打卡</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="space-y-8">
                <div v-if="loading" class="text-center py-10 text-gray-600"><i class="fa-solid fa-circle-notch fa-spin"></i> 加载动态中...</div>
                <div v-if="!loading && Object.keys(groupedCheckIns).length === 0" class="text-center py-10 text-gray-600">暂无数据</div>
                
                <div v-for="(group, dateStr) in groupedCheckIns" :key="dateStr" class="relative animate-fade-in">
                    <div class="sticky top-0 z-10 flex items-center gap-4 mb-6">
                        <div class="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        <span class="text-sm font-bold text-indigo-200 bg-[#0b0c15]/80 px-3 py-1 rounded-full backdrop-blur border border-white/10">{{ dateStr }}</span>
                        <div class="h-px bg-gradient-to-r from-indigo-500/30 to-transparent flex-1"></div>
                    </div>

                    <div class="ml-1.5 border-l-2 border-white/5 pl-8 space-y-6 pb-4">
                        <div v-for="log in group" :key="log._id" class="relative group">
                            <div class="absolute -left-[39px] top-4 w-5 h-5 rounded-full bg-[#0b0c15] border-2 border-gray-700 group-hover:border-indigo-500 transition-colors flex items-center justify-center">
                                <div class="w-1.5 h-1.5 rounded-full bg-gray-500 group-hover:bg-indigo-400"></div>
                            </div>

                            <div class="bg-[#151721] hover:bg-[#1a1c26] border border-white/5 hover:border-indigo-500/30 rounded-xl p-4 transition-all shadow-sm hover:shadow-lg flex gap-4">
                                <img :src="log.userId?.avatar || 'https://api.dicebear.com/7.x/initials/svg'" class="w-10 h-10 rounded-full bg-gray-800 object-cover shrink-0 cursor-pointer hover:opacity-80" @click="openMemberModal(log.userId)">
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-start mb-1">
                                        <div class="flex items-center gap-2">
                                            <span class="text-sm font-bold text-gray-300 cursor-pointer hover:text-indigo-400" @click="openMemberModal(log.userId)">{{ log.userId?.name || '未知用户' }}</span>
                                            <span class="text-[10px] text-gray-600 font-mono">{{ formatTime(log.createdAt) }}</span>
                                        </div>
                                        <div v-if="canManage(log) && !log.isEditing" class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                            <button @click="enableEdit(log)" class="text-xs text-gray-500 hover:text-blue-400"><i class="fa-solid fa-pen"></i></button>
                                            <button @click="deleteCheckIn(log._id)" class="text-xs text-gray-500 hover:text-red-400"><i class="fa-solid fa-trash"></i></button>
                                        </div>
                                    </div>
                                    <div class="mb-2" v-if="!log.isEditing">
                                        <span :class="['text-[10px] px-2 py-0.5 rounded border uppercase tracking-wider font-bold inline-flex items-center gap-1', getTypeStyle(log.type)]">
                                            <i :class="getTypeIcon(log.type)"></i> {{ log.type }}
                                        </span>
                                    </div>
                                    <div v-if="!log.isEditing" class="text-sm text-gray-300 leading-relaxed markdown-content" v-html="renderMarkdown(log.content)"></div>
                                    <div v-else class="mt-2">
                                        <textarea v-model="log.editContent" rows="3" class="w-full bg-black/20 border border-white/10 rounded p-2 text-sm text-gray-200 focus:border-indigo-500 outline-none mb-2 font-mono"></textarea>
                                        <div class="flex justify-end gap-2">
                                            <button @click="cancelEdit(log)" class="text-xs px-3 py-1 rounded border border-white/10 text-gray-400 hover:text-white">取消</button>
                                            <button @click="saveEdit(log)" class="text-xs px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500">保存</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showInsertMedia" class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" @click.self="showInsertMedia = false">
        <div class="bg-[#1a1c26] w-full max-w-sm rounded-xl border border-white/10 shadow-2xl p-6">
            <h3 class="text-lg font-bold text-white mb-4">插入链接</h3>
            <div class="space-y-4">
                <div>
                    <label class="text-[10px] text-gray-500 block mb-1">链接文字</label>
                    <input v-model="mediaForm.text" class="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none">
                </div>
                <div>
                    <label class="text-[10px] text-gray-500 block mb-1">链接地址 (URL)</label>
                    <input v-model="mediaForm.url" class="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" placeholder="https://...">
                </div>
                <div class="flex gap-3 pt-2">
                    <button @click="showInsertMedia = false" class="flex-1 py-2 text-xs text-gray-400 hover:text-white border border-white/10 rounded">取消</button>
                    <button @click="confirmInsert" class="flex-1 py-2 text-xs bg-indigo-600 text-white font-bold rounded hover:bg-indigo-500" :disabled="!mediaForm.url">确认插入</button>
                </div>
            </div>
        </div>
    </div>

    <div v-if="selectedUser" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" @click.self="closeMemberModal">
        <div class="bg-[#13151f] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden relative animate-scale-up">
            <button @click="closeMemberModal" class="absolute top-4 right-4 text-gray-500 hover:text-white z-10"><i class="fa-solid fa-xmark text-xl"></i></button>
            <div class="p-8 border-b border-white/5 bg-gradient-to-r from-indigo-900/20 to-transparent flex items-center gap-6">
                <div class="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                    <img :src="selectedUser.avatar || 'https://api.dicebear.com/7.x/initials/svg'" class="w-full h-full rounded-full bg-gray-900 object-cover">
                </div>
                <div>
                    <h2 class="text-2xl font-black text-white mb-1">{{ selectedUser.name }}</h2>
                    <p class="text-indigo-300 text-sm font-mono mb-3">加入于 {{ formatDate(selectedUser.createdAt) }}</p>
                    <span class="text-xs bg-white/5 px-3 py-1 rounded-full text-gray-400">🔥 {{ (selectedUser.skills || []).length }} 项技能</span>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#0b0c15]">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="space-y-6">
                        <h3 class="text-sm font-bold text-yellow-500 uppercase tracking-widest border-b border-yellow-500/20 pb-2 mb-4"><i class="fa-solid fa-crown mr-2"></i> 核心专长</h3>
                        <div v-for="skill in getCoreSkills(selectedUser)" :key="skill.name" class="group">
                            <div class="flex justify-between text-xs mb-1.5"><span class="font-bold text-gray-200">{{ skill.name }}</span><span :class="['font-mono font-bold', getLevelColorText(skill.level)]">Lv.{{ skill.level }}</span></div>
                            <div class="h-2 bg-gray-800 rounded-full overflow-hidden"><div class="h-full rounded-full transition-all duration-500" :class="getLevelColorBg(skill.level)" :style="{ width: skill.level + '%' }"></div></div>
                        </div>
                    </div>
                    <div class="space-y-8">
                        <div>
                            <h3 class="text-sm font-bold text-pink-400 uppercase tracking-widest border-b border-pink-500/20 pb-2 mb-4"><i class="fa-solid fa-fire-flame-curved mr-2"></i> 正在攻克</h3>
                            <div class="flex flex-wrap gap-3"><div v-for="skill in getLearningSkills(selectedUser)" :key="skill.name" class="bg-pink-900/10 border border-pink-500/30 px-3 py-2 rounded-lg flex items-center gap-3"><span class="text-sm font-bold text-pink-200">{{ skill.name }}</span><div class="text-xs font-mono text-pink-400 bg-black/30 px-1.5 rounded">{{ skill.level }}%</div></div></div>
                        </div>
                        <div v-if="getOtherSkills(selectedUser).length > 0">
                            <h3 class="text-sm font-bold text-blue-400 uppercase tracking-widest border-b border-blue-500/20 pb-2 mb-4"><i class="fa-solid fa-layer-group mr-2"></i> 技能储备</h3>
                            <div class="flex flex-wrap gap-2"><span v-for="skill in getOtherSkills(selectedUser)" :key="skill.name" class="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2 py-1 rounded">{{ skill.name }}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showTypeConfig" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" @click.self="resetTypeForm">
        <div class="bg-[#1a1c26] w-full max-w-lg rounded-xl border border-white/10 shadow-2xl p-6 flex flex-col max-h-[80vh]">
            <div class="flex justify-between items-center mb-6 shrink-0">
                <h3 class="text-lg font-bold text-white">🏷️ 打卡类型管理</h3>
                <button @click="resetTypeForm" class="text-gray-500 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="space-y-3 flex-1 overflow-y-auto custom-scrollbar mb-6 pr-2">
                <div v-for="type in checkInTypes" :key="type._id" 
                     class="flex items-center gap-3 bg-black/20 p-3 rounded border border-white/5 hover:border-indigo-500/30 transition-colors group">
                    <div :class="['w-8 h-8 rounded flex items-center justify-center shrink-0', type.styleClass || 'bg-gray-700 text-gray-300']">
                        <i :class="type.icon"></i>
                    </div>
                    <div class="flex-1 min-w-0"><div class="text-sm text-gray-200 font-bold">{{ type.label }}</div></div>
                    <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click="editType(type)" class="text-gray-500 hover:text-blue-400 p-1"><i class="fa-solid fa-pen"></i></button>
                        <button @click="deleteType(type._id)" class="text-gray-500 hover:text-red-400 p-1"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
            <div class="border-t border-white/10 pt-4 shrink-0">
                <h4 class="text-xs font-bold text-gray-500 uppercase mb-3 flex justify-between items-center">
                    <span>{{ editingType ? '编辑类型' : '新增类型' }}</span>
                    <button v-if="editingType" @click="resetTypeFormLocal" class="text-[10px] text-red-400 hover:text-red-300">取消编辑</button>
                </h4>
                <div class="space-y-4">
                    <div class="grid grid-cols-2 gap-4">
                        <div><label class="text-[10px] text-gray-500 block mb-1">名称</label><input v-model="newTypeForm.label" class="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"></div>
                        <div><label class="text-[10px] text-gray-500 block mb-1">样式</label><select v-model="newTypeForm.styleClass" class="w-full bg-black/40 border border-white/10 rounded px-3 py-2 text-sm text-gray-300 outline-none appearance-none"><option value="bg-blue-500/10 text-blue-400 border-blue-500/30">Blue</option><option value="bg-purple-500/10 text-purple-400 border-purple-500/30">Purple</option><option value="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Green</option><option value="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Yellow</option><option value="bg-pink-500/10 text-pink-400 border-pink-500/30">Pink</option><option value="bg-cyan-500/10 text-cyan-400 border-cyan-500/30">Cyan</option></select></div>
                    </div>
                    <div>
                        <label class="text-[10px] text-gray-500 block mb-2">图标</label>
                        <div class="grid grid-cols-8 gap-2 max-h-24 overflow-y-auto custom-scrollbar p-1">
                            <button v-for="icon in availableIcons" :key="icon" @click="newTypeForm.icon = icon" :class="['w-8 h-8 rounded flex items-center justify-center text-sm transition-all', newTypeForm.icon === icon ? 'bg-indigo-500 text-white scale-110 shadow-lg' : 'bg-white/5 text-gray-500 hover:bg-white/10 hover:text-white']"><i :class="icon"></i></button>
                        </div>
                    </div>
                    <button @click="saveType" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"><i :class="editingType ? 'fa-solid fa-check' : 'fa-solid fa-plus'"></i> {{ editingType ? '更新类型' : '添加类型' }}</button>
                </div>
            </div>
        </div>
    </div>

</div>
`;

// Styles
const style = document.createElement('style');
style.innerHTML = `
    @keyframes scale-up { 0% { transform: scale(0.95); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
    .animate-scale-up { animation: scale-up 0.2s ease-out; }
    .animate-fade-in { animation: fadeIn 0.2s ease-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    
    /* Markdown Styles */
    .markdown-content img { max-width: 100%; border-radius: 8px; margin: 8px 0; border: 1px solid rgba(255,255,255,0.1); }
    .markdown-content a { color: #818cf8; text-decoration: underline; }
    .markdown-content ul { list-style: disc; padding-left: 20px; }
    .markdown-content code { background: rgba(0,0,0,0.3); padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
`;
document.head.appendChild(style);

const SkillWallComponent = {
    template: SkillWallTemplate,
    setup() {
        const { ref, computed, onMounted } = Vue;
        const USERS_API = '/api/users/wall';
        const CHECKINS_API = '/api/checkins';
        const TYPES_API = '/api/checkins/config/types';
        
        const getAuth = () => ({ 'Authorization': `Bearer ${localStorage.getItem('authToken')}` });
        const getJsonHeaders = () => ({ 'Content-Type': 'application/json', ...getAuth() });
        const isAdmin = computed(() => localStorage.getItem('authUsername') === 'admin');
        const authId = localStorage.getItem('authId');

        // Data
        const users = ref([]);
        const checkIns = ref([]);
        const checkInTypes = ref([]);
        const loading = ref(false);
        const submitting = ref(false);
        const selectedUser = ref(null);
        
        // Search & Filter
        const searchQuery = ref('');
        const onlyMe = ref(false);
        
        // Config State
        const showTypeConfig = ref(false);
        const editingType = ref(null);
        const newTypeForm = ref({ label: '', icon: 'fa-solid fa-code', styleClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30' });

        // Insert Media State
        const showInsertMedia = ref(false);
        const mediaForm = ref({ text: '', url: '' });

        // Input State
        const newCheckIn = ref({ type: '', content: '' });
        const checkInInput = ref(null);
        const showInputIconPicker = ref(false);

        // Icons
        const availableIcons = [
            'fa-solid fa-code', 'fa-solid fa-pen-nib', 'fa-solid fa-book-open', 'fa-regular fa-lightbulb',
            'fa-solid fa-video', 'fa-solid fa-headphones', 'fa-solid fa-bug', 'fa-solid fa-dumbbell',
            'fa-solid fa-gamepad', 'fa-solid fa-music', 'fa-solid fa-palette', 'fa-solid fa-camera',
            'fa-solid fa-terminal', 'fa-solid fa-database', 'fa-solid fa-server', 'fa-brands fa-github'
        ];

        // --- Fetch ---
        const initData = async () => {
            loading.value = true;
            try {
                const typeRes = await fetch(TYPES_API, { headers: getAuth() });
                if (typeRes.ok) {
                    checkInTypes.value = await typeRes.json();
                    if(checkInTypes.value.length > 0 && !newCheckIn.value.type) newCheckIn.value.type = checkInTypes.value[0].label;
                }
                const [uRes, cRes] = await Promise.all([
                    fetch(USERS_API, { headers: getAuth() }),
                    fetch(CHECKINS_API, { headers: getAuth() })
                ]);
                if (uRes.ok) users.value = await uRes.json();
                if (cRes.ok) checkIns.value = await cRes.json();
            } catch (e) { console.error(e); } 
            finally { loading.value = false; }
        };

        // --- Rich Input & Modal Logic ---
        const openInsertModal = (mode) => {
            // 仅支持 link
            mediaForm.value = { text: '', url: '' };
            showInsertMedia.value = true;
        };

        const confirmInsert = () => {
            if (!mediaForm.value.url) return;
            const textarea = checkInInput.value;
            if (!textarea) return;
            
            const markdown = `[${mediaForm.value.text || 'Link'}](${mediaForm.value.url})`;
            
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            newCheckIn.value.content = text.substring(0, start) + markdown + text.substring(end);
            
            showInsertMedia.value = false;
            setTimeout(() => { textarea.focus(); textarea.setSelectionRange(start + markdown.length, start + markdown.length); }, 100);
        };

        const insertIcon = (iconClass) => {
            const textarea = checkInInput.value;
            if (!textarea) return;
            const iconCode = `[icon: ${iconClass}] `;
            newCheckIn.value.content += iconCode;
            showInputIconPicker.value = false;
            textarea.focus();
        };

        const renderMarkdown = (text) => {
            if (!text) return '';
            let processed = text.replace(/\[icon:\s*(.*?)\]/g, '<i class="$1"></i>');
            return typeof marked !== 'undefined' ? marked.parse(processed) : processed;
        };

        // --- Search Logic ---
        const clearSearch = () => { searchQuery.value = ''; onlyMe.value = false; };
        const toggleMyFilter = () => { onlyMe.value = !onlyMe.value; if (onlyMe.value) searchQuery.value = ''; };

        const filteredCheckIns = computed(() => {
            let result = checkIns.value;
            if (onlyMe.value) result = result.filter(c => c.userId && (c.userId._id === authId || c.userId === authId));
            if (searchQuery.value.trim()) {
                const q = searchQuery.value.toLowerCase();
                result = result.filter(c => 
                    (c.content && c.content.toLowerCase().includes(q)) || 
                    (c.userId && c.userId.name && c.userId.name.toLowerCase().includes(q)) ||
                    (c.type && c.type.toLowerCase().includes(q))
                );
            }
            return result;
        });

        const groupedCheckIns = computed(() => {
            const groups = {};
            filteredCheckIns.value.forEach(log => {
                const d = new Date(log.createdAt);
                const today = new Date();
                let dateKey = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
                if (d.toDateString() === today.toDateString()) dateKey = "今天";
                else if (new Date(today.setDate(today.getDate()-1)).toDateString() === d.toDateString()) dateKey = "昨天";
                if (!groups[dateKey]) groups[dateKey] = [];
                groups[dateKey].push(log);
            });
            return groups;
        });

        // --- CRUD ---
        const submitCheckIn = async () => {
            if (!newCheckIn.value.content.trim()) return;
            submitting.value = true;
            try {
                const res = await fetch(CHECKINS_API, { method: 'POST', headers: getJsonHeaders(), body: JSON.stringify(newCheckIn.value) });
                if (res.ok) {
                    const savedLog = await res.json();
                    checkIns.value.unshift(savedLog);
                    newCheckIn.value.content = '';
                }
            } catch (e) { alert("打卡失败"); } 
            finally { submitting.value = false; }
        };

        const deleteCheckIn = async (id) => {
            if(!confirm("确定删除？")) return;
            try {
                const res = await fetch(`${CHECKINS_API}/${id}`, { method: 'DELETE', headers: getAuth() });
                if(res.ok) checkIns.value = checkIns.value.filter(c => c._id !== id);
            } catch(e) {}
        };

        // --- Type Config ---
        const resetTypeForm = () => { showTypeConfig.value = false; resetTypeFormLocal(); };
        const resetTypeFormLocal = () => { editingType.value = null; newTypeForm.value = { label: '', icon: 'fa-solid fa-code', styleClass: 'bg-blue-500/10 text-blue-400 border-blue-500/30' }; };
        const editType = (type) => { editingType.value = type; newTypeForm.value = { ...type }; };
        const saveType = async () => {
            if(!newTypeForm.value.label) return;
            try {
                if (editingType.value) {
                    const res = await fetch(`${TYPES_API}/${editingType.value._id}`, { method: 'PUT', headers: getJsonHeaders(), body: JSON.stringify(newTypeForm.value) });
                    if(res.ok) { const updated = await res.json(); const idx = checkInTypes.value.findIndex(t => t._id === updated._id); if(idx!==-1) checkInTypes.value[idx]=updated; resetTypeFormLocal(); }
                } else {
                    const res = await fetch(TYPES_API, { method: 'POST', headers: getJsonHeaders(), body: JSON.stringify(newTypeForm.value) });
                    if(res.ok) { checkInTypes.value.push(await res.json()); resetTypeFormLocal(); }
                }
            } catch(e) {}
        };
        const deleteType = async (id) => {
            if(!confirm("删除?")) return;
            try { await fetch(`${TYPES_API}/${id}`, { method: 'DELETE', headers: getAuth() }); checkInTypes.value = checkInTypes.value.filter(t => t._id !== id); } catch(e) {}
        };

        // --- Helpers ---
        const formatDate = (d) => d ? new Date(d).toLocaleDateString() : '-';
        const formatTime = (d) => { const date = new Date(d); return `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`; };
        const getTypeStyle = (label) => checkInTypes.value.find(t => t.label === label)?.styleClass || 'bg-gray-500/10 text-gray-400 border-gray-500/30';
        const getTypeIcon = (label) => checkInTypes.value.find(t => t.label === label)?.icon || 'fa-solid fa-tag';
        const canManage = (log) => isAdmin.value || (log.userId && (log.userId._id === authId || log.userId === authId));
        const sortedUsers = computed(() => users.value.filter(u => u.skills?.length > 0).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)));
        
        // Modal & Log Editing
        const openMemberModal = (user) => selectedUser.value = user;
        const closeMemberModal = () => selectedUser.value = null;
        const enableEdit = (log) => { log.isEditing = true; log.editContent = log.content; log.editType = log.type; };
        const cancelEdit = (log) => { log.isEditing = false; };
        const saveEdit = async (log) => {
            try {
                const res = await fetch(`${CHECKINS_API}/${log._id}`, { method: 'PUT', headers: getJsonHeaders(), body: JSON.stringify({ content: log.editContent, type: log.editType }) });
                if (res.ok) { const updated = await res.json(); log.content = updated.content; log.type = updated.type; log.isEditing = false; }
            } catch(e) {}
        };

        const getCoreSkills = (u) => (u.skills||[]).filter(s => s.isCore).sort((a,b) => b.level - a.level);
        const getLearningSkills = (u) => (u.skills||[]).filter(s => s.isLearning && !s.isCore);
        const getOtherSkills = (u) => (u.skills||[]).filter(s => !s.isCore && !s.isLearning);
        
        // 🔥 Skill Level 5-Tier Color Logic
        const getLevelColorBg = (v) => {
            if (v <= 20) return 'bg-slate-500';   // Lv.1 入门
            if (v <= 40) return 'bg-blue-500';    // Lv.2 掌握
            if (v <= 60) return 'bg-cyan-500';    // Lv.3 熟练
            if (v <= 80) return 'bg-purple-500';  // Lv.4 精通
            return 'bg-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.6)]'; // Lv.5 专家
        };
        
        const getLevelColorText = (v) => {
            if (v <= 20) return 'text-slate-400';
            if (v <= 40) return 'text-blue-400';
            if (v <= 60) return 'text-cyan-400';
            if (v <= 80) return 'text-purple-400';
            return 'text-yellow-400 font-black';
        };

        onMounted(initData);

        return {
            sortedUsers, checkIns, loading, submitting, newCheckIn, checkInTypes, selectedUser, groupedCheckIns,
            isAdmin, showTypeConfig, newTypeForm, availableIcons, editingType,
            searchQuery, onlyMe, checkInInput, showInputIconPicker,
            showInsertMedia, mediaForm, openInsertModal, confirmInsert, // Updated
            submitCheckIn, deleteCheckIn, enableEdit, cancelEdit, saveEdit,
            addType: saveType, saveType, deleteType, resetTypeForm, resetTypeFormLocal, editType,
            openMemberModal, closeMemberModal,
            formatDate, formatTime, getTypeStyle, getTypeIcon, canManage, renderMarkdown,
            insertIcon, clearSearch, toggleMyFilter,
            getCoreSkills, getLearningSkills, getOtherSkills, getLevelColorBg, getLevelColorText
        };
    }
};