/**
 * Problem Handler - V44.0 (Remark & Auto-Refresh Fix)
 * 1. 新增功能：添加“流转备注 (Remark)”字段，方便流转说明。
 * 2. 体验修复：验收/驳回/发布后，自动刷新右侧详情页状态，无需手动刷新。
 * 3. 流程保持：PDF 上传 -> 提交验收 (原子操作)。
 */
const ProblemHandlerTemplate = `
<div class="h-full flex flex-col bg-[#0f111a] text-gray-100 font-sans relative">
    
    <div class="px-6 py-4 border-b border-white/10 bg-[#0f111a]/95 backdrop-blur-xl flex justify-between items-center shadow-md z-20">
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/50"><i class="fa-solid fa-code"></i></div>
            <div>
                <h2 class="text-lg font-bold text-white tracking-wide">C++ 题目研发中心</h2>
                <div class="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Problem Dev System</div>
            </div>
        </div>
        <div class="flex bg-white/5 rounded-lg p-1 border border-white/10">
            <button @click="viewMode='my_dev'" :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2', viewMode==='my_dev'?'bg-blue-600 text-white shadow-lg':'text-gray-400 hover:text-white']"><i class="fa-solid fa-pen-ruler"></i> 我出的题</button>
            <button @click="viewMode='todo_audit'" :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2', viewMode==='todo_audit'?'bg-orange-600 text-white shadow-lg':'text-gray-400 hover:text-white']">
                <i class="fa-solid fa-microscope"></i> 待我验收
                <span v-if="todoCount>0" class="ml-1 bg-white text-orange-600 px-1.5 rounded-full text-[10px]">{{ todoCount }}</span>
            </button>
            <button @click="viewMode='pool'" :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2', viewMode==='pool'?'bg-purple-600 text-white shadow-lg':'text-gray-400 hover:text-white']"><i class="fa-solid fa-box-archive"></i> 所有题目</button>
        </div>
        <button @click="openCreateModal" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg transition-all flex items-center gap-2"><i class="fa-solid fa-plus"></i> 创建新题</button>
    </div>

    <div class="flex-1 overflow-hidden relative flex">
        
        <div class="w-80 border-r border-white/10 bg-[#13151f] flex flex-col">
            <div class="p-4 border-b border-white/5">
                <input v-model="searchKey" placeholder="搜索题目..." class="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 outline-none">
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                <div v-for="p in filteredList" :key="p._id" @click="selectProblem(p)" :class="['p-3 rounded-xl cursor-pointer border transition-all relative group', currentProblem?._id === p._id ? 'bg-blue-600/10 border-blue-500/50' : 'bg-white/5 border-transparent hover:bg-white/10']">
                    
                    <button v-if="isMyProblem(p)" @click.stop="deleteProblem(p)" class="absolute right-2 top-2 w-6 h-6 rounded bg-red-500/20 text-red-400 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white z-10" title="删除题目">
                        <i class="fa-solid fa-trash"></i>
                    </button>

                    <div class="flex justify-between items-start mb-1 pr-6">
                        <div class="text-sm font-bold text-white line-clamp-1">{{ p.title }}</div>
                        <span :class="['text-[10px] px-1.5 py-0.5 rounded border', getStatusBadge(p.status)]">{{ getStatusLabel(p.status) }}</span>
                    </div>
                    <div class="flex justify-between items-center text-[10px] text-gray-500">
                        <span><i class="fa-solid fa-user mr-1"></i>{{ p.authorId?.name || '未知' }}</span>
                        <span>v{{ p.version }}</span>
                    </div>
                    <div v-if="p.relatedTaskId" class="mt-1 text-[10px] text-blue-400/80 flex items-center gap-1 bg-blue-900/10 px-1.5 py-0.5 rounded w-fit">
                        <i class="fa-solid fa-link"></i> KPI: {{ p.relatedTaskId.title }}
                    </div>
                </div>
                
                <div v-if="filteredList.length === 0" class="text-center text-gray-500 text-xs py-4">无相关题目</div>
            </div>
        </div>

        <div class="flex-1 bg-[#0b0c15] overflow-y-auto custom-scrollbar p-8 relative">
            <div v-if="!currentProblem" class="flex flex-col items-center justify-center h-full text-gray-600">
                <i class="fa-solid fa-code text-6xl mb-4 opacity-20"></i>
                <p>请选择或创建一个题目开始研发</p>
            </div>

            <div v-else class="max-w-5xl mx-auto space-y-6">
                <div class="flex justify-between items-end border-b border-white/10 pb-6">
                    <div>
                        <div class="flex items-center gap-3 mb-2">
                            <h1 class="text-3xl font-black text-white">{{ currentProblem.title }}</h1>
                            <span :class="['text-xs px-2 py-1 rounded border font-bold', getStatusBadge(currentProblem.status)]">{{ getStatusLabel(currentProblem.status) }}</span>
                        </div>
                        <div class="flex gap-4 text-xs text-gray-400">
                            <span class="flex items-center gap-1"><i class="fa-solid fa-user-pen"></i> 出题: {{ currentProblem.authorId?.name }}</span>
                            <span class="flex items-center gap-1"><i class="fa-solid fa-user-check"></i> 验题: {{ currentProblem.testerId?.name || '未指定' }}</span>
                            <span class="flex items-center gap-1"><i class="fa-solid fa-clock-rotate-left"></i> 更新: {{ new Date(currentProblem.updatedAt).toLocaleString() }}</span>
                        </div>
                        <div v-if="currentProblem.relatedTaskId" class="mt-2 text-xs bg-blue-900/20 border border-blue-500/30 text-blue-300 px-3 py-1.5 rounded inline-flex items-center gap-2">
                            <i class="fa-solid fa-thumbtack"></i> 绑定 KPI 任务: {{ currentProblem.relatedTaskId.title }}
                        </div>
                    </div>
                    
                    <div class="flex gap-3">
                        <template v-if="isAuthor && (currentProblem.status === 'dev' || currentProblem.status === 'revision')">
                            <button @click="confirmAction('确定提交验收吗？提交后将通知验题人。', submitForReview)" :disabled="isSaving" :class="['px-6 py-2 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-2', isSaving ? 'bg-gray-600 cursor-wait' : 'bg-blue-600 hover:bg-blue-500']">
                                <i v-if="isSaving" class="fa-solid fa-spinner fa-spin"></i> {{ isSaving ? '提交中...' : '提交验收' }}
                            </button>
                        </template>
                        <template v-if="isTester && currentProblem.status === 'review'">
                            <button @click="rejectProblem" class="px-4 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg text-xs font-bold border border-red-500/30">驳回返修</button>
                            <button @click="confirmAction('确定验收通过吗？', approveProblem)" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-lg">验收通过</button>
                        </template>
                        <template v-if="currentProblem.status === 'ready'">
                            <button @click="confirmAction('确定发布上线吗？发布后将不可修改。', publishProblem)" class="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold shadow-lg">发布上线</button>
                        </template>
                    </div>
                </div>

                <div v-if="currentProblem.status === 'revision'" class="bg-red-500/10 border border-red-500/30 p-4 rounded-xl">
                    <div class="text-xs font-bold text-red-400 uppercase mb-1"><i class="fa-solid fa-circle-exclamation mr-1"></i> 返修意见</div>
                    <div class="text-sm text-red-100">{{ currentProblem.audit?.comment || '无详细意见' }}</div>
                </div>

                <div class="grid grid-cols-3 gap-6">
                    
                    <div class="col-span-2 space-y-6">
                        <div class="bg-[#13151f] rounded-xl p-5 border border-white/5">
                            <div class="text-sm font-bold text-gray-400 mb-4 flex justify-between">
                                <span><i class="fa-solid fa-file-pdf mr-2"></i>题目文档 (必须)</span>
                                <span v-if="!canEdit" class="text-xs text-gray-600"><i class="fa-solid fa-lock"></i> 只读</span>
                            </div>
                            
                            <div class="flex items-center justify-between bg-black/20 p-4 rounded-lg border border-white/5">
                                <div class="flex items-center gap-4">
                                    <div class="w-10 h-10 rounded bg-red-500/20 text-red-400 flex items-center justify-center text-xl"><i class="fa-solid fa-file-pdf"></i></div>
                                    <div>
                                        <div class="text-xs font-bold text-gray-300">题目描述文件 (PDF)</div>
                                        <div class="text-[10px] text-gray-600 mt-1" v-if="formData.resources.problemPdf?.name">{{ formData.resources.problemPdf.name }}</div>
                                        <div class="text-[10px] text-red-500 mt-1" v-else>* 未上传</div>
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <a v-if="formData.resources.problemPdf?.url" :href="getDownloadLink(formData.resources.problemPdf)" target="_blank" class="text-blue-400 text-xs hover:underline flex items-center gap-1"><i class="fa-solid fa-download"></i> 下载</a>
                                    <label v-if="canEdit" class="cursor-pointer text-gray-300 hover:text-white text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded border border-white/10 transition-all">
                                        <i class="fa-solid fa-cloud-arrow-up mr-1"></i> 上传 PDF
                                        <input type="file" accept=".pdf" hidden @change="e=>handleUpload(e, 'problemPdf')">
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="bg-[#13151f] rounded-xl p-5 border border-white/5">
                            <div class="text-sm font-bold text-gray-400 mb-4"><i class="fa-solid fa-box-open mr-2"></i>研发资源 (必须)</div>
                            
                            <div v-if="isTester && !blindTestPassed && currentProblem.status === 'review'" class="bg-orange-500/10 border border-orange-500/30 p-4 rounded-lg text-center mb-4">
                                <div class="text-orange-400 text-sm font-bold mb-2"><i class="fa-solid fa-eye-slash"></i> 盲测阶段</div>
                                <div class="text-xs text-gray-400 mb-3">标程和数据已隐藏。请先阅读 PDF 尝试独立解题。</div>
                                <button @click="passBlindTest" class="bg-orange-600 hover:bg-orange-500 text-white px-4 py-1.5 rounded text-xs font-bold">我已完成盲测，解锁资源</button>
                            </div>

                            <div v-else class="space-y-3">
                                <div class="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded bg-blue-500/20 text-blue-400 flex items-center justify-center"><i class="fa-brands fa-cuttlefish"></i></div>
                                        <div>
                                            <div class="text-xs font-bold text-gray-300">标准程序 (Standard Code)</div>
                                            <div class="text-[10px] text-gray-600" v-if="formData.resources.standardCode?.name">{{ formData.resources.standardCode.name }}</div>
                                            <div class="text-[10px] text-red-500" v-else>* 未上传</div>
                                        </div>
                                    </div>
                                    <div class="flex gap-2">
                                        <a v-if="formData.resources.standardCode?.url" :href="getDownloadLink(formData.resources.standardCode)" target="_blank" class="text-blue-400 text-xs hover:underline">下载</a>
                                        <label v-if="canEdit" class="cursor-pointer text-gray-400 hover:text-white text-xs bg-white/5 px-2 py-1 rounded border border-white/10">
                                            上传 <input type="file" hidden @change="e=>handleUpload(e, 'standardCode')">
                                        </label>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between bg-black/20 p-3 rounded-lg border border-white/5">
                                    <div class="flex items-center gap-3">
                                        <div class="w-8 h-8 rounded bg-purple-500/20 text-purple-400 flex items-center justify-center"><i class="fa-solid fa-database"></i></div>
                                        <div>
                                            <div class="text-xs font-bold text-gray-300">测试数据包 (Test Data)</div>
                                            <div class="text-[10px] text-gray-600" v-if="formData.resources.testData?.name">{{ formData.resources.testData.name }}</div>
                                            <div class="text-[10px] text-red-500" v-else>* 未上传</div>
                                        </div>
                                    </div>
                                    <div class="flex gap-2">
                                        <a v-if="formData.resources.testData?.url" :href="getDownloadLink(formData.resources.testData)" target="_blank" class="text-blue-400 text-xs hover:underline">下载</a>
                                        <label v-if="canEdit" class="cursor-pointer text-gray-400 hover:text-white text-xs bg-white/5 px-2 py-1 rounded border border-white/10">
                                            上传 <input type="file" hidden @change="e=>handleUpload(e, 'testData')">
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="bg-[#13151f] rounded-xl p-5 border border-white/5">
                            <div class="text-sm font-bold text-gray-400 mb-2"><i class="fa-solid fa-comment-dots mr-2"></i>流转备注</div>
                            <textarea v-model="formData.remark" :disabled="!canEdit" placeholder="在此处填写解题思路、注意事项或给验题人的留言..." rows="3" class="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-xs text-white focus:border-blue-500 outline-none resize-none"></textarea>
                        </div>
                    </div>

                    <div class="space-y-6">
                        <div class="bg-[#13151f] rounded-xl p-5 border border-white/5 space-y-4">
                            <div class="text-sm font-bold text-gray-400"><i class="fa-solid fa-sliders mr-2"></i>配置 (必须)</div>
                            <div>
                                <label class="text-xs text-gray-500 block mb-1">难度预估</label>
                                <select v-model="formData.content.difficulty" :disabled="!canEdit" class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none">
                                    <option>入门</option><option>普及-</option><option>普及/提高-</option><option>普及+/提高</option><option>提高+/省选-</option><option>省选/NOI-</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-xs text-gray-500 block mb-1">指定验题人</label>
                                <select v-model="formData.testerId" :disabled="!canEdit" class="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none">
                                    <option :value="null">-- 请选择 --</option>
                                    <option v-for="u in users" :key="u._id" :value="u._id">{{ u.name }}</option>
                                </select>
                            </div>
                            <div v-if="currentProblem.relatedTaskId">
                                <label class="text-xs text-gray-500 block mb-1">关联 KPI 任务</label>
                                <div class="text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg truncate">
                                    {{ currentProblem.relatedTaskId.title }}
                                </div>
                            </div>
                        </div>

                        <div v-if="isTester && currentProblem.status === 'review'" class="bg-[#13151f] rounded-xl p-5 border border-orange-500/20">
                            <div class="text-sm font-bold text-orange-400 mb-4"><i class="fa-solid fa-clipboard-check mr-2"></i>验题反馈</div>
                            <div class="space-y-3">
                                <div class="flex items-center justify-between text-xs text-gray-300">
                                    <span>通过盲测?</span>
                                    <span :class="blindTestPassed ? 'text-emerald-400':'text-gray-500'">{{ blindTestPassed ? '是' : '否' }}</span>
                                </div>
                                <div>
                                    <label class="text-xs text-gray-500 block mb-1">解题耗时(分钟)</label>
                                    <input type="number" v-model="auditForm.timeCost" class="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white">
                                </div>
                                <div>
                                    <label class="text-xs text-gray-500 block mb-1">数据强度评价</label>
                                    <select v-model="auditForm.dataQuality" class="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white">
                                        <option>弱 (需要加强)</option><option>适中</option><option>强 (边界覆盖全)</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="text-xs text-gray-500 block mb-1">审核/驳回意见</label>
                                    <textarea v-model="auditForm.comment" rows="3" class="w-full bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-white"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <div v-if="showCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div class="bg-[#1a1c26] w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-xl relative">
                <h3 class="text-lg font-bold text-white mb-6">创建新题目</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-xs text-gray-500 font-bold uppercase mb-2">题目名称 (必填)</label>
                        <input v-model="newProblemData.title" placeholder="例如: A+B Problem" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-500">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 font-bold uppercase mb-2">关联 KPI 任务 (可选)</label>
                        <select v-model="newProblemData.relatedTaskId" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-blue-500">
                            <option :value="null">-- 不关联 --</option>
                            <option v-for="t in myTasks" :key="t._id" :value="t._id">
                                👤 {{ getUserNameFromTask(t) }} | {{ t.title }} ({{ t.progress }}%)
                            </option>
                        </select>
                        <p class="text-[10px] text-gray-600 mt-1">关联后，此题目的研发进度可计入该任务的绩效。</p>
                        <p v-if="myTasks.length===0" class="text-[10px] text-orange-400 mt-1">提示：暂无可关联的进行中任务（待办池任务不在此列）。</p>
                    </div>
                </div>
                <div class="flex justify-end gap-3 mt-8">
                    <button @click="showCreateModal=false" class="text-gray-400 text-sm hover:text-white px-4 py-2">取消</button>
                    <button @click="confirmCreate" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg">立即创建</button>
                </div>
            </div>
        </div>

        <div v-if="sysModal.show" class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div class="bg-[#1a1c26] w-full max-w-sm rounded-xl border border-white/10 shadow-2xl p-6 transform scale-100 transition-all">
                <div class="mb-4">
                    <div v-if="sysModal.type==='confirm'" class="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 mx-auto"><i class="fa-solid fa-question text-xl"></i></div>
                    <div v-else class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mb-4 mx-auto"><i class="fa-solid fa-circle-info text-xl"></i></div>
                    <h3 class="text-white font-bold text-center text-lg mb-2">{{ sysModal.type === 'confirm' ? '确认操作' : '提示' }}</h3>
                    <p class="text-gray-400 text-center text-sm leading-relaxed">{{ sysModal.msg }}</p>
                </div>
                <div class="flex justify-center gap-3">
                    <button v-if="sysModal.type==='confirm'" @click="sysModal.onCancel" class="px-4 py-2 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-all">取消</button>
                    <button @click="sysModal.onOk" class="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg transition-all">确定</button>
                </div>
            </div>
        </div>

    </div>
</div>
`;

