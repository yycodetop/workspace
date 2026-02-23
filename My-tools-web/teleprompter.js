/**
 * Teleprompter Component - V19.0 (DOCX 导入支持)
 * 迭代内容：
 * 1. 增加 DOCX 格式课件导入功能。
 * 2. 严格遵循 DOCX 文档内部的换行符（Paragraph）作为提词器的换行依据。
 * 3. 继承 V18 的多行板书等所有核心功能。
 */

const TeleprompterTemplate = `
<div id="teleprompter-root" class="h-full w-full flex flex-col bg-[#0f1014] text-[#e0e0e0] font-sans relative overflow-hidden">
    <component :is="'style'">
        /* --- 核心变量 --- */
        #teleprompter-root {
            --accent: #00d2ff;
            --bg-panel: #1a1b20;
            --bg-dark: #0f1014;
            --border: #333;
            --highlight-color: {{ highlightColor }};
            --reading-size: {{ fontSize }}px;
        }

        /* --- 布局框架 --- */
        .controls { height: 64px; background: var(--bg-panel); border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; padding: 0 20px; z-index: 50; }
        .control-group { display: flex; align-items: center; gap: 12px; }
        .main-layout { display: flex; flex: 1; height: calc(100% - 64px); overflow: hidden; position: relative; }

        /* --- 通用控件 --- */
        button { cursor: pointer; border: none; outline: none; transition: all 0.2s; font-family: inherit; }
        .tool-btn { background: transparent; color: #888; padding: 6px 12px; border-radius: 6px; font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 50px; }
        .tool-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }
        .tool-btn.active { color: var(--accent); background: rgba(0, 210, 255, 0.1); }
        
        .play-btn { width: 48px; height: 48px; border-radius: 50%; background: var(--accent); color: #000; font-size: 20px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(0,210,255,0.3); }
        .play-btn:hover { transform: scale(1.1); box-shadow: 0 0 25px rgba(0,210,255,0.5); }
        .play-btn.pausing { background: #ff9f43; color: #fff; animation: pulse 1s infinite; }

        .param-item { display: flex; align-items: center; gap: 8px; background: #25262e; padding: 4px 12px; border-radius: 20px; border: 1px solid #333; font-size: 12px; height: 32px; }
        .param-item label { color: #666; font-weight: bold; white-space: nowrap; }
        input[type="range"] { width: 100px; height: 4px; background: #555; border-radius: 2px; -webkit-appearance: none; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; border-radius: 50%; background: var(--accent); cursor: pointer; }
        input[type="color"] { width: 24px; height: 24px; border: none; background: none; cursor: pointer; padding: 0; }

        .timer-badge {
            background: #000; border: 1px solid #444; color: #bbb;
            padding: 0 12px; height: 32px; border-radius: 4px; 
            font-family: 'Consolas', monospace; font-size: 14px; font-weight: bold; 
            display: flex; align-items: center; gap: 8px;
            min-width: 110px; justify-content: center;
            box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
        }
        .timer-badge.active { border-color: var(--accent); color: var(--accent); background: rgba(0, 210, 255, 0.05); }
        .timer-label { font-size: 10px; color: #666; font-weight: normal; margin-right: -4px; }

        .share-badge { font-size: 11px; padding: 2px 8px; border-radius: 4px; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.2s; border: 1px solid transparent; }
        .share-badge.private { background: #333; color: #888; border-color: #444; }
        .share-badge.shared { background: rgba(46, 213, 115, 0.15); color: #2ed573; border-color: rgba(46, 213, 115, 0.3); }

        /* --- 左侧提词区 --- */
        .prompter-container { flex: 1; position: relative; overflow-y: auto; background: #000; display: flex; justify-content: center; scroll-behavior: auto; }
        .prompter-container::-webkit-scrollbar { width: 0; }
        .text-content { width: 85%; max-width: 1200px; padding: 45vh 0; counter-reset: line-counter; }

        /* 文本行 */
        .script-line {
            position: relative;
            font-size: var(--reading-size);
            line-height: 1.6;
            color: #ddd;
            padding: 15px 30px 15px 70px;
            margin-bottom: 25px;
            border-radius: 12px;
            border-left: 4px solid transparent;
            transition: all 0.3s ease;
            cursor: pointer;
            display: flex; flex-direction: column; align-items: flex-start; gap: 8px;
        }
        
        .line-text-editable { 
            width: 100%; outline: none; border-bottom: 1px dashed transparent; min-width: 20px; 
            white-space: pre-wrap; text-align: justify;
        }
        .edit-mode .line-text-editable:hover { border-bottom-color: #555; }
        .edit-mode .line-text-editable:focus { border-bottom-color: var(--accent); background: rgba(255,255,255,0.05); }

        /* 行号 */
        .script-line::before {
            counter-increment: line-counter;
            content: counter(line-counter, decimal-leading-zero);
            position: absolute; left: 15px; top: 20px;
            font-size: 16px; color: #444; font-family: monospace; font-weight: bold;
            pointer-events: none; user-select: none;
        }

        /* 播放模式：视觉梯度 */
        .playing .script-line { opacity: 0.15; filter: blur(1px); transition: opacity 0.5s; }
        .playing .script-line.active-reading {
            opacity: 1; filter: blur(0);
            transform: scale(1.01);
            background: linear-gradient(90deg, rgba(255,255,255,0.05), transparent);
            border-left-color: var(--highlight-color);
            box-shadow: -20px 0 40px -20px rgba(0,0,0,0.8);
        }
        .playing .script-line.active-reading .line-text-editable {
            color: var(--highlight-color);
            font-weight: bold;
            text-shadow: 0 0 30px rgba(0,0,0,0.5);
        }
        .playing .script-line.active-reading::before { color: var(--highlight-color); opacity: 0.8; }
        .playing .script-line.preview-1 { opacity: 0.8; filter: blur(0); transform: scale(1); }
        .playing .script-line.preview-1 .line-text-editable { color: #fff; }
        .playing .script-line.preview-2 { opacity: 0.5; filter: blur(0.5px); }
        .playing .script-line.preview-2 .line-text-editable { color: #ccc; }

        /* 板书胶囊 */
        .inline-board-badge {
            display: flex; 
            align-items: flex-start; 
            gap: 10px;
            width: 90%; 
            font-size: 1em; 
            line-height: 1.5;
            background: rgba(0, 210, 255, 0.1); 
            border: 2px solid rgba(0, 210, 255, 0.3); 
            color: var(--accent);
            padding: 8px 16px; border-radius: 8px; 
            font-weight: bold; text-shadow: none; 
            pointer-events: none; user-select: none; 
            margin-top: 5px;
            white-space: pre-wrap; 
            text-align: left;
        }
        .edit-mode .inline-board-badge { opacity: 0.6; cursor: pointer; pointer-events: auto; }
        .inline-board-badge i { margin-top: 4px; } 

        /* 行内编辑按钮 */
        .line-actions {
            position: absolute; right: 10px; top: 10px;
            display: none; gap: 5px;
            background: #000; padding: 4px; border-radius: 6px; border: 1px solid #333;
        }
        .edit-mode .script-line:hover .line-actions { display: flex; }
        .action-btn { 
            width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
            background: #25262e; color: #888; border-radius: 4px; font-size: 12px;
        }
        .action-btn:hover { color: #fff; background: #333; }
        .action-btn.del:hover { color: var(--danger); background: rgba(255,71,87,0.1); }

        .eye-guide { position: absolute; top: 42%; left: 0; width: 100%; height: 0; border-top: 1px dashed rgba(255, 71, 87, 0.4); z-index: 10; pointer-events: none; display: flex; justify-content: space-between; padding: 0 10px; }
        .eye-label { font-size: 10px; color: #ff4757; background: #000; padding: 2px 6px; transform: translateY(-50%); border-radius: 4px; }

        /* --- 右侧面板 --- */
        .right-panel { width: 400px; background: var(--bg-panel); border-left: 1px solid var(--border); display: flex; flex-direction: column; transition: width 0.3s; z-index: 20; }
        .section-monitor { height: 40%; min-height: 250px; display: flex; flex-direction: column; border-bottom: 1px solid var(--border); }
        .section-nav { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #15161a; }
        .panel-header { padding: 10px 15px; background: #202127; font-size: 12px; font-weight: bold; color: #888; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #2a2a2a; }
        .board-viewport { flex: 1; background: #000; margin: 10px; border-radius: 6px; border: 1px solid #333; display: flex; align-items: center; justify-content: center; overflow: hidden; relative; }
        .board-viewport img { width: 100%; height: 100%; object-fit: contain; }
        
        .board-text { 
            font-size: 24px; color: var(--accent); font-weight: bold; text-align: center; 
            padding: 20px; width: 100%; 
            white-space: pre-wrap;
            overflow-y: auto; max-height: 100%;
            display: flex; flex-direction: column; justify-content: center;
        }
        .board-text .katex { color: inherit; } 
        .empty-state { color: #444; font-size: 12px; display: flex; flex-direction: column; align-items: center; gap: 5px; }
        .nav-list { flex: 1; overflow-y: auto; padding: 10px; }
        .nav-item { background: #25262e; border-radius: 6px; padding: 10px 12px; margin-bottom: 8px; border-left: 3px solid transparent; cursor: pointer; transition: all 0.2s; }
        .nav-item:hover { background: #2f303a; }
        .nav-item.active { border-left-color: var(--accent); background: rgba(0, 210, 255, 0.1); }
        .nav-text { font-size: 13px; color: #fff; margin-bottom: 4px; font-weight: bold; }
        .nav-sub { font-size: 11px; color: #666; display: flex; justify-content: space-between; }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #111; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #444; border-radius: 3px; }

        /* 弹窗 */
        .modal-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 200; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px); }
        .modal-panel { background: #1e1e24; width: 450px; padding: 25px; border-radius: 12px; border: 1px solid #444; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
        input[type="text"], input[type="number"], textarea { width: 100%; background: #111; border: 1px solid #333; color: #fff; padding: 10px; border-radius: 6px; margin-bottom: 15px; font-size: 14px; }
        .btn-row { display: flex; justify-content: flex-end; gap: 10px; margin-top: 15px; }
        .btn { padding: 8px 20px; border-radius: 6px; font-size: 12px; font-weight: bold; background: #333; color: #ccc; }
        .btn-primary { background: var(--accent); color: #000; }
        .btn-danger { color: var(--danger); border: 1px solid rgba(255,71,87,0.3); background: transparent; }

        .history-tabs { display: flex; gap: 20px; margin-bottom: 15px; border-bottom: 1px solid #333; }
        .history-tab { padding-bottom: 8px; cursor: pointer; color: #888; font-weight: bold; border-bottom: 2px solid transparent; }
        .history-tab.active { color: var(--accent); border-bottom-color: var(--accent); }
        .history-item { display: flex; justify-content: space-between; align-items: center; background: #25262e; padding: 12px; border-radius: 8px; margin-bottom: 8px; }
        .history-tag { font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 5px; background: #333; color: #aaa; }
        .history-tag.shared { background: rgba(46, 213, 115, 0.1); color: #2ed573; }
        .history-tag.me { background: rgba(0, 210, 255, 0.1); color: var(--accent); }

        @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(255, 159, 67, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(255, 159, 67, 0); } 100% { box-shadow: 0 0 0 0 rgba(255, 159, 67, 0); } }
    </component>

    <div class="controls">
        <div class="control-group">
            <button class="tool-btn" @click="loadHistory"><i class="fa-solid fa-cloud"></i> <span>课件库</span></button>
            <button class="tool-btn" :class="{active: isEditMode}" @click="toggleEdit"><i class="fa-solid fa-pen-to-square"></i> <span>{{ isEditMode ? '完成' : '编辑' }}</span></button>
            <div style="width:1px; height:24px; background:#333; margin:0 5px;"></div>
            <button class="tool-btn" @click="reset"><i class="fa-solid fa-backward-step"></i> <span>重置</span></button>
            <button class="play-btn" :class="{ 'pausing': isAutoPausing }" @click="togglePlay">
                <i v-if="isAutoPausing" class="fa-solid fa-hourglass-half"></i>
                <i v-else :class="isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play'"></i>
            </button>
            <span v-if="isAutoPausing" style="color:#ff9f43; font-weight:bold; font-family:monospace;">{{ pauseCountdown }}s</span>
        </div>

        <div class="control-group">
            <div class="flex flex-col items-center">
                <h2 class="text-sm font-bold text-white tracking-widest opacity-80 mb-1">{{ currentFileName || '未命名课件' }}</h2>
                <div class="share-badge" :class="isShared ? 'shared' : 'private'" @click="toggleShare">
                    <i :class="isShared ? 'fa-solid fa-globe' : 'fa-solid fa-lock'"></i>
                    <span>{{ isShared ? '已共享' : '私有' }}</span>
                </div>
            </div>
        </div>

        <div class="control-group">
            
            <div class="timer-badge" :class="{active: isPlaying}">
                <span class="timer-label">{{ isPlaying ? '剩余' : '预计' }}</span>
                <i class="fa-regular fa-clock"></i>
                <span>{{ timeDisplay }}</span>
            </div>

            <div class="param-item">
                <label>秒/字</label>
                <input type="range" v-model.number="spc" min="0.1" max="1.0" step="0.05">
                <span style="font-family:monospace; width:36px; color:var(--accent); text-align:right;">{{ spc.toFixed(2) }}</span>
            </div>
            <div class="param-item">
                <label>字号</label>
                <input type="range" v-model.number="fontSize" min="28" max="100" step="2">
            </div>
            <div class="param-item">
                <label>高亮</label>
                <input type="color" v-model="highlightColor">
            </div>
            <div class="relative">
                <button class="tool-btn" onclick="document.getElementById('uploadInput').click()">
                    <i class="fa-regular fa-folder-open"></i> <span>导入</span>
                </button>
                <input type="file" id="uploadInput" hidden accept=".json,.txt,.pdf,.docx,.doc" @change="handleUpload">
            </div>
            <button class="tool-btn" @click="handleExport" title="导出备份">
                <i class="fa-solid fa-download"></i> <span>导出</span>
            </button>
            <button class="tool-btn active" @click="togglePanel">
                <i class="fa-solid fa-sidebar"></i> <span>板书</span>
            </button>
        </div>
    </div>

    <div class="main-layout">
        <div class="prompter-container" id="prompter" :class="{ 'playing': isPlaying, 'edit-mode': isEditMode }">
            <div class="text-content" id="content">
                <div v-if="lines.length === 0" style="text-align:center; padding-top:20vh; opacity:0.5;">
                    <i class="fa-solid fa-file-lines text-6xl mb-4"></i>
                    <p>请导入 PDF / TXT / DOCX / JSON 课件</p>
                </div>

                <div v-for="(line, index) in lines" :key="line.id" 
                     :id="line.id"
                     class="script-line" 
                     :class="{ 
                        'active-reading': activeLineId === line.id,
                        'preview-1': isPlaying && index === activeLineIndex + 1,
                        'preview-2': isPlaying && index === activeLineIndex + 2
                     }"
                     @click="handleLineClick(line.id, $event)"
                     @dblclick="handleLineDoubleClick(line.id)">
                    
                    <span class="line-text-editable" 
                          :contenteditable="isEditMode"
                          @blur="handleTextBlur(line.id, $event)"
                          v-text="line.text"></span>
                    
                    <div v-if="notes[line.id]" class="inline-board-badge" @click.stop="handleLineDoubleClick(line.id)">
                        <i class="fa-solid fa-tv"></i> 
                        <span style="flex:1">{{ notes[line.id].text || '图片展示' }}</span>
                        <span v-if="notes[line.id].duration > 0" style="opacity:0.7; font-size:0.8em; margin-left:4px; white-space:nowrap;">(⏳ {{notes[line.id].duration}}s)</span>
                    </div>

                    <div class="line-actions" v-if="isEditMode">
                        <button class="action-btn" title="向上插入" @click.stop="insertLine(line.id, 'before')"><i class="fa-solid fa-arrow-up"></i></button>
                        <button class="action-btn" title="向下插入" @click.stop="insertLine(line.id, 'after')"><i class="fa-solid fa-arrow-down"></i></button>
                        <button class="action-btn del" title="删除此行" @click.stop="deleteLine(line.id)"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>

            <div class="eye-guide">
                <span class="eye-label">EYE LEVEL</span>
                <span class="eye-label">▼</span>
            </div>
        </div>

        <div class="right-panel" v-show="showPanel">
            <div class="section-monitor">
                <div class="panel-header">
                    <span>📺 实时板书</span>
                    <span style="font-size:10px; opacity:0.6;">(KaTeX 支持)</span>
                </div>
                <div class="board-viewport">
                    <img v-if="currentBoardImg" :src="currentBoardImg" class="animate-fade-in">
                    <div v-else-if="currentBoardText" class="board-text" v-html="renderedBoardText"></div>
                    <div v-else class="empty-state">
                        <i class="fa-regular fa-image text-3xl"></i>
                        <span>等待触发</span>
                    </div>
                </div>
            </div>

            <div class="section-nav">
                <div class="panel-header" style="border-top:1px solid #333;">
                    <span>📍 节点大纲</span>
                    <span style="font-size:10px; color:var(--accent);">共 {{ Object.keys(notes).length }} 个</span>
                </div>
                <div class="nav-list custom-scrollbar">
                    <div v-if="Object.keys(notes).length === 0" style="text-align:center; color:#666; margin-top:30px; font-size:12px;">暂无节点</div>
                    <div v-for="(note, id) in sortedNotes" :key="id" 
                         class="nav-item" :class="{active: activeLineId === id}"
                         @click="scrollToLine(id)">
                        <div class="nav-text">{{ note.text || '图片展示' }}</div>
                        <div class="nav-sub">
                            <span>行 {{ getLineIndex(id) }}</span>
                            <span v-if="note.duration > 0" style="color:#ff9f43;">⏳ {{ note.duration }}s</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-if="showNoteModal" class="modal-mask">
        <div class="modal-panel animate-bounce-in">
            <h3 class="text-white font-bold mb-4">📺 添加板书/备注</h3>
            <label class="block text-gray-500 text-xs mb-2">板书内容 (支持公式 $$...$$)</label>
            <textarea v-model="editForm.note" rows="3" placeholder="例如：公式推导 $$x = \\frac{-b}{2a}$$&#10;支持多行输入..."></textarea>
            <label class="block text-gray-500 text-xs mb-2">停顿时间 (秒)</label>
            <input type="number" v-model.number="editForm.duration" min="0" placeholder="0 表示不停顿">
            <label class="block text-gray-500 text-xs mb-2">图片 URL (可选)</label>
            <input type="text" v-model="editForm.img" placeholder="https://...">
            <div class="btn-row">
                <button v-if="notes[editingId]" @click="deleteNote" class="btn btn-danger">删除板书</button>
                <div style="flex:1"></div>
                <button @click="showNoteModal = false" class="btn">取消</button>
                <button @click="saveNote" class="btn btn-primary">保存</button>
            </div>
        </div>
    </div>
    
    <div v-if="showHistoryModal" class="modal-mask">
        <div class="modal-panel" style="width:600px; height:500px; display:flex; flex-direction:column;">
            <div class="flex justify-between items-center mb-4 text-white">
                <h3 class="font-bold">☁️ 课件库</h3>
                <button @click="showHistoryModal = false">✕</button>
            </div>
            
            <div class="history-tabs">
                <div class="history-tab" :class="{active: historyTab==='my'}" @click="historyTab='my'">👤 我的课件</div>
                <div class="history-tab" :class="{active: historyTab==='shared'}" @click="historyTab='shared'">🌐 团队资源池</div>
            </div>

            <div class="custom-scrollbar flex-1 overflow-y-auto space-y-2">
                <div v-for="s in currentHistoryList" :key="s._id" class="history-item">
                    <div>
                        <div class="text-white font-bold text-sm flex items-center gap-2">
                            {{ s.title }}
                            <span v-if="historyTab==='my' && s.isShared" class="history-tag shared">已共享</span>
                            <span v-if="historyTab==='shared' && s.isMine" class="history-tag me">我</span>
                            <span v-if="historyTab==='shared' && s.userId && !s.isMine" class="history-tag">{{ s.userId.name || '同事' }}</span>
                        </div>
                        <div class="text-gray-500 text-xs mt-1">{{ new Date(s.lastModified).toLocaleDateString() }}</div>
                    </div>
                    <div class="flex gap-2">
                        <button class="btn btn-primary py-1 px-3" @click="loadScript(s._id)">载入</button>
                        <button v-if="historyTab==='my'" class="btn btn-danger py-1 px-3" @click="deleteScript(s._id)">删除</button>
                    </div>
                </div>
                <div v-if="currentHistoryList.length===0" class="text-center text-gray-600 py-10">暂无数据</div>
            </div>
        </div>
    </div>

    <div v-if="toastMsg" class="fixed bottom-10 left-1/2 -translate-x-1/2 z-[3000] bg-gray-800 border border-cyan-500 text-cyan-400 px-6 py-2 rounded-full font-bold shadow-lg animate-fade-in-up">
        {{ toastMsg }}
    </div>
</div>
`;

