/**
 * Work Log Component - 轻量级工作随记
 * 风格：暗黑模式，类似 Twitter/微博 时间流
 */
const WorkLogTemplate = `
<div class="h-full flex flex-col bg-[#0b0c15] text-gray-100 relative overflow-hidden font-sans">
    
    <div class="p-6 border-b border-white/10 bg-[#13151f] shrink-0 z-20 shadow-xl">
        <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <i class="fa-solid fa-pen-nib text-cyan-400"></i> 工作随记
            <span class="text-xs font-normal text-gray-500 bg-black/30 px-2 py-0.5 rounded">记录点滴，汇聚成河</span>
        </h2>
        
        <div class="relative group">
            <textarea 
                v-model="newContent" 
                @keydown.ctrl.enter="submitLog"
                placeholder="此刻在做什么？输入 #标签 可以自动分类..." 
                class="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm text-gray-200 focus:outline-none focus:border-cyan-500/50 transition-all resize-none h-24 custom-scrollbar"
            ></textarea>
            
            <div class="flex justify-between items-center mt-3">
                <div class="flex gap-2">
                    <button @click="addTag('#Bug修复')" class="text-xs px-2 py-1 rounded bg-red-900/20 text-red-400 border border-red-500/20 hover:bg-red-900/40 transition">#Bug修复</button>
                    <button @click="addTag('#会议')" class="text-xs px-2 py-1 rounded bg-blue-900/20 text-blue-400 border border-blue-500/20 hover:bg-blue-900/40 transition">#会议</button>
                    <button @click="addTag('#协助')" class="text-xs px-2 py-1 rounded bg-green-900/20 text-green-400 border border-green-500/20 hover:bg-green-900/40 transition">#协助</button>
                    <button @click="addTag('#调研')" class="text-xs px-2 py-1 rounded bg-purple-900/20 text-purple-400 border border-purple-500/20 hover:bg-purple-900/40 transition">#调研</button>
                </div>
                <button 
                    @click="submitLog" 
                    :disabled="!newContent.trim() || isSubmitting"
                    class="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-1.5 rounded-lg text-sm font-bold shadow-lg shadow-cyan-900/20 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <i v-if="isSubmitting" class="fa-solid fa-spinner fa-spin"></i> 发送 <span class="text-[10px] opacity-60 font-normal">Ctrl+Enter</span>
                </button>
            </div>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar p-6 relative">
        <div v-if="loading" class="text-center text-gray-500 mt-10"><i class="fa-solid fa-circle-notch fa-spin"></i> 加载中...</div>
        
        <div v-else-if="Object.keys(groupedLogs).length === 0" class="flex flex-col items-center justify-center h-64 text-gray-600 opacity-50">
            <i class="fa-regular fa-paper-plane text-4xl mb-2"></i>
            <p>还没有记录，来写第一条吧</p>
        </div>

        <div v-else class="max-w-4xl mx-auto space-y-8">
            <div v-for="(logs, date) in groupedLogs" :key="date" class="relative pl-8 border-l border-white/10">
                <div class="absolute -left-[31px] top-0 flex items-center gap-3 mb-4">
                    <div class="w-4 h-4 rounded-full bg-cyan-900 border-2 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"></div>
                    <span class="text-cyan-400 font-bold font-mono text-sm bg-[#0b0c15] pr-2">{{ formatDateHeader(date) }}</span>
                </div>

                <div class="space-y-4 pt-1">
                    <div v-for="log in logs" :key="log._id" class="group relative bg-[#1a1c26] border border-white/5 hover:border-white/20 rounded-xl p-4 transition-all hover:shadow-lg">
                        
                        <button v-if="canDelete(log)" @click="deleteLog(log._id)" class="absolute top-3 right-3 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>

                        <div class="flex gap-3">
                            <img :src="log.user?.avatar || '/api/placeholder/40/40'" class="w-10 h-10 rounded-lg bg-black/30 object-cover shrink-0 border border-white/10">
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-sm font-bold text-gray-200">{{ log.user?.name || 'Unknown' }}</span>
                                    <span class="text-xs text-gray-600 font-mono">{{ formatTime(log.createdAt) }}</span>
                                </div>
                                <div class="text-gray-300 text-sm whitespace-pre-wrap leading-relaxed" v-html="highlightTags(log.content)"></div>
                                
                                <div v-if="log.tags && log.tags.length" class="mt-3 flex flex-wrap gap-2">
                                    <span v-for="tag in log.tags" :key="tag" class="text-[10px] bg-cyan-900/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20">{{ tag }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
`;

