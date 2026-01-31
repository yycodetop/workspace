/**
 * Resource Hub Component - V2.0
 * 特性：手动图标选择、一键复制、热度统计、权限控制
 */

const ResourceHubTemplate = `
<div class="h-full flex flex-col bg-[#0b0c15] text-gray-100 relative overflow-hidden font-sans selection:bg-pink-500/30">
    <div class="absolute inset-0 pointer-events-none" style="background-image: radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 50%);"></div>

    <div class="relative z-20 px-8 py-6 border-b border-white/10 bg-[#0b0c15]/90 backdrop-blur-xl flex justify-between items-center shadow-2xl shrink-0">
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-pink-600/20 border border-pink-500/50 flex items-center justify-center text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                <i class="fa-solid fa-globe animate-pulse-slow"></i>
            </div>
            <div>
                <h2 class="text-xl font-bold text-white tracking-widest uppercase">资源补给站</h2>
                <div class="text-[10px] text-pink-500/80 font-mono">RESOURCE HUB</div>
            </div>
        </div>

        <div class="flex items-center gap-4">
            <div class="relative group">
                <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-hover:text-pink-400 transition-colors"></i>
                <input v-model="searchQuery" @input="debounceSearch" type="text" placeholder="搜索资源..." 
                    class="bg-[#13151f] border border-white/10 rounded-full pl-10 pr-4 py-2 w-64 text-sm text-white focus:border-pink-500 focus:w-80 transition-all outline-none placeholder-gray-600">
            </div>
            
            <button v-if="canCreate" @click="openModal()" class="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg text-xs font-bold border border-pink-400/50">
                <i class="fa-solid fa-share-nodes"></i> 分享资源
            </button>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto p-8 custom-scrollbar relative z-10">
        <div v-if="loading" class="flex justify-center mt-20 text-pink-500"><i class="fa-solid fa-circle-notch fa-spin text-2xl"></i></div>
        
        <div v-else-if="resources.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-600 gap-4">
            <i class="fa-regular fa-compass text-4xl opacity-50"></i>
            <p class="text-sm">暂无资源，快来分享第一个宝藏网站吧！</p>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div v-for="item in resources" :key="item._id" class="group bg-[#13151f] border border-white/10 rounded-xl p-5 hover:border-pink-500/50 transition-all hover:-translate-y-1 flex flex-col relative overflow-hidden shadow-lg">
                <div class="flex gap-4 mb-3">
                    <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-2xl text-pink-400 shadow-inner shrink-0">
                        <i :class="item.icon || 'fa-solid fa-globe'"></i>
                    </div>
                    
                    <div class="flex-1 min-w-0">
                        <a :href="item.url" target="_blank" @click="trackClick(item._id)" class="text-base font-bold text-white hover:text-pink-400 transition-colors truncate block mb-1" :title="item.title">
                            {{ item.title }} <i class="fa-solid fa-arrow-up-right-from-square text-[10px] ml-1 opacity-50"></i>
                        </a>
                        <p class="text-xs text-gray-400 line-clamp-2 h-8 leading-relaxed">{{ item.desc || '暂无描述' }}</p>
                    </div>
                </div>

                <div class="mt-auto flex justify-between items-center pt-3 border-t border-white/5">
                    <div class="flex items-center gap-2" :title="'分享人: ' + item.ownerName">
                        <img :src="item.ownerAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed='+item.ownerName" class="w-5 h-5 rounded-full border border-white/10 bg-gray-700">
                        <span class="text-[10px] text-gray-500 truncate max-w-[80px]">{{ item.ownerName }}</span>
                    </div>
                    
                    <div class="flex items-center gap-2">
                        <div class="flex items-center gap-1 text-[10px] text-gray-500 bg-black/30 px-2 py-1 rounded border border-white/5" title="点击热度">
                            <i class="fa-solid fa-fire text-orange-500/80"></i> {{ item.clicks || 0 }}
                        </div>

                        <button @click="copyLink(item.url)" class="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="复制链接">
                            <i class="fa-regular fa-copy"></i>
                        </button>

                        <div v-if="canManageItem(item)" class="flex gap-1 border-l border-white/10 pl-2 ml-1">
                            <button @click="openModal(item)" class="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-900/20" title="编辑">
                                <i class="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button @click="deleteResource(item._id)" class="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-900/20" title="删除">
                                <i class="fa-solid fa-trash text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-[#1a1c26] w-full max-w-lg rounded-2xl border border-pink-500/30 p-6 flex flex-col gap-5 animate-bounce-in shadow-2xl">
            <div class="flex justify-between items-center border-b border-white/10 pb-4">
                <h3 class="text-lg font-bold text-white flex items-center gap-2">
                    <i class="fa-solid fa-share-nodes text-pink-500"></i> {{ form._id ? '编辑资源' : '分享新资源' }}
                </h3>
                <button @click="closeModal" class="text-gray-500 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button>
            </div>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-xs font-bold text-gray-500 uppercase mb-2">选择一个图标</label>
                    <div class="grid grid-cols-8 gap-2 bg-black/20 p-3 rounded-lg border border-white/5 h-32 overflow-y-auto custom-scrollbar">
                        <button v-for="icon in iconList" :key="icon" @click="form.icon = icon"
                            :class="['w-8 h-8 rounded flex items-center justify-center transition-all', form.icon === icon ? 'bg-pink-600 text-white shadow-lg scale-110' : 'text-gray-500 hover:bg-white/10 hover:text-white']">
                            <i :class="icon"></i>
                        </button>
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="col-span-1 md:col-span-2">
                        <label class="block text-xs font-bold text-pink-500 uppercase mb-1.5">网站名称</label>
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded bg-pink-900/20 flex items-center justify-center text-pink-400 border border-pink-500/30 shrink-0">
                                <i :class="form.icon"></i>
                            </div>
                            <input v-model="form.title" class="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-pink-500 transition-colors" placeholder="例如：ChatGPT">
                        </div>
                    </div>
                    
                    <div class="col-span-1 md:col-span-2">
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1.5">链接地址 (URL)</label>
                        <div class="flex items-center bg-black/30 border border-white/10 rounded-lg px-3 focus-within:border-pink-500 transition-colors">
                            <i class="fa-solid fa-link text-gray-600 mr-2 text-xs"></i>
                            <input v-model="form.url" class="flex-1 bg-transparent py-2 text-white text-sm outline-none font-mono" placeholder="https://...">
                        </div>
                    </div>

                    <div class="col-span-1 md:col-span-2">
                        <label class="block text-xs font-bold text-gray-500 uppercase mb-1.5">推荐理由 / 作用</label>
                        <textarea v-model="form.desc" rows="3" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-gray-300 text-sm outline-none focus:border-pink-500 transition-colors resize-none" placeholder="简单介绍一下这个网站是做什么的..."></textarea>
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-2 border-t border-white/10">
                <button @click="closeModal" class="text-gray-400 hover:text-white text-sm px-4">取消</button>
                <button @click="saveResource" class="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg transform active:scale-95 transition-all flex items-center gap-2">
                    <i v-if="isSaving" class="fa-solid fa-spinner fa-spin"></i> {{ isSaving ? '提交中...' : '提交' }}
                </button>
            </div>
        </div>
    </div>

    <div v-if="toast.show" class="fixed top-6 left-1/2 -translate-x-1/2 z-[150] bg-pink-600 text-white px-6 py-3 rounded-full shadow-[0_0_20px_rgba(219,39,119,0.5)] flex items-center gap-3 border border-pink-400/50 animate-bounce-in font-bold text-sm">
        <i class="fa-solid fa-circle-check"></i> {{ toast.message }}
    </div>
</div>
`;

