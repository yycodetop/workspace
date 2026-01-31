/**
 * Idea Hub Component - Centered Focus Edition (Fixed Version)
 * 修复：
 * 1. API 地址改为相对路径，解决跨域问题。
 * 2. 增强 submitIdea 函数，包含详细的错误提示。
 */

const IdeaHubTemplate = `
<div class="h-full flex flex-col bg-[#0b0c15] text-gray-100 font-sans selection:bg-amber-500/30 relative">
    <div class="px-8 py-6 border-b border-white/10 bg-[#0b0c15]/90 backdrop-blur-xl flex justify-between items-center shrink-0 z-10">
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <i class="fa-regular fa-lightbulb animate-pulse"></i>
            </div>
            <div>
                <h2 class="text-xl font-bold text-white tracking-widest uppercase">创意树洞</h2>
                <div class="flex gap-4 text-[10px] font-mono text-amber-500/80 mt-1">
                    <button @click="setFilter('pending')" :class="['hover:text-white transition-colors', filterStatus==='pending'?'text-white font-bold underline':'']">蓄水池</button>
                    <button @click="setFilter('approved')" :class="['hover:text-white transition-colors', filterStatus==='approved'?'text-white font-bold underline':'']">待开发</button>
                    <button @click="setFilter('rejected')" :class="['hover:text-white transition-colors', filterStatus==='rejected'?'text-white font-bold underline':'']">已归档</button>
                </div>
            </div>
        </div>
        <div class="flex gap-3">
            <button @click="refreshData" class="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-amber-400 hover:bg-amber-900/20 transition-all"><i :class="['fa-solid fa-rotate', isLoading ? 'fa-spin' : '']"></i></button>
            <button v-if="canCreate" @click="openModal" class="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg text-xs font-bold tracking-wider border border-amber-400/50 active:scale-95"><i class="fa-solid fa-plus"></i> 贡献点子</button>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div v-if="filteredIdeas.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-600 gap-4"><i class="fa-regular fa-paper-plane text-4xl opacity-50"></i><p class="text-sm">暂无创意</p></div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div v-for="(idea, index) in filteredIdeas" :key="idea._id" @click="enterFocusMode(index)" class="group bg-[#13151f] border border-white/10 rounded-xl p-5 hover:border-amber-500/50 transition-all hover:-translate-y-1 relative flex flex-col h-full shadow-lg cursor-pointer">
                <div class="flex justify-between items-start mb-3">
                    <span class="text-[10px] bg-white/5 text-gray-400 px-2 py-1 rounded border border-white/5">{{ idea.category }}</span>
                    <span v-if="idea.status !== 'pending'" :class="['text-[10px] px-2 py-1 rounded font-bold border', idea.status==='approved'?'bg-emerald-900/20 text-emerald-400 border-emerald-500/30':'bg-red-900/20 text-red-400 border-red-500/30']">{{ idea.status === 'approved' ? '已采纳' : '已毙掉' }}</span>
                </div>
                <h3 class="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">{{ idea.title }}</h3>
                <p class="text-xs text-gray-400 leading-relaxed mb-4 line-clamp-4 flex-1">{{ idea.content }}</p>
                <div class="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
                    <div class="flex items-center gap-2 text-xs text-gray-500"><i :class="['fa-solid fa-user', idea.isAnonymous ? 'text-purple-400' : '']"></i> {{ idea.authorName }}</div>
                    <div class="flex items-center gap-3 text-xs text-gray-500">
                        <span class="flex items-center gap-1"><i class="fa-solid fa-heart text-pink-500/50"></i> {{ idea.likes.length }}</span>
                        <span class="flex items-center gap-1"><i class="fa-regular fa-comment text-blue-400/50"></i> {{ idea.comments ? idea.comments.length : 0 }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="focusIndex !== -1" class="fixed inset-0 z-[100] bg-[#020408]/95 backdrop-blur-xl flex items-center justify-center animate-fade-in p-4">
        
        <button @click="exitFocusMode" class="absolute top-6 right-8 text-gray-400 hover:text-white text-2xl transition-transform hover:rotate-90 z-50 p-2">
            <i class="fa-solid fa-xmark"></i>
        </button>

        <button v-if="focusIndex > 0" @click.stop="prevIdea" class="absolute left-2 md:left-8 p-4 text-gray-500 hover:text-amber-400 transition-all hover:scale-125 z-50 bg-black/20 rounded-full border border-white/5 hover:border-amber-500/50 hover:bg-black/50">
            <i class="fa-solid fa-chevron-left text-2xl"></i>
        </button>

        <div class="w-full max-w-4xl h-[80vh] bg-[#13151f] border border-white/10 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden animate-bounce-in ring-1 ring-white/5">
            <div class="h-1.5 w-full bg-gradient-to-r from-amber-600 via-pink-600 to-purple-600 shrink-0"></div>
            
            <div class="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                <div class="flex items-center justify-between mb-8">
                    <div class="flex items-center gap-3">
                        <span class="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-xs font-bold uppercase tracking-wider">{{ currentIdea.category }}</span>
                        <span class="text-xs text-gray-500 font-mono flex items-center gap-2">
                            <i class="fa-regular fa-clock"></i> {{ new Date(currentIdea.createdAt).toLocaleString() }}
                        </span>
                    </div>
                    <div v-if="currentIdea.status !== 'pending'" :class="['px-3 py-1 rounded text-xs font-black uppercase border rotate-[-5deg] shadow-lg', currentIdea.status==='approved'?'bg-emerald-500/10 text-emerald-400 border-emerald-500':'bg-red-500/10 text-red-400 border-red-500']">
                        {{ currentIdea.status === 'approved' ? 'ACCEPTED' : 'REJECTED' }}
                    </div>
                </div>

                <h1 class="text-3xl md:text-5xl font-black text-white mb-10 leading-tight tracking-tight">{{ currentIdea.title }}</h1>
                
                <div class="flex items-center gap-4 mb-10 p-4 bg-white/5 rounded-xl border border-white/5 w-fit">
                    <div :class="['w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 border-[#13151f]', currentIdea.isAnonymous ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white' : 'bg-gradient-to-br from-gray-700 to-gray-600 text-gray-200']">
                        {{ currentIdea.authorName.charAt(0) }}
                    </div>
                    <div>
                        <div class="text-sm font-bold text-white">{{ currentIdea.authorName }}</div>
                        <div class="text-[10px] text-gray-400 uppercase tracking-wider">{{ currentIdea.isAnonymous ? 'Anonymous Contributor' : 'Team Member' }}</div>
                    </div>
                </div>

                <div class="text-gray-200 text-base md:text-xl leading-8 whitespace-pre-wrap mb-12 selection:bg-amber-500/30 pl-4 border-l-2 border-white/10 font-light">
                    {{ currentIdea.content }}
                </div>

                <div v-if="currentIdea.reviewComment" class="mb-12 p-6 bg-[#0b0c15] border-l-4 border-amber-500 rounded-r-xl shadow-inner">
                    <h4 class="text-xs font-bold text-amber-500 uppercase mb-2 flex items-center gap-2"><i class="fa-solid fa-quote-left"></i> Reviewer Feedback</h4>
                    <p class="text-sm text-gray-300 italic mb-2">"{{ currentIdea.reviewComment }}"</p>
                    <div class="text-[10px] text-gray-500 text-right">By {{ currentIdea.reviewedBy }}</div>
                </div>

                <div class="border-t border-white/10 pt-10">
                    <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2"><i class="fa-regular fa-comments text-blue-400"></i> 团队讨论 ({{ currentIdea.comments ? currentIdea.comments.length : 0 }})</h3>
                    
                    <div class="space-y-6 mb-8 pl-2">
                        <div v-if="!currentIdea.comments || currentIdea.comments.length === 0" class="text-gray-600 text-sm italic py-4">暂无评论，成为第一个发言的人...</div>
                        <div v-for="comment in currentIdea.comments" :key="comment._id" class="flex gap-4 group">
                            <img :src="comment.authorAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed='+comment.authorName" class="w-8 h-8 rounded-full bg-gray-700 border border-white/10">
                            <div class="flex-1 bg-white/[0.03] p-3 rounded-lg rounded-tl-none border border-white/5 hover:border-white/10 transition-colors">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-xs font-bold text-gray-300">{{ comment.authorName }}</span>
                                    <span class="text-[10px] text-gray-600">{{ new Date(comment.createdAt).toLocaleString() }}</span>
                                    <button v-if="canReview || comment.authorId === myId" @click="deleteComment(currentIdea._id, comment._id)" class="text-gray-600 hover:text-red-400 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity ml-auto"><i class="fa-solid fa-trash"></i></button>
                                </div>
                                <p class="text-sm text-gray-400 leading-relaxed">{{ comment.content }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex gap-3 items-end bg-[#0b0c15] p-2 rounded-xl border border-white/10 focus-within:border-blue-500/50 transition-colors">
                        <input v-model="newComment" @keyup.enter="postComment" type="text" placeholder="发表你的看法..." class="flex-1 bg-transparent border-none px-4 py-2 text-sm text-white outline-none placeholder-gray-600">
                        <button @click="postComment" class="bg-blue-600 hover:bg-blue-500 text-white w-8 h-8 flex items-center justify-center rounded-lg shadow-lg transition-all"><i class="fa-solid fa-paper-plane text-xs"></i></button>
                    </div>
                </div>
            </div>

            <div class="p-6 border-t border-white/10 bg-[#0f111a] flex justify-between items-center shrink-0 z-20">
                <button @click="toggleLike(currentIdea)" :class="['flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all active:scale-95 font-bold text-sm', currentIdea.likes.includes(myId) ? 'bg-pink-600/20 border-pink-500 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.2)]' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white']">
                    <i :class="[currentIdea.likes.includes(myId) ? 'fa-solid' : 'fa-regular', 'fa-heart']"></i>
                    <span>{{ currentIdea.likes.length }}</span>
                </button>
                <div class="flex gap-3">
                    <template v-if="canReview">
                        <button v-if="currentIdea.status === 'pending'" @click="openReview(currentIdea)" class="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all border border-amber-400/50 flex items-center gap-2"><i class="fa-solid fa-gavel"></i> 评审决策</button>
                        <button @click="deleteIdea(currentIdea._id)" class="text-gray-500 hover:text-red-400 px-4 py-2 transition-all hover:bg-red-900/10 rounded-lg"><i class="fa-solid fa-trash"></i></button>
                    </template>
                </div>
            </div>
        </div>

        <button v-if="focusIndex < filteredIdeas.length - 1" @click.stop="nextIdea" class="absolute right-2 md:right-8 p-4 text-gray-500 hover:text-amber-400 transition-all hover:scale-125 z-50 bg-black/20 rounded-full border border-white/5 hover:border-amber-500/50 hover:bg-black/50">
            <i class="fa-solid fa-chevron-right text-2xl"></i>
        </button>
    </div>

    <div v-if="showModal" class="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-[#1a1c26] border border-amber-500/30 rounded-2xl w-full max-w-lg p-6 flex flex-col gap-4 animate-bounce-in shadow-2xl">
            <h3 class="text-lg font-bold text-white flex items-center gap-2"><i class="fa-regular fa-lightbulb text-amber-400"></i> 贡献创意</h3>
            
            <input v-model="form.title" class="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-amber-500 outline-none" placeholder="一句话描述你的点子 (标题)...">
            
            <div class="flex gap-4">
                <select v-model="form.category" class="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-gray-300 text-sm outline-none w-1/3"><option v-for="cat in categories" :key="cat._id" :value="cat.name">{{ cat.name }}</option></select>
                <div class="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/5 cursor-pointer flex-1" @click="form.isAnonymous = !form.isAnonymous"><div :class="['w-4 h-4 rounded border flex items-center justify-center transition-colors', form.isAnonymous ? 'bg-purple-600 border-purple-500' : 'border-gray-500']"><i v-if="form.isAnonymous" class="fa-solid fa-check text-[10px] text-white"></i></div><span class="text-sm text-gray-300 select-none">匿名模式</span></div>
            </div>
            
            <textarea v-model="form.content" rows="6" class="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-gray-300 text-sm focus:border-amber-500 outline-none resize-none" placeholder="详细描述一下..."></textarea>
            
            <div class="flex justify-end gap-3 pt-2">
                <button @click="showModal = false" class="text-gray-400 hover:text-white text-sm px-4">取消</button>
                <button @click="submitIdea" :disabled="isSubmitting" class="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                    <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i> 提交
                </button>
            </div>
        </div>
    </div>

    <div v-if="showReviewModal" class="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><div class="bg-[#1a1c26] border border-white/10 rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 animate-fade-in-up"><h3 class="text-lg font-bold text-white">评审决策</h3><p class="text-sm text-gray-400 italic">"{{ reviewingIdea.title }}"</p><textarea v-model="reviewComment" rows="3" class="bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-white/30 outline-none" placeholder="评审意见..."></textarea><div class="grid grid-cols-2 gap-4 pt-2"><button @click="submitReview('rejected')" class="bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-500/30 py-2 rounded-lg text-sm font-bold transition-all">毙掉</button><button @click="submitReview('approved')" class="bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg text-sm font-bold transition-all">通过 (转任务)</button></div><button @click="showReviewModal = false" class="text-xs text-gray-500 hover:text-white mt-2">暂不处理</button></div></div>
    
    <div v-if="toast.show" class="fixed top-6 left-1/2 -translate-x-1/2 z-[150] bg-amber-600 text-white px-6 py-3 rounded-full shadow font-bold text-sm">{{ toast.message }}</div>
</div>
`;

