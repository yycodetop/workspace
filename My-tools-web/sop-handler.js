/**
 * SOP Handler - V21.0 (Fix Preview Modal)
 * 1. 修复：补全了缺失的“预览弹窗”UI代码，现在点击预览可以看到详情了。
 * 2. 保持：卡片样式、开始按钮逻辑、分类管理、权限控制等所有功能完全不变。
 */
const SOPHandlerTemplate = `
<div class="h-full flex flex-col bg-[#0b0c15] text-gray-100 font-sans selection:bg-purple-500/30 relative">
    
    <div class="px-8 py-5 border-b border-white/10 bg-[#0b0c15]/90 backdrop-blur-xl flex justify-between items-center shadow-lg z-20">
        <div class="flex items-center gap-6">
            <h2 class="text-xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                <i class="fa-solid fa-clipboard-check text-purple-500"></i> SOP 执行中心
            </h2>
            <div class="flex bg-white/5 rounded-lg p-1 border border-white/10">
                <button @click="switchView('library')" :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2', viewMode==='library' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white']"><i class="fa-solid fa-shop"></i> 任务超市</button>
                <button @click="switchView('my_tasks')" :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2', viewMode==='my_tasks' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white']"><i class="fa-solid fa-list-ul"></i> 我的任务</button>
                <button @click="switchView('review')" :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2', viewMode==='review' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white']">
                    <i class="fa-solid fa-gavel"></i> 审核台 
                    <span v-if="reviewTasks.length > 0" class="bg-red-500 text-white text-[10px] px-1.5 rounded-full ml-1">{{ reviewTasks.length }}</span>
                </button>
                <button @click="switchView('all_tasks')" class="px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 text-gray-400 hover:text-white border-l border-white/10 ml-2 pl-4"><i class="fa-solid fa-users-viewfinder"></i> 全员任务</button>
                <button v-if="isAdmin" @click="switchView('admin_lib')" :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ml-2', viewMode==='admin_lib' ? 'bg-indigo-600 text-white shadow-lg' : 'text-indigo-400 hover:text-white border border-indigo-500/30 bg-indigo-500/10']">
                    <i class="fa-solid fa-swatchbook"></i> SOP 标准库
                </button>
            </div>
        </div>
        <button @click="refresh" class="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all"><i class="fa-solid fa-rotate"></i></button>
    </div>

    <div class="flex-1 overflow-hidden relative">
        
        <div v-if="viewMode === 'library'" class="h-full overflow-y-auto p-8 custom-scrollbar animate-fade-in-up">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div v-for="tpl in templates" :key="tpl._id" @click="openPreview(tpl)" class="bg-[#13151f] border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all flex flex-col h-full hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20 cursor-pointer group">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/10">{{ tpl.title.charAt(0) }}</div>
                        <span class="px-2 py-1 rounded text-[10px] bg-white/5 text-gray-400 uppercase font-bold border border-white/5">{{ tpl.category }}</span>
                    </div>
                    <h3 class="text-lg font-bold text-white mb-2">{{ tpl.title }}</h3>
                    <p class="text-xs text-gray-500 mb-6 line-clamp-3 flex-1">{{ tpl.desc || '暂无描述' }}</p>
                    
                    <div v-if="tpl.attachments?.length" class="mb-4 space-y-1 border-t border-white/5 pt-2">
                        <div v-for="f in tpl.attachments" :key="f.url" class="text-[10px] flex items-center gap-2 text-gray-400">
                            <i class="fa-solid fa-paperclip text-blue-500"></i> <a :href="getDownloadLink(f)" @click.stop target="_blank" class="hover:text-blue-400 underline truncate">{{ f.name }}</a>
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <button @click.stop="openPreview(tpl)" class="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-white/10">预览</button>
                        <button @click.stop="openStartModal(tpl)" class="flex-1 bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"><i class="fa-solid fa-play"></i> 开始</button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="viewMode === 'admin_lib'" class="h-full overflow-y-auto p-8 custom-scrollbar animate-fade-in-up">
            <div class="flex items-center gap-3 mb-8 bg-[#13151f] p-4 rounded-xl border border-white/10">
                <div class="text-sm font-bold text-gray-400 mr-2">管理操作：</div>
                <button @click="showCategoryModal = true" class="px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/50 text-indigo-300 text-xs font-bold hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2">
                    <i class="fa-solid fa-tags"></i> 分类维护
                </button>
                <button @click="customAlert('新建SOP功能开发中...')" class="px-4 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold hover:bg-purple-500 transition-all flex items-center gap-2 shadow-lg">
                    <i class="fa-solid fa-plus"></i> 新建 SOP
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div v-for="tpl in templates" :key="tpl._id" class="bg-[#13151f] border border-indigo-500/20 rounded-xl p-6 relative group hover:bg-white/[0.02]">
                    <div class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="w-7 h-7 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white flex items-center justify-center text-xs"><i class="fa-solid fa-pen"></i></button>
                        <button class="w-7 h-7 rounded bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center text-white font-bold text-xl shadow-lg border border-white/10">{{ tpl.title.charAt(0) }}</div>
                    </div>
                    <h3 class="text-lg font-bold text-white mb-2">{{ tpl.title }}</h3>
                    <div class="flex gap-2 mt-4">
                        <span class="px-2 py-1 rounded text-[10px] bg-white/5 text-gray-400 border border-white/5">{{ tpl.category }}</span>
                        <span class="px-2 py-1 rounded text-[10px] bg-white/5 text-gray-500 border border-white/5">v{{ tpl.version }}</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="viewMode === 'my_tasks'" class="h-full overflow-y-auto p-8 custom-scrollbar animate-fade-in-up">
             <div v-if="myTasks.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500"><i class="fa-regular fa-folder-open text-4xl mb-4 opacity-50"></i><p>暂无任务</p></div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                <div v-for="task in myTasks" :key="task._id" @click="openTaskDetail(task._id)" class="bg-[#13151f] border border-white/10 rounded-xl p-5 hover:border-purple-500/50 hover:bg-white/[0.02] cursor-pointer transition-all group relative flex flex-col shadow-lg">
                    <div class="flex justify-between items-center mb-4">
                        <span :class="['px-3 py-1 rounded-full text-xs font-bold border', getStatusBadge(task.status)]">{{ getStatusLabel(task.status) }}</span>
                        <button @click.stop="deleteTask(task._id)" class="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><i class="fa-solid fa-trash"></i></button>
                    </div>
                    <h3 class="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors truncate">{{ task.snapshot?.title || '未命名' }}</h3>
                    <div class="text-xs text-gray-500 mb-4">ID: #{{ task._id.slice(-6) }}</div>
                    <div v-if="task.status === 'rejected'" class="mb-4 bg-red-500/10 border border-red-500/40 rounded-lg p-3 animate-pulse">
                        <div class="text-[10px] text-red-400 font-bold uppercase mb-1 flex items-center gap-1"><i class="fa-solid fa-circle-exclamation"></i> 驳回原因</div>
                        <div class="text-xs text-red-200 line-clamp-3 font-medium">{{ getLatestRejectReason(task) }}</div>
                    </div>
                    <div class="space-y-3 flex-1">
                        <div class="flex items-center gap-3 text-xs text-gray-400 bg-black/20 p-2.5 rounded border border-white/5">
                            <div class="w-6 h-6 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-300 font-bold border border-purple-500/20">{{ task.reviewerId?.name?.charAt(0) || '?' }}</div>
                            <div><div class="text-[10px] text-gray-500 uppercase font-bold">审核人员</div><div class="text-gray-200">{{ task.reviewerId?.name || '未指定' }}</div></div>
                        </div>
                        <div class="flex flex-col gap-1.5 text-xs text-gray-400 bg-black/20 p-2.5 rounded border border-white/5">
                            <div class="flex justify-between items-center"><span class="text-[10px] text-gray-500 uppercase font-bold"><i class="fa-solid fa-link mr-1"></i>关联任务</span><span class="text-gray-300 truncate max-w-[120px]">{{ task.relatedTaskId?.title || '无' }}</span></div>
                            <div v-if="task.relatedTaskId" class="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden"><div class="bg-blue-500 h-full rounded-full transition-all duration-500" :style="{width: (task.relatedTaskId.progress || 0) + '%'}"></div></div>
                        </div>
                    </div>
                    <div class="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                        <div class="flex items-center gap-2 text-gray-500"><i class="fa-solid fa-list-check"></i> 已完成步骤</div>
                        <div class="flex items-center gap-1"><span class="text-emerald-400 font-bold text-base">{{ getCompletedCount(task) }}</span><span class="text-gray-600">/</span><span class="text-gray-400">{{ (task.snapshot?.steps || []).length }}</span></div>
                    </div>
                </div>
            </div>
        </div>
        
        <div v-if="viewMode === 'all_tasks'" class="h-full overflow-y-auto p-8 custom-scrollbar animate-fade-in-up">
            <div class="max-w-5xl mx-auto space-y-4">
                <div v-for="task in allTasks" :key="task._id" @click="openTaskDetail(task._id)" class="bg-[#13151f] border border-white/10 rounded-xl p-4 hover:bg-white/5 cursor-pointer flex items-center justify-between group">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full bg-gray-700 overflow-hidden border border-white/20 flex-shrink-0"><img v-if="task.userId?.avatar" :src="task.userId.avatar" class="w-full h-full object-cover"><div v-else class="w-full h-full flex items-center justify-center text-xs font-bold text-white">{{ task.userId?.name?.charAt(0) || '?' }}</div></div>
                        <div><div class="text-sm font-bold text-white flex items-center gap-2">{{ task.snapshot?.title }}<span v-if="task.status === 'completed'" class="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 rounded"><i class="fa-solid fa-check mr-1"></i>已完成</span></div><div class="text-xs text-gray-500 mt-1">执行: {{ task.userId?.name }} | 关联: {{ task.relatedTaskId?.title || '-' }}</div></div>
                    </div>
                    <span :class="['px-3 py-1 rounded-full text-xs font-bold border', getStatusBadge(task.status)]">{{ getStatusLabel(task.status) }}</span>
                </div>
            </div>
        </div>

        <div v-if="viewMode === 'review'" class="h-full overflow-y-auto p-8 custom-scrollbar animate-fade-in-up">
             <div v-if="reviewTasks.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500"><i class="fa-solid fa-mug-hot text-4xl mb-4 opacity-50"></i><p>暂无待审核任务</p></div>
             <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                <div v-for="task in reviewTasks" :key="task._id" @click="openTaskDetail(task._id)" class="bg-[#13151f] border border-emerald-500/30 rounded-xl p-5 hover:bg-white/[0.02] cursor-pointer transition-all group relative flex flex-col shadow-lg shadow-emerald-900/10">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-12 h-12 rounded-full bg-gray-700 overflow-hidden border-2 border-emerald-500/50"><img v-if="task.userId?.avatar" :src="task.userId.avatar" class="w-full h-full object-cover"><div v-else class="w-full h-full flex items-center justify-center text-xs font-bold text-white">{{ task.userId?.name?.charAt(0) || '?' }}</div></div>
                        <div><h3 class="text-sm font-bold text-white mb-1">{{ task.snapshot?.title }}</h3><div class="text-xs text-gray-400">提交人: <span class="text-white">{{ task.userId?.name || '未知' }}</span></div></div>
                    </div>
                    <div class="bg-black/30 rounded-lg p-3 text-xs border border-white/5 space-y-2 mb-4">
                        <div class="flex justify-between"><span class="text-gray-500">提交时间</span><span class="text-gray-300">{{ new Date(task.updatedAt).toLocaleDateString() }}</span></div>
                        <div class="flex justify-between"><span class="text-gray-500">关联任务</span><span class="text-gray-300 truncate max-w-[120px]">{{ task.relatedTaskId?.title || '-' }}</span></div>
                    </div>
                    <button class="w-full bg-emerald-600/10 text-emerald-400 border border-emerald-500/30 py-2 rounded-lg text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all">进入审核</button>
                </div>
            </div>
        </div>

        <div v-if="previewTemplate" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div class="bg-[#1a1c26] w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/10 p-0 shadow-2xl flex flex-col overflow-hidden relative">
                <div class="p-6 border-b border-white/10 flex justify-between items-start bg-[#13151f]">
                    <div>
                        <div class="text-xs font-bold text-purple-500 uppercase mb-1 flex items-center gap-2">
                            <span class="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">{{ previewTemplate.category }}</span>
                            <span class="text-gray-500">v{{ previewTemplate.version }}</span>
                        </div>
                        <h3 class="text-2xl font-bold text-white">{{ previewTemplate.title }}</h3>
                    </div>
                    <button @click="previewTemplate = null" class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <div class="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap bg-white/5 p-4 rounded-lg border border-white/5">{{ previewTemplate.desc || '此 SOP 暂无详细描述' }}</div>
                    
                    <div v-if="previewTemplate.attachments?.length" class="bg-blue-900/10 rounded-lg p-4 border border-blue-500/20">
                        <h4 class="text-xs font-bold text-blue-400 uppercase mb-3 flex items-center gap-2"><i class="fa-solid fa-folder-open"></i> 参考文档</h4>
                        <div class="space-y-2">
                            <a v-for="f in previewTemplate.attachments" :href="getDownloadLink(f)" target="_blank" class="flex items-center gap-2 text-sm text-gray-300 hover:text-white group">
                                <i class="fa-solid fa-file-arrow-down text-gray-500 group-hover:text-blue-400"></i> {{ f.name }}
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 class="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2"><i class="fa-solid fa-list-ol"></i> 步骤概览</h4>
                        <div class="space-y-3 relative">
                            <div class="absolute left-[15px] top-4 bottom-4 w-0.5 bg-white/5 -z-10"></div>
                            <div v-for="(step, idx) in previewTemplate.steps" :key="idx" class="flex gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                <div class="w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:border-purple-500/50 group-hover:text-purple-400 transition-colors z-10">{{ idx + 1 }}</div>
                                <div>
                                    <div class="text-sm font-bold text-white mb-1">{{ step.title }}</div>
                                    <div class="text-xs text-gray-500">{{ step.desc || '无详细指引' }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="p-6 border-t border-white/10 bg-[#13151f] flex justify-end gap-3">
                    <button @click="previewTemplate = null" class="px-6 py-2 rounded-lg border border-white/10 text-gray-400 hover:text-white text-sm font-bold transition-all">关闭</button>
                    <button @click="openStartModal(previewTemplate); previewTemplate = null" class="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-lg transition-all flex items-center gap-2"><i class="fa-solid fa-play"></i> 立即开始</button>
                </div>
            </div>
        </div>

        <div v-if="showCategoryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div class="bg-[#1a1c26] w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-xl relative">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-lg font-bold text-white flex items-center gap-2"><i class="fa-solid fa-tags text-indigo-500"></i> 分类管理</h3>
                    <button @click="showCategoryModal=false" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <div class="flex gap-2 mb-4">
                    <input v-model="newCategoryName" placeholder="输入新分类名称..." class="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none">
                    <button @click="addCategory" class="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-500 whitespace-nowrap"><i class="fa-solid fa-plus"></i> 添加</button>
                </div>
                <div class="max-h-[300px] overflow-y-auto custom-scrollbar space-y-2 border-t border-white/5 pt-4">
                    <div v-for="cat in categories" :key="cat._id" class="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5 group">
                        <div v-if="editingCatId === cat._id" class="flex-1 flex gap-2 mr-2">
                            <input v-model="editingCatName" class="w-full bg-black/50 border border-indigo-500/50 rounded px-2 py-1 text-xs text-white outline-none">
                            <button @click="updateCategory(cat._id)" class="text-emerald-400 hover:text-emerald-300"><i class="fa-solid fa-check"></i></button>
                            <button @click="cancelEdit" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                        <div v-else class="text-sm text-gray-300 flex-1">{{ cat.name }}</div>
                        <div v-if="editingCatId !== cat._id" class="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button @click="startEdit(cat)" class="text-blue-400 hover:text-blue-300 text-xs"><i class="fa-solid fa-pen"></i></button>
                            <button @click="deleteCategory(cat._id)" class="text-red-400 hover:text-red-300 text-xs"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    <div v-if="categories.length === 0" class="text-center text-gray-500 text-xs py-4">暂无分类</div>
                </div>
            </div>
        </div>

        <div v-if="showStartModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div class="bg-[#1a1c26] w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-xl relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <h3 class="text-lg font-bold text-white mb-6 relative z-10">开始任务: {{ selectedTemplate?.title }}</h3>
                <div class="space-y-5 relative z-10">
                    <div>
                        <label class="block text-xs text-gray-500 font-bold uppercase mb-2">1. 指定审核人员 (预约)</label>
                        <select v-model="selectedReviewerId" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-colors">
                            <option :value="null">-- 不指定 (或稍后指定) --</option>
                            <option v-for="u in users" :key="u._id" :value="u._id">{{ u.name }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-500 font-bold uppercase mb-2">2. 关联已有任务</label>
                        <select v-model="selectedRelatedTaskId" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-colors">
                            <option :value="null">-- 不关联 --</option>
                            <option v-for="t in myCommandTasks" :key="t._id" :value="t._id">{{ t.title }} ({{ t.progress }}%)</option>
                        </select>
                    </div>
                </div>
                <div class="flex justify-end gap-3 pt-6 border-t border-white/5 mt-6 relative z-10">
                    <button @click="showStartModal=false" class="text-gray-400 text-sm hover:text-white transition-colors">取消</button>
                    <button @click="confirmStartTask" class="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg transition-all">确认预约/开始</button>
                </div>
            </div>
        </div>

        <div v-if="currentTask" class="absolute inset-0 z-50 bg-[#0b0c15] flex flex-col animate-fade-in-up">
            <div class="px-6 py-4 border-b border-white/10 bg-[#13151f] flex justify-between items-center shadow-md z-10">
                <div class="flex items-center gap-4">
                    <button @click="closeTaskDetail" class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"><i class="fa-solid fa-arrow-left"></i></button>
                    <div><h2 class="text-lg font-bold text-white flex items-center gap-3">{{ currentTask.snapshot?.title }} <span :class="['px-2 py-0.5 rounded text-[10px] border', getStatusBadge(currentTask.status)]">{{ getStatusLabel(currentTask.status) }}</span></h2></div>
                </div>
                <div class="flex gap-3">
                    <template v-if="isReviewerMode">
                        <button @click="confirmAction('确定通过全部步骤并归档？', () => auditTask('approve_all'))" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-bold shadow-lg shadow-emerald-900/20">全部通过</button>
                        <button @click="showRejectModal(null, 'all')" class="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 px-4 py-2 rounded text-sm font-bold transition-all">整单驳回</button>
                    </template>
                    <template v-else-if="currentTask.status !== 'submitted' && currentTask.status !== 'completed'">
                        <button @click="confirmAction('提交后将等待审核，确认提交？', submitForReview)" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded text-sm font-bold shadow-lg shadow-blue-900/20">提交审核</button>
                    </template>
                </div>
            </div>

            <div class="flex-1 flex overflow-hidden">
                <div class="w-80 border-r border-white/10 bg-[#0f111a] overflow-y-auto custom-scrollbar p-6 flex flex-col gap-6">
                    <div v-if="currentTask.snapshot?.attachments?.length" class="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4">
                        <div class="text-[10px] font-bold text-blue-400 uppercase mb-3 flex items-center gap-2"><i class="fa-solid fa-folder-open"></i> 标准参考文档</div>
                        <div class="space-y-2"><a v-for="f in currentTask.snapshot.attachments" :key="f.url" :href="getDownloadLink(f)" target="_blank" class="block text-xs text-gray-300 hover:text-white truncate group transition-colors"><i class="fa-solid fa-file-arrow-down mr-2 text-gray-500 group-hover:text-blue-400"></i> {{ f.name }}</a></div>
                    </div>
                    <div class="space-y-4 relative">
                        <div class="absolute left-[11px] top-4 bottom-4 w-0.5 bg-white/5 -z-10"></div>
                        <div v-for="(step, idx) in taskSteps" :key="idx" @click="activeStepIndex = idx" :class="['relative pl-8 cursor-pointer group transition-all p-2 rounded-lg', activeStepIndex === idx ? 'bg-white/5' : 'hover:bg-white/[0.02]']">
                            <div class="absolute left-0 top-3 z-10 transition-all">
                                <i v-if="getStepStatus(idx) === 'approved'" class="fa-solid fa-square-check text-emerald-500 text-lg"></i>
                                <i v-else-if="getStepStatus(idx) === 'rejected'" class="fa-solid fa-square-xmark text-red-500 text-lg"></i>
                                <i v-else-if="getStepData(idx)?.submittedAt" class="fa-regular fa-square-check text-emerald-500/70 text-lg"></i>
                                <i v-else-if="activeStepIndex === idx" class="fa-regular fa-square text-purple-500 text-lg"></i>
                                <i v-else class="fa-regular fa-square text-gray-600 text-lg group-hover:text-gray-400"></i>
                            </div>
                            <div :class="['text-sm font-bold mb-0.5 transition-colors', activeStepIndex === idx ? 'text-white' : 'text-gray-400']">{{ step.title }}</div>
                            <div class="text-[10px] text-gray-600 truncate">{{ step.type === 'file' ? '上传文档' : '填写内容' }}</div>
                            <div v-if="getStepStatus(idx) === 'rejected'" class="mt-2 bg-red-900/20 text-red-400 text-[10px] p-2 rounded border border-red-500/20 animate-pulse"><i class="fa-solid fa-circle-exclamation mr-1"></i> {{ getStepData(idx)?.rejectReason || '需修改' }}</div>
                        </div>
                    </div>
                </div>

                <div class="flex-1 bg-[#0b0c15] p-10 overflow-y-auto custom-scrollbar flex flex-col">
                    <div class="max-w-3xl mx-auto w-full flex-1">
                        <div class="mb-8">
                            <h3 class="text-2xl font-bold text-white mb-2"><span class="text-purple-500 mr-2">Step {{ activeStepIndex + 1 }}.</span>{{ currentStep.title }}</h3>
                            <div class="text-gray-400 text-sm bg-white/5 p-4 rounded-lg border border-white/5 leading-relaxed">{{ currentStep.desc || '暂无指引' }}</div>
                        </div>
                        <div class="bg-[#13151f] border border-white/10 rounded-xl p-6 shadow-xl relative overflow-hidden">
                            <div v-if="shouldReadOnly" class="bg-blue-900/20 border border-blue-500/30 text-blue-400 text-xs px-4 py-2 rounded mb-4 flex items-center"><i class="fa-solid fa-lock mr-2"></i> <span v-if="currentTask.status === 'completed'">此任务已归档，内容仅供查阅。</span><span v-else>只读模式：您不是执行人。</span></div>
                            <div v-if="currentStep.type === 'input'" class="space-y-4">
                                <label class="text-xs text-gray-500 font-bold uppercase">填写内容</label>
                                <textarea v-model="activeStepData.content" :disabled="shouldReadOnly" rows="6" class="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white text-sm focus:border-purple-500 outline-none resize-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"></textarea>
                            </div>
                            <div v-else-if="currentStep.type === 'file'" class="space-y-4">
                                <label class="text-xs text-gray-500 font-bold uppercase">上传文档</label>
                                <div v-if="!shouldReadOnly" class="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-purple-500/50 relative bg-black/20 transition-colors">
                                    <input type="file" multiple @change="handleTaskFileUpload" class="absolute inset-0 opacity-0 cursor-pointer z-20" :disabled="isUploading">
                                    <div><i class="fa-solid fa-cloud-arrow-up text-4xl text-gray-600 mb-3 group-hover:text-purple-500"></i><div class="text-gray-400 text-sm font-bold">点击上传 (支持多文件)</div><div class="text-xs text-gray-600 mt-1">支持 PDF, Word, Excel, JPG</div></div>
                                    <div v-if="isUploading" class="absolute inset-0 bg-black/80 z-40 flex items-center justify-center"><i class="fa-solid fa-circle-notch fa-spin text-purple-500 text-2xl"></i></div>
                                </div>
                                <div v-if="activeStepData.attachments?.length > 0" class="space-y-2">
                                    <div v-for="(f, idx) in activeStepData.attachments" :key="idx" class="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/5 group hover:border-purple-500/30 transition-colors">
                                        <a :href="getDownloadLink(f)" target="_blank" class="text-sm text-blue-400 hover:text-white flex items-center gap-2"><i class="fa-solid fa-file"></i> {{ f.name }}</a>
                                        <button v-if="!shouldReadOnly" @click="activeStepData.attachments.splice(idx, 1)" class="text-gray-500 hover:text-red-400 transition-colors"><i class="fa-solid fa-trash"></i></button>
                                    </div>
                                </div>
                            </div>
                             <div class="mt-6 pt-6 border-t border-white/5 flex justify-between items-center relative z-20">
                                 <div class="text-xs text-gray-500">
                                     <span v-if="activeStepData.status === 'rejected'" class="text-red-400"><i class="fa-solid fa-circle-exclamation"></i> 驳回待修</span>
                                     <span v-else-if="activeStepData.status === 'approved'" class="text-emerald-400"><i class="fa-solid fa-check-circle"></i> 已通过</span>
                                     <span v-else-if="activeStepData.submittedAt" class="text-blue-400"><i class="fa-solid fa-clock"></i> 已保存</span>
                                 </div>
                                 <div class="flex gap-3">
                                     <template v-if="isReviewerMode">
                                         <button @click="showRejectModal(activeStepIndex, 'step')" class="text-red-400 hover:bg-red-900/20 px-3 py-1.5 rounded text-xs font-bold border border-transparent hover:border-red-500/30 transition-all">驳回此步</button>
                                         <button @click="auditStep(activeStepIndex, 'approve_step')" class="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-500/30 px-3 py-1.5 rounded text-xs font-bold transition-all">通过此步</button>
                                     </template>
                                     <template v-else-if="!shouldReadOnly">
                                         <button v-if="activeStepIndex > 0" @click="activeStepIndex--" class="text-gray-500 hover:text-white px-3 py-1.5 text-xs font-bold transition-colors">上一步</button>
                                         <button @click="saveCurrentStep" class="bg-purple-600 hover:bg-purple-500 text-white px-6 py-1.5 rounded text-xs font-bold shadow-lg transition-all">{{ activeStepIndex === taskSteps.length - 1 ? '保存并完成' : '保存，下一步' }}</button>
                                     </template>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="sysModal.show" class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div class="bg-[#1a1c26] w-full max-w-sm rounded-xl border border-white/10 shadow-2xl p-6 transform scale-100 transition-all">
                <div class="mb-4">
                    <div v-if="sysModal.type==='confirm'" class="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 mx-auto"><i class="fa-solid fa-question text-xl"></i></div>
                    <div v-else class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mb-4 mx-auto"><i class="fa-solid fa-circle-info text-xl"></i></div>
                    <h3 class="text-white font-bold text-center text-lg mb-2">{{ sysModal.type === 'confirm' ? '确认操作' : '提示' }}</h3>
                    <p class="text-gray-400 text-center text-sm leading-relaxed">{{ sysModal.msg }}</p>
                </div>
                <div class="flex justify-center gap-3">
                    <button v-if="sysModal.type==='confirm'" @click="sysModal.onCancel" class="px-4 py-2 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-all">取消</button>
                    <button @click="sysModal.onOk" class="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-lg transition-all">确定</button>
                </div>
            </div>
        </div>

        <div v-if="showRejectDialog" class="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div class="bg-[#1a1c26] w-full max-w-md rounded-xl border border-white/10 p-6 shadow-2xl animate-bounce-in">
                <h3 class="text-lg font-bold text-white mb-4">填写驳回原因</h3>
                <textarea v-model="rejectReason" rows="3" class="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-red-500" placeholder="请输入具体原因，以便执行人修改..."></textarea>
                <div class="flex justify-end gap-3 mt-4"><button @click="showRejectDialog=false" class="text-gray-400 text-sm hover:text-white">取消</button><button @click="confirmReject" class="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-red-900/20">确认驳回</button></div>
            </div>
        </div>

    </div>
</div>
`;

