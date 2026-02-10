/**
 * Admin System Component - V4.0 (Fixed & Robust)
 * 包含：用户管理、权限方案(Roles)、SOP标准库、创意分类
 */

const AdminSystemTemplate = `
<div class="h-full flex flex-col bg-[#0b0c15] text-gray-100 font-sans selection:bg-purple-500/30">
    <div class="px-8 py-6 border-b border-white/10 bg-[#0b0c15]/90 backdrop-blur-xl flex justify-between items-center z-10">
        <div>
            <h2 class="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                <i class="fa-solid fa-shield-halved text-purple-500"></i> 系统控制台
            </h2>
            <div class="flex gap-4 mt-4 text-sm font-bold">
                <button @click="currentTab = 'users'" :class="['px-4 py-2 rounded-lg transition-all', currentTab === 'users' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-500 hover:text-white hover:bg-white/5']">用户管理</button>
                <button @click="currentTab = 'roles'" :class="['px-4 py-2 rounded-lg transition-all', currentTab === 'roles' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-500 hover:text-white hover:bg-white/5']">权限方案</button>
                <button @click="currentTab = 'sops'" :class="['px-4 py-2 rounded-lg transition-all', currentTab === 'sops' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-500 hover:text-white hover:bg-white/5']">SOP 标准库</button>
                <button @click="currentTab = 'cats'" :class="['px-4 py-2 rounded-lg transition-all', currentTab === 'cats' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'text-gray-500 hover:text-white hover:bg-white/5']">创意分类</button>
            </div>
        </div>
        <button @click="refresh" class="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all" title="刷新数据">
            <i class="fa-solid fa-rotate"></i>
        </button>
    </div>

    <div class="flex-1 overflow-auto p-8 custom-scrollbar relative">
        
        <div v-if="currentTab === 'sops'" class="animate-fade-in-up">
            <div class="flex justify-between items-center mb-6">
                <div class="text-gray-400 text-sm">定义标准作业流程，指导团队高效执行</div>
                <button @click="openSOPModal()" class="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                    <i class="fa-solid fa-plus"></i> 新建 SOP
                </button>
            </div>
            
            <div v-if="sops.length === 0" class="text-center py-20 text-gray-500 border border-dashed border-white/10 rounded-xl">暂无 SOP 模版，请点击右上角新建</div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div v-for="sop in sops" :key="sop._id" class="bg-[#13151f] border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all group relative shadow-lg">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                                {{ sop.title ? sop.title.charAt(0).toUpperCase() : 'S' }}
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-white leading-tight">{{ sop.title }}</h3>
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="px-2 py-0.5 rounded text-[10px] bg-white/10 text-gray-400 uppercase font-bold tracking-wider">{{ sop.category }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button @click="openSOPModal(sop)" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-blue-500/20 hover:text-blue-400 flex items-center justify-center transition-all"><i class="fa-solid fa-pen"></i></button>
                            <button @click="deleteSOP(sop._id)" class="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-all"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    <p class="text-sm text-gray-400 mb-4 line-clamp-2 h-10">{{ sop.desc || '暂无描述' }}</p>
                    <div class="text-xs text-gray-500 flex justify-between border-t border-white/5 pt-3">
                        <span><i class="fa-solid fa-list-ol mr-1"></i> {{ sop.steps ? sop.steps.length : 0 }} 个步骤</span>
                        <span><i class="fa-solid fa-paperclip mr-1"></i> {{ sop.attachments ? sop.attachments.length : 0 }} 个文档</span>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="currentTab === 'users'" class="bg-[#13151f] border border-white/5 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
             <table class="w-full text-left">
                <thead class="text-xs text-gray-500 uppercase bg-white/5 border-b border-white/5">
                    <tr>
                        <th class="px-6 py-4">用户</th>
                        <th class="px-6 py-4">账号状态</th>
                        <th class="px-6 py-4">分配角色</th>
                        <th class="px-6 py-4 text-right">操作</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    <tr v-for="u in users" :key="u._id" class="group hover:bg-white/[0.02] transition-colors">
                        <td class="px-6 py-4">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold">{{ u.username.charAt(0).toUpperCase() }}</div>
                                <div>
                                    <div class="font-bold text-white text-sm">{{ u.name || '未设置昵称' }}</div>
                                    <div class="text-xs text-gray-500 font-mono">@{{ u.username }}</div>
                                </div>
                            </div>
                        </td>
                        <td class="px-6 py-4">
                            <button @click="toggleUserActive(u)" :class="['px-3 py-1 rounded-full text-xs font-bold border transition-all', u.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20']">
                                <i :class="['fa-solid mr-1', u.isActive ? 'fa-check' : 'fa-ban']"></i>
                                {{ u.isActive ? '状态正常' : '已禁用' }}
                            </button>
                        </td>
                        <td class="px-6 py-4">
                            <div class="flex flex-wrap gap-2">
                                <span v-if="!u.roles || !u.roles.length" class="text-gray-600 text-xs italic">暂无角色</span>
                                <span v-for="role in u.roles" :key="role._id || role" class="px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs border border-blue-500/30 flex items-center gap-1">
                                    <i class="fa-solid fa-shield-cat text-[10px]"></i> {{ role.name || 'Unknown' }}
                                </span>
                            </div>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <button @click="openAssignModal(u)" class="text-xs bg-white/5 hover:bg-purple-600 hover:text-white text-gray-300 px-3 py-1.5 rounded border border-white/10 transition-all">
                                <i class="fa-solid fa-user-gear mr-1"></i> 配置角色
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-if="currentTab === 'roles'" class="space-y-6 animate-fade-in-up">
            <div class="flex justify-end">
                <button @click="openRoleModal()" class="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2">
                    <i class="fa-solid fa-plus"></i> 新建权限方案
                </button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="role in roles" :key="role._id" class="bg-[#13151f] border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all group relative shadow-lg">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <h3 class="text-lg font-bold text-white flex items-center gap-2">
                                <i class="fa-solid fa-shield-cat text-purple-400"></i> {{ role.name }}
                            </h3>
                            <p class="text-xs text-gray-500 mt-1">{{ role.description || '无描述' }}</p>
                        </div>
                        <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button @click="openRoleModal(role)" class="text-blue-400 hover:text-white w-6 h-6 flex items-center justify-center rounded bg-white/5"><i class="fa-solid fa-pen text-xs"></i></button>
                            <button @click="deleteRole(role._id)" class="text-red-400 hover:text-white w-6 h-6 flex items-center justify-center rounded bg-white/5"><i class="fa-solid fa-trash text-xs"></i></button>
                        </div>
                    </div>
                    <div class="space-y-2 border-t border-white/5 pt-4">
                        <div v-for="(actions, menuId) in role.permissions" :key="menuId" class="text-xs bg-black/30 p-2 rounded border border-white/5 flex flex-wrap gap-1 items-center">
                            <span class="text-gray-400 font-bold uppercase mr-1">{{ getMenuName(menuId) }}:</span>
                            <span v-for="act in actions" class="text-purple-300 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/20">{{ getActionLabel(menuId, act) }}</span>
                        </div>
                        <div v-if="!role.permissions || Object.keys(role.permissions).length === 0" class="text-xs text-gray-600 italic">未配置任何权限</div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="currentTab === 'cats'" class="animate-fade-in-up">
            <div class="max-w-2xl mx-auto bg-[#13151f] border border-white/10 rounded-xl p-8 shadow-2xl">
                <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <i class="fa-solid fa-tags text-purple-500"></i> 配置创意分类
                </h3>
                <div class="flex gap-3 mb-8">
                    <input v-model="newCatName" placeholder="输入新分类名称..." class="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none transition-all">
                    <button @click="addCategory" class="bg-purple-600 hover:bg-purple-500 text-white px-6 font-bold rounded-lg transition-all shadow-lg flex items-center gap-2">
                        <i class="fa-solid fa-plus"></i> 添加
                    </button>
                </div>
                <div class="space-y-3">
                    <div v-if="categories.length === 0" class="text-center text-gray-500 py-8 border border-dashed border-white/10 rounded-lg">暂无分类，请添加</div>
                    <div v-for="cat in categories" :key="cat._id" class="flex justify-between items-center bg-white/5 p-4 rounded-lg border border-white/5 group hover:border-purple-500/30 transition-all hover:bg-white/[0.07]">
                        <span class="text-gray-200 font-bold pl-2 border-l-2 border-purple-500">{{ cat.name }}</span>
                        <button @click="deleteCategory(cat._id)" class="text-gray-500 hover:text-red-400 transition-colors w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showAssignModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bg-[#1a1c26] w-full max-w-md rounded-2xl border border-white/10 p-6 shadow-2xl scale-100">
            <h3 class="text-lg font-bold text-white mb-4">为 <span class="text-purple-400">{{ editingUser.name }}</span> 分配角色</h3>
            <div class="space-y-2 mb-6 max-h-60 overflow-y-auto custom-scrollbar">
                <label v-for="role in roles" :key="role._id" class="flex items-center gap-3 p-3 rounded bg-white/5 cursor-pointer hover:bg-white/10 border border-transparent hover:border-purple-500/30 transition-all">
                    <input type="checkbox" :value="role._id" v-model="selectedRoleIds" class="w-4 h-4 rounded bg-gray-700 accent-purple-500">
                    <div>
                        <div class="text-sm font-bold text-gray-200">{{ role.name }}</div>
                        <div class="text-xs text-gray-500">{{ role.description }}</div>
                    </div>
                </label>
            </div>
            <div class="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button @click="showAssignModal = false" class="text-gray-400 text-sm hover:text-white transition-colors">取消</button>
                <button @click="saveUserRoles" class="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg">保存配置</button>
            </div>
        </div>
    </div>

    <div v-if="showRoleModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bg-[#1a1c26] w-full max-w-3xl rounded-2xl border border-white/10 p-6 flex flex-col max-h-[90vh] shadow-2xl">
            <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <i class="fa-solid fa-shield-halved text-purple-500"></i>
                {{ roleForm._id ? '编辑方案' : '新建方案' }}
            </h3>
            <div class="flex gap-4 mb-6">
                <div class="flex-1">
                    <label class="text-xs text-gray-500 font-bold uppercase block mb-1">方案名称</label>
                    <input v-model="roleForm.name" placeholder="例如：财务专员" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-purple-500 transition-all">
                </div>
                <div class="flex-[2]">
                    <label class="text-xs text-gray-500 font-bold uppercase block mb-1">方案描述</label>
                    <input v-model="roleForm.description" placeholder="描述该角色的职责范围" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-purple-500 transition-all">
                </div>
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl bg-black/20 p-4">
                <table class="w-full text-left text-sm">
                    <thead><tr class="text-gray-500 border-b border-white/10"><th class="pb-2 w-1/4">功能模块</th><th class="pb-2">授权细项</th></tr></thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="module in systemModules" :key="module.id">
                            <td class="py-4 text-gray-300 font-bold">{{ module.label }}</td>
                            <td class="py-4">
                                <div class="flex flex-wrap gap-4">
                                    <label v-for="action in module.actions" :key="action.val" class="flex items-center gap-2 cursor-pointer select-none group">
                                        <input type="checkbox" :checked="checkPerm(module.id, action.val)" @change="togglePerm(module.id, action.val)" class="w-4 h-4 rounded bg-gray-700 accent-purple-500">
                                        <span class="text-gray-400 group-hover:text-white transition-colors">{{ action.label }}</span>
                                    </label>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                <button @click="showRoleModal = false" class="text-gray-400 text-sm hover:text-white">取消</button>
                <button @click="saveRole" class="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg">保存方案</button>
            </div>
        </div>
    </div>

    <div v-if="showSOPModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div class="bg-[#1a1c26] w-full max-w-5xl rounded-2xl border border-white/10 flex flex-col max-h-[90vh] shadow-2xl overflow-hidden">
            <div class="p-5 border-b border-white/10 flex justify-between items-center bg-[#13151f]">
                <h3 class="text-xl font-bold text-white flex items-center gap-2"><i class="fa-solid fa-file-waveform text-purple-500"></i> {{ sopForm._id ? '编辑 SOP 模版' : '创建 SOP 模版' }}</h3>
                <button @click="showSOPModal = false" class="text-gray-500 hover:text-white transition-transform hover:rotate-90"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
                <div class="w-full md:w-1/3 p-6 border-r border-white/10 overflow-y-auto custom-scrollbar bg-black/10">
                    <div class="space-y-5">
                        <div>
                            <label class="block text-xs text-gray-500 font-bold uppercase mb-2">流程标题 <span class="text-red-500">*</span></label>
                            <input v-model="sopForm.title" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-purple-500 outline-none transition-all" placeholder="如：新员工入职流程">
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 font-bold uppercase mb-2">所属分类</label>
                            <select v-model="sopForm.category" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-purple-500">
                                <option value="General">通用</option>
                                <option value="C++">C++</option>
                                <option value="Scratch">Scratch</option>
                                <option value="WeDo">WeDo</option>
                                <option value="Arduino">Arduino</option>
                                <option value="teach">教学服务</option>
                                <option value="operations">市场运营</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-500 font-bold uppercase mb-2">流程描述</label>
                            <textarea v-model="sopForm.desc" rows="4" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none focus:border-purple-500 transition-all" placeholder="简述该SOP的目的和适用范围..."></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-xs text-gray-500 font-bold uppercase mb-2">参考资料/附件</label>
                            <div class="border border-dashed border-white/20 rounded-lg p-4 text-center hover:bg-white/5 relative transition-all group">
                                <input type="file" multiple @change="handleDocUpload" class="absolute inset-0 opacity-0 cursor-pointer z-10">
                                <div class="text-gray-400 group-hover:text-purple-400 transition-colors">
                                    <i class="fa-solid fa-cloud-arrow-up text-2xl mb-2"></i>
                                    <div class="text-xs">点击或拖拽文件上传</div>
                                </div>
                            </div>
                            <div class="mt-3 space-y-2">
                                <div v-for="(file, idx) in sopForm.attachments" :key="idx" class="flex justify-between items-center bg-white/5 px-3 py-2 rounded text-xs border border-white/5">
                                    <a :href="file.url" target="_blank" class="text-blue-400 hover:text-blue-300 flex items-center gap-2 truncate max-w-[200px]">
                                        <i class="fa-regular fa-file"></i> {{ file.name }}
                                    </a>
                                    <button @click="sopForm.attachments.splice(idx,1)" class="text-gray-500 hover:text-red-400"><i class="fa-solid fa-times"></i></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#1a1c26]">
                    <div class="flex justify-between items-center mb-4">
                        <label class="text-xs text-gray-500 font-bold uppercase flex items-center gap-2"><i class="fa-solid fa-list-ol"></i> 步骤序列</label>
                        <button @click="addStep" class="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold shadow-lg transition-all"><i class="fa-solid fa-plus mr-1"></i> 添加步骤</button>
                    </div>
                    
                    <div v-if="sopForm.steps.length === 0" class="text-center py-10 text-gray-600 italic">暂无步骤，请添加</div>

                    <div class="space-y-3">
                        <div v-for="(step, idx) in sopForm.steps" :key="idx" class="bg-black/20 border border-white/5 rounded-lg p-4 flex gap-4 items-start group hover:border-purple-500/30 transition-all">
                            <div class="mt-1 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-gray-500 group-hover:bg-purple-600 group-hover:text-white transition-colors">{{ idx + 1 }}</div>
                            <div class="flex-1 space-y-3">
                                <div class="flex gap-3">
                                    <div class="flex-1 relative">
                                        <input v-model="step.title" class="w-full bg-transparent border-b border-white/10 px-0 py-1 text-white text-sm font-bold outline-none focus:border-purple-500 transition-all placeholder-gray-600" placeholder="步骤名称 (必填)">
                                    </div>
                                    <select v-model="step.type" class="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-blue-400 font-bold outline-none focus:border-blue-500">
                                        <option value="read">仅阅读</option>
                                        <option value="input">填文本</option>
                                        <option value="file">传文档</option>
                                    </select>
                                </div>
                                <input v-model="step.desc" class="w-full bg-transparent text-xs text-gray-400 outline-none border-b border-transparent focus:border-white/10 pb-1 transition-all placeholder-gray-700" placeholder="详细操作指引...">
                                <label class="flex items-center gap-2 text-xs text-gray-500 cursor-pointer select-none">
                                    <input type="checkbox" v-model="step.isRequired" class="rounded bg-gray-700 accent-purple-500"> 
                                    <span>必须完成此步骤才能继续</span>
                                </label>
                            </div>
                            <button @click="removeStep(idx)" class="mt-1 text-gray-600 hover:text-red-400 w-6 h-6 flex items-center justify-center transition-colors"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-white/10 bg-[#13151f] rounded-b-2xl flex justify-end gap-3">
                <button @click="showSOPModal = false" class="px-5 py-2 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">取消</button>
                <button @click="saveSOP" class="px-6 py-2 rounded-lg text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition-all">保存模版</button>
            </div>
        </div>
    </div>
</div>
`;

