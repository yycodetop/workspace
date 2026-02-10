// ... (保留头部模版结构不变，仅修改 SOP Modal 部分)

const AdminSystemTemplate = `
<div class="h-full flex flex-col bg-[#0b0c15] text-gray-100 font-sans selection:bg-purple-500/30">
    <div class="px-8 py-6 border-b border-white/10 bg-[#0b0c15]/90 backdrop-blur-xl flex justify-between items-center">
        <div>
            <h2 class="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
                <i class="fa-solid fa-shield-halved text-purple-500"></i> 系统控制台
            </h2>
            <div class="flex gap-4 mt-4 text-sm font-bold">
                <button @click="currentTab = 'users'" :class="['px-4 py-2 rounded-lg transition-all', currentTab === 'users' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white']">用户管理</button>
                <button @click="currentTab = 'roles'" :class="['px-4 py-2 rounded-lg transition-all', currentTab === 'roles' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white']">权限方案</button>
                <button @click="currentTab = 'sops'" :class="['px-4 py-2 rounded-lg transition-all', currentTab === 'sops' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white']">SOP 标准库</button>
                <button @click="currentTab = 'cats'" :class="['px-4 py-2 rounded-lg transition-all', currentTab === 'cats' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white']">创意分类</button>
            </div>
        </div>
        <button @click="refresh" class="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all"><i class="fa-solid fa-rotate"></i></button>
    </div>

    <div class="flex-1 overflow-auto p-8 custom-scrollbar">
        <div v-if="currentTab === 'sops'" class="animate-fade-in-up">
            <div class="flex justify-between items-center mb-6">
                <div class="text-gray-400 text-sm">定义标准作业流程</div>
                <button @click="openSOPModal()" class="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg"><i class="fa-solid fa-plus mr-2"></i>新建 SOP</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <div v-for="sop in sops" :key="sop._id" class="bg-[#13151f] border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all group relative">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center text-white font-bold text-lg">{{ sop.title.charAt(0) }}</div>
                            <div>
                                <h3 class="text-lg font-bold text-white">{{ sop.title }}</h3>
                                <div class="flex items-center gap-2 mt-1"><span class="px-2 py-0.5 rounded text-[10px] bg-white/10 text-gray-400 uppercase">{{ sop.category }}</span></div>
                            </div>
                        </div>
                        <div class="flex gap-2"><button @click="openSOPModal(sop)"><i class="fa-solid fa-pen text-gray-500 hover:text-white"></i></button><button @click="deleteSOP(sop._id)"><i class="fa-solid fa-trash text-gray-500 hover:text-white"></i></button></div>
                    </div>
                    <div class="text-xs text-gray-500">包含 {{ sop.steps.length }} 个步骤 | {{ (sop.attachments||[]).length }} 个文档</div>
                </div>
            </div>
        </div>

        <div v-if="currentTab === 'users'" class="bg-[#13151f] border border-white/5 rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
             <table class="w-full text-left">
                <thead class="text-xs text-gray-500 uppercase bg-white/5 border-b border-white/5"><tr><th class="px-6 py-4">用户</th><th class="px-6 py-4">状态</th><th class="px-6 py-4">角色</th><th class="px-6 py-4 text-right">操作</th></tr></thead>
                <tbody class="divide-y divide-white/5"><tr v-for="u in users" :key="u._id" class="group hover:bg-white/[0.02]"><td class="px-6 py-4"><div class="font-bold text-white">{{ u.name }}</div><div class="text-xs text-gray-500">@{{ u.username }}</div></td><td class="px-6 py-4"><button @click="toggleUserActive(u)" :class="['px-3 py-1 rounded-full text-xs font-bold border', u.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20']">{{ u.isActive ? '启用' : '禁用' }}</button></td><td class="px-6 py-4"><div class="flex flex-wrap gap-2"><span v-if="!u.roles || !u.roles.length" class="text-gray-600 text-xs">无角色</span><span v-for="role in u.roles" :key="role._id" class="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs border border-blue-500/30">{{ role.name }}</span></div></td><td class="px-6 py-4 text-right"><button @click="openAssignModal(u)" class="text-xs bg-white/5 hover:bg-white/10 text-white px-3 py-1.5 rounded border border-white/10">配置角色</button></td></tr></tbody>
            </table>
        </div>
        <div v-if="currentTab === 'roles'" class="space-y-6 animate-fade-in-up">
            <div class="flex justify-end"><button @click="openRoleModal()" class="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg"><i class="fa-solid fa-plus mr-2"></i>新建方案</button></div>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div v-for="role in roles" :key="role._id" class="bg-[#13151f] border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all group relative"><div class="flex justify-between items-start mb-4"><div><h3 class="text-lg font-bold text-white">{{ role.name }}</h3><p class="text-xs text-gray-500 mt-1">{{ role.description }}</p></div><div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button @click="openRoleModal(role)" class="text-blue-400 hover:text-white"><i class="fa-solid fa-pen"></i></button><button @click="deleteRole(role._id)" class="text-red-400 hover:text-white"><i class="fa-solid fa-trash"></i></button></div></div><div class="space-y-2"><div v-for="(actions, menuId) in role.permissions" :key="menuId" class="text-xs bg-black/30 p-2 rounded border border-white/5 flex flex-wrap gap-1"><span class="text-gray-400 font-bold uppercase mr-1">{{ getMenuName(menuId) }}:</span><span v-for="act in actions" class="text-purple-400 bg-purple-900/20 px-1 rounded">{{ getActionLabel(menuId, act) }}</span></div></div></div></div>
        </div>
        <div v-if="currentTab === 'cats'" class="animate-fade-in-up">
            <div class="max-w-2xl mx-auto bg-[#13151f] border border-white/10 rounded-xl p-8">
                <h3 class="text-lg font-bold text-white mb-6">配置创意分类</h3>
                <div class="flex gap-3 mb-8"><input v-model="newCatName" placeholder="输入新分类名称" class="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"><button @click="addCategory" class="bg-purple-600 hover:bg-purple-500 text-white px-6 font-bold rounded-lg transition-all"><i class="fa-solid fa-plus"></i> 添加</button></div>
                <div class="space-y-3"><div v-if="categories.length === 0" class="text-center text-gray-500 py-4">暂无分类</div><div v-for="cat in categories" :key="cat._id" class="flex justify-between items-center bg-white/5 p-4 rounded-lg border border-white/5 group hover:border-purple-500/30 transition-colors"><span class="text-gray-200 font-bold">{{ cat.name }}</span><button @click="deleteCategory(cat._id)" class="text-gray-500 hover:text-red-400 transition-colors"><i class="fa-solid fa-trash"></i></button></div></div>
            </div>
        </div>
    </div>

    <div v-if="showAssignModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><div class="bg-[#1a1c26] w-full max-w-md rounded-2xl border border-white/10 p-6"><h3 class="text-lg font-bold text-white mb-4">为 {{ editingUser.name }} 分配角色</h3><div class="space-y-2 mb-6 max-h-60 overflow-y-auto"><label v-for="role in roles" :key="role._id" class="flex items-center gap-3 p-3 rounded bg-white/5 cursor-pointer hover:bg-white/10"><input type="checkbox" :value="role._id" v-model="selectedRoleIds" class="w-4 h-4 rounded bg-gray-700 accent-purple-500"><span class="text-sm font-bold text-gray-200">{{ role.name }}</span></label></div><div class="flex justify-end gap-3"><button @click="showAssignModal = false" class="text-gray-400 text-sm">取消</button><button @click="saveUserRoles" class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold">保存</button></div></div></div>
    <div v-if="showRoleModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><div class="bg-[#1a1c26] w-full max-w-3xl rounded-2xl border border-white/10 p-6 flex flex-col max-h-[90vh]"><h3 class="text-lg font-bold text-white mb-6">{{ roleForm._id ? '编辑方案' : '新建方案' }}</h3><div class="flex gap-4 mb-6"><input v-model="roleForm.name" placeholder="方案名称" class="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-purple-500"><input v-model="roleForm.description" placeholder="描述" class="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-purple-500"></div><div class="flex-1 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl bg-black/20 p-4"><table class="w-full text-left text-sm"><thead><tr class="text-gray-500 border-b border-white/10"><th class="pb-2 w-1/4">模块</th><th class="pb-2">权限</th></tr></thead><tbody class="divide-y divide-white/5"><tr v-for="module in systemModules" :key="module.id"><td class="py-4 text-gray-300 font-bold">{{ module.label }}</td><td class="py-4"><div class="flex flex-wrap gap-4"><label v-for="action in module.actions" :key="action.val" class="flex items-center gap-2 cursor-pointer select-none group"><input type="checkbox" :checked="checkPerm(module.id, action.val)" @change="togglePerm(module.id, action.val)" class="w-4 h-4 rounded bg-gray-700 accent-purple-500"><span class="text-gray-400 group-hover:text-white transition-colors">{{ action.label }}</span></label></div></td></tr></tbody></table></div><div class="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10"><button @click="showRoleModal = false" class="text-gray-400 text-sm">取消</button><button @click="saveRole" class="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-bold">保存</button></div></div></div>

    <div v-if="showSOPModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-[#1a1c26] w-full max-w-4xl rounded-2xl border border-white/10 flex flex-col max-h-[90vh] shadow-2xl">
            <div class="p-6 border-b border-white/10 flex justify-between items-center bg-[#13151f] rounded-t-2xl">
                <h3 class="text-xl font-bold text-white">{{ sopForm._id ? '编辑 SOP' : '创建 SOP' }}</h3>
                <button @click="showSOPModal = false" class="text-gray-500 hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button>
            </div>
            <div class="flex-1 overflow-hidden flex flex-col md:flex-row">
                <div class="w-full md:w-1/3 p-6 border-r border-white/10 overflow-y-auto custom-scrollbar bg-black/10">
                    <div class="space-y-4">
                        <div><label class="block text-xs text-gray-500 font-bold uppercase mb-2">标题</label><input v-model="sopForm.title" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-purple-500 outline-none"></div>
                        <div>
                            <label class="block text-xs text-gray-500 font-bold uppercase mb-2">分类</label>
                            <select v-model="sopForm.category" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none"><option value="C++">C++</option><option value="Scratch">Scratch</option><option value="WeDo">WeDo</option><option value="Arduino">Arduino</option><option value="teach">教学服务</option><option value="operations">市场运营</option></select>
                        </div>
                        <div><label class="block text-xs text-gray-500 font-bold uppercase mb-2">描述</label><textarea v-model="sopForm.desc" rows="3" class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-sm text-white outline-none"></textarea></div>
                        
                        <div>
                            <label class="block text-xs text-gray-500 font-bold uppercase mb-2">标准文档附件</label>
                            <div class="border border-dashed border-white/20 rounded-lg p-3 text-center hover:bg-white/5 relative">
                                <input type="file" multiple @change="handleDocUpload" class="absolute inset-0 opacity-0 cursor-pointer">
                                <span class="text-xs text-gray-400"><i class="fa-solid fa-cloud-arrow-up mr-1"></i> 点击上传 (支持多个)</span>
                            </div>
                            <div class="mt-2 space-y-1">
                                <div v-for="(file, idx) in sopForm.attachments" :key="idx" class="flex justify-between items-center bg-white/5 px-2 py-1 rounded text-xs">
                                    <a :href="file.url" target="_blank" class="text-blue-400 hover:underline truncate max-w-[150px]">{{ file.name }}</a>
                                    <button @click="sopForm.attachments.splice(idx,1)" class="text-red-400 hover:text-white"><i class="fa-solid fa-times"></i></button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                <div class="flex-1 p-6 overflow-y-auto custom-scrollbar bg-[#1a1c26]">
                    <div class="flex justify-between items-center mb-4"><label class="text-xs text-gray-500 font-bold uppercase">步骤配置</label><button @click="addStep" class="text-xs bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded font-bold"><i class="fa-solid fa-plus"></i></button></div>
                    <div class="space-y-3">
                        <div v-for="(step, idx) in sopForm.steps" :key="idx" class="bg-black/20 border border-white/5 rounded-lg p-3 flex gap-3 items-start">
                            <div class="mt-2 text-gray-600 font-bold text-xs">#{{ idx + 1 }}</div>
                            <div class="flex-1 space-y-2">
                                <div class="flex gap-2">
                                    <input v-model="step.title" class="flex-1 bg-transparent border-b border-white/10 px-0 py-1 text-white text-sm font-bold outline-none" placeholder="步骤名称">
                                    <select v-model="step.type" class="bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-blue-400 font-bold outline-none"><option value="read">仅阅读</option><option value="input">填文本</option><option value="file">传文档</option></select>
                                </div>
                                <input v-model="step.desc" class="w-full bg-transparent text-xs text-gray-400 outline-none" placeholder="指引...">
                                <label class="flex items-center gap-2 text-xs text-gray-500"><input type="checkbox" v-model="step.isRequired" class="rounded bg-gray-700"> 必做</label>
                            </div>
                            <button @click="removeStep(idx)" class="mt-1 text-gray-600 hover:text-red-400"><i class="fa-solid fa-xmark"></i></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-white/10 bg-[#13151f] rounded-b-2xl flex justify-end gap-3">
                <button @click="showSOPModal = false" class="px-5 py-2 rounded-lg text-sm text-gray-400 hover:text-white">取消</button>
                <button @click="saveSOP" class="px-6 py-2 rounded-lg text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white">保存</button>
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

        const currentTab = ref('users');
        const users = ref([]); const roles = ref([]); const categories = ref([]); const sops = ref([]);
        const showAssignModal = ref(false); const showRoleModal = ref(false); const showSOPModal = ref(false);
        const newCatName = ref(''); const editingUser = ref({}); const selectedRoleIds = ref([]);
        const roleForm = ref({ _id: null, name: '', description: '', permissions: {} });

        // 🔥 Form 包含 attachments 数组
        const defaultSOPForm = { _id: null, title: '', desc: '', category: 'General', steps: [{ title: '阅读文档', desc: '', type: 'read', isRequired: true }], attachments: [] };
        const sopForm = ref(JSON.parse(JSON.stringify(defaultSOPForm)));
        
        const systemModules = [
            { id: 'projects', label: '项目管理', actions: [{ val: 'create', label: '立项权' }, { val: 'edit', label: '编辑项目' }, { val: 'delete', label: '删除项目' }, { val: 'view_stats', label: '查看绩效' }] },
            { id: 'tasks', label: '任务指挥', actions: [{ val: 'view_all', label: '查看全员任务' }, { val: 'create', label: '发布任务' }, { val: 'edit', label: '编辑任务' }, { val: 'delete', label: '删除任务' }, { val: 'assign', label: '指派给他人' }, { val: 'edit_all', label: '编辑他人任务' }, { val: 'view_stats', label: '查看总看板' }] },
            { id: 'resources', label: '资源补给', actions: [{ val: 'create', label: '分享资源' }, { val: 'manage', label: '管理(编辑/删除他人)' }] },
            { id: 'ideas', label: '创意树洞', actions: [{ val: 'create', label: '提交创意' }, { val: 'review', label: '评审与决策' }] },
            { id: 'admin', label: '系统设置', actions: [{ val: 'view', label: '后台访问' }, { val: 'manage_users', label: '用户管理' }, { val: 'manage_roles', label: '权限配置' }] }
        ];

        const getH = () => ({ 'Authorization': `Bearer ${localStorage.getItem('authToken')}` });
        
        const refresh = async () => {
            const h = getH();
            const [u, r, c, s] = await Promise.all([fetch(`${API_ADMIN}/users`, {headers:h}), fetch(`${API_ADMIN}/roles`, {headers:h}), fetch(`${API_ADMIN}/idea-categories`, {headers:h}), fetch(`${API_SOP}/templates`, {headers:h})]);
            if(u.ok) users.value = await u.json(); 
            if(r.ok) roles.value = await r.json();
            if(c.ok) categories.value = await c.json();
            if(s.ok) sops.value = await s.json();
        };

        const openSOPModal = (sop = null) => {
            if (sop) sopForm.value = JSON.parse(JSON.stringify(sop));
            else sopForm.value = JSON.parse(JSON.stringify(defaultSOPForm));
            if(!sopForm.value.attachments) sopForm.value.attachments = []; // 兼容旧数据
            showSOPModal.value = true;
        };

        // 🔥 多文件上传逻辑
        const handleDocUpload = async (e) => {
            const files = e.target.files;
            if(!files.length) return;
            
            for (let i = 0; i < files.length; i++) {
                const fd = new FormData();
                fd.append('file', files[i]);
                try {
                    const res = await fetch(API_UPLOAD, { method: 'POST', body: fd, headers: getH() });
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

        // 原有基础方法 (省略部分实现细节以匹配模板)
        const addCategory = async () => { if(!newCatName.value) return; await fetch(`${API_ADMIN}/idea-categories`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getH() }, body: JSON.stringify({ name: newCatName.value }) }); newCatName.value = ''; refresh(); };
        const deleteCategory = async (id) => { if(!confirm('删除?')) return; await fetch(`${API_ADMIN}/idea-categories/${id}`, { method: 'DELETE', headers: getH() }); refresh(); };
        const toggleUserActive = async(u)=>{ await fetch(`${API_ADMIN}/users/${u._id}`,{method:'PUT',headers:{'Content-Type':'application/json',...getH()},body:JSON.stringify({isActive:!u.isActive})}); refresh(); };
        const openAssignModal = (u)=>{ editingUser.value=u; selectedRoleIds.value=(u.roles||[]).map(r=>r._id); showAssignModal.value=true; };
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
            showAssignModal, showRoleModal, showSOPModal, systemModules, refresh, addCategory, deleteCategory, toggleUserActive, openAssignModal, saveUserRoles, openRoleModal, saveRole, deleteRole, checkPerm, togglePerm, getMenuName, getActionLabel, openSOPModal, saveSOP, deleteSOP, addStep, removeStep, handleDocUpload
        };
    }
};