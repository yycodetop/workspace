/**
 * Tuition Manager Component - V1.0 (Fixed Variable Name)
 * 1. 变量名修正：从 SOPHandlerComponent 改为 TuitionManagerComponent，解决冲突。
 * 2. 功能：收费、退费、数据分析。
 */
const TuitionManagerTemplate = `
<div class="h-full flex flex-col bg-[#0f111a] text-gray-100 font-sans relative overflow-hidden">
    
    <!-- 顶部 Tab 导航 -->
    <div class="px-6 py-4 border-b border-white/10 bg-[#0f111a]/95 backdrop-blur-xl flex justify-between items-center z-20">
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-900/50">
                <i class="fa-solid fa-sack-dollar"></i>
            </div>
            <h2 class="text-lg font-bold text-white tracking-wide">学费管理系统</h2>
        </div>
        
        <div class="flex bg-white/5 rounded-lg p-1 border border-white/10">
            <button @click="currentTab = 'charge'" :class="['px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2', currentTab==='charge'?'bg-emerald-600 text-white shadow-lg':'text-gray-400 hover:text-white']">
                <i class="fa-solid fa-file-invoice-dollar"></i> 收费管理
            </button>
            <button @click="currentTab = 'refund'" :class="['px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2', currentTab==='refund'?'bg-red-600 text-white shadow-lg':'text-gray-400 hover:text-white']">
                <i class="fa-solid fa-hand-holding-dollar"></i> 退费管理
            </button>
            <button @click="currentTab = 'analysis'" :class="['px-6 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2', currentTab==='analysis'?'bg-blue-600 text-white shadow-lg':'text-gray-400 hover:text-white']">
                <i class="fa-solid fa-chart-pie"></i> 数据分析
            </button>
        </div>
    </div>

    <!-- 主内容区域 -->
    <div class="flex-1 overflow-hidden relative">
        
        <!-- Tab 1: 收费管理 -->
        <div v-if="currentTab === 'charge'" class="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
            
            <div class="flex justify-between items-start mb-6">
                <div class="bg-[#1a1c26] p-4 rounded-xl border border-white/10 flex gap-4 items-center">
                    <div class="text-xs text-gray-500 font-bold uppercase">基础配置</div>
                    <button @click="openConfigModal('campus')" class="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 transition-all">
                        <i class="fa-solid fa-school mr-1"></i> 管理校区
                    </button>
                    <button @click="openConfigModal('course')" class="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 transition-all">
                        <i class="fa-solid fa-book-open mr-1"></i> 管理课程
                    </button>
                </div>

                <div class="flex gap-3">
                    <div class="relative">
                        <i class="fa-solid fa-search absolute left-3 top-2.5 text-gray-500 text-xs"></i>
                        <input v-model="filters.chargeSearch" @input="fetchRecords('income')" placeholder="搜教师/课程/学生..." class="bg-black/30 border border-white/10 rounded-lg pl-8 pr-4 py-2 text-sm text-white focus:border-emerald-500 outline-none w-64">
                    </div>
                    <button @click="openRecordModal('income')" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                        <i class="fa-solid fa-plus"></i> 新增收费
                    </button>
                </div>
            </div>

            <div class="bg-[#1a1c26] rounded-xl border border-white/10 overflow-hidden flex-1">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-black/20 text-xs text-gray-400 border-b border-white/5 uppercase">
                            <th class="p-4">录入时间</th>
                            <th class="p-4">学生姓名</th>
                            <th class="p-4">年级</th>
                            <th class="p-4">校区</th>
                            <th class="p-4">课程</th>
                            <th class="p-4">教师</th>
                            <th class="p-4">收费金额</th>
                            <th class="p-4 text-right">收费日期</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm">
                        <tr v-for="r in incomeList" :key="r._id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td class="p-4 text-gray-500 text-xs">{{ formatDate(r.createdAt, true) }}</td>
                            <td class="p-4 font-bold text-white">{{ r.studentName }}</td>
                            <td class="p-4 text-gray-300">{{ r.grade }}</td>
                            <td class="p-4 text-blue-300">{{ r.campus }}</td>
                            <td class="p-4 text-purple-300">{{ r.course }}</td>
                            <td class="p-4 text-gray-300"><i class="fa-solid fa-user-tie mr-1 text-xs"></i>{{ r.teacher }}</td>
                            <td class="p-4 text-emerald-400 font-mono font-bold">¥{{ r.amount.toLocaleString() }}</td>
                            <td class="p-4 text-right text-gray-400">{{ formatDate(r.transactionDate) }}</td>
                        </tr>
                        <tr v-if="incomeList.length === 0">
                            <td colspan="8" class="p-8 text-center text-gray-600">暂无收费记录</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Tab 2: 退费管理 -->
        <div v-if="currentTab === 'refund'" class="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
            <div class="flex justify-end mb-6">
                <button @click="openRecordModal('refund')" class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                    <i class="fa-solid fa-minus"></i> 登记退费
                </button>
            </div>

            <div class="bg-[#1a1c26] rounded-xl border border-white/10 overflow-hidden flex-1">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-black/20 text-xs text-gray-400 border-b border-white/5 uppercase">
                            <th class="p-4">录入时间</th>
                            <th class="p-4">学生姓名</th>
                            <th class="p-4">校区/课程</th>
                            <th class="p-4">责任教师</th>
                            <th class="p-4">退费金额</th>
                            <th class="p-4">退费原因</th>
                            <th class="p-4 text-right">退费日期</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm">
                        <tr v-for="r in refundList" :key="r._id" class="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td class="p-4 text-gray-500 text-xs">{{ formatDate(r.createdAt, true) }}</td>
                            <td class="p-4 font-bold text-white">{{ r.studentName }}</td>
                            <td class="p-4 text-gray-300">
                                <div class="text-xs text-blue-300">{{ r.campus }}</div>
                                <div class="text-xs text-purple-300">{{ r.course }}</div>
                            </td>
                            <td class="p-4 text-gray-300">{{ r.teacher }}</td>
                            <td class="p-4 text-red-400 font-mono font-bold">-¥{{ r.amount.toLocaleString() }}</td>
                            <td class="p-4 text-gray-300 max-w-xs truncate" :title="r.reason">{{ r.reason }}</td>
                            <td class="p-4 text-right text-gray-400">{{ formatDate(r.transactionDate) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Tab 3: 数据分析 -->
        <div v-if="currentTab === 'analysis'" class="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
            <!-- 分析过滤器 -->
            <div class="bg-[#1a1c26] p-4 rounded-xl border border-white/10 mb-6 flex items-center gap-4">
                <div class="text-sm text-gray-400">统计区间：</div>
                <input type="date" v-model="analysisFilter.startDate" class="bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm text-white outline-none">
                <span class="text-gray-500">-</span>
                <input type="date" v-model="analysisFilter.endDate" class="bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm text-white outline-none">
                <button @click="fetchAnalysis" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-sm font-bold ml-2">
                    <i class="fa-solid fa-chart-simple mr-1"></i> 生成报表
                </button>
            </div>

            <!-- 数据概览卡片 -->
            <div class="grid grid-cols-2 gap-6 mb-6">
                <div class="bg-gradient-to-br from-emerald-900/40 to-[#1a1c26] border border-emerald-500/30 p-6 rounded-2xl">
                    <div class="text-gray-400 text-xs font-bold uppercase mb-1">总收费 (Income)</div>
                    <div class="text-4xl font-black text-white font-mono">¥{{ totalIncome.toLocaleString() }}</div>
                </div>
                <div class="bg-gradient-to-br from-red-900/40 to-[#1a1c26] border border-red-500/30 p-6 rounded-2xl">
                    <div class="text-gray-400 text-xs font-bold uppercase mb-1">总退费 (Refund)</div>
                    <div class="text-4xl font-black text-white font-mono">¥{{ totalRefund.toLocaleString() }}</div>
                </div>
            </div>

            <!-- 图表区 -->
            <div class="grid grid-cols-3 gap-6 h-80">
                <div class="bg-[#1a1c26] p-4 rounded-xl border border-white/10 flex flex-col">
                    <div class="text-sm font-bold text-gray-300 mb-4 text-center">分校区收费占比</div>
                    <div class="flex-1 relative"><canvas id="chartCampus"></canvas></div>
                </div>
                <div class="bg-[#1a1c26] p-4 rounded-xl border border-white/10 flex flex-col">
                    <div class="text-sm font-bold text-gray-300 mb-4 text-center">分课程收费占比</div>
                    <div class="flex-1 relative"><canvas id="chartCourse"></canvas></div>
                </div>
                <div class="bg-[#1a1c26] p-4 rounded-xl border border-white/10 flex flex-col">
                    <div class="text-sm font-bold text-gray-300 mb-4 text-center">分教师收费占比</div>
                    <div class="flex-1 relative"><canvas id="chartTeacher"></canvas></div>
                </div>
            </div>
        </div>

        <!-- 弹窗：配置管理 -->
        <div v-if="showConfigModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-[#1a1c26] w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl">
                <h3 class="text-lg font-bold text-white mb-4">管理{{ configType === 'campus' ? '校区' : '课程' }}</h3>
                <div class="max-h-60 overflow-y-auto custom-scrollbar mb-4 space-y-2">
                    <div v-for="item in configList" :key="item._id" class="flex gap-2">
                        <input v-model="item.name" :disabled="!item.isEditing" class="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none">
                        <button v-if="!item.isEditing" @click="item.isEditing = true" class="text-blue-400 hover:text-white px-2"><i class="fa-solid fa-pen"></i></button>
                        <button v-else @click="updateConfig(item)" class="text-emerald-400 hover:text-white px-2"><i class="fa-solid fa-check"></i></button>
                    </div>
                </div>
                <div class="flex gap-2 border-t border-white/10 pt-4">
                    <input v-model="newConfigName" placeholder="输入新名称..." class="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
                    <button @click="addConfig" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded font-bold text-xs">添加</button>
                </div>
                <div class="mt-4 flex justify-end">
                    <button @click="showConfigModal = false" class="text-gray-400 hover:text-white text-sm">关闭</button>
                </div>
            </div>
        </div>

        <!-- 弹窗：新增记录 -->
        <div v-if="showRecordModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-[#1a1c26] w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl">
                <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <i :class="recordType==='income'?'fa-solid fa-plus text-emerald-500':'fa-solid fa-minus text-red-500'"></i>
                    {{ recordType === 'income' ? '新增收费记录' : '登记退费' }}
                </h3>
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-1">
                        <label class="block text-xs text-gray-500 mb-1">学生姓名</label>
                        <input v-model="recordForm.studentName" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
                    </div>
                    <div class="col-span-1" v-if="recordType==='income'">
                        <label class="block text-xs text-gray-500 mb-1">年级</label>
                        <input v-model="recordForm.grade" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
                    </div>
                    
                    <div class="col-span-1">
                        <label class="block text-xs text-gray-500 mb-1">校区</label>
                        <select v-model="recordForm.campus" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none">
                            <option value="">请选择</option>
                            <option v-for="c in campuses" :value="c.name">{{ c.name }}</option>
                        </select>
                    </div>
                    <div class="col-span-1">
                        <label class="block text-xs text-gray-500 mb-1">课程</label>
                        <select v-model="recordForm.course" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none">
                            <option value="">请选择</option>
                            <option v-for="c in courses" :value="c.name">{{ c.name }}</option>
                        </select>
                    </div>

                    <div class="col-span-1">
                        <label class="block text-xs text-gray-500 mb-1">教师</label>
                        <select v-model="recordForm.teacher" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none">
                            <option value="">请选择</option>
                            <option v-for="t in teachers" :value="t.name">{{ t.name }}</option>
                        </select>
                    </div>
                    <div class="col-span-1">
                        <label class="block text-xs text-gray-500 mb-1">{{ recordType==='income'?'收费金额':'退费金额' }} (元)</label>
                        <input type="number" v-model="recordForm.amount" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
                    </div>

                    <div class="col-span-2">
                        <label class="block text-xs text-gray-500 mb-1">{{ recordType==='income'?'收费时间':'退费时间' }}</label>
                        <input type="datetime-local" v-model="recordForm.transactionDate" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none">
                    </div>

                    <div class="col-span-2" v-if="recordType==='refund'">
                        <label class="block text-xs text-gray-500 mb-1">退费原因</label>
                        <textarea v-model="recordForm.reason" rows="2" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500"></textarea>
                    </div>
                </div>

                <div class="flex justify-end gap-3 mt-6">
                    <button @click="showRecordModal = false" class="text-gray-400 hover:text-white text-sm px-4 py-2">取消</button>
                    <button @click="submitRecord" :class="['text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg', recordType==='income'?'bg-emerald-600 hover:bg-emerald-500':'bg-red-600 hover:bg-red-500']">保存</button>
                </div>
            </div>
        </div>

    </div>
</div>
`;

// 🔥 修正：变量名改为 TuitionManagerComponent，防止与 SOPHandlerComponent 冲突
const TuitionManagerComponent = {
    template: TuitionManagerTemplate,
    setup() {
        const { ref, reactive, onMounted, computed, watch, nextTick } = Vue;
        const currentTab = ref('charge');
        const showConfigModal = ref(false);
        const showRecordModal = ref(false);
        const configType = ref('campus');
        const recordType = ref('income');
        const incomeList = ref([]);
        const refundList = ref([]);
        const configData = ref([]); 
        const teachers = ref([]); 
        
        const filters = reactive({ chargeSearch: '' });
        const analysisFilter = reactive({
            startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
        });
        const newConfigName = ref('');
        const recordForm = reactive({ studentName: '', grade: '', campus: '', course: '', teacher: '', amount: '', transactionDate: '', reason: '' });
        const totalIncome = ref(0);
        const totalRefund = ref(0);
        const charts = {};

        const API = '/api/tuition'; 
        const getHeaders = () => ({ 'Authorization': `Bearer ${localStorage.getItem('authToken')}`, 'Content-Type': 'application/json' });

        const configList = computed(() => configData.value.filter(c => c.type === configType.value));
        const campuses = computed(() => configData.value.filter(c => c.type === 'campus'));
        const courses = computed(() => configData.value.filter(c => c.type === 'course'));

        const fetchConfigs = async () => { try { const res = await fetch(`${API}/config`, { headers: getHeaders() }); if(res.ok) configData.value = (await res.json()).map(i => ({...i, isEditing: false})); } catch(e) { console.error(e); } };
        const fetchTeachers = async () => { try { const res = await fetch(`${API}/teachers`, { headers: getHeaders() }); if(res.ok) teachers.value = await res.json(); } catch(e) { console.error(e); } };
        
        const fetchRecords = async (type) => {
            try {
                let url = `${API}/records?type=${type}`;
                if(type === 'income' && filters.chargeSearch) url += `&search=${filters.chargeSearch}`;
                const res = await fetch(url, { headers: getHeaders() });
                if(res.ok) { const data = await res.json(); if(type === 'income') incomeList.value = data; else refundList.value = data; }
            } catch(e) { console.error(e); }
        };

        const addConfig = async () => { if(!newConfigName.value) return alert('请输入名称'); try { const res = await fetch(`${API}/config`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ type: configType.value, name: newConfigName.value }) }); if(res.ok) { await fetchConfigs(); newConfigName.value = ''; } } catch(e) { alert(e.message); } };
        const updateConfig = async (item) => { try { const res = await fetch(`${API}/config/${item._id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ name: item.name }) }); if(res.ok) { item.isEditing = false; await fetchConfigs(); } } catch(e) { alert(e.message); } };

        const submitRecord = async () => {
            if(!recordForm.studentName || !recordForm.amount || !recordForm.transactionDate) return alert('请补全必填信息');
            const payload = { ...recordForm, type: recordType.value };
            try { const res = await fetch(`${API}/records`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) }); if(res.ok) { showRecordModal.value = false; fetchRecords(recordType.value); Object.keys(recordForm).forEach(k => recordForm[k] = ''); } else { alert('保存失败'); } } catch(e) { alert(e.message); }
        };

        const loadChartJs = () => { return new Promise((resolve) => { if(window.Chart) return resolve(); const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/chart.js'; script.onload = resolve; document.head.appendChild(script); }); };
        const renderCharts = (data) => {
            const createPie = (canvasId, label, sourceData) => {
                const ctx = document.getElementById(canvasId); if(!ctx) return;
                if(charts[canvasId]) charts[canvasId].destroy();
                charts[canvasId] = new Chart(ctx, { type: 'pie', data: { labels: sourceData.map(d => d._id), datasets: [{ data: sourceData.map(d => d.totalAmount), backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'] }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { color: '#9ca3af' } } } } });
            };
            createPie('chartCampus', '校区', data.income.byCampus); createPie('chartCourse', '课程', data.income.byCourse); createPie('chartTeacher', '教师', data.income.byTeacher);
        };
        const fetchAnalysis = async () => { try { const res = await fetch(`${API}/analysis`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(analysisFilter) }); if(res.ok) { const data = await res.json(); totalIncome.value = data.income.byCampus.reduce((sum, i) => sum + i.totalAmount, 0); totalRefund.value = data.refund.totalRefund || 0; await loadChartJs(); nextTick(() => renderCharts(data)); } } catch(e) { console.error(e); } };
        const formatDate = (d, full=false) => { if(!d) return '-'; const date = new Date(d); return full ? date.toLocaleString() : date.toLocaleDateString(); };
        
        const openConfigModal = (type) => { configType.value = type; showConfigModal.value = true; };
        const openRecordModal = (type) => { recordType.value = type; const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); recordForm.transactionDate = now.toISOString().slice(0,16); showRecordModal.value = true; };

        onMounted(() => { fetchConfigs(); fetchTeachers(); fetchRecords('income'); });
        watch(currentTab, (val) => { if(val === 'refund') fetchRecords('refund'); if(val === 'analysis') fetchAnalysis(); });

        return {
            currentTab, showConfigModal, showRecordModal, configType, recordType, incomeList, refundList, configList, campuses, courses, teachers, filters, analysisFilter, newConfigName, recordForm, totalIncome, totalRefund,
            openConfigModal, openRecordModal, addConfig, updateConfig, submitRecord, fetchRecords, fetchAnalysis, formatDate
        };
    }
};