const IdeaHubComponent = {
    template: IdeaHubTemplate,
    setup() {
        const { ref, computed, onMounted, onUnmounted, getCurrentInstance } = Vue;
        // ✅ 关键修复：API 地址改为相对路径，走 Vite 代理
        const API_BASE = '/api/ideas';
        const myId = localStorage.getItem('authId');
        
        const ideas = ref([]);
        const categories = ref([]);
        const isLoading = ref(false);
        const isSubmitting = ref(false);
        const filterStatus = ref('pending');
        const toast = ref({ show:false, message:'' });
        const focusIndex = ref(-1);
        const showModal = ref(false);
        const form = ref({ title:'', content:'', category:'', isAnonymous:false });
        const showReviewModal = ref(false);
        const reviewingIdea = ref({});
        const reviewComment = ref('');
        const newComment = ref('');

        const instance = getCurrentInstance();
        const hasPerm = (a) => instance.appContext.config.globalProperties.$hasPerm('ideas', a);
        const canCreate = computed(() => hasPerm('create'));
        const canReview = computed(() => hasPerm('review'));

        const getH = () => ({ 'Authorization': `Bearer ${localStorage.getItem('authToken')}` });

        const refreshData = async () => {
            isLoading.value = true;
            try {
                const [iRes, cRes] = await Promise.all([ fetch(API_BASE, { headers: getH() }), fetch(`${API_BASE}/categories`, { headers: getH() }) ]);
                if(iRes.ok) ideas.value = await iRes.json();
                if(cRes.ok) { categories.value = await cRes.json(); if(categories.value.length && !form.value.category) form.value.category = categories.value[0].name; }
            } catch(e) { showToast('加载失败'); } finally { isLoading.value = false; }
        };

        const filteredIdeas = computed(() => ideas.value.filter(i => i.status === filterStatus.value));
        const currentIdea = computed(() => focusIndex.value !== -1 ? filteredIdeas.value[focusIndex.value] : {});

        const enterFocusMode = (index) => { focusIndex.value = index; };
        const exitFocusMode = () => { focusIndex.value = -1; };
        const nextIdea = () => { if(focusIndex.value < filteredIdeas.value.length - 1) focusIndex.value++; };
        const prevIdea = () => { if(focusIndex.value > 0) focusIndex.value--; };
        const setFilter = (status) => { filterStatus.value = status; exitFocusMode(); };
        const handleKeydown = (e) => { if(focusIndex.value===-1)return; if(e.key==='ArrowRight')nextIdea(); if(e.key==='ArrowLeft')prevIdea(); if(e.key==='Escape')exitFocusMode(); };

        // ✅ 关键修复：增强的提交函数
        const submitIdea = async () => {
            // 1. 基础校验
            if(!form.value.title || !form.value.content) return showToast('请填写完整标题和内容');
            
            isSubmitting.value = true;
            try {
                // 2. 构造数据
                const payload = {
                    title: form.value.title,
                    content: form.value.content,
                    category: form.value.category || (categories.value[0]?.name) || '默认',
                    isAnonymous: form.value.isAnonymous
                };

                // 3. 发送请求
                const res = await fetch(API_BASE, { 
                    method: 'POST', 
                    headers: { 
                        'Content-Type': 'application/json', 
                        ...getH() // 确保带上 Token
                    }, 
                    body: JSON.stringify(payload) 
                });

                // 4. 处理结果
                const data = await res.json();
                
                if (!res.ok) {
                    // 如果后端报错，打印详细信息并提示
                    console.error('Submit Failed:', data);
                    throw new Error(data.message || data.error || '提交失败');
                }

                showToast('✨ 创意已投递！'); 
                showModal.value = false; 
                // 重置表单
                form.value = { title:'', content:'', category: categories.value[0]?.name || '', isAnonymous: false }; 
                refreshData();

            } catch(e) { 
                console.error(e);
                alert(`提交失败: ${e.message}`); 
            } finally { 
                isSubmitting.value = false; 
            }
        };

        const toggleLike = async (idea) => { try { const res = await fetch(`${API_BASE}/${idea._id}/like`, { method: 'PUT', headers: getH() }); if(res.ok) idea.likes = await res.json(); } catch(e) {} };
        const postComment = async () => { if(!newComment.value.trim()) return; try { const res = await fetch(`${API_BASE}/${currentIdea.value._id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getH() }, body: JSON.stringify({ content: newComment.value }) }); if(res.ok) { currentIdea.value.comments = await res.json(); newComment.value = ''; } } catch(e) { showToast('评论失败'); } };
        const deleteComment = async (ideaId, commentId) => { if(!confirm('删除评论?')) return; try { const res = await fetch(`${API_BASE}/${ideaId}/comments/${commentId}`, { method: 'DELETE', headers: getH() }); if(res.ok) currentIdea.value.comments = await res.json(); } catch(e) { showToast('删除失败'); } };
        const deleteIdea = async (id) => { if(!confirm('确定删除?')) return; await fetch(`${API_BASE}/${id}`, { method: 'DELETE', headers: getH() }); refreshData(); if(focusIndex.value !== -1) exitFocusMode(); };
        const openReview = (idea) => { reviewingIdea.value = idea; reviewComment.value = ''; showReviewModal.value = true; };
        const submitReview = async (status) => { if(!reviewComment.value) return showToast('请填写意见'); try { const url = `${API_BASE}/${reviewingIdea.value._id}/${status === 'approved' ? 'convert' : 'review'}`; const res = await fetch(url, { method: status === 'approved' ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json', ...getH() }, body: JSON.stringify({ status, comment: reviewComment.value }) }); if(res.ok) { showToast(status === 'approved' ? '已转为任务！' : '已归档'); showReviewModal.value = false; refreshData(); exitFocusMode(); } } catch(e) {} };
        const openModal = () => showModal.value = true;
        const showToast = (m) => { toast.value={show:true, message:m}; setTimeout(()=>toast.value.show=false, 2000); };

        onMounted(() => { refreshData(); window.addEventListener('keydown', handleKeydown); });
        onUnmounted(() => { window.removeEventListener('keydown', handleKeydown); });

        return { ideas, categories, filteredIdeas, currentIdea, isLoading, isSubmitting, filterStatus, myId, toast, canCreate, canReview, focusIndex, enterFocusMode, exitFocusMode, nextIdea, prevIdea, setFilter, showModal, form, openModal, submitIdea, showReviewModal, reviewingIdea, reviewComment, openReview, submitReview, refreshData, toggleLike, deleteIdea, newComment, postComment, deleteComment };
    }
};