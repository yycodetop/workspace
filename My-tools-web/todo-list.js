/**
 * Task Command Module - Fixed Z-Index
 * 修复：任务弹窗层级提升至 z-[200]，解决被待办池抽屉(z-[160])遮挡导致的模糊和不可点击问题
 */

const TodoListTemplate = `
<div class="h-full flex flex-col bg-[#0b0c15] text-gray-100 relative overflow-hidden font-sans selection:bg-cyan-500/30">
    <div class="absolute inset-0 pointer-events-none" style="background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px); background-size: 40px 40px; opacity: 0.5;"></div>

    <div class="relative z-20 px-6 py-4 border-b border-white/10 bg-[#0b0c15]/90 backdrop-blur-xl flex justify-between items-center shadow-2xl shrink-0">
        <div class="flex items-center gap-6">
            <div class="w-10 h-10 rounded-lg bg-cyan-600/20 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"><i class="fa-solid fa-satellite-dish animate-pulse-slow"></i></div>
            <div class="flex bg-black/40 rounded-lg p-1 border border-white/10">
                <button @click="switchViewMode('tasks')" :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2', viewMode==='tasks' && !activeProjectId ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-400 hover:text-white']"><i class="fa-solid fa-list-check"></i> 执行视图</button>
                <button @click="switchViewMode('projects')" :class="['px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2', viewMode==='projects' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white']"><i class="fa-solid fa-folder-tree"></i> 项目视图</button>
            </div>
            <div v-if="activeProjectId" class="flex items-center gap-2 text-sm animate-fade-in-right">
                <span class="text-gray-500"><i class="fa-solid fa-chevron-right text-xs"></i></span>
                <span class="bg-purple-900/30 text-purple-300 border border-purple-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2"><i class="fa-regular fa-folder-open"></i> {{ getProjectName(activeProjectId) }}<button @click="clearProjectFilter" class="hover:text-white"><i class="fa-solid fa-xmark"></i></button></span>
                <button v-if="canViewProjStats" @click="openProjectStats" class="ml-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1"><i class="fa-solid fa-chart-simple"></i> 绩效报表</button>
            </div>
        </div>

        <div class="flex items-center gap-3">
            
            <template v-if="viewMode === 'tasks' || activeProjectId">
                <div v-if="canViewAll" class="group flex items-center bg-[#13151f] rounded-lg border border-white/10 px-3 h-9 transition-colors hover:border-cyan-500/50"><i class="fa-solid fa-users text-gray-500 text-xs mr-2 group-hover:text-cyan-400"></i><select v-model="filterOwnerId" @change="refreshData" class="bg-transparent text-xs text-white border-none outline-none py-1 w-24 cursor-pointer"><option value="all">全员视角</option><option v-for="m in members" :key="m._id" :value="m._id">{{ m.name }}</option></select></div>
                <div class="group flex items-center bg-[#13151f] rounded-lg border border-white/10 px-3 h-9 transition-colors hover:border-cyan-500/50"><i class="fa-solid fa-filter text-gray-500 text-xs mr-2 group-hover:text-cyan-400"></i><select v-model="filterStatus" class="bg-transparent text-xs text-white border-none outline-none py-1 w-20 cursor-pointer"><option value="all">所有状态</option><option value="todo">待办</option><option value="doing">进行中</option><option value="done">已完成</option><option value="blocked">阻塞</option></select></div>
                <div class="w-px h-6 bg-white/10 mx-1"></div>
            </template>

            <button @click="showBacklogDrawer = true" class="relative bg-[#1a1c26] hover:bg-[#252836] text-white h-9 px-4 rounded-lg flex items-center gap-2 border border-white/10 hover:border-cyan-500/50 transition-all group">
                <i class="fa-solid fa-layer-group text-gray-400 group-hover:text-cyan-400"></i> 
                <span class="text-xs font-bold">待办池</span>
                <span v-if="backlogTasks.length > 0" class="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full border-2 border-[#0b0c15] shadow-lg animate-bounce-in">
                    {{ backlogTasks.length }}
                </span>
            </button>

            <button v-if="canViewTaskStats" @click="openGlobalStats" class="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/20 transition-all" title="总看板"><i class="fa-solid fa-chart-pie"></i></button>
            <button @click="openActivityDrawer" class="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-orange-400 hover:bg-orange-900/20 transition-all" title="团队动态"><i class="fa-regular fa-bell"></i></button>
            <button @click="refreshData" class="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:bg-cyan-900/20" title="刷新"><i :class="['fa-solid fa-rotate', isLoading ? 'fa-spin' : '']"></i></button>
            
            <button v-if="viewMode === 'projects' && !activeProjectId && canCreateProject" @click="openProjectModal()" class="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg text-xs font-bold border border-purple-400/50"><i class="fa-solid fa-folder-plus"></i> 立项</button>
            <button v-else-if="canCreateTask" @click="openTaskModal()" class="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg text-xs font-bold border border-cyan-400/50"><i class="fa-solid fa-plus"></i> 发布指令</button>
        </div>
    </div>

    <div class="flex-1 overflow-hidden relative z-10 flex flex-col">
        
        <div v-if="viewMode === 'projects' && !activeProjectId" class="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div v-if="projects.length === 0" class="flex flex-col items-center justify-center h-64 text-gray-600 gap-4"><i class="fa-regular fa-folder-open text-4xl opacity-50"></i><p class="text-sm">暂无长期项目</p></div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div v-for="proj in projects" :key="proj._id" @click="enterProject(proj)" class="group bg-[#13151f] border border-white/10 rounded-xl p-5 hover:border-purple-500/50 transition-all cursor-pointer relative overflow-hidden flex flex-col shadow-lg hover:-translate-y-1 h-full">
                    <div class="absolute top-0 left-0 w-1 h-full bg-purple-600"></div>
                    <div class="flex justify-between items-start mb-2"><h3 class="text-lg font-bold text-white group-hover:text-purple-400 transition-colors truncate pr-2">{{ proj.title }}</h3><button v-if="canEditProject" @click.stop="openProjectModal(proj)" class="text-gray-600 hover:text-white shrink-0"><i class="fa-solid fa-pen-to-square"></i></button></div>
                    <div class="mb-4 space-y-2"><div class="flex items-center gap-2"><span class="text-[10px] text-gray-500 font-bold w-10 shrink-0">负责人</span><div class="flex items-center gap-1 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30"><img :src="getMemberAvatarById(proj.ownerId)" class="w-4 h-4 rounded-full"><span class="text-[10px] text-purple-300 font-bold">{{ proj.ownerName }}</span></div></div><div class="flex items-start gap-2" v-if="proj.members && proj.members.length > 0"><span class="text-[10px] text-gray-500 font-bold w-10 shrink-0 mt-1">成员</span><div class="flex flex-wrap gap-1.5"><div v-for="mid in proj.members" :key="mid" class="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5"><img :src="getMemberAvatarById(mid)" class="w-3.5 h-3.5 rounded-full opacity-70"><span class="text-[10px] text-gray-400">{{ getMemberNameById(mid) }}</span></div></div></div></div>
                    <p class="text-xs text-gray-400 mb-4 line-clamp-2 h-8">{{ proj.desc || '暂无描述信息...' }}</p>
                    <div class="mt-auto"><div class="flex justify-between text-[10px] text-gray-400 mb-1"><span>完成度</span><span class="font-mono text-purple-400">{{ Math.round(proj.calculatedProgress) }}%</span></div><div class="h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5"><div class="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-1000" :style="{ width: proj.calculatedProgress + '%' }"></div></div></div>
                    <div class="mt-4 flex-1 bg-black/30 rounded-lg p-2 border border-white/5 overflow-hidden flex flex-col min-h-[100px]"><div class="flex justify-between items-center mb-2 px-1"><span class="text-[10px] font-bold text-gray-500 uppercase">任务速览</span><span class="text-[10px] text-gray-600">{{ proj.doneTasks }}/{{ proj.totalTasks }}</span></div><div v-if="proj.tasks.length === 0" class="text-[10px] text-gray-600 text-center py-4">暂无任务</div><div v-else class="overflow-y-auto custom-scrollbar space-y-1 pr-1 max-h-[120px]"><div v-for="t in proj.tasks" :key="t._id" class="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 transition-colors group/item"><div class="w-3 shrink-0 flex justify-center"><i v-if="t.status === 'done'" class="fa-solid fa-check-circle text-emerald-500 text-[10px]"></i><i v-else-if="t.status === 'doing'" class="fa-solid fa-play text-blue-400 text-[8px]"></i><i v-else-if="t.status === 'blocked'" class="fa-solid fa-circle-exclamation text-red-400 text-[10px]"></i><i v-else class="fa-regular fa-circle text-gray-600 text-[8px]"></i></div><div :class="['flex-1 text-[10px] truncate', t.status === 'done' ? 'text-gray-600 line-through' : 'text-gray-300']">{{ t.title }}</div><img :src="getMemberAvatarById(t.ownerId)" class="w-3.5 h-3.5 rounded-full opacity-60" :title="getMemberNameById(t.ownerId)"><div v-if="t.status !== 'done'" class="w-6 h-1 bg-gray-700 rounded-full overflow-hidden shrink-0"><div class="h-full bg-blue-500" :style="{width: t.progress + '%'}"></div></div></div></div></div>
                </div>
            </div>
        </div>

        <div v-else class="flex-1 flex flex-col relative bg-[#0b0c15] overflow-hidden">
            <div class="h-10 border-b border-white/10 flex bg-[#0f111a] shrink-0 overflow-hidden relative select-none">
                <div class="flex" :style="{ transform: 'translateX(-' + scrollX + 'px)' }">
                    <div v-for="(day, index) in timelineDays" :key="index" class="w-[100px] shrink-0 border-r border-white/5 flex flex-col items-center justify-center text-xs text-gray-500 font-mono">
                        <span :class="{'text-cyan-400 font-bold': isToday(day.date)}">{{ day.label }}</span>
                        <span class="text-[9px] opacity-40">{{ day.week }}</span>
                    </div>
                </div>
            </div>
            
            <div class="flex-1 overflow-auto custom-scrollbar relative" @scroll="handleScroll">
                <div class="absolute inset-0 flex pointer-events-none h-full" :style="{ width: (timelineDays.length * 100) + 'px' }">
                    <div v-for="(day, index) in timelineDays" :key="index" :class="['w-[100px] shrink-0 border-r border-white/5 h-full', isToday(day.date) ? 'bg-cyan-900/5' : '']"></div>
                </div>
                
                <div class="relative py-4 space-y-4 min-h-full" :style="{ width: (timelineDays.length * 100) + 'px' }">
                    <div v-if="scheduledTasks.length === 0" class="absolute left-10 top-10 text-gray-600 text-sm flex items-center gap-2"><i class="fa-solid fa-timeline"></i> 暂无进行中的任务，请从右上角待办池拖入或新建</div>
                    <div v-for="task in scheduledTasks" :key="task._id" class="relative h-10 w-full hover:bg-white/[0.02] transition-colors group">
                        <div @click="editTask(task)" class="absolute top-0 h-9 rounded-lg shadow-lg border cursor-pointer flex items-center px-1 overflow-visible hover:brightness-110 hover:scale-[1.01] transition-all z-10" :class="getStatusBorderClass(task.status)" :style="{ ...getTaskStyle(task), backgroundColor: getMemberColor(task.ownerId) + '40' }">
                            <div class="absolute left-0 top-0 bottom-0 pointer-events-none transition-all duration-500 rounded-l-lg" :style="{ width: task.progress + '%', backgroundColor: getMemberColor(task.ownerId) }"></div>
                            <div class="absolute top-1/2 -translate-y-1/2 transition-all duration-500 z-20 flex flex-col items-center" :style="{ left: 'calc(' + task.progress + '% - 14px)' }">
                                <div class="w-7 h-7 rounded-full border-2 border-white shadow bg-gray-800 relative group-hover:scale-110 transition-transform"><img :src="getMemberAvatarById(task.ownerId)" class="w-full h-full object-cover"></div>
                                <div class="opacity-0 group-hover:opacity-100 absolute -top-6 bg-black/80 text-white text-[9px] px-1.5 rounded transition-opacity whitespace-nowrap border border-white/20">{{ task.progress }}%</div>
                            </div>
                            <div class="relative z-10 flex items-center justify-between w-full gap-2 text-xs pl-2 pr-4">
                                <div class="flex items-center gap-2 overflow-hidden text-white drop-shadow-md mix-blend-plus-lighter">
                                    <span class="font-bold truncate shadow-black text-shadow">{{ task.title }}</span>
                                    <span v-if="task.projectId" class="text-[9px] bg-purple-900/50 text-purple-200 px-1 rounded border border-purple-500/30 truncate max-w-[80px]">{{ getProjectName(task.projectId) }}</span>
                                </div>
                                <span v-if="task.status === 'done'" class="text-[9px] font-bold text-emerald-100 bg-emerald-500/80 px-1 rounded shadow">KPI:{{ task.kpiValue }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="fixed inset-y-0 right-0 z-[160] w-80 bg-[#0f111a] border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col" :class="showBacklogDrawer ? 'translate-x-0' : 'translate-x-full'">
        <div class="px-5 py-4 border-b border-white/10 flex justify-between items-center bg-black/20">
            <h3 class="text-sm font-bold text-white flex items-center gap-2"><i class="fa-solid fa-layer-group text-cyan-400"></i> 待办池</h3>
            <span class="bg-white/10 text-gray-300 px-2 py-0.5 rounded text-[10px]">{{ backlogTasks.length }}</span>
            <button @click="showBacklogDrawer = false" class="text-gray-500 hover:text-white ml-auto"><i class="fa-solid fa-xmark text-lg"></i></button>
        </div>
        <div class="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            <div v-if="backlogTasks.length === 0" class="flex flex-col items-center justify-center h-40 text-gray-600 gap-2">
                <i class="fa-regular fa-folder-open text-2xl opacity-50"></i>
                <span class="text-xs">暂无待办任务</span>
            </div>
            <div v-for="task in backlogTasks" :key="task._id" @click="editTask(task)" class="group bg-[#1a1c26] border border-white/5 hover:border-cyan-500/50 p-3 rounded-lg cursor-pointer transition-all relative overflow-hidden shadow-sm hover:shadow-md hover:bg-[#20232e]">
                <div class="absolute left-0 top-0 bottom-0 w-1 transition-colors" :style="{ backgroundColor: getMemberColor(task.ownerId) }"></div>
                <div class="pl-3">
                    <div class="text-sm text-gray-200 mb-2 font-medium group-hover:text-cyan-300 truncate">{{ task.title }}</div>
                    <div class="flex justify-between items-center text-[10px]">
                        <span class="text-gray-500 bg-black/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <img :src="getMemberAvatarById(task.ownerId)" class="w-3.5 h-3.5 rounded-full"> {{ task.ownerName }}
                        </span>
                        <span v-if="task.projectId" class="text-purple-400 bg-purple-900/20 px-1 rounded truncate max-w-[60px]">{{ getProjectName(task.projectId) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-if="showBacklogDrawer" @click="showBacklogDrawer = false" class="fixed inset-0 bg-black/50 z-[150] backdrop-blur-sm"></div>

    <div class="fixed inset-y-0 right-0 z-[150] w-96 bg-[#0f111a] border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col" :class="showActivityDrawer ? 'translate-x-0' : 'translate-x-full'"><div class="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-black/20"><h3 class="text-sm font-bold text-white flex items-center gap-2"><i class="fa-regular fa-clock text-orange-400"></i> 团队动态</h3><button @click="showActivityDrawer = false" class="text-gray-500 hover:text-white"><i class="fa-solid fa-xmark text-lg"></i></button></div><div class="flex-1 overflow-y-auto p-6 custom-scrollbar"><div v-if="activities.length === 0" class="text-center text-gray-500 text-xs mt-10">暂无动态</div><div class="relative pl-4 border-l border-white/10 space-y-8"><div v-for="log in activities" :key="log._id" class="relative group"><div class="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#0f111a] border-2 border-gray-600 group-hover:border-orange-500 group-hover:bg-orange-900 transition-colors"></div><div class="flex items-center gap-2 mb-1"><img :src="log.actorAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed='+log.actorName" class="w-5 h-5 rounded-full bg-gray-700"><span class="text-xs font-bold text-gray-300">{{ log.actorName }}</span><span class="text-[10px] text-gray-600 ml-auto">{{ new Date(log.createdAt).toLocaleString().slice(5, 16) }}</span></div><div class="text-xs text-gray-400">{{ log.action }} <span class="text-cyan-400 font-mono bg-cyan-900/10 px-1 rounded">{{ log.targetName }}</span></div><div v-if="log.details" class="mt-1 text-[10px] text-gray-500 bg-white/5 p-2 rounded border border-white/5 break-all font-mono">{{ log.details }}</div></div></div></div></div><div v-if="showActivityDrawer" @click="showActivityDrawer = false" class="fixed inset-0 bg-black/50 z-[140] backdrop-blur-sm"></div>

    <div v-if="showTaskModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><div class="bg-[#1a1c26] border border-cyan-500/30 rounded-2xl w-full max-w-2xl relative z-10 flex flex-col animate-bounce-in overflow-hidden max-h-[90vh]"><div class="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-cyan-900/20 to-transparent flex justify-between items-center"><h3 class="font-bold text-white text-lg"><i class="fa-solid fa-microchip text-cyan-400"></i> {{ isEditing ? '任务追踪' : '新指令' }}</h3><button @click="closeModal" class="text-gray-500 hover:text-white transition-colors"><i class="fa-solid fa-xmark text-xl"></i></button></div><div class="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6"><div class="bg-purple-900/10 border border-purple-500/20 rounded-lg p-3"><label class="block text-xs font-bold text-purple-400 uppercase mb-1.5">归属项目</label><select v-model="taskForm.projectId" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-purple-500"><option :value="null">-- 无项目 --</option><option v-for="p in projects" :key="p._id" :value="p._id">{{ p.title }}</option></select></div><div class="flex gap-4 items-end"><div class="flex-1"><label class="block text-xs font-bold text-cyan-500 uppercase mb-1.5">任务名称</label><input v-model="taskForm.title" class="w-full rounded-lg border border-white/10 px-4 py-3 bg-black/30 text-white focus:outline-none focus:border-cyan-500 text-sm font-bold" placeholder="输入名称..."></div><div class="w-48"><label class="block text-xs font-bold text-gray-500 uppercase mb-1.5">状态</label><select v-model="taskForm.status" class="w-full rounded-lg border border-white/10 px-3 py-3 bg-black/30 text-white focus:outline-none focus:border-cyan-500 text-sm font-bold"><option value="todo">📅 待办</option><option value="doing">🚀 进行中</option><option value="done">✅ 已完成</option><option value="blocked">🚧 阻塞</option></select></div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4"><div :class="{'opacity-40 pointer-events-none grayscale': taskForm.status === 'todo'}"><label class="block text-xs font-bold text-gray-500 uppercase mb-1.5">开始时间</label><input v-model="taskForm.start" type="date" class="w-full rounded-lg border border-white/10 px-3 py-2.5 bg-black/30 text-gray-300 text-sm font-mono"></div><div :class="{'opacity-40 pointer-events-none grayscale': taskForm.status === 'todo'}"><label class="block text-xs font-bold text-gray-500 uppercase mb-1.5">结束时间</label><input v-model="taskForm.end" type="date" class="w-full rounded-lg border border-white/10 px-3 py-2.5 bg-black/30 text-gray-300 text-sm font-mono"></div><div v-if="canAssign"><label class="block text-xs font-bold text-yellow-500 uppercase mb-1.5">指派给</label><div class="relative"><select v-model="taskForm.ownerId" @change="updateOwnerName" class="w-full rounded-lg border border-yellow-500/30 px-3 py-2.5 bg-yellow-900/10 text-yellow-200 text-sm appearance-none cursor-pointer hover:bg-yellow-900/20"><option v-for="m in members" :key="m._id" :value="m._id">{{ m.name }}</option></select></div></div><div v-else><label class="block text-xs font-bold text-gray-500 uppercase mb-1.5">负责人</label><div class="w-full rounded-lg border border-white/5 px-3 py-2.5 bg-white/5 text-gray-400 text-sm"><i class="fa-solid fa-lock text-xs"></i> {{ taskForm.ownerName }}</div></div></div><div class="p-5 bg-gradient-to-br from-white/5 to-transparent rounded-xl border border-white/10"><div v-if="taskForm.status === 'done'" class="mb-4"><label class="block text-xs font-bold text-emerald-500 uppercase mb-1.5">KPI</label><input v-model.number="taskForm.kpiValue" type="number" min="0" max="100" class="w-full rounded-lg border border-emerald-500/50 px-3 py-2.5 bg-emerald-900/10 text-emerald-400 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"></div><div class="mb-4"><div class="flex justify-between text-xs mb-2"><span class="text-gray-400 font-bold">进度</span><span :class="['font-mono text-lg font-bold', taskForm.progress == 100 ? 'text-emerald-400' : 'text-cyan-400']">{{ taskForm.progress }}%</span></div><input type="range" v-model="taskForm.progress" min="0" max="100" class="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400 transition-all"></div><div class="border-t border-white/5 pt-4"><label class="block text-xs font-bold text-gray-500 uppercase mb-2">进度追踪</label><div class="flex gap-2 mb-4"><input v-model="currentLogNote" type="text" placeholder="备注..." class="flex-1 bg-black/30 border border-white/10 rounded px-3 py-2 text-xs text-white"><div class="text-[10px] text-gray-500 flex items-center px-2 bg-white/5 rounded">自动记录</div></div><div class="max-h-32 overflow-y-auto custom-scrollbar space-y-2 bg-black/20 p-2 rounded-lg" v-if="taskForm.progressLogs"><div v-for="(log, idx) in taskForm.progressLogs.slice().reverse()" :key="idx" class="text-xs flex gap-2 items-start border-l-2 border-cyan-500/30 pl-2 group"><div class="text-gray-500 font-mono shrink-0">{{ new Date(log.timestamp).toLocaleString().slice(5, 16) }}</div><div class="text-cyan-400 font-bold shrink-0">{{ log.operator }}:</div><div class="text-gray-300 break-all flex-1">{{ log.note || '更新了进度' }} <span class="text-gray-600">({{ log.progress }}%)</span></div><button v-if="canEdit" @click.stop="deleteLog(log._id)" class="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><i class="fa-solid fa-trash"></i></button></div></div></div></div><div><label class="block text-xs font-bold text-gray-500 uppercase mb-1.5">任务描述</label><textarea v-model="taskForm.desc" rows="3" class="w-full rounded-lg border border-white/10 px-4 py-3 bg-black/30 text-gray-300 resize-none text-sm focus:outline-none focus:border-cyan-500 placeholder-gray-700"></textarea></div></div>
            <div class="px-6 py-4 border-t border-white/10 flex justify-between gap-3 bg-black/40">
                <button v-if="isEditing && canDeleteTask" @click="deleteTask" class="text-red-500 hover:text-red-400 text-sm font-bold flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-red-900/10"><i class="fa-solid fa-trash-can"></i> 删除</button>
                <div v-else></div>
                <div class="flex gap-3"><button @click="closeModal" class="px-5 py-2 rounded-lg text-gray-400 hover:text-white text-sm">取消</button><button @click="saveTask" class="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-cyan-900/30 transition-all transform active:scale-95 flex items-center gap-2"><i v-if="isSaving" class="fa-solid fa-spinner fa-spin"></i>{{ isSaving ? '保存中...' : '保存 & 记录' }}</button></div>
            </div>
        </div>
    </div>

    <div v-if="showProjectModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><div class="bg-[#1a1c26] border border-purple-500/30 rounded-2xl w-full max-w-lg p-6 flex flex-col gap-4 animate-bounce-in"><h3 class="text-lg font-bold text-white">{{ projForm._id ? '编辑项目' : '新建项目' }}</h3><input v-model="projForm.title" class="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none" placeholder="项目名称..."><textarea v-model="projForm.desc" rows="3" class="bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-gray-300 text-sm focus:border-purple-500 outline-none" placeholder="描述..."></textarea><div><label class="block text-xs font-bold text-purple-400 uppercase mb-2">项目负责人 (Owner)</label><select v-model="projForm.ownerId" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm outline-none focus:border-purple-500 cursor-pointer"><option v-for="m in members" :key="m._id" :value="m._id">{{ m.name }}</option></select></div><div class="bg-black/20 p-3 rounded-lg border border-white/5"><label class="block text-xs font-bold text-gray-500 uppercase mb-2">项目成员</label><div class="max-h-32 overflow-y-auto custom-scrollbar space-y-1"><label v-for="m in members" :key="m._id" class="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded cursor-pointer group"><input type="checkbox" :value="m._id" v-model="projForm.members" class="w-4 h-4 rounded border-gray-600 bg-black/50 accent-purple-500"><img :src="getMemberAvatar(m)" class="w-5 h-5 rounded-full"><span class="text-sm text-gray-300 group-hover:text-white">{{ m.name }}</span></label></div></div><div class="flex justify-end gap-3 pt-2"><button v-if="projForm._id" @click="deleteProject" class="text-red-500 hover:text-red-400 text-sm mr-auto">删除</button><button @click="showProjectModal = false" class="text-gray-400 hover:text-white text-sm px-4">取消</button><button @click="saveProject" class="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-bold text-sm">提交</button></div></div></div>
    
    <div v-if="showProjStatsModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in-up"><div class="bg-[#0f111a] border border-emerald-500/30 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl relative"><div class="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5"><div><h2 class="text-2xl font-black text-white flex items-center gap-3"><i class="fa-solid fa-trophy text-emerald-400"></i> 项目绩效龙虎榜</h2><p class="text-xs text-emerald-500 mt-1 font-mono uppercase">{{ projStatsData.project?.title }}</p></div><button @click="showProjStatsModal = false" class="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-400"><i class="fa-solid fa-xmark"></i></button></div><div class="flex-1 overflow-y-auto p-8 custom-scrollbar"><table class="w-full text-left border-collapse"><thead class="text-xs text-gray-500 uppercase border-b border-white/10"><tr><th class="pb-3 pl-2">成员</th><th class="pb-3 text-center">角色</th><th class="pb-3 text-right">贡献 KPI</th><th class="pb-3 pl-8">完成任务清单</th></tr></thead><tbody class="divide-y divide-white/5"><tr v-for="user in projStatsData.stats" :key="user.id" class="group hover:bg-white/[0.02]"><td class="py-4 pl-2"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-full border-2 border-emerald-500/20 p-0.5"><img :src="user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed='+user.name" class="w-full h-full rounded-full object-cover"></div><span class="font-bold text-white text-lg">{{ user.name }}</span></div></td><td class="py-4 text-center"><span :class="['px-2 py-1 rounded text-xs font-bold border', user.role==='Owner'?'bg-purple-900/30 text-purple-400 border-purple-500/30':'bg-gray-800 text-gray-400 border-gray-700']">{{ user.role }}</span></td><td class="py-4 text-right"><div class="text-2xl font-black text-emerald-400 font-mono">{{ user.totalKPI }}</div></td><td class="py-4 pl-8"><div v-if="user.tasks.length === 0" class="text-gray-600 text-xs italic">暂无产出</div><div v-else class="flex flex-wrap gap-2"><div v-for="(t, idx) in user.tasks" :key="idx" class="bg-black/40 border border-white/10 px-2 py-1 rounded text-xs text-gray-300 flex items-center gap-1"><i class="fa-solid fa-check text-emerald-500/50"></i> {{ t.title }} <span class="text-emerald-500 font-mono text-[9px]">+{{ t.kpi }}</span></div></div></td></tr></tbody></table></div></div></div>
    
    <div v-if="showStatsModal" class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in-up"><div class="bg-[#0f111a] border border-white/10 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden"><div class="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none"></div><div class="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5"><div class="flex items-center gap-6"><div><h2 class="text-2xl font-black text-white flex items-center gap-3"><i class="fa-solid fa-chart-line text-emerald-400"></i> 效能仪表盘</h2><p class="text-xs text-gray-500 mt-1 font-mono">ANALYTICS & RANKING</p></div><div v-if="canViewAll" class="flex flex-col gap-1 border-l border-white/10 pl-6"><span class="text-[10px] text-gray-500 uppercase font-bold">Viewing:</span><div class="flex items-center gap-2 bg-black/40 rounded px-2 py-1 border border-white/10"><i class="fa-solid fa-user-tag text-emerald-500 text-xs"></i><select v-model="statsFilterOwnerId" @change="fetchStats" class="bg-transparent text-sm text-white border-none outline-none font-bold cursor-pointer"><option value="all">全员数据</option><option v-for="m in members" :key="m._id" :value="m._id">{{ m.name }}</option></select></div></div></div><button @click="closeStats" class="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"><i class="fa-solid fa-xmark text-xl"></i></button></div><div v-if="statsLoading" class="flex-1 flex items-center justify-center text-emerald-500 gap-3"><i class="fa-solid fa-circle-notch fa-spin text-2xl"></i> 数据加载中...</div><div v-else class="flex-1 overflow-hidden flex flex-col"><div v-if="statDetailUser" class="flex-1 overflow-y-auto p-8 custom-scrollbar animate-fade-in-up"><button @click="statDetailUser = null" class="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"><div class="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10"><i class="fa-solid fa-arrow-left"></i></div><span>返回总览</span></button><div class="flex items-center gap-6 mb-8"><img :src="statDetailUser.user.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed='+statDetailUser.user.name" class="w-20 h-20 rounded-full border-4 border-[#1a1c26] shadow-xl"><div><h2 class="text-3xl font-black text-white">{{ statDetailUser.user.name }}</h2><p class="text-emerald-400 font-mono text-sm mt-1">贡献任务清单</p></div></div><div class="bg-[#1a1c26] border border-white/5 rounded-xl overflow-hidden"><table class="w-full text-left"><thead class="bg-black/20 text-xs text-gray-500 uppercase font-bold"><tr><th class="p-4">任务名称</th><th class="p-4 text-center">归属项目</th><th class="p-4 text-right">KPI 贡献</th></tr></thead><tbody class="divide-y divide-white/5"><tr v-for="t in statDetailUser.tasks" :key="t._id" class="group hover:bg-white/[0.02]"><td class="p-4 font-bold text-gray-200">{{ t.title }}</td><td class="p-4 text-center text-xs text-gray-500">{{ getProjectName(t.projectId) }}</td><td class="p-4 text-right"><span class="bg-emerald-900/20 text-emerald-400 px-3 py-1 rounded font-mono font-bold border border-emerald-500/30">+{{ t.kpiValue }}</span></td></tr><tr v-if="statDetailUser.tasks.length === 0"><td colspan="3" class="p-8 text-center text-gray-500 italic">该成员暂无 KPI 产出</td></tr></tbody></table></div></div><div v-else class="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8"><div class="grid grid-cols-1 md:grid-cols-3 gap-6"><div class="bg-[#1a1c26] border border-white/5 p-6 rounded-2xl relative overflow-hidden"><div class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">KPI 总分</div><div class="text-4xl font-black text-white font-mono">{{ statsData.kpi?.totalKPI || 0 }}</div></div><div class="bg-[#1a1c26] border border-white/5 p-6 rounded-2xl relative overflow-hidden"><div class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">平均分</div><div class="text-4xl font-black text-white font-mono">{{ (statsData.kpi?.avgKPI || 0).toFixed(1) }}</div></div><div class="bg-[#1a1c26] border border-white/5 p-6 rounded-2xl relative overflow-hidden flex flex-col justify-between"><div class="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">状态分布</div><div class="w-full h-4 bg-gray-800 rounded-full overflow-hidden flex"><div class="bg-emerald-500 h-full" :style="{width: getStatPercent('done') + '%'}"></div><div class="bg-blue-500 h-full" :style="{width: getStatPercent('doing') + '%'}"></div><div class="bg-gray-600 h-full" :style="{width: getStatPercent('todo') + '%'}"></div></div></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="bg-[#1a1c26] border border-white/5 p-6 rounded-2xl"><h3 class="text-sm font-bold text-white mb-6 flex items-center gap-2"><i class="fa-solid fa-chart-column text-cyan-400"></i> 7日趋势</h3><div class="h-48 flex items-end gap-4 relative pl-8 pb-6 border-l border-b border-white/10"><div v-for="(day, index) in fillTrendData()" :key="index" class="flex-1 flex flex-col items-center gap-2 group h-full justify-end"><div class="w-full max-w-[40px] bg-gradient-to-t from-cyan-900/50 to-cyan-500/50 rounded-t-sm relative transition-all duration-500 hover:to-cyan-400" :style="{ height: Math.max(5, (day.dailyKPI / 200) * 100) + '%' }"><div class="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">{{ day.dailyKPI }}</div></div><div class="text-[10px] text-gray-500 font-mono">{{ day.dateLabel }}</div></div></div></div><div class="bg-[#1a1c26] border border-white/5 rounded-2xl flex flex-col overflow-hidden"><div class="p-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center"><h3 class="text-sm font-bold text-white flex items-center gap-2"><i class="fa-solid fa-medal text-yellow-500"></i> 贡献龙虎榜</h3><span class="text-[10px] text-gray-500">点击查看详情</span></div><div class="flex-1 overflow-y-auto custom-scrollbar p-2"><div v-if="!statsData.rankings || statsData.rankings.length === 0" class="text-center text-gray-600 py-10 text-xs">暂无数据</div><div v-else class="space-y-1"><div v-for="(rank, idx) in statsData.rankings" :key="rank.id" @click="viewMemberDetails(rank.id)" class="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"><div class="font-mono text-gray-600 w-4 text-center text-xs font-bold group-hover:text-white">{{ idx + 1 }}</div><img :src="rank.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed='+rank.name" class="w-8 h-8 rounded-full bg-gray-700"><div class="flex-1 min-w-0"><div class="text-sm font-bold text-gray-300 truncate group-hover:text-white">{{ rank.name }}</div><div class="text-[10px] text-gray-600">{{ rank.taskCount }} 个任务</div></div><div class="text-right"><div class="text-emerald-400 font-mono font-bold">{{ rank.totalKPI }}</div><div class="text-[9px] text-gray-600 uppercase">KPI</div></div><i class="fa-solid fa-chevron-right text-gray-700 text-xs group-hover:text-gray-400"></i></div></div></div></div></div></div></div></div>
    
    <div v-if="toast.show" class="fixed top-6 left-1/2 -translate-x-1/2 z-[300] bg-cyan-600 text-white px-6 py-3 rounded-full shadow border border-cyan-400/50 animate-bounce-in font-bold text-sm">{{ toast.message }}</div>
</div>
`;

