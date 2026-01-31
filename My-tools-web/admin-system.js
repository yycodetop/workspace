/**
 * Admin System - V2.5 (Resource Hub Permissions Enabled)
 * 更新：正式加入 "资源补给" 权限配置项
 */
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
                <button @click="currentTab = 'cats'" :class="['px-4 py-2 rounded-lg transition-all', currentTab === 'cats' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-white']">创意分类</button>
            </div>
        </div>
        <button @click="refresh" class="w-10 h-10 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all"><i class="fa-solid fa-rotate"></i></button>
    </div>

    <div class="flex-1 overflow-auto p-8 custom-scrollbar">
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
                <div class="flex gap-3 mb-8"><input v-model="newCatName" placeholder="输入新分类名称 (如: 团建活动)" class="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:border-purple-500 outline-none"><button @click="addCategory" class="bg-purple-600 hover:bg-purple-500 text-white px-6 font-bold rounded-lg transition-all"><i class="fa-solid fa-plus"></i> 添加</button></div>
                <div class="space-y-3"><div v-if="categories.length === 0" class="text-center text-gray-500 py-4">暂无分类，请添加</div><div v-for="cat in categories" :key="cat._id" class="flex justify-between items-center bg-white/5 p-4 rounded-lg border border-white/5 group hover:border-purple-500/30 transition-colors"><span class="text-gray-200 font-bold">{{ cat.name }}</span><button @click="deleteCategory(cat._id)" class="text-gray-500 hover:text-red-400 transition-colors"><i class="fa-solid fa-trash"></i></button></div></div>
            </div>
        </div>
    </div>

    <div v-if="showAssignModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><div class="bg-[#1a1c26] w-full max-w-md rounded-2xl border border-white/10 p-6"><h3 class="text-lg font-bold text-white mb-4">为 {{ editingUser.name }} 分配角色</h3><div class="space-y-2 mb-6 max-h-60 overflow-y-auto"><label v-for="role in roles" :key="role._id" class="flex items-center gap-3 p-3 rounded bg-white/5 cursor-pointer hover:bg-white/10"><input type="checkbox" :value="role._id" v-model="selectedRoleIds" class="w-4 h-4 rounded bg-gray-700 accent-purple-500"><span class="text-sm font-bold text-gray-200">{{ role.name }}</span></label></div><div class="flex justify-end gap-3"><button @click="showAssignModal = false" class="text-gray-400 text-sm">取消</button><button @click="saveUserRoles" class="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold">保存</button></div></div></div>
    
    <div v-if="showRoleModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"><div class="bg-[#1a1c26] w-full max-w-3xl rounded-2xl border border-white/10 p-6 flex flex-col max-h-[90vh]"><h3 class="text-lg font-bold text-white mb-6">{{ roleForm._id ? '编辑方案' : '新建方案' }}</h3><div class="flex gap-4 mb-6"><input v-model="roleForm.name" placeholder="方案名称" class="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-purple-500"><input v-model="roleForm.description" placeholder="描述" class="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-2 text-white text-sm outline-none focus:border-purple-500"></div><div class="flex-1 overflow-y-auto custom-scrollbar border border-white/5 rounded-xl bg-black/20 p-4"><table class="w-full text-left text-sm"><thead><tr class="text-gray-500 border-b border-white/10"><th class="pb-2 w-1/4">模块</th><th class="pb-2">权限</th></tr></thead><tbody class="divide-y divide-white/5"><tr v-for="module in systemModules" :key="module.id"><td class="py-4 text-gray-300 font-bold">{{ module.label }}</td><td class="py-4"><div class="flex flex-wrap gap-4"><label v-for="action in module.actions" :key="action.val" class="flex items-center gap-2 cursor-pointer select-none group"><input type="checkbox" :checked="checkPerm(module.id, action.val)" @change="togglePerm(module.id, action.val)" class="w-4 h-4 rounded bg-gray-700 accent-purple-500"><span class="text-gray-400 group-hover:text-white transition-colors">{{ action.label }}</span></label></div></td></tr></tbody></table></div><div class="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10"><button @click="showRoleModal = false" class="text-gray-400 text-sm">取消</button><button @click="saveRole" class="bg-purple-600 text-white px-6 py-2 rounded-lg text-sm font-bold">保存</button></div></div></div>
</div>
`;

const AdminSystemComponent = {
    template: AdminSystemTemplate,
    setup() {
        const { ref, reactive, onMounted } = Vue;
        const API_BASE = '/api/admin';
        const currentTab = ref('users');
        const users = ref([]);
        const roles = ref([]);
        const categories = ref([]);
        const newCatName = ref('');
        
        const showAssignModal = ref(false);
        const showRoleModal = ref(false);
        const editingUser = ref({});
        const selectedRoleIds = ref([]);
        const roleForm = ref({ _id: null, name: '', description: '', permissions: {} });

        // 🔥 系统权限字典 (已包含资源补给站)
        const systemModules = [
            { 
                id: 'projects', label: '项目管理', 
                actions: [
                    { val: 'create', label: '立项权' },
                    { val: 'edit', label: '编辑项目' },
                    { val: 'delete', label: '删除项目' },
                    { val: 'view_stats', label: '查看绩效' }
                ] 
            },
            { 
                id: 'tasks', label: '任务指挥', 
                actions: [
                    { val: 'view_all', label: '查看全员任务' },
                    { val: 'create', label: '发布任务' },
                    { val: 'edit', label: '编辑任务' },
                    { val: 'delete', label: '删除任务' },
                    { val: 'assign', label: '指派给他人' },
                    { val: 'edit_all', label: '编辑他人任务' },
                    { val: 'view_stats', label: '查看总看板' }
                ] 
            },
            { 
                // 🔥 资源补给站权限
                id: 'resources', label: '资源补给', 
                actions: [
                    { val: 'create', label: '分享资源' }, // 允许新增
                    { val: 'manage', label: '管理(编辑/删除他人)' } // 管理员权限
                ] 
            },
            { 
                id: 'ideas', label: '创意树洞', 
                actions: [
                    { val: 'create', label: '提交创意' },
                    { val: 'review', label: '评审与决策' }
                ] 
            },
            { 
                id: 'admin', label: '系统设置', 
                actions: [
                    { val: 'view', label: '后台访问' },
                    { val: 'manage_users', label: '用户管理' },
                    { val: 'manage_roles', label: '权限配置' }
                ] 
            }
        ];

        const getH = () => ({ 'Authorization': `Bearer ${localStorage.getItem('authToken')}` });
        
        const refresh = async () => {
            const [u, r, c] = await Promise.all([fetch(`${API_BASE}/users`, {headers:getH()}), fetch(`${API_BASE}/roles`, {headers:getH()}), fetch(`${API_BASE}/idea-categories`, {headers:getH()})]);
            if(u.ok) users.value = await u.json(); 
            if(r.ok) roles.value = await r.json();
            if(c.ok) categories.value = await c.json();
        };

        const addCategory = async () => { if(!newCatName.value) return; await fetch(`${API_BASE}/idea-categories`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...getH() }, body: JSON.stringify({ name: newCatName.value }) }); newCatName.value = ''; refresh(); };
        const deleteCategory = async (id) => { if(!confirm('删除?')) return; await fetch(`${API_BASE}/idea-categories/${id}`, { method: 'DELETE', headers: getH() }); refresh(); };
        const toggleUserActive = async(u)=>{ await fetch(`${API_BASE}/users/${u._id}`,{method:'PUT',headers:{'Content-Type':'application/json',...getH()},body:JSON.stringify({isActive:!u.isActive})}); refresh(); };
        const openAssignModal = (u)=>{ editingUser.value=u; selectedRoleIds.value=(u.roles||[]).map(r=>r._id); showAssignModal.value=true; };
        const saveUserRoles = async()=>{ await fetch(`${API_BASE}/users/${editingUser.value._id}`,{method:'PUT',headers:{'Content-Type':'application/json',...getH()},body:JSON.stringify({roles:selectedRoleIds.value})}); showAssignModal.value=false; refresh(); };
        const openRoleModal = (r)=>{ roleForm.value = r ? JSON.parse(JSON.stringify(r)) : { _id:null, name:'', description:'', permissions:{} }; if(!roleForm.value.permissions) roleForm.value.permissions={}; showRoleModal.value=true; };
        const checkPerm = (m,a) => roleForm.value.permissions[m]?.includes(a);
        const togglePerm = (m,a) => { const p=roleForm.value.permissions; if(!p[m]) p[m]=[]; p[m].includes(a)?p[m]=p[m].filter(x=>x!==a):p[m].push(a); };
        const saveRole = async()=>{ await fetch(`${API_BASE}/roles`,{method:'POST',headers:{'Content-Type':'application/json',...getH()},body:JSON.stringify(roleForm.value)}); showRoleModal.value=false; refresh(); };
        const deleteRole = async(id)=>{ if(confirm('删除?')) await fetch(`${API_BASE}/roles/${id}`,{method:'DELETE',headers:getH()}); refresh(); };
        const getMenuName = (id) => systemModules.find(m=>m.id===id)?.label||id;
        const getActionLabel = (mid, val) => systemModules.find(m=>m.id===mid)?.actions.find(a=>a.val===val)?.label || val;

        onMounted(refresh);
        return { currentTab, users, roles, categories, newCatName, systemModules, showAssignModal, showRoleModal, editingUser, selectedRoleIds, roleForm, refresh, addCategory, deleteCategory, toggleUserActive, openAssignModal, saveUserRoles, openRoleModal, saveRole, deleteRole, checkPerm, togglePerm, getMenuName, getActionLabel };
    }
};