const AdminSystemComponent = {
    template: AdminSystemTemplate,
    setup() {
        const { ref, reactive, onMounted } = Vue;
        const API_ADMIN = '/api/admin';
        const API_SOP = '/api/sop';
        const API_UPLOAD = '/api/upload';

        // 状态定义
        const currentTab = ref('users');
        const users = ref([]);
        const roles = ref([]);
        const categories = ref([]);
        const sops = ref([]);
        
        // Modal 控制
        const showAssignModal = ref(false);
        const showRoleModal = ref(false);
        const showSOPModal = ref(false);

        // 表单数据
        const newCatName = ref('');
        const editingUser = ref({});
        const selectedRoleIds = ref([]);
        const roleForm = ref({ _id: null, name: '', description: '', permissions: {} });
        
        const defaultSOPForm = { _id: null, title: '', desc: '', category: 'General', steps: [{ title: '阅读文档', desc: '', type: 'read', isRequired: true }], attachments: [] };
        const sopForm = ref(JSON.parse(JSON.stringify(defaultSOPForm)));
        
        // 模块字典
        const systemModules = [
            { id: 'projects', label: '项目管理', actions: [{ val: 'create', label: '立项权' }, { val: 'edit', label: '编辑项目' }, { val: 'delete', label: '删除项目' }, { val: 'view_stats', label: '查看绩效' }] },
            { id: 'tasks', label: '任务指挥', actions: [{ val: 'view_all', label: '查看全员任务' }, { val: 'create', label: '发布任务' }, { val: 'edit', label: '编辑任务' }, { val: 'delete', label: '删除任务' }, { val: 'assign', label: '指派给他人' }, { val: 'edit_all', label: '编辑他人任务' }, { val: 'view_stats', label: '查看总看板' }] },
            { id: 'resources', label: '资源补给', actions: [{ val: 'create', label: '分享资源' }, { val: 'manage', label: '管理(编辑/删除他人)' }] },
            { id: 'ideas', label: '创意树洞', actions: [{ val: 'create', label: '提交创意' }, { val: 'review', label: '评审与决策' }] },
            { id: 'admin', label: '系统设置', actions: [{ val: 'view', label: '后台访问' }, { val: 'manage_users', label: '用户管理' }, { val: 'manage_roles', label: '权限配置' }] },
            { id: 'sop', label: 'SOP 管理', actions: [{ val: 'create_template', label: '创建模版' }, { val: 'manage_template', label: '管理模版' }] }
        ];

        const getH = () => ({ 'Authorization': `Bearer ${localStorage.getItem('authToken')}` });
        
        // 🔥 核心刷新逻辑 (包含容错处理)
        const refresh = async () => {
            const h = getH();
            
            // 使用 Promise.allSettled 代替 Promise.all，防止一个接口挂掉导致全部白屏
            const results = await Promise.allSettled([
                fetch(`${API_ADMIN}/users`, {headers:h}),
                fetch(`${API_ADMIN}/roles`, {headers:h}),
                fetch(`${API_ADMIN}/idea-categories`, {headers:h}),
                fetch(`${API_SOP}/templates`, {headers:h})
            ]);

            // 1. 用户
            if(results[0].status === 'fulfilled' && results[0].value.ok) 
                users.value = await results[0].value.json();
            else console.warn("Load Users Failed");

            // 2. 角色
            if(results[1].status === 'fulfilled' && results[1].value.ok) 
                roles.value = await results[1].value.json();
            else console.warn("Load Roles Failed");

            // 3. 分类 (如果没建表可能404，给个默认空数组)
            if(results[2].status === 'fulfilled' && results[2].value.ok) 
                categories.value = await results[2].value.json();
            else categories.value = [];

            // 4. SOP
            if(results[3].status === 'fulfilled' && results[3].value.ok) 
                sops.value = await results[3].value.json();
            else console.warn("Load SOPs Failed");
        };

        // === SOP 逻辑 ===
        const openSOPModal = (sop = null) => {
            if (sop) sopForm.value = JSON.parse(JSON.stringify(sop));
            else sopForm.value = JSON.parse(JSON.stringify(defaultSOPForm));
            if(!sopForm.value.attachments) sopForm.value.attachments = [];
            showSOPModal.value = true;
        };

        const handleDocUpload = async (e) => {
            const files = e.target.files;
            if(!files.length) return;
            for (let i = 0; i < files.length; i++) {
                const fd = new FormData();
                fd.append('file', files[i]);
                try {
                    const res = await fetch(API_UPLOAD, { method: 'POST', body: fd, headers: { 'Authorization': getH().Authorization } });
                    const data = await res.json();
                    sopForm.value.attachments.push({ name: data.originalName, url: data.url, size: data.size });
                } catch(err) { alert('上传失败: ' + files[i].name); }
            }
        };

        const addStep = () => sopForm.value.steps.push({ title: '', desc: '', type: 'input', isRequired: true });
        const removeStep = (idx) => sopForm.value.steps.splice(idx, 1);
        
        const saveSOP = async () => {
            if (!sopForm.value.title) return alert('请输入标题');
            try {
                const isEdit = !!sopForm.value._id;
                const url = isEdit ? `${API_SOP}/templates/${sopForm.value._id}` : `${API_SOP}/templates`;
                const method = isEdit ? 'PUT' : 'POST';
                const res = await fetch(url, { method: method, headers: { 'Content-Type': 'application/json', ...getH() }, body: JSON.stringify(sopForm.value) });
                if (!res.ok) throw new Error((await res.json()).message);
                showSOPModal.value = false; refresh();
            } catch (e) { alert('保存失败: ' + e.message); }
        };
        const deleteSOP = async (id) => { if(confirm('确定删除?')) { await fetch(`${API_SOP}/templates/${id}`, { method: 'DELETE', headers: getH() }); refresh(); } };

        // === 创意分类逻辑 ===
        const addCategory = async () => { 
            if(!newCatName.value) return; 
            try {
                const res = await fetch(`${API_ADMIN}/idea-categories`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getH() }, body: JSON.stringify({ name: newCatName.value }) });
                if(res.ok) { newCatName.value = ''; refresh(); }
            } catch(e) { console.error(e); }
        };
        const deleteCategory = async (id) => { if(!confirm('删除?')) return; await fetch(`${API_ADMIN}/idea-categories/${id}`, { method: 'DELETE', headers: getH() }); refresh(); };

        // === 用户与角色逻辑 ===
        const toggleUserActive = async(u)=>{ await fetch(`${API_ADMIN}/users/${u._id}`,{method:'PUT',headers:{'Content-Type':'application/json',...getH()},body:JSON.stringify({isActive:!u.isActive})}); refresh(); };
        const openAssignModal = (u)=>{ editingUser.value=u; selectedRoleIds.value=(u.roles||[]).map(r=>r._id || r); showAssignModal.value=true; };
        const saveUserRoles = async()=>{ await fetch(`${API_ADMIN}/users/${editingUser.value._id}`,{method:'PUT',headers:{'Content-Type':'application/json',...getH()},body:JSON.stringify({roles:selectedRoleIds.value})}); showAssignModal.value=false; refresh(); };
        
        const openRoleModal = (r)=>{ roleForm.value = r ? JSON.parse(JSON.stringify(r)) : { _id:null, name:'', description:'', permissions:{} }; if(!roleForm.value.permissions) roleForm.value.permissions={}; showRoleModal.value=true; };
        const checkPerm = (m,a) => roleForm.value.permissions[m]?.includes(a);
        const togglePerm = (m,a) => { const p=roleForm.value.permissions; if(!p[m]) p[m]=[]; p[m].includes(a)?p[m]=p[m].filter(x=>x!==a):p[m].push(a); };
        const saveRole = async()=>{ await fetch(`${API_ADMIN}/roles`,{method:'POST',headers:{'Content-Type':'application/json',...getH()},body:JSON.stringify(roleForm.value)}); showRoleModal.value=false; refresh(); };
        const deleteRole = async(id)=>{ if(confirm('删除?')) await fetch(`${API_ADMIN}/roles/${id}`,{method:'DELETE',headers:getH()}); refresh(); };
        
        const getMenuName = (id) => systemModules.find(m=>m.id===id)?.label||id;
        const getActionLabel = (mid, val) => systemModules.find(m=>m.id===mid)?.actions.find(a=>a.val===val)?.label || val;

        onMounted(refresh);

        return { 
            currentTab, users, roles, categories, sops, newCatName, editingUser, selectedRoleIds, roleForm, sopForm,
            showAssignModal, showRoleModal, showSOPModal, systemModules, refresh, 
            addCategory, deleteCategory, toggleUserActive, openAssignModal, saveUserRoles, 
            openRoleModal, saveRole, deleteRole, checkPerm, togglePerm, getMenuName, getActionLabel, 
            openSOPModal, saveSOP, deleteSOP, addStep, removeStep, handleDocUpload
        };
    }
};