const WorkLogComponent = {
    template: WorkLogTemplate,
    setup() {
        const { ref, computed, onMounted } = Vue;
        const logs = ref([]);
        const newContent = ref('');
        const loading = ref(false);
        const isSubmitting = ref(false);
        const currentUser = ref({ _id: '', role: '' });

        // 获取 Token Header
        const getH = () => ({
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
        });

        // 初始化
        onMounted(async () => {
            // 解析当前用户 (简单逻辑，建议从 localStorage 或 全局状态拿)
            const payload = JSON.parse(atob(localStorage.getItem('authToken').split('.')[1]));
            currentUser.value = { _id: payload.id, role: payload.role }; // 假设 payload 存了这些
            
            await fetchLogs();
        });

        const fetchLogs = async () => {
            loading.value = true;
            try {
                const res = await fetch('/api/work-logs', { headers: getH() });
                if (res.ok) {
                    logs.value = await res.json();
                }
            } finally {
                loading.value = false;
            }
        };

        const submitLog = async () => {
            if (!newContent.value.trim() || isSubmitting.value) return;
            isSubmitting.value = true;
            
            try {
                // 前端简单解析 Tag 用于预览，实际由后端再校验
                const tags = newContent.value.match(/#[^\s]+/g) || [];
                
                const res = await fetch('/api/work-logs', {
                    method: 'POST',
                    headers: getH(),
                    body: JSON.stringify({
                        content: newContent.value,
                        tags: tags
                    })
                });

                if (res.ok) {
                    const newLog = await res.json();
                    logs.value.unshift(newLog); // 乐观更新
                    newContent.value = '';
                }
            } catch(e) {
                alert('发送失败');
            } finally {
                isSubmitting.value = false;
            }
        };

        const deleteLog = async (id) => {
            if (!confirm('确定删除这条记录吗？')) return;
            try {
                const res = await fetch(`/api/work-logs/${id}`, { method: 'DELETE', headers: getH() });
                if (res.ok) {
                    logs.value = logs.value.filter(l => l._id !== id);
                }
            } catch(e) { console.error(e); }
        };

        const addTag = (tag) => {
            newContent.value += (newContent.value ? ' ' : '') + tag + ' ';
            // 自动聚焦回输入框 (略)
        };

        // 数据分组逻辑
        const groupedLogs = computed(() => {
            const groups = {};
            logs.value.forEach(log => {
                const date = log.dateStr || log.createdAt.split('T')[0];
                if (!groups[date]) groups[date] = [];
                groups[date].push(log);
            });
            return groups;
        });

        // 工具函数
        const formatDateHeader = (dateStr) => {
            const date = new Date(dateStr);
            const today = new Date();
            const isToday = date.toDateString() === today.toDateString();
            return isToday ? '今天' : date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' });
        };

        const formatTime = (iso) => {
            const d = new Date(iso);
            return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
        };

        const canDelete = (log) => {
            // 简单判断：是自己写的 或者 是管理员
            // 注意：这里需要确保 currentUser._id 和 log.user._id 类型一致 (String vs ObjId)
            return log.user._id === currentUser.value._id || log.user === currentUser.value._id;
        };
        
        const highlightTags = (text) => {
             // 简单的正则替换，给 tag 加颜色
             if(!text) return '';
             return text.replace(/(#[^\s]+)/g, '<span class="text-cyan-400">$1</span>');
        };

        return {
            newContent, logs, loading, isSubmitting, groupedLogs,
            submitLog, deleteLog, addTag, formatDateHeader, formatTime, canDelete, highlightTags
        };
    }
};