const TodoListComponent = {
    template: TodoListTemplate,
    setup() {
        const { ref, computed, onMounted, getCurrentInstance } = Vue;
        const API_BASE = '/api';

        const tasks = ref([]);
        const members = ref([]);
        const projects = ref([]);
        const activities = ref([]);
        const isLoading = ref(false);
        const isSaving = ref(false);
        const scrollX = ref(0);
        
        const myId = localStorage.getItem('authId');
        const myName = localStorage.getItem('authUser');
        const filterOwnerId = ref('all');
        const filterStatus = ref('all');

        const viewMode = ref('tasks');
        const activeProjectId = ref(null);

        const showTaskModal = ref(false);
        const showProjectModal = ref(false);
        const showStatsModal = ref(false);
        const showProjStatsModal = ref(false);
        const showActivityDrawer = ref(false);
        const showBacklogDrawer = ref(false);
        const isEditing = ref(false);
        
        const defaultTaskForm = { _id: null, title: '', start: '', end: '', status: 'todo', ownerId: myId, ownerName: myName, desc: '', progress: 0, kpiValue: 0, projectId: null, progressLogs: [] };
        const taskForm = ref({ ...defaultTaskForm });
        const currentLogNote = ref('');
        const projForm = ref({ _id: null, title: '', desc: '', members: [], ownerId: myId });
        
        const toast = ref({ show: false, message: '' });
        
        const statsLoading = ref(false);
        const statsData = ref({ statusDistribution: [], kpi: {}, trend: [], rankings: [] });
        const statsFilterOwnerId = ref('all');
        const statDetailUser = ref(null);
        const projStatsData = ref({ project: {}, stats: [] });

        const instance = getCurrentInstance();
        const hasPerm = (a, b) => {
            const fn = instance.appContext.config.globalProperties.$hasPerm;
            return fn ? fn(a, b) : false;
        };
        
        const isAdmin = computed(() => localStorage.getItem('authUsername') === 'admin');
        const canViewAll = computed(() => hasPerm('tasks', 'view_all') || isAdmin.value);
        
        const canCreateProject = computed(() => hasPerm('projects', 'create') || isAdmin.value);
        const canEditProject = computed(() => hasPerm('projects', 'edit') || isAdmin.value);
        const canDeleteProject = computed(() => hasPerm('projects', 'delete') || isAdmin.value);
        const canViewProjStats = computed(() => hasPerm('projects', 'view_stats') || isAdmin.value);

        const canCreateTask = computed(() => hasPerm('tasks', 'create') || isAdmin.value);
        const canEdit = computed(() => hasPerm('tasks', 'edit') || isAdmin.value);
        const canAssign = computed(() => hasPerm('tasks', 'assign') || isAdmin.value);
        const canDeleteTask = computed(() => hasPerm('tasks', 'delete') || isAdmin.value);
        const canViewTaskStats = computed(() => hasPerm('tasks', 'view_stats') || isAdmin.value);
        
        const canCreate = canCreateTask; 
        const canViewStats = canViewTaskStats;

        const memberColors = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#0891b2', '#dc2626', '#4f46e5'];
        const getMemberColor = (uid) => { if (!uid) return '#6b7280'; let hash = 0; for (let i = 0; i < uid.length; i++) hash = uid.charCodeAt(i) + ((hash << 5) - hash); return memberColors[Math.abs(hash) % memberColors.length]; };
        const getMemberAvatarById = (uid) => getMemberAvatar(members.value.find(u => u._id === uid));
        const getMemberNameById = (uid) => members.value.find(u => u._id === uid)?.name || 'Unknown';
        const getMemberAvatar = (m) => (m && m.avatar) ? m.avatar : `https://api.dicebear.com/7.x/initials/svg?seed=${m ? m.name : 'User'}`;
        const getProjectName = (pid) => projects.value.find(p => p._id === pid)?.title || '未分类';

        const refreshData = async () => {
            isLoading.value = true;
            try {
                const h = { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` };
                const [tRes, mRes, pRes] = await Promise.all([
                    fetch(`${API_BASE}/tasks?ownerId=${filterOwnerId.value}`, { headers: h }),
                    fetch(`${API_BASE}/tasks/members`, { headers: h }),
                    fetch(`${API_BASE}/projects`, { headers: h })
                ]);
                if (tRes.ok) tasks.value = await tRes.json();
                if (mRes.ok) members.value = await mRes.json();
                if (pRes.ok) projects.value = await pRes.json();
            } catch (e) { showToast('数据同步失败'); } 
            finally { isLoading.value = false; }
        };

        const handleFilterChange = () => { refreshData(); };
        const switchViewMode = (mode) => { viewMode.value = mode; if (mode === 'tasks') activeProjectId.value = null; };
        const enterProject = (proj) => { activeProjectId.value = proj._id; viewMode.value = 'tasks'; };
        const clearProjectFilter = () => { activeProjectId.value = null; };

        const openActivityDrawer = async () => {
            showActivityDrawer.value = true;
            try { const res = await fetch(`${API_BASE}/activities`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } }); if(res.ok) activities.value = await res.json(); } catch(e) {}
        };

        const openGlobalStats = () => { 
            showStatsModal.value = true; 
            statDetailUser.value = null; 
            statsFilterOwnerId.value = canViewAll.value ? (filterOwnerId.value === 'all' ? 'all' : filterOwnerId.value) : myId; 
            fetchStats(); 
        };
        const openStats = openGlobalStats;
        
        const fetchStats = async () => { 
            statsLoading.value = true; 
            try { 
                const res = await fetch(`${API_BASE}/tasks/stats?ownerId=${statsFilterOwnerId.value}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } }); 
                if (res.ok) statsData.value = await res.json(); 
            } catch (e) { showToast('获取统计失败'); } 
            finally { statsLoading.value = false; } 
        };

        const viewMemberDetails = async (userId) => {
            statsLoading.value = true;
            try {
                const res = await fetch(`${API_BASE}/tasks/stats/details/${userId}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } });
                if (res.ok) statDetailUser.value = await res.json();
            } catch(e) { showToast('加载详情失败'); }
            finally { statsLoading.value = false; }
        };

        const closeStats = () => showStatsModal.value = false;
        
        const openProjectStats = async () => {
            showProjStatsModal.value = true;
            statsLoading.value = true;
            try { const res = await fetch(`${API_BASE}/projects/${activeProjectId.value}/stats`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } }); if(res.ok) projStatsData.value = await res.json(); } catch(e) { showToast('无法加载绩效数据'); } finally { statsLoading.value = false; }
        };

        const getStatCount = (s) => statsData.value.statusDistribution.find(i => i._id === s)?.count || 0;
        const getStatPercent = (s) => { const total = statsData.value.statusDistribution.reduce((acc, cur) => acc + cur.count, 0); return total === 0 ? 0 : (getStatCount(s) / total) * 100; };
        const fillTrendData = () => { const result = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const dateStr = d.toISOString().split('T')[0]; const found = statsData.value.trend.find(t => t._id === dateStr); result.push({ dateLabel: dateStr.slice(5), dailyKPI: found ? found.dailyKPI : 0 }); } return result; };

        const filteredTasks = computed(() => {
            let res = tasks.value || [];
            if (filterStatus.value !== 'all') res = res.filter(t => t.status === filterStatus.value);
            if (activeProjectId.value) res = res.filter(t => t.projectId === activeProjectId.value);
            return res;
        });

        const backlogTasks = computed(() => filteredTasks.value.filter(t => t.status === 'todo'));
        const scheduledTasks = computed(() => filteredTasks.value.filter(t => t.status !== 'todo').sort((a, b) => new Date(a.start) - new Date(b.start)));
        const filteredTaskCount = computed(() => filteredTasks.value.length);

        const updateOwnerName = () => { const m = members.value.find(m => m._id === taskForm.value.ownerId); if (m) taskForm.value.ownerName = m.name; };
        
        const openTaskModal = () => { const today = new Date().toISOString().split('T')[0]; taskForm.value = { ...defaultTaskForm, start: today, end: today, ownerId: myId, ownerName: myName, progressLogs:[], projectId: activeProjectId.value }; currentLogNote.value = ''; isEditing.value = false; showTaskModal.value = true; };
        const editTask = (t) => { taskForm.value = { ...t, start: t.start?.split('T')[0]||'', end: t.end?.split('T')[0]||'' }; currentLogNote.value = ''; isEditing.value = true; showTaskModal.value = true; };
        
        const saveTask = async () => {
            if (!taskForm.value.title) return showToast('请输入名称');
            isSaving.value = true;
            const payload = { ...taskForm.value };
            payload.isBacklog = (payload.status === 'todo');
            if (payload.status !== 'todo' && !payload.start) { const t=new Date().toISOString().split('T')[0]; payload.start=t; payload.end=t; }
            if (currentLogNote.value.trim() !== '' || (isEditing.value && payload.progressLogs)) { if (currentLogNote.value.trim() !== '') payload.newLog = { progress: payload.progress, note: currentLogNote.value }; }
            const url = isEditing.value && payload._id ? `${API_BASE}/tasks/${payload._id}` : `${API_BASE}/tasks`;
            try { const res = await fetch(url, { method: isEditing.value && payload._id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }, body: JSON.stringify(payload) }); 
            if (res.ok) { showToast('保存成功'); closeModal(); refreshData(); } else { const err = await res.json(); showToast(err.message || '操作失败'); } } catch(e) { showToast('网络错误'); } finally { isSaving.value = false; }
        };

        const deleteTask = async () => { if(!confirm('删除?')) return; await fetch(`${API_BASE}/tasks/${taskForm.value._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } }); showToast('已删除'); showTaskModal.value=false; refreshData(); };
        const deleteLog = async (logId) => { if(!confirm('删除日志?')) return; try { const res = await fetch(`${API_BASE}/tasks/${taskForm.value._id}/logs/${logId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } }); if(res.ok) { const updated=await res.json(); taskForm.value.progressLogs=updated.progressLogs; showToast('已删除'); } } catch(e) {} };

        const openProjectModal = (p=null) => { projForm.value = p ? { ...p, members: p.members || [] } : { _id:null, title:'', desc:'', members:[], ownerId: myId }; showProjectModal.value = true; };
        const saveProject = async () => { if(!projForm.value.title) return; const url = projForm.value._id ? `${API_BASE}/projects/${projForm.value._id}` : `${API_BASE}/projects`; try { await fetch(url, { method: projForm.value._id?'PUT':'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }, body: JSON.stringify(projForm.value) }); showToast('项目保存'); showProjectModal.value=false; refreshData(); } catch(e){} };
        const deleteProject = async () => { if(!confirm('删除项目?')) return; await fetch(`${API_BASE}/projects/${projForm.value._id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` } }); showToast('已删除'); showProjectModal.value=false; refreshData(); };

        const closeModal = () => { showTaskModal.value = false; showProjectModal.value = false; };
        const showToast = (m) => { toast.value = {show:true, message:m}; setTimeout(()=>toast.value.show=false, 2000); };
        const handleScroll = (e) => scrollX.value = e.target.scrollLeft;
        
        const getStatusBorderClass = (s) => ({ todo: 'border-gray-500', doing: 'border-blue-400 shadow-blue-500/50', done: 'border-emerald-400 opacity-60 grayscale-[0.3]', blocked: 'border-red-500' }[s] || 'border-gray-700');
        const timelineDays = ref([]);
        const generateTimeline = () => { const arr=[]; const t=new Date(); for(let i=-7;i<45;i++){ const d=new Date(t); d.setDate(t.getDate()+i); arr.push({date:d, label:`${d.getMonth()+1}/${d.getDate()}`, week:['日','一','二','三','四','五','六'][d.getDay()]}); } timelineDays.value=arr; };
        const isToday = (d) => d.toDateString() === new Date().toDateString();
        const getTaskStyle = (task) => { if(!task.start) return {}; const s=new Date(task.start), e=task.end?new Date(task.end):s; const off=Math.floor((s-timelineDays.value[0].date)/86400000); let dur=Math.ceil((e-s)/86400000); if(dur<1)dur=1; return { left:(off*100)+'px', width:(dur*100)+'px' }; };

        onMounted(() => { generateTimeline(); refreshData(); });

        return { 
            myId, isAdmin, canViewAll,
            members, projects, viewMode, activeProjectId, backlogTasks, scheduledTasks, timelineDays, filteredTaskCount, filterOwnerId, filterStatus, scrollX, isLoading, isSaving, 
            showTaskModal, showProjectModal, showStatsModal, showProjStatsModal, showActivityDrawer, activities,
            showBacklogDrawer, // 🔥
            isEditing, taskForm, projForm, toast, statsLoading, statsData, statsFilterOwnerId, projStatsData,
            statDetailUser,
            canCreateProject, canEditProject, canDeleteProject, canViewProjStats, 
            canCreateTask, canEdit, canAssign, canDeleteTask, canViewTaskStats,
            canDelete: canDeleteTask,
            canCreate, canViewStats,
            switchViewMode, enterProject, clearProjectFilter, openGlobalStats, openStats, openProjectStats, openActivityDrawer,
            fetchStats, viewMemberDetails, closeStats, getStatPercent, getStatCount, fillTrendData, refreshData, openTaskModal, openProjectModal, editTask, closeModal, saveTask, saveProject, deleteTask, deleteProject, deleteLog, updateOwnerName, handleFilterChange, handleScroll, isToday, getTaskStyle, getStatusBorderClass, currentLogNote, 
            getMemberColor, getMemberAvatar, getMemberAvatarById, getMemberNameById, getProjectName
        };
    }
};