const SOPHandlerComponent = {
    template: SOPHandlerTemplate,
    setup() {
        const { ref, computed, onMounted, reactive, watch } = Vue;
        const API_SOP = '/api/sop'; const API_UPLOAD = '/api/upload'; const API_ADMIN = '/api/admin'; const API_TASKS = '/api/tasks'; const API_USERS_WALL = '/api/users/wall';

        const viewMode = ref('library'); 
        const templates = ref([]); const myTasks = ref([]); const reviewTasks = ref([]); const allTasks = ref([]); const users = ref([]);
        const myCommandTasks = ref([]); 
        
        const showCategoryModal = ref(false);
        const categories = ref([]);
        const newCategoryName = ref('');
        const editingCatId = ref(null);
        const editingCatName = ref('');
        const isAdmin = ref(false); 

        const currentTask = ref(null); const activeStepIndex = ref(0);
        const showStartModal = ref(false); const selectedTemplate = ref(null); const selectedReviewerId = ref(null); const selectedRelatedTaskId = ref(null);
        const previewTemplate = ref(null); // 🔥 修复：确保这个变量被 UI 正确引用
        const activeStepData = reactive({ content: '', attachments: [], status: 'pending' });
        const isUploading = ref(false);
        const showRejectDialog = ref(false); const rejectReason = ref(''); const rejectTarget = ref({ index: null, scope: 'step' }); 

        const sysModal = reactive({ show: false, type: 'alert', msg: '', onOk: null, onCancel: null });

        const getH = () => ({ 'Authorization': `Bearer ${localStorage.getItem('authToken')}` });
        const getDownloadLink = (file) => (!file || !file.url) ? '#' : `${API_UPLOAD}/download?url=${encodeURIComponent(file.url)}&name=${encodeURIComponent(file.name)}`;
        
        const checkIsAdmin = () => {
            try {
                const token = localStorage.getItem('authToken');
                if(!token) return false;
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.isAdmin === true || (payload.roles && payload.roles.some(r => r.toLowerCase().includes('admin')));
            } catch(e) { return false; }
        };

        const isReviewerMode = computed(() => currentTask.value && viewMode.value === 'review');
        const isMyTask = computed(() => {
            if(!currentTask.value) return false;
            return viewMode.value === 'my_tasks' || viewMode.value === 'library';
        });

        const shouldReadOnly = computed(() => {
            if (!currentTask.value) return true;
            if (currentTask.value.status === 'completed') return true;
            if (isReviewerMode.value) return false;
            if (!isMyTask.value) return true;
            return false;
        });

        const taskSteps = computed(() => currentTask.value?.snapshot?.steps || currentTask.value?.templateId?.steps || []);
        const currentStep = computed(() => taskSteps.value[activeStepIndex.value] || {});

        const getCompletedCount = (task) => {
            if (!task || !task.stepData) return 0;
            return task.stepData.filter(s => s.status === 'approved' || (s.submittedAt && s.status !== 'rejected')).length;
        };

        const getLatestRejectReason = (task) => {
            if (!task.auditLogs || task.auditLogs.length === 0) return '无详细原因';
            const lastReject = [...task.auditLogs].reverse().find(log => log.action.includes('reject'));
            return lastReject ? lastReject.comment : '查看详情';
        };

        const customAlert = (msg) => { sysModal.type = 'alert'; sysModal.msg = msg; sysModal.show = true; sysModal.onOk = () => { sysModal.show = false; }; };
        const confirmAction = (msg, callback) => { sysModal.type = 'confirm'; sysModal.msg = msg; sysModal.show = true; sysModal.onOk = () => { sysModal.show = false; if(callback) callback(); }; sysModal.onCancel = () => { sysModal.show = false; }; };

        const refresh = async () => {
            isAdmin.value = checkIsAdmin();
            const h = getH();
            try {
                const [tRes, mRes, rRes, uRes, tcRes, catRes] = await Promise.all([
                    fetch(`${API_SOP}/templates`, {headers:h}),
                    fetch(`${API_SOP}/tasks/my`, {headers:h}),
                    fetch(`${API_SOP}/tasks/pending-review`, {headers:h}),
                    fetch(API_USERS_WALL, {headers:h}), 
                    fetch(`${API_TASKS}`, {headers:h}),
                    fetch(`${API_SOP}/categories`, {headers:h}) 
                ]);
                if(tRes.ok) templates.value = await tRes.json();
                if(mRes.ok) myTasks.value = await mRes.json();
                if(rRes.ok) reviewTasks.value = await rRes.json();
                if(uRes.ok) users.value = await uRes.json();
                if(tcRes.ok) myCommandTasks.value = await tcRes.json();
                if(catRes.ok) categories.value = await catRes.json(); 
                fetch(`${API_SOP}/tasks/all`, {headers:h}).then(r=>{ if(r.ok) r.json().then(d=>allTasks.value=d); });
            } catch(e) {}
        };

        const addCategory = async () => {
            if(!newCategoryName.value.trim()) return customAlert('请输入名称');
            try {
                const res = await fetch(`${API_SOP}/categories`, { method: 'POST', headers: {'Content-Type':'application/json', ...getH()}, body: JSON.stringify({name: newCategoryName.value}) });
                if(!res.ok) throw new Error((await res.json()).message);
                newCategoryName.value = ''; refresh();
            } catch(e) { customAlert(e.message); }
        };
        const deleteCategory = async (id) => {
            confirmAction('确定删除此分类吗？', async () => {
                await fetch(`${API_SOP}/categories/${id}`, { method: 'DELETE', headers: getH() });
                refresh();
            });
        };
        const startEdit = (cat) => { editingCatId.value = cat._id; editingCatName.value = cat.name; };
        const cancelEdit = () => { editingCatId.value = null; };
        const updateCategory = async (id) => {
            if(!editingCatName.value.trim()) return;
            await fetch(`${API_SOP}/categories/${id}`, { method: 'PUT', headers: {'Content-Type':'application/json', ...getH()}, body: JSON.stringify({name: editingCatName.value}) });
            cancelEdit(); refresh();
        };

        const switchView = (mode) => {
            viewMode.value = mode;
            currentTask.value = null; 
            refresh();
        };

        const openStartModal = (tpl) => { selectedTemplate.value = tpl; selectedReviewerId.value = null; selectedRelatedTaskId.value = null; showStartModal.value = true; };
        const confirmStartTask = async () => {
            if(!selectedTemplate.value) return customAlert("未选择模板");
            try {
                const res = await fetch(`${API_SOP}/tasks`, {
                    method: 'POST', headers: {'Content-Type':'application/json', ...getH()},
                    body: JSON.stringify({ templateId: selectedTemplate.value._id, reviewerId: selectedReviewerId.value, relatedTaskId: selectedRelatedTaskId.value })
                });
                if(!res.ok) throw new Error((await res.json()).message);
                showStartModal.value = false;
                customAlert('任务创建成功！已跳转到“我的任务”');
                switchView('my_tasks'); // 🔥 创建后自动跳转
            } catch(e) { customAlert(e.message); }
        };

        const openTaskDetail = async (taskId) => {
            try {
                const res = await fetch(`${API_SOP}/tasks/${taskId}`, {headers:getH()});
                if(res.status === 403) {
                    customAlert('🚫 您无权查看此任务详情（仅限执行人、审核人或管理员）');
                    return;
                }
                if(res.ok) {
                    currentTask.value = await res.json();
                    activeStepIndex.value = 0;
                    loadStepDataToReactive();
                }
            } catch(e) { console.error(e); }
        };

        const closeTaskDetail = () => { currentTask.value = null; refresh(); };
        const loadStepDataToReactive = () => {
            const s = currentTask.value.stepData.find(x => x.stepIndex === activeStepIndex.value);
            activeStepData.content = s?.content || ''; activeStepData.attachments = s?.attachments || []; activeStepData.status = s?.status || 'pending';
        };
        watch(activeStepIndex, loadStepDataToReactive);

        const openPreview = (tpl) => { previewTemplate.value = tpl; };
        const handleTaskFileUpload = async (e) => {
            const files = e.target.files; if(!files.length) return;
            isUploading.value = true;
            for(let i=0; i<files.length; i++) {
                const fd = new FormData(); fd.append('file', files[i]);
                try {
                    const res = await fetch(API_UPLOAD, { method: 'POST', body: fd, headers: getH() });
                    if(res.ok) { const d = await res.json(); activeStepData.attachments.push({ name: d.originalName, url: d.url }); }
                } catch(e){}
            }
            isUploading.value = false;
        };

        const saveCurrentStep = async () => {
            if(currentStep.value.isRequired) {
                if(currentStep.value.type === 'input' && !activeStepData.content) return customAlert('请填写内容');
                if(currentStep.value.type === 'file' && (!activeStepData.attachments || activeStepData.attachments.length === 0)) return customAlert('请至少上传一个文件');
            }
            await fetch(`${API_SOP}/tasks/${currentTask.value._id}/step`, {
                method: 'PUT', headers: {'Content-Type':'application/json', ...getH()},
                body: JSON.stringify({ stepIndex: activeStepIndex.value, content: activeStepData.content, attachments: activeStepData.attachments })
            });
            const res = await fetch(`${API_SOP}/tasks/${currentTask.value._id}`, {headers:getH()});
            currentTask.value = await res.json();
            if(activeStepIndex.value < taskSteps.value.length - 1) { activeStepIndex.value++; } else { customAlert('步骤已保存，请点击右上角提交审核'); }
        };

        const submitForReview = async () => { await fetch(`${API_SOP}/tasks/${currentTask.value._id}/submit`, { method:'PUT', headers:getH() }); customAlert('提交成功！'); closeTaskDetail(); };
        const auditStep = async (idx, act) => { await auditRequest(act, idx); openTaskDetail(currentTask.value._id); };
        const auditTask = async (act) => { await auditRequest(act); customAlert('操作成功'); closeTaskDetail(); };
        
        const auditRequest = async (action, stepIndex=null, comment='') => {
            const res = await fetch(`${API_SOP}/tasks/${currentTask.value._id}/audit`, { method:'POST', headers:{'Content-Type':'application/json', ...getH()}, body:JSON.stringify({action, stepIndex, comment}) });
            if(!res.ok) {
                const err = await res.json();
                customAlert(err.message || '操作失败');
                throw new Error(err.message);
            }
        };

        const deleteTask = async (id) => { confirmAction('确定要删除这个任务吗？此操作不可恢复。', async () => { await fetch(`${API_SOP}/tasks/${id}`, { method:'DELETE', headers:getH() }); refresh(); }); };
        const showRejectModal = (stepIdx, scope) => { rejectTarget.value = { index: stepIdx, scope }; rejectReason.value = ''; showRejectDialog.value = true; };
        const confirmReject = async () => { const action = rejectTarget.value.scope === 'step' ? 'reject_step' : 'reject_all'; try { await auditRequest(action, rejectTarget.value.index, rejectReason.value); showRejectDialog.value = false; closeTaskDetail(); } catch(e){} };

        const getStatusColor = (s) => ({in_progress:'bg-purple-500',submitted:'bg-blue-500',reviewing:'bg-blue-500',rejected:'bg-red-500',completed:'bg-emerald-500'}[s]);
        const getStatusBadge = (s) => ({in_progress:'bg-purple-900/20 text-purple-400 border-purple-500/30',submitted:'bg-blue-900/20 text-blue-400 border-blue-500/30',reviewing:'bg-blue-900/20 text-blue-400 border-blue-500/30',rejected:'bg-red-900/20 text-red-400 border-red-500/30',completed:'bg-emerald-900/20 text-emerald-400 border-emerald-500/30'}[s]);
        const getStatusLabel = (s) => ({in_progress:'进行中',submitted:'待审核',reviewing:'审核中',rejected:'已驳回',completed:'已归档'}[s]||s);
        const getStepStatus = (idx) => currentTask.value?.stepData.find(x => x.stepIndex === idx)?.status || 'pending';
        const getStepData = (idx) => currentTask.value.stepData.find(x => x.stepIndex === idx);
        
        const getStepStatusClass = (idx) => { return 'bg-transparent border-transparent'; };

        onMounted(refresh); 

        return {
            viewMode, templates, myTasks, reviewTasks, allTasks, users, myCommandTasks, currentTask, activeStepIndex, activeStepData,
            showStartModal, selectedTemplate, selectedReviewerId, selectedRelatedTaskId, previewTemplate, isUploading,
            sysModal, customAlert, confirmAction, 
            refresh, openStartModal, confirmStartTask, openTaskDetail, closeTaskDetail, handleTaskFileUpload, saveCurrentStep, submitForReview,
            isReviewerMode, isMyTask, taskSteps, currentStep, shouldReadOnly, switchView,
            showRejectDialog, rejectReason, showRejectModal, confirmReject, auditStep, auditTask, deleteTask,
            getStatusColor, getStatusBadge, getStatusLabel, getStepStatus, getStepStatusClass, getStepData, openPreview, getDownloadLink,
            getCompletedCount, getLatestRejectReason,
            showCategoryModal, categories, newCategoryName, editingCatId, editingCatName, isAdmin,
            addCategory, deleteCategory, startEdit, cancelEdit, updateCategory
        };
    }
};