const ProblemHandlerComponent = {
    template: ProblemHandlerTemplate,
    setup() {
        const { ref, computed, onMounted, reactive, watch } = Vue;
        const API_PROB = '/api/problems';
        const API_UPLOAD = '/api/upload';
        const API_USERS = '/api/users/wall';
        const API_TASKS = '/api/tasks';

        const viewMode = ref('my_dev'); 
        const list = ref([]);
        const currentProblem = ref(null);
        const users = ref([]);
        const myTasks = ref([]); 
        const blindTestPassed = ref(false);
        const searchKey = ref(''); 
        const isSaving = ref(false); 

        const showCreateModal = ref(false);
        const newProblemData = reactive({ title: '', relatedTaskId: null }); 
        const sysModal = reactive({ show: false, type: 'alert', msg: '', onOk: null, onCancel: null });

        // 🔥🔥🔥 数据模型新增 remark
        const formData = reactive({
            title: '', 
            testerId: null, 
            relatedTaskId: null,
            remark: '', // 流转备注
            content: { difficulty: '入门' },
            resources: { problemPdf: {}, standardCode: {}, testData: {} }
        });

        const auditForm = reactive({ timeCost: 0, dataQuality: '适中', comment: '' });

        const getH = () => ({ 'Authorization': `Bearer ${localStorage.getItem('authToken')}` });
        const getCurrentUid = () => {
            try { return JSON.parse(atob(localStorage.getItem('authToken').split('.')[1])).id; } catch(e){return null;}
        };

        const filteredList = computed(() => {
            if (!searchKey.value) return list.value;
            const k = searchKey.value.toLowerCase();
            return list.value.filter(p => p.title.toLowerCase().includes(k));
        });

        const todoCount = computed(() => 0); 
        const isAuthor = computed(() => currentProblem.value?.authorId?._id === getCurrentUid() || currentProblem.value?.authorId === getCurrentUid());
        const isTester = computed(() => currentProblem.value?.testerId?._id === getCurrentUid() || currentProblem.value?.testerId === getCurrentUid());
        const canEdit = computed(() => isAuthor.value && ['dev', 'revision'].includes(currentProblem.value?.status));

        const isMyProblem = (p) => {
            const myId = getCurrentUid();
            const pAuthId = (p.authorId && p.authorId._id) ? p.authorId._id : p.authorId;
            return String(pAuthId) === String(myId) && p.status !== 'published';
        };

        const getUserNameFromTask = (t) => {
            if (!t) return '未知';
            if (t.ownerName) return t.ownerName;
            if (t.userName) return t.userName; 

            const possibleObjs = [t.owner, t.userId, t.assignee, t.creator];
            for (let obj of possibleObjs) {
                if (obj && typeof obj === 'object' && obj.name) return obj.name;
            }

            const possibleIds = [t.ownerId, t.owner, t.userId, t.assignee]
                .map(val => {
                    if (typeof val === 'string') return val;
                    if (val && val._id) return String(val._id); 
                    return null;
                })
                .filter(Boolean);

            if (possibleIds.length === 0) return '无负责人';
            const rawId = possibleIds[0];

            if (users.value && users.value.length > 0) {
                let found = users.value.find(u => String(u._id).toLowerCase() === String(rawId).toLowerCase());
                if (found) return found.name;
            }
            return rawId; 
        };

        const customAlert = (msg) => { sysModal.type = 'alert'; sysModal.msg = msg; sysModal.show = true; sysModal.onOk = () => { sysModal.show = false; }; };
        const confirmAction = (msg, callback) => { 
            sysModal.type = 'confirm'; sysModal.msg = msg; sysModal.show = true; 
            sysModal.onOk = () => { sysModal.show = false; if(callback) callback(); }; 
            sysModal.onCancel = () => { sysModal.show = false; }; 
        };

        const refresh = async () => {
            const typeMap = { my_dev: 'my', todo_audit: 'todo', pool: 'all' };
            try {
                const [lRes, uRes, tRes] = await Promise.all([
                    fetch(`${API_PROB}?type=${typeMap[viewMode.value]}`, {headers:getH()}),
                    fetch(API_USERS, {headers:getH()}),
                    fetch(API_TASKS, {headers:getH()}) 
                ]);
                if(lRes.ok) list.value = await lRes.json();
                
                if(uRes.ok) {
                    const uData = await uRes.json();
                    users.value = Array.isArray(uData) ? uData : (uData.data || []);
                }

                if(tRes.ok) {
                    const tData = await tRes.json();
                    const rawTasks = Array.isArray(tData) ? tData : (tData.data || []);
                    myTasks.value = rawTasks.filter(t => t.status !== 'todo' && t.status !== 'pool');
                }
            } catch(e) { console.error(e); }
        };

        const openCreateModal = () => {
            newProblemData.title = '';
            newProblemData.relatedTaskId = null; 
            showCreateModal.value = true;
        };

        const confirmCreate = async () => {
            if(!newProblemData.title.trim()) return customAlert('请输入题目名称');
            try {
                const res = await fetch(API_PROB, {
                    method: 'POST', headers: {'Content-Type':'application/json', ...getH()},
                    body: JSON.stringify({ 
                        title: newProblemData.title,
                        relatedTaskId: newProblemData.relatedTaskId || null
                    })
                });
                if(res.ok) { 
                    showCreateModal.value = false;
                    refresh(); 
                    selectProblem(await res.json()); 
                }
            } catch(e) { customAlert(e.message); }
        };

        const deleteProblem = async (p) => {
            const msg = '确定删除题目“' + (p.title || '未知') + '”吗？此操作不可恢复。';
            confirmAction(msg, async () => {
                try {
                    const url = API_PROB + '/' + p._id;
                    const res = await fetch(url, { method: 'DELETE', headers: getH() });
                    if (!res.ok) { const d=await res.json(); throw new Error(d.message); }
                    customAlert('删除成功');
                    if(currentProblem.value && currentProblem.value._id === p._id) currentProblem.value = null;
                    refresh();
                } catch(e) { 
                    customAlert('操作失败: ' + e.message); 
                }
            });
        };

        const selectProblem = async (p) => {
            try {
                const res = await fetch(`${API_PROB}/${p._id}`, {headers:getH()});
                const detail = await res.json();
                currentProblem.value = detail;
                
                const rawTester = detail.testerId;
                const fixedTesterId = (rawTester && typeof rawTester === 'object') ? rawTester._id : rawTester;

                const rawTask = detail.relatedTaskId;
                const fixedTaskId = (rawTask && typeof rawTask === 'object') ? rawTask._id : rawTask;

                Object.assign(formData, {
                    title: detail.title, 
                    testerId: fixedTesterId || null,
                    relatedTaskId: fixedTaskId || null,
                    remark: detail.remark || '', // 加载备注
                    content: detail.content || {},
                    resources: detail.resources || {}
                });
                blindTestPassed.value = false;
            } catch(e){}
        };

        // 提交验收 (原子操作：保存+流转)
        const submitForReview = async () => {
            if(!formData.testerId) return customAlert('请先在右侧配置栏指定“验题人”');
            if(!formData.resources.problemPdf?.url) return customAlert('请先上传“题目文档 (PDF)”');
            if(!formData.resources.standardCode?.url) return customAlert('请先上传“标准程序”');
            if(!formData.resources.testData?.url) return customAlert('请先上传“测试数据包”');

            if (isSaving.value) return;
            isSaving.value = true;

            try {
                // 1. 保存当前数据 (包含 remark)
                const payload = {
                    title: formData.title,
                    content: JSON.parse(JSON.stringify(formData.content || {})),
                    resources: JSON.parse(JSON.stringify(formData.resources || {})),
                    remark: formData.remark,
                    testerId: formData.testerId || null,
                    relatedTaskId: formData.relatedTaskId || null
                };

                const saveRes = await fetch(`${API_PROB}/${currentProblem.value._id}`, {
                    method: 'PUT', headers: {'Content-Type':'application/json', ...getH()},
                    body: JSON.stringify(payload)
                });
                if (!saveRes.ok) throw new Error('保存失败');

                // 2. 触发状态机
                const transRes = await fetch(`${API_PROB}/${currentProblem.value._id}/transition`, {
                    method: 'POST', headers: {'Content-Type':'application/json', ...getH()},
                    body: JSON.stringify({ action: 'submit' })
                });
                
                if (!transRes.ok) throw new Error('流转失败');
                
                const updatedDoc = await transRes.json();
                customAlert('已成功提交验收！'); 
                
                // 🔥🔥🔥 关键修复：利用返回的最新文档更新当前视图
                await selectProblem(updatedDoc);
                refresh();

            } catch(e) {
                console.error("Submit Error:", e);
                customAlert('提交失败: ' + e.message);
            } finally {
                isSaving.value = false;
            }
        };

        const handleUpload = async (e, type) => {
            const file = e.target.files[0];
            if(!file) return;
            const fd = new FormData(); fd.append('file', file);
            const res = await fetch(API_UPLOAD, { method:'POST', body:fd, headers:getH() });
            if(res.ok) {
                const data = await res.json();
                formData.resources[type] = { name: data.originalName, url: data.url };
            }
        };

        const passBlindTest = () => { blindTestPassed.value = true; };

        // 驳回
        const rejectProblem = async () => {
            if(!auditForm.comment) return customAlert('请填写驳回意见');
            const res = await fetch(`${API_PROB}/${currentProblem.value._id}/transition`, {
                method: 'POST', headers: {'Content-Type':'application/json', ...getH()},
                body: JSON.stringify({ action: 'reject', comment: auditForm.comment })
            });
            if(res.ok) {
                customAlert('已驳回'); 
                // 🔥 刷新视图
                await selectProblem(await res.json());
                refresh();
            }
        };

        // 通过
        const approveProblem = async () => {
            const res = await fetch(`${API_PROB}/${currentProblem.value._id}/transition`, {
                method: 'POST', headers: {'Content-Type':'application/json', ...getH()},
                body: JSON.stringify({ action: 'approve', auditData: auditForm })
            });
            if(res.ok) {
                customAlert('验收通过！'); 
                // 🔥 刷新视图
                await selectProblem(await res.json());
                refresh();
            }
        };

        // 发布
        const publishProblem = async () => {
             const res = await fetch(`${API_PROB}/${currentProblem.value._id}/transition`, {
                method: 'POST', headers: {'Content-Type':'application/json', ...getH()},
                body: JSON.stringify({ action: 'publish' })
            });
            if(res.ok) {
                customAlert('发布成功！'); 
                // 🔥 刷新视图
                await selectProblem(await res.json());
                refresh();
            }
        };

        const getDownloadLink = (f) => `${API_UPLOAD}/download?url=${encodeURIComponent(f.url)}&name=${encodeURIComponent(f.name)}`;
        const getStatusBadge = (s) => ({dev:'text-blue-400 border-blue-500/50', review:'text-orange-400 border-orange-500/50', revision:'text-red-400 border-red-500/50', ready:'text-purple-400 border-purple-500/50', published:'text-emerald-400 border-emerald-500/50'}[s]);
        const getStatusLabel = (s) => ({dev:'开发中', review:'待验收', revision:'返修中', ready:'待发布', published:'已发布'}[s]||s);

        watch(viewMode, refresh);
        onMounted(refresh);

        return {
            viewMode, list, filteredList, currentProblem, users, myTasks, formData, auditForm,
            isAuthor, isTester, canEdit, blindTestPassed, todoCount, searchKey, isSaving,
            showCreateModal, newProblemData, sysModal,
            openCreateModal, confirmCreate, selectProblem, handleUpload, getDownloadLink,
            submitForReview, passBlindTest, rejectProblem, approveProblem, publishProblem,
            getStatusBadge, getStatusLabel, customAlert, confirmAction,
            isMyProblem, deleteProblem, getUserNameFromTask
        };
    }
};