const ResourceHubComponent = {
    template: ResourceHubTemplate,
    setup() {
        const { ref, computed, onMounted, getCurrentInstance } = Vue;
        const API_BASE = '/api/resources';
        
        const resources = ref([]);
        const loading = ref(false);
        const isSaving = ref(false);
        const searchQuery = ref('');
        const showModal = ref(false);
        const toast = ref({ show: false, message: '' });
        
        const myId = localStorage.getItem('authId');
        const isAdmin = localStorage.getItem('authUsername') === 'admin';

        // 预设图标库 (V2.0 需求)
        const iconList = [
            'fa-solid fa-globe', 'fa-solid fa-rocket', 'fa-solid fa-book', 'fa-solid fa-code',
            'fa-solid fa-laptop-code', 'fa-solid fa-paintbrush', 'fa-solid fa-image', 'fa-solid fa-video',
            'fa-solid fa-music', 'fa-solid fa-file-pdf', 'fa-solid fa-cloud', 'fa-solid fa-database',
            'fa-solid fa-robot', 'fa-solid fa-brain', 'fa-solid fa-chart-simple', 'fa-solid fa-bullhorn',
            'fa-solid fa-users', 'fa-solid fa-graduation-cap', 'fa-solid fa-gamepad', 'fa-brands fa-github',
            'fa-brands fa-google', 'fa-brands fa-aws', 'fa-brands fa-weixin', 'fa-regular fa-lightbulb'
        ];

        const defaultForm = { _id: null, title: '', url: '', desc: '', icon: 'fa-solid fa-globe' };
        const form = ref({ ...defaultForm });

        // 权限检查
        const instance = getCurrentInstance();
        const hasPerm = (a, b) => {
            const fn = instance.appContext.config.globalProperties.$hasPerm;
            return fn ? fn(a, b) : false;
        };

        const canCreate = computed(() => hasPerm('resources', 'create') || isAdmin);
        const canManageItem = (item) => isAdmin || (hasPerm('resources', 'manage')) || item.ownerId === myId;

        // 加载数据
        const fetchResources = async () => {
            loading.value = true;
            try {
                const url = searchQuery.value ? `${API_BASE}?q=${encodeURIComponent(searchQuery.value)}` : API_BASE;
                const res = await fetch(url, { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } });
                if (res.ok) resources.value = await res.json();
            } catch (e) { showToast('加载失败'); }
            finally { loading.value = false; }
        };

        let timeout = null;
        const debounceSearch = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(fetchResources, 300);
        };

        // 保存 (新增/编辑)
        const saveResource = async () => {
            if (!form.value.title || !form.value.url) return showToast('请填写名称和地址');
            isSaving.value = true;
            try {
                const method = form.value._id ? 'PUT' : 'POST';
                const url = form.value._id ? `${API_BASE}/${form.value._id}` : API_BASE;
                
                const res = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` },
                    body: JSON.stringify(form.value)
                });

                if (res.ok) {
                    showToast('操作成功');
                    closeModal();
                    fetchResources();
                } else {
                    const err = await res.json();
                    showToast(err.message || '操作失败');
                }
            } catch (e) { showToast('网络错误'); }
            finally { isSaving.value = false; }
        };

        // 删除
        const deleteResource = async (id) => {
            if (!confirm('确定删除这个资源吗？')) return;
            try {
                const res = await fetch(`${API_BASE}/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                });
                if (res.ok) { showToast('已删除'); fetchResources(); }
                else { showToast('删除失败，可能无权限'); }
            } catch (e) { showToast('错误'); }
        };

        // 统计点击
        const trackClick = (id) => {
            fetch(`${API_BASE}/${id}/click`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } });
            // 乐观更新 UI
            const item = resources.value.find(i => i._id === id);
            if (item) item.clicks = (item.clicks || 0) + 1;
        };

        // 复制链接 (V2.0 新增)
        const copyLink = (url) => {
            if (!url) return;
            navigator.clipboard.writeText(url).then(() => {
                showToast('链接已复制！');
            }).catch(() => {
                showToast('复制失败，请手动复制');
            });
        };

        const openModal = (item = null) => {
            form.value = item ? { ...item } : { ...defaultForm };
            showModal.value = true;
        };
        const closeModal = () => showModal.value = false;
        const showToast = (msg) => { toast.value = { show: true, message: msg }; setTimeout(() => toast.value.show = false, 2000); };

        onMounted(fetchResources);

        return {
            resources, loading, isSaving, searchQuery, showModal, form, toast, iconList,
            fetchResources, debounceSearch, openModal, closeModal, saveResource, deleteResource, 
            trackClick, copyLink, canCreate, canManageItem
        };
    }
};