const TeleprompterComponent = {
    template: TeleprompterTemplate,
    setup() {
        const { ref, computed, onMounted, onUnmounted, nextTick } = Vue;
        
        // State
        const lines = ref([]);
        const notes = ref({});
        const currentFileName = ref('');
        const currentScriptId = ref(null);
        
        // Settings: spc = Seconds Per Character
        const spc = ref(0.2); 
        const fontSize = ref(46);
        const highlightColor = ref('#00d2ff');
        const isShared = ref(false);
        
        // UI
        const isPlaying = ref(false);
        const isAutoPausing = ref(false);
        const pauseCountdown = ref(0);
        const isEditMode = ref(false);
        const showPanel = ref(true);
        const activeLineId = ref(null);
        const activeLineIndex = ref(-1);
        const currentScrollY = ref(0);

        // Modals
        const showNoteModal = ref(false);
        const editingId = ref(null);
        const editForm = ref({ text: '', note: '', img: '', duration: 0 });
        const showHistoryModal = ref(false);
        const historyTab = ref('my'); 
        const myScripts = ref([]);
        const sharedScripts = ref([]);
        const toastMsg = ref('');

        let animationFrame = null;
        let lastTime = 0;
        let autoPauseTimer = null;

        const getH = () => ({ 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('authToken')}` });
        const showToast = (m, type='info') => { toastMsg.value = m; setTimeout(() => toastMsg.value = '', 2500); };

        // --- Core Logic ---
        const animate = (timestamp) => {
            if (!isPlaying.value || isAutoPausing.value) return;
            if (!lastTime) lastTime = timestamp;
            const deltaTime = (timestamp - lastTime) / 1000;
            lastTime = timestamp;

            const container = document.getElementById('prompter');
            
            // Dynamic speed calculation
            let currentLineHeight = 100;
            let currentCharCount = 20;
            if (activeLineId.value) {
                const el = document.getElementById(activeLineId.value);
                if (el) {
                    currentLineHeight = el.offsetHeight + 25; 
                    currentCharCount = Math.max(2, (lines.value.find(l => l.id === activeLineId.value)?.text || "").length);
                }
            }
            const timeForLine = currentCharCount * spc.value;
            const speedPx = currentLineHeight / timeForLine;
            
            currentScrollY.value += speedPx * deltaTime;
            container.scrollTop = currentScrollY.value;

            checkActiveLine();
            animationFrame = requestAnimationFrame(animate);
        };

        const checkActiveLine = () => {
            const container = document.getElementById('prompter');
            const eyeLevel = container.scrollTop + (container.offsetHeight * 0.42);
            let foundId = null;
            let foundIndex = -1;
            
            const els = document.querySelectorAll('.script-line');
            for (let i = 0; i < els.length; i++) {
                const el = els[i];
                if (el.offsetTop <= eyeLevel && (el.offsetTop + el.offsetHeight) > eyeLevel) {
                    foundId = el.id; foundIndex = i; break;
                }
            }
            if (foundId && foundId !== activeLineId.value) {
                activeLineId.value = foundId;
                activeLineIndex.value = foundIndex;
                const note = notes.value[foundId];
                if (note && note.duration > 0 && isPlaying.value) triggerAutoPause(note.duration);
            }
        };

        const triggerAutoPause = (seconds) => {
            isAutoPausing.value = true;
            pauseCountdown.value = seconds;
            showToast(`板书停顿: ${seconds}秒`);
            autoPauseTimer = setInterval(() => {
                pauseCountdown.value--;
                if (pauseCountdown.value <= 0) {
                    clearInterval(autoPauseTimer);
                    isAutoPausing.value = false;
                    lastTime = 0;
                    animationFrame = requestAnimationFrame(animate);
                }
            }, 1000);
        };

        // --- Time Display ---
        const formatTime = (seconds) => {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        };

        const calculateDuration = (startIndex = 0) => {
            let totalSeconds = 0;
            if (isAutoPausing.value && startIndex === activeLineIndex.value) {
                totalSeconds += pauseCountdown.value; 
            }
            for (let i = startIndex; i < lines.value.length; i++) {
                const line = lines.value[i];
                const charCount = Math.max(2, (line.text || '').length);
                totalSeconds += charCount * spc.value;
                const note = notes.value[line.id];
                if (note && note.duration) {
                    if (i === activeLineIndex.value && isAutoPausing.value) continue;
                    totalSeconds += note.duration;
                }
            }
            return totalSeconds;
        };

        const timeDisplay = computed(() => {
            const seconds = calculateDuration(isPlaying.value ? Math.max(0, activeLineIndex.value) : 0);
            return formatTime(seconds);
        });

        // --- Actions ---
        const togglePlay = () => {
            if (isAutoPausing.value) {
                clearInterval(autoPauseTimer); isAutoPausing.value = false;
                lastTime = 0; animationFrame = requestAnimationFrame(animate); return;
            }
            isPlaying.value = !isPlaying.value;
            if (isPlaying.value) {
                isEditMode.value = false; lastTime = 0;
                currentScrollY.value = document.getElementById('prompter').scrollTop;
                animationFrame = requestAnimationFrame(animate);
            } else { cancelAnimationFrame(animationFrame); }
        };

        const reset = () => {
            isPlaying.value = false; isAutoPausing.value = false;
            clearInterval(autoPauseTimer); cancelAnimationFrame(animationFrame);
            currentScrollY.value = 0; document.getElementById('prompter').scrollTop = 0;
            activeLineId.value = null; activeLineIndex.value = -1;
        };

        const handleLineClick = (id, event) => {
            if (!isEditMode.value) {
                if (isPlaying.value) togglePlay();
                scrollToLine(id);
            }
        };

        const handleTextBlur = (id, event) => {
            const newText = event.target.innerText;
            const idx = lines.value.findIndex(l => l.id === id);
            if(idx !== -1 && lines.value[idx].text !== newText) {
                lines.value[idx].text = newText;
                saveToServer(); 
            }
        };

        const handleLineDoubleClick = (id) => {
            editingId.value = id;
            const note = notes.value[id] || {};
            editForm.value = { note: note.text||'', img: note.img||'', duration: note.duration||0 };
            showNoteModal.value = true;
        };

        const scrollToLine = (id) => {
            const el = document.getElementById(id);
            const container = document.getElementById('prompter');
            if(el) {
                currentScrollY.value = el.offsetTop - (container.offsetHeight * 0.42);
                container.scrollTop = currentScrollY.value;
                activeLineId.value = id;
                activeLineIndex.value = lines.value.findIndex(l => l.id === id);
            }
        };

        const toggleEdit = () => {
            isEditMode.value = !isEditMode.value;
            if(!isEditMode.value) saveToServer();
        };

        const insertLine = (targetId, pos) => {
            const idx = lines.value.findIndex(l => l.id === targetId);
            const newId = `L-${Date.now()}`;
            const newLine = { id: newId, text: '（新行）' };
            if (pos === 'before') lines.value.splice(idx, 0, newLine);
            else lines.value.splice(idx + 1, 0, newLine);
            saveToServer();
        };

        const deleteLine = (id) => {
            if(!confirm('确定删除此行？')) return;
            lines.value = lines.value.filter(l => l.id !== id);
            delete notes.value[id];
            saveToServer();
        };

        const saveNote = () => {
            if (editForm.value.note || editForm.value.img || editForm.value.duration > 0) {
                notes.value[editingId.value] = { text: editForm.value.note, img: editForm.value.img, duration: editForm.value.duration };
            } else { delete notes.value[editingId.value]; }
            showNoteModal.value = false;
            saveToServer();
        };

        const deleteNote = () => { delete notes.value[editingId.value]; showNoteModal.value = false; saveToServer(); };

        const toggleShare = () => { isShared.value = !isShared.value; saveToServer(); showToast(isShared.value ? '已设为共享' : '已设为私有'); };

        const handleExport = () => {
            if(!currentFileName.value) return showToast('无内容可导出', 'error');
            const data = {
                title: currentFileName.value,
                content: lines.value.map(l => l.text),
                notes: notes.value,
                lineOrder: lines.value.map(l => l.id),
                overrides: lines.value.reduce((acc, l) => { acc[l.id] = l.text; return acc; }, {}),
                fontSize: fontSize.value,
                scrollSpeed: spc.value
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${currentFileName.value}_backup.json`;
            a.click();
            showToast('已导出 JSON');
        };

        const handleUpload = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const ext = file.name.split('.').pop().toLowerCase();
            
            if (ext === 'json') {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const data = JSON.parse(ev.target.result);
                        currentFileName.value = data.title || file.name.replace('.json', '');
                        if(data.scrollSpeed) spc.value = data.scrollSpeed; 
                        if(data.fontSize) fontSize.value = data.fontSize;
                        notes.value = data.notes || {};
                        if(data.lineOrder && data.overrides) {
                            lines.value = data.lineOrder.map(lid => ({ id: lid, text: data.overrides[lid] || '' }));
                        } else if(data.content) {
                            lines.value = data.content.map((t, i) => ({ id: `L-${Date.now()}-${i}`, text: t }));
                        }
                        currentScriptId.value = null; isShared.value = false;
                        saveToServer();
                        showToast('JSON 备份已恢复');
                    } catch(e) { showToast('文件格式错误', 'error'); }
                };
                reader.readAsText(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = async (ev) => {
                let rawLines = [];
                
                if (ext === 'pdf') {
                    showToast('PDF 解析中...');
                    const typedarray = new Uint8Array(ev.target.result);
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    for(let i=1; i<=pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        const items = content.items;
                        items.sort((a,b) => { const yDiff = b.transform[5] - a.transform[5]; return Math.abs(yDiff) > 5 ? yDiff : a.transform[4] - b.transform[4]; });
                        let buffer = ""; let lastY = null;
                        items.forEach(item => {
                            const curY = item.transform[5];
                            const height = item.transform[3] || 12;
                            if (lastY !== null && (lastY - curY > height * 1.8)) { if(buffer.trim()) rawLines.push(buffer); buffer = ""; }
                            buffer += item.str; lastY = curY;
                        });
                        if(buffer.trim()) rawLines.push(buffer);
                    }
                } else if (ext === 'docx' || ext === 'doc') {
                    showToast('DOCX 解析中...');
                    if (typeof mammoth === 'undefined') {
                        showToast('缺少解析库，请在 index.html 引入 mammoth.js', 'error');
                        return;
                    }
                    try {
                        // 使用 mammoth 提取纯文本，它会完美保留原有文档段落的换行逻辑
                        const result = await mammoth.extractRawText({ arrayBuffer: ev.target.result });
                        // 兼容各种操作系统的换行符，严格按换行进行拆分
                        rawLines = result.value.split(/\r?\n/);
                    } catch (err) {
                        showToast('DOCX 解析失败，请确认是否为有效文档', 'error');
                        console.error(err);
                        return;
                    }
                } else { 
                    // txt 处理
                    rawLines = ev.target.result.split(/\r?\n/); 
                }
                
                // 过滤掉空白行，并将文本装配为提词器的行结构
                lines.value = rawLines.map((t, i) => ({ id: `L-${Date.now()}-${i}`, text: t.trim() })).filter(l => l.text);
                notes.value = {}; currentFileName.value = file.name.replace(/\.[^/.]+$/, ""); currentScriptId.value = null; isShared.value = false;
                saveToServer(); 
                showToast(`导入成功: ${lines.value.length} 段`);
            };
            
            // DOCX / PDF 需要读成 ArrayBuffer
            if (ext === 'pdf' || ext === 'docx' || ext === 'doc') {
                reader.readAsArrayBuffer(file); 
            } else {
                reader.readAsText(file);
            }
        };

        const saveToServer = async () => {
            try {
                const payload = {
                    title: currentFileName.value,
                    content: [], 
                    overrides: lines.value.reduce((acc, l) => { acc[l.id] = l.text; return acc; }, {}),
                    lineOrder: lines.value.map(l => l.id),
                    notes: notes.value,
                    scrollSpeed: spc.value, 
                    fontSize: fontSize.value,
                    isShared: isShared.value,
                    _id: currentScriptId.value
                };
                const res = await fetch('/api/scripts', { method: 'POST', headers: getH(), body: JSON.stringify(payload) });
                if (res.ok) { const data = await res.json(); currentScriptId.value = data._id; }
            } catch(e) {}
        };

        const loadHistory = async () => {
            showHistoryModal.value = true;
            const res = await fetch('/api/scripts', { headers: getH() });
            if (res.ok) {
                const data = await res.json();
                myScripts.value = data.myScripts || [];
                const others = data.sharedScripts || [];
                const mineShared = (data.myScripts || []).filter(s => s.isShared).map(s => ({...s, isMine: true}));
                const map = new Map();
                [...others, ...mineShared].forEach(s => map.set(s._id, s));
                sharedScripts.value = Array.from(map.values()).sort((a,b) => new Date(b.lastModified) - new Date(a.lastModified));
            }
        };

        const loadScript = async (id) => {
            const res = await fetch(`/api/scripts/${id}`, { headers: getH() });
            if(res.ok) {
                const data = await res.json();
                const isMine = myScripts.value.some(s => s._id === data._id);
                if (isMine) { currentScriptId.value = data._id; currentFileName.value = data.title; isShared.value = data.isShared; }
                else { currentScriptId.value = null; currentFileName.value = data.title + " (副本)"; isShared.value = false; showToast('已保存为副本'); setTimeout(saveToServer, 500); }
                spc.value = data.scrollSpeed || 0.3; 
                if(data.fontSize) fontSize.value = data.fontSize;
                notes.value = data.notes || {};
                if (data.lineOrder && data.lineOrder.length > 0) { lines.value = data.lineOrder.map(lid => ({ id: lid, text: data.overrides ? data.overrides[lid] : '' })); }
                else if (data.content) { lines.value = data.content.map((t, i) => ({ id: `L-${Date.now()}-${i}`, text: t })); }
                showHistoryModal.value = false;
            }
        };

        const deleteScript = async (id) => {
            if(!confirm('删除?')) return;
            await fetch(`/api/scripts/${id}`, { method: 'DELETE', headers: getH() });
            loadHistory();
        };

        const currentBoardImg = computed(() => activeLineId.value && notes.value[activeLineId.value]?.img);
        const currentBoardText = computed(() => activeLineId.value && notes.value[activeLineId.value]?.text);
        
        const renderedBoardText = computed(() => {
            const text = currentBoardText.value || '';
            if (window.katex && (text.includes('$$') || text.includes('\\'))) {
                try { return text.replace(/\$\$(.*?)\$\$/g, (m, c) => katex.renderToString(c, {throwOnError:false})); } catch(e) { return text; }
            }
            return text;
        });

        const currentHistoryList = computed(() => historyTab.value === 'my' ? myScripts.value : sharedScripts.value);
        const sortedNotes = computed(() => {
            const keys = Object.keys(notes.value).sort((a,b) => lines.value.findIndex(l => l.id === a) - lines.value.findIndex(l => l.id === b));
            const res = {}; keys.forEach(k => res[k] = notes.value[k]); return res;
        });
        const getLineIndex = (id) => lines.value.findIndex(l => l.id === id) + 1;

        onMounted(() => {
            if (window.pdfjsLib) pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            window.addEventListener('keydown', (e) => {
                if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && !document.activeElement.isContentEditable) {
                    e.preventDefault(); togglePlay();
                }
            });
        });

        onUnmounted(() => { cancelAnimationFrame(animationFrame); clearInterval(autoPauseTimer); });

        return {
            lines, notes, currentFileName, spc, fontSize, highlightColor, isShared,
            isPlaying, isAutoPausing, pauseCountdown, isEditMode, showPanel, activeLineId, activeLineIndex,
            showNoteModal, editForm, showHistoryModal, historyTab, currentHistoryList, toastMsg,
            togglePlay, reset, toggleEdit, handleLineClick, handleLineDoubleClick, scrollToLine, handleTextBlur,
            handleUpload, handleExport, loadHistory, loadScript, deleteScript,
            insertLine, deleteLine, saveNote, deleteNote, toggleShare,
            currentBoardImg, currentBoardText, renderedBoardText, sortedNotes, getLineIndex,
            timeDisplay,
            togglePanel: () => showPanel.value = !showPanel.value,
            closeModal: () => showNoteModal.value = false
        };
    }
};