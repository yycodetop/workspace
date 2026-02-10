/**
 * Tuition Manager Component - V2.2 (Date Filter, Export, Enrollment Type)
 * 1. 筛选：支持日期区间查询。
 * 2. 导出：支持导出当前筛选结果为 Excel (CSV)。
 * 3. 字段：新增 报名类型 (新报/续报)。
 */
const TuitionManagerTemplate = `
<div class="h-full flex flex-col bg-[#0f111a] text-gray-100 font-sans relative overflow-hidden">
    
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

    <div class="flex-1 overflow-hidden relative">
        
        <div v-if="currentTab === 'charge'" class="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
            
            <div class="flex flex-wrap justify-between items-end mb-6 gap-4">
                <div class="flex gap-4 items-center">
                    <div class="bg-[#1a1c26] p-2 rounded-xl border border-white/10 flex gap-2">
                        <button @click="openConfigModal('campus')" class="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 transition-all"><i class="fa-solid fa-school mr-1"></i>校区</button>
                        <button @click="openConfigModal('course')" class="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 transition-all"><i class="fa-solid fa-book-open mr-1"></i>课程</button>
                    </div>

                    <div class="flex items-center bg-[#1a1c26] p-2 rounded-xl border border-white/10 gap-2">
                        <input type="date" v-model="filters.startDate" class="bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none">
                        <span class="text-gray-500 text-xs">-</span>
                        <input type="date" v-model="filters.endDate" class="bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none">
                        <button @click="fetchRecords('income')" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold shadow-lg" title="查询">
                            <i class="fa-solid fa-search"></i>
                        </button>
                        <button @click="resetFilters" class="text-gray-400 hover:text-white px-2 text-xs" title="重置"><i class="fa-solid fa-rotate-left"></i></button>
                    </div>
                </div>

                <div class="flex gap-3">
                    <div class="relative">
                        <i class="fa-solid fa-search absolute left-3 top-2.5 text-gray-500 text-xs"></i>
                        <input v-model="filters.search" @input="fetchRecords('income')" placeholder="搜教师/课程/学生..." class="bg-black/30 border border-white/10 rounded-lg pl-8 pr-4 py-2 text-sm text-white focus:border-emerald-500 outline-none w-56">
                    </div>
                    <button @click="downloadExcel('income')" class="bg-[#1a1c26] hover:bg-white/10 border border-white/10 text-emerald-400 px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                        <i class="fa-solid fa-file-excel"></i> 导出
                    </button>
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
                            <th class="p-4">校区/课程</th>
                            <th class="p-4">类型</th> <th class="p-4">责任教师</th>
                            <th class="p-4">经办人</th>
                            <th class="p-4">转介绍/备注</th>
                            <th class="p-4">收费金额</th>
                            <th class="p-4 text-right">收费日期</th>
                            <th v-if="isAdmin" class="p-4 text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm">
                        <tr v-for="r in incomeList" :key="r._id" class="border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <td class="p-4 text-gray-500 text-xs">{{ formatDate(r.createdAt, true) }}</td>
                            <td class="p-4 font-bold text-white">
                                <div>{{ r.studentName }}</div>
                                <div class="text-xs text-gray-500 font-normal">{{ r.grade }}</div>
                            </td>
                            <td class="p-4 text-gray-300">
                                <div class="text-xs text-blue-300">{{ r.campus }}</div>
                                <div class="text-xs text-purple-300">{{ r.course }}</div>
                            </td>
                            
                            <td class="p-4">
                                <span :class="['px-2 py-0.5 rounded text-xs border', r.enrollmentType==='new'?'border-emerald-500 text-emerald-400':'border-blue-500 text-blue-400']">
                                    {{ r.enrollmentType === 'new' ? '新报' : '续报' }}
                                </span>
                            </td>

                            <td class="p-4 text-emerald-200">{{ r.teacher }}</td>
                            <td class="p-4 text-gray-400 text-xs">
                                <span class="bg-white/5 px-2 py-1 rounded border border-white/5">{{ r.operatorName || '系统' }}</span>
                            </td>

                            <td class="p-4 text-gray-400 text-xs">
                                <div v-if="r.referral" class="text-amber-500 mb-1"><i class="fa-solid fa-share-nodes mr-1"></i>{{ r.referral }}</div>
                                <div v-if="r.remarks" class="max-w-[120px] truncate" :title="r.remarks">{{ r.remarks }}</div>
                                <span v-else class="text-gray-600">-</span>
                            </td>
                            <td class="p-4 text-emerald-400 font-mono font-bold">¥{{ r.amount.toLocaleString() }}</td>
                            <td class="p-4 text-right text-gray-400">{{ formatDate(r.transactionDate) }}</td>
                            
                            <td v-if="isAdmin" class="p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button @click="editRecord(r)" class="text-blue-400 hover:text-blue-300 mx-1" title="修改"><i class="fa-solid fa-pen-to-square"></i></button>
                                <button @click="deleteRecord(r._id)" class="text-red-500 hover:text-red-400 mx-1" title="删除"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                        <tr v-if="incomeList.length === 0">
                            <td colspan="10" class="p-8 text-center text-gray-600">暂无符合条件的收费记录</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="currentTab === 'refund'" class="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
            
            <div class="flex flex-wrap justify-between items-end mb-6 gap-4">
                <div class="flex items-center bg-[#1a1c26] p-2 rounded-xl border border-white/10 gap-2">
                    <input type="date" v-model="filters.startDate" class="bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none">
                    <span class="text-gray-500 text-xs">-</span>
                    <input type="date" v-model="filters.endDate" class="bg-black/30 border border-white/10 rounded px-2 py-1.5 text-xs text-white outline-none">
                    <button @click="fetchRecords('refund')" class="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded text-xs font-bold shadow-lg" title="查询">
                        <i class="fa-solid fa-search"></i>
                    </button>
                    <button @click="resetFilters" class="text-gray-400 hover:text-white px-2 text-xs" title="重置"><i class="fa-solid fa-rotate-left"></i></button>
                </div>

                <div class="flex gap-3">
                    <button @click="downloadExcel('refund')" class="bg-[#1a1c26] hover:bg-white/10 border border-white/10 text-emerald-400 px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                        <i class="fa-solid fa-file-excel"></i> 导出
                    </button>
                    <button @click="openRecordModal('refund')" class="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                        <i class="fa-solid fa-minus"></i> 登记退费
                    </button>
                </div>
            </div>

            <div class="bg-[#1a1c26] rounded-xl border border-white/10 overflow-hidden flex-1">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-black/20 text-xs text-gray-400 border-b border-white/5 uppercase">
                            <th class="p-4">录入时间</th>
                            <th class="p-4">学生姓名</th>
                            <th class="p-4">校区/课程</th>
                            <th class="p-4">责任教师</th>
                            <th class="p-4">经办人</th>
                            <th class="p-4">退费金额</th>
                            <th class="p-4">退费原因/备注</th>
                            <th class="p-4 text-right">退费日期</th>
                            <th v-if="isAdmin" class="p-4 text-center">操作</th>
                        </tr>
                    </thead>
                    <tbody class="text-sm">
                        <tr v-for="r in refundList" :key="r._id" class="border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <td class="p-4 text-gray-500 text-xs">{{ formatDate(r.createdAt, true) }}</td>
                            <td class="p-4 font-bold text-white">{{ r.studentName }}</td>
                            <td class="p-4 text-gray-300">
                                <div class="text-xs text-blue-300">{{ r.campus }}</div>
                                <div class="text-xs text-purple-300">{{ r.course }}</div>
                            </td>
                            <td class="p-4 text-gray-300">{{ r.teacher }}</td>
                            <td class="p-4 text-gray-400 text-xs">
                                <span class="bg-white/5 px-2 py-1 rounded border border-white/5">{{ r.operatorName || '系统' }}</span>
                            </td>
                            <td class="p-4 text-red-400 font-mono font-bold">-¥{{ r.amount.toLocaleString() }}</td>
                            <td class="p-4 text-gray-300 max-w-xs">
                                <div class="truncate" :title="r.reason">{{ r.reason }}</div>
                                <div v-if="r.remarks" class="text-xs text-gray-500 mt-1 truncate" :title="r.remarks">注: {{ r.remarks }}</div>
                            </td>
                            <td class="p-4 text-right text-gray-400">{{ formatDate(r.transactionDate) }}</td>
                            
                            <td v-if="isAdmin" class="p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <button @click="editRecord(r)" class="text-blue-400 hover:text-blue-300 mx-1" title="修改"><i class="fa-solid fa-pen-to-square"></i></button>
                                <button @click="deleteRecord(r._id)" class="text-red-500 hover:text-red-400 mx-1" title="删除"><i class="fa-solid fa-trash"></i></button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div v-if="currentTab === 'analysis'" class="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
            <div class="bg-[#1a1c26] p-4 rounded-xl border border-white/10 mb-6 flex items-center gap-4">
                <div class="text-sm text-gray-400">统计区间：</div>
                <input type="date" v-model="analysisFilter.startDate" class="bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm text-white outline-none">
                <span class="text-gray-500">-</span>
                <input type="date" v-model="analysisFilter.endDate" class="bg-black/30 border border-white/10 rounded px-3 py-1.5 text-sm text-white outline-none">
                <button @click="fetchAnalysis" class="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded text-sm font-bold ml-2">
                    <i class="fa-solid fa-chart-simple mr-1"></i> 生成报表
                </button>
            </div>

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

        <div v-if="showConfigModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-[#1a1c26] w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl animate-fade-in-up">
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

        <div v-if="showRecordModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-[#1a1c26] w-full max-w-lg rounded-2xl border border-white/10 p-6 shadow-2xl animate-fade-in-up">
                <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <i :class="recordType==='income'?'fa-solid fa-plus text-emerald-500':'fa-solid fa-minus text-red-500'"></i>
                    {{ isEditingRecord ? '修改记录' : (recordType === 'income' ? '新增收费记录' : '登记退费') }}
                </h3>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="col-span-1">
                        <label class="block text-xs text-gray-500 mb-1">学生姓名 <span class="text-red-500">*</span></label>
                        <input v-model="recordForm.studentName" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
                    </div>
                    <div class="col-span-1" v-if="recordType==='income'">
                        <label class="block text-xs text-gray-500 mb-1">年级</label>
                        <input v-model="recordForm.grade" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
                    </div>
                    
                    <div class="col-span-1">
                        <label class="block text-xs text-gray-500 mb-1">校区 <span class="text-red-500">*</span></label>
                        <select v-model="recordForm.campus" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none">
                            <option value="">请选择</option>
                            <option v-for="c in campuses" :value="c.name">{{ c.name }}</option>
                        </select>
                    </div>
                    <div class="col-span-1">
                        <label class="block text-xs text-gray-500 mb-1">课程 <span class="text-red-500">*</span></label>
                        <select v-model="recordForm.course" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none">
                            <option value="">请选择</option>
                            <option v-for="c in courses" :value="c.name">{{ c.name }}</option>
                        </select>
                    </div>

                    <div class="col-span-1">
                        <label class="block text-xs text-gray-500 mb-1">责任教师 <span class="text-red-500">*</span></label>
                        <select v-model="recordForm.teacher" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none">
                            <option value="">请选择</option>
                            <option v-for="t in teachers" :value="t.name">{{ t.name }}</option>
                        </select>
                    </div>
                    
                    <div class="col-span-1" v-if="recordType==='income'">
                        <label class="block text-xs text-gray-500 mb-1">报名类型 <span class="text-red-500">*</span></label>
                        <div class="flex gap-4 items-center h-[38px]">
                            <label class="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                <input type="radio" value="renewal" v-model="recordForm.enrollmentType" class="accent-emerald-500"> 续报 (默认)
                            </label>
                            <label class="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                <input type="radio" value="new" v-model="recordForm.enrollmentType" class="accent-emerald-500"> 新报
                            </label>
                        </div>
                    </div>

                    <div class="col-span-1">
                        <label class="block text-xs text-gray-500 mb-1">{{ recordType==='income'?'收费金额':'退费金额' }} (元) <span class="text-red-500">*</span></label>
                        <input type="number" v-model="recordForm.amount" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500">
                    </div>

                    <div class="col-span-2" v-if="recordType==='income'">
                        <label class="block text-xs text-gray-500 mb-1">转介绍学员 (选填)</label>
                        <input v-model="recordForm.referral" placeholder="请输入介绍人/学员姓名" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-amber-500">
                    </div>

                    <div class="col-span-2">
                        <label class="block text-xs text-gray-500 mb-1">{{ recordType==='income'?'收费时间':'退费时间' }} <span class="text-red-500">*</span></label>
                        <input type="datetime-local" v-model="recordForm.transactionDate" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none">
                    </div>

                    <div class="col-span-2" v-if="recordType==='refund'">
                        <label class="block text-xs text-gray-500 mb-1">退费原因</label>
                        <textarea v-model="recordForm.reason" rows="2" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500"></textarea>
                    </div>

                    <div class="col-span-2">
                        <label class="block text-xs text-gray-500 mb-1">备注信息</label>
                        <textarea v-model="recordForm.remarks" rows="2" placeholder="填写额外说明..." class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-sm text-white outline-none focus:border-blue-500"></textarea>
                    </div>
                </div>
                
                <div class="mt-4 flex justify-between items-center text-xs text-gray-500 border-t border-white/5 pt-3">
                    <div>当前操作员: <span class="text-emerald-400 font-bold">{{ currentOperatorName }}</span></div>
                    <div class="flex gap-3">
                        <button @click="showRecordModal = false" class="hover:text-white">取消</button>
                        <button @click="submitRecord" :class="['text-white px-4 py-1.5 rounded font-bold shadow-lg', recordType==='income'?'bg-emerald-600 hover:bg-emerald-500':'bg-red-600 hover:bg-red-500']">
                            {{ isEditingRecord ? '保存修改' : '确认提交' }}
                        </button>
                    </div>
                </div>

            </div>
        </div>

    </div>
</div>
`;

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
        const isEditingRecord = ref(false);
        const editingId = ref(null);
        
        const isAdmin = ref(localStorage.getItem('authUsername') === 'admin');
        const currentOperatorName = ref(localStorage.getItem('authName') || '我'); 

        // 🔥 筛选器默认值为空 (即全部)
        const filters = reactive({ 
            search: '',
            startDate: '', 
            endDate: ''
        });

        const analysisFilter = reactive({
            startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0]
        });
        const newConfigName = ref('');
        const recordForm = reactive({ 
            studentName: '', grade: '', campus: '', course: '', teacher: '', 
            enrollmentType: 'renewal', // 🔥 默认续报
            amount: '', transactionDate: '', reason: '',
            referral: '', remarks: '' 
        });
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
        
        // 🔥 获取记录 (带筛选)
        const fetchRecords = async (type) => {
            try {
                let url = `${API}/records?type=${type}`;
                if(filters.search) url += `&search=${filters.search}`;
                if(filters.startDate && filters.endDate) url += `&startDate=${filters.startDate}&endDate=${filters.endDate}`;
                
                const res = await fetch(url, { headers: getHeaders() });
                if(res.ok) { 
                    const data = await res.json(); 
                    if(type === 'income') incomeList.value = data; 
                    else refundList.value = data; 
                }
            } catch(e) { console.error(e); }
        };

        const resetFilters = () => {
            filters.search = '';
            filters.startDate = '';
            filters.endDate = '';
            fetchRecords(currentTab.value === 'charge' ? 'income' : 'refund');
        };

        // 🔥 导出 Excel (CSV)
        const downloadExcel = (type) => {
            const data = type === 'income' ? incomeList.value : refundList.value;
            if (!data.length) return alert('当前没有数据可导出');

            // 定义 CSV 表头
            let csvContent = "\uFEFF"; // 添加 BOM 防止乱码
            let headers = [];
            
            if (type === 'income') {
                headers = ['录入时间', '学生姓名', '年级', '校区', '课程', '类型', '责任教师', '经办人', '金额', '收费日期', '转介绍', '备注'];
            } else {
                headers = ['录入时间', '学生姓名', '校区', '课程', '责任教师', '经办人', '金额', '退费日期', '退费原因', '备注'];
            }
            
            csvContent += headers.join(",") + "\n";

            data.forEach(row => {
                let rowData = [];
                const created = new Date(row.createdAt).toLocaleDateString();
                const transDate = new Date(row.transactionDate).toLocaleDateString();
                
                if (type === 'income') {
                    rowData = [
                        created, row.studentName, row.grade || '-', row.campus, row.course, 
                        row.enrollmentType === 'new' ? '新报' : '续报',
                        row.teacher, row.operatorName || '-', row.amount, transDate, 
                        row.referral || '-', row.remarks || '-'
                    ];
                } else {
                    rowData = [
                        created, row.studentName, row.campus, row.course, 
                        row.teacher, row.operatorName || '-', row.amount, transDate, 
                        row.reason || '-', row.remarks || '-'
                    ];
                }
                // 处理 CSV 中的逗号和换行
                const safeRow = rowData.map(str => `"${String(str).replace(/"/g, '""')}"`).join(",");
                csvContent += safeRow + "\n";
            });

            // 触发下载
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            const dateStr = filters.startDate ? `${filters.startDate}_to_${filters.endDate}` : 'all';
            link.setAttribute("download", `${type}_report_${dateStr}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        const addConfig = async () => { if(!newConfigName.value) return alert('请输入名称'); try { const res = await fetch(`${API}/config`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ type: configType.value, name: newConfigName.value }) }); if(res.ok) { await fetchConfigs(); newConfigName.value = ''; } } catch(e) { alert(e.message); } };
        const updateConfig = async (item) => { try { const res = await fetch(`${API}/config/${item._id}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ name: item.name }) }); if(res.ok) { item.isEditing = false; await fetchConfigs(); } } catch(e) { alert(e.message); } };

        const submitRecord = async () => {
            if(!recordForm.studentName || !recordForm.amount || !recordForm.transactionDate) return alert('请补全必填信息');
            const payload = { ...recordForm, type: recordType.value };
            
            try {
                let res;
                if (isEditingRecord.value && editingId.value) {
                    res = await fetch(`${API}/records/${editingId.value}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify(payload) });
                } else {
                    res = await fetch(`${API}/records`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(payload) });
                }

                if(res.ok) { 
                    showRecordModal.value = false; 
                    fetchRecords(recordType.value); 
                    resetForm();
                } else { 
                    const err = await res.json();
                    alert(err.message || '操作失败'); 
                } 
            } catch(e) { alert(e.message); }
        };

        const deleteRecord = async (id) => {
            if(!confirm('确定要删除这条记录吗？')) return;
            try {
                const res = await fetch(`${API}/records/${id}`, { method: 'DELETE', headers: getHeaders() });
                if (res.ok) {
                    fetchRecords(recordType.value);
                    if (currentTab.value === 'analysis') fetchAnalysis();
                } else { alert((await res.json()).message || '删除失败'); }
            } catch(e) { alert(e.message); }
        };

        const editRecord = (record) => {
            isEditingRecord.value = true;
            editingId.value = record._id;
            recordType.value = record.type;
            Object.keys(recordForm).forEach(k => {
                if (k === 'transactionDate' && record[k]) recordForm[k] = new Date(record[k]).toISOString().slice(0, 16);
                else recordForm[k] = record[k] === undefined ? '' : record[k];
            });
            // 确保有默认值
            if (!recordForm.enrollmentType) recordForm.enrollmentType = 'renewal';
            showRecordModal.value = true;
        };

        const resetForm = () => {
            Object.keys(recordForm).forEach(k => recordForm[k] = '');
            recordForm.enrollmentType = 'renewal'; // 🔥 重置时默认续报
            isEditingRecord.value = false;
            editingId.value = null;
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
        const openRecordModal = (type) => { 
            resetForm(); 
            recordType.value = type; 
            const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); 
            recordForm.transactionDate = now.toISOString().slice(0,16); 
            showRecordModal.value = true; 
        };

        onMounted(() => { fetchConfigs(); fetchTeachers(); fetchRecords('income'); });
        watch(currentTab, (val) => { if(val === 'refund') fetchRecords('refund'); if(val === 'analysis') fetchAnalysis(); });

        return {
            currentTab, showConfigModal, showRecordModal, configType, recordType, incomeList, refundList, configList, campuses, courses, teachers, filters, analysisFilter, newConfigName, recordForm, totalIncome, totalRefund, isAdmin, isEditingRecord, currentOperatorName,
            openConfigModal, openRecordModal, addConfig, updateConfig, submitRecord, editRecord, deleteRecord, fetchRecords, fetchAnalysis, formatDate, resetFilters, downloadExcel
        };
    }
};