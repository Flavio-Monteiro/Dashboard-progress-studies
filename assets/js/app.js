// Variáveis globais
let currentTheme = localStorage.getItem('theme') || 'light';
let timerInterval;
let timerSeconds = 25 * 60;
let isTimerRunning = false;
let timerType = 'focus'; // 'focus', 'shortBreak', 'longBreak'
let cyclesCompleted = 0;
let totalFocusedTime = 0;
let draggingItem = null;


// Inicialização
document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initSidebar();
    initModals();
    loadData();
    initPomodoro();
    initKanban();
    initCalendar();
    updateDashboardStats();
    renderCharts();
});

// Tema
function initTheme() {
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    }

    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function toggleTheme() {
    if (currentTheme === 'light') {
        currentTheme = 'dark';
        document.body.setAttribute('data-theme', 'dark');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        currentTheme = 'light';
        document.body.removeAttribute('data-theme');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
    }
    localStorage.setItem('theme', currentTheme);
}

// Sidebar
function initSidebar() {
    const menuItems = document.querySelectorAll('.sidebar-menu a');

    menuItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all items
            menuItems.forEach(i => i.classList.remove('active'));

            // Add active class to clicked item
            this.classList.add('active');

            // Hide all sections
            document.querySelectorAll('section').forEach(section => {
                section.style.display = 'none';
            });

            // Show selected section
            const sectionId = this.getAttribute('data-section') + '-section';
            document.getElementById(sectionId).style.display = 'block';
        });
    });
}

// Modais
function initModals() {
    // Disciplinas
    document.getElementById('new-graduacao-btn').addEventListener('click', () => openModal('disciplina', null));
    document.getElementById('add-disciplina-btn').addEventListener('click', () => openModal('disciplina', null));
    document.getElementById('close-disciplina-modal').addEventListener('click', () => closeModal('disciplina'));
    document.getElementById('cancel-disciplina').addEventListener('click', () => closeModal('disciplina'));
    document.getElementById('disciplina-form').addEventListener('submit', saveDisciplina);

    // Extensão
    document.getElementById('new-extensao-btn').addEventListener('click', () => openModal('extensao', null));
    document.getElementById('close-extensao-modal').addEventListener('click', () => closeModal('extensao'));
    document.getElementById('cancel-extensao').addEventListener('click', () => closeModal('extensao'));
    document.getElementById('extensao-form').addEventListener('submit', saveExtensao);

    // Atividades
    document.getElementById('new-atividade-kanban-btn').addEventListener('click', () => openModal('atividade', null));
    document.getElementById('add-atividade-btn').addEventListener('click', () => openModal('atividade', null));
    document.getElementById('close-atividade-modal').addEventListener('click', () => closeModal('atividade'));
    document.getElementById('cancel-atividade').addEventListener('click', () => closeModal('atividade'));
    document.getElementById('atividade-form').addEventListener('submit', saveAtividade);

    // Anotações
    document.getElementById('new-anotacao-btn').addEventListener('click', () => openModal('anotacao', null));
    document.getElementById('close-anotacao-modal').addEventListener('click', () => closeModal('anotacao'));
    document.getElementById('cancel-anotacao').addEventListener('click', () => closeModal('anotacao'));
    document.getElementById('anotacao-form').addEventListener('submit', saveAnotacao);

    // Lembretes
    document.getElementById('new-lembrete-btn').addEventListener('click', () => openModal('lembrete', null));
    document.getElementById('close-lembrete-modal').addEventListener('click', () => closeModal('lembrete'));
    document.getElementById('cancel-lembrete').addEventListener('click', () => closeModal('lembrete'));
    document.getElementById('lembrete-form').addEventListener('submit', saveLembrete);

    // Metas
    document.getElementById('new-meta-btn').addEventListener('click', () => openModal('meta', null));
    document.getElementById('add-meta-btn').addEventListener('click', () => openModal('meta', null));
    document.getElementById('close-meta-modal').addEventListener('click', () => closeModal('meta'));
    document.getElementById('cancel-meta').addEventListener('click', () => closeModal('meta'));
    document.getElementById('meta-form').addEventListener('submit', saveMeta);
}

function openModal(type, id) {
    const modal = document.getElementById(`${type}-modal`);
    const title = document.getElementById(`${type}-modal-title`);

    if (id) {
        // Edição
        title.textContent = `Editar ${getModalTitle(type)}`;
        fillModalForm(type, id);
    } else {
        // Novo
        title.textContent = `Novo ${getModalTitle(type)}`;
        document.getElementById(`${type}-form`).reset();
        document.getElementById(`${type}-id`).value = '';

        // Preencher selects se necessário
        if (type === 'atividade') {
            fillDisciplinasSelect();
        }
    }

    modal.classList.add('active');
}

function closeModal(type) {
    document.getElementById(`${type}-modal`).classList.remove('active');
}

function getModalTitle(type) {
    const titles = {
        'disciplina': 'Disciplina',
        'extensao': 'Curso de Extensão',
        'atividade': 'Atividade',
        'anotacao': 'Anotação',
        'lembrete': 'Lembrete',
        'meta': 'Meta SMART'
    };
    return titles[type] || '';
}

function fillModalForm(type, id) {
    const data = getDataFromStorage(type);
    const item = data.find(item => item.id === id);

    if (!item) return;

    const form = document.getElementById(`${type}-form`);
    form.reset();

    document.getElementById(`${type}-id`).value = id;

    for (const key in item) {
        if (key !== 'id' && document.getElementById(`${type}-${key}`)) {
            document.getElementById(`${type}-${key}`).value = item[key];
        }
    }

    // Preencher selects se necessário
    if (type === 'atividade') {
        fillDisciplinasSelect();
    }
}

function fillDisciplinasSelect() {
    const select = document.getElementById('atividade-disciplina');
    select.innerHTML = '<option value="">Nenhum</option>';

    const disciplinas = getDataFromStorage('disciplina');
    const cursos = getDataFromStorage('extensao');

    if (disciplinas.length > 0) {
        const optgroupDisciplinas = document.createElement('optgroup');
        optgroupDisciplinas.label = 'Disciplinas';
        disciplinas.forEach(d => {
            const option = document.createElement('option');
            option.value = `disciplina_${d.id}`;
            option.textContent = d.nome;
            optgroupDisciplinas.appendChild(option);
        });
        select.appendChild(optgroupDisciplinas);
    }

    if (cursos.length > 0) {
        const optgroupCursos = document.createElement('optgroup');
        optgroupCursos.label = 'Cursos de Extensão';
        cursos.forEach(c => {
            const option = document.createElement('option');
            option.value = `extensao_${c.id}`;
            option.textContent = c.nome;
            optgroupCursos.appendChild(option);
        });
        select.appendChild(optgroupCursos);
    }
}

// Data Management
function loadData() {
    // Inicializar dados se não existirem
    if (!localStorage.getItem('disciplina')) {
        localStorage.setItem('disciplina', JSON.stringify([]));
    }
    if (!localStorage.getItem('extensao')) {
        localStorage.setItem('extensao', JSON.stringify([]));
    }
    if (!localStorage.getItem('atividade')) {
        localStorage.setItem('atividade', JSON.stringify([]));
    }
    if (!localStorage.getItem('anotacao')) {
        localStorage.setItem('anotacao', JSON.stringify([]));
    }
    if (!localStorage.getItem('lembrete')) {
        localStorage.setItem('lembrete', JSON.stringify([]));
    }
    if (!localStorage.getItem('meta')) {
        localStorage.setItem('meta', JSON.stringify([]));
    }
    if (!localStorage.getItem('pomodoro')) {
        localStorage.setItem('pomodoro', JSON.stringify({
            totalFocusedTime: 0,
            cyclesCompleted: 0
        }));
    }

    // Carregar dados nas seções
    renderDisciplinas();
    renderExtensao();
    renderAtividades();
    renderAnotacoes();
    renderMetas();
    loadPomodoroStats();
}

function getDataFromStorage(type) {
    const data = localStorage.getItem(type);
    return data ? JSON.parse(data) : [];
}

function saveDataToStorage(type, data) {
    localStorage.setItem(type, JSON.stringify(data));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Disciplinas
function saveDisciplina(e) {
    e.preventDefault();

    const form = document.getElementById('disciplina-form');
    const id = document.getElementById('disciplina-id').value || generateId();
    const nome = document.getElementById('disciplina-nome').value;
    const carga = parseInt(document.getElementById('disciplina-carga').value);
    const estudadas = parseInt(document.getElementById('disciplina-estudadas').value) || 0;
    const status = document.getElementById('disciplina-status').value;
    const situacao = document.getElementById('disciplina-situacao').value;

    const progresso = Math.min(Math.round((estudadas / carga) * 100), 100);

    const disciplina = {
        id,
        nome,
        carga,
        estudadas,
        status,
        situacao,
        progresso
    };

    let disciplinas = getDataFromStorage('disciplina');

    if (document.getElementById('disciplina-id').value) {
        // Atualizar
        const index = disciplinas.findIndex(d => d.id === id);
        if (index !== -1) {
            disciplinas[index] = disciplina;
        }
    } else {
        // Adicionar novo
        disciplinas.push(disciplina);
    }

    saveDataToStorage('disciplina', disciplinas);
    closeModal('disciplina');
    renderDisciplinas();
    updateDashboardStats();
    renderCharts();
}

function renderDisciplinas() {
    const disciplinas = getDataFromStorage('disciplina');

    // Renderizar na tabela de graduação
    const tableBody = document.getElementById('graduacao-list');
    tableBody.innerHTML = '';

    // Renderizar no dashboard
    const dashboardContainer = document.getElementById('disciplinas-container');
    dashboardContainer.innerHTML = '';

    if (disciplinas.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhuma disciplina cadastrada</td></tr>';
        dashboardContainer.innerHTML = '<div class="empty-state"><i class="fas fa-book-open"></i><p>Nenhuma disciplina cadastrada</p></div>';
        document.getElementById('graduacao-progress').style.width = '0%';
        document.getElementById('graduacao-progress').textContent = '0%';
        document.getElementById('graduacao-stats').textContent = '0 disciplinas cadastradas | 0 concluídas';
        return;
    }

    // Calcular progresso geral
    const totalCarga = disciplinas.reduce((sum, d) => sum + d.carga, 0);
    const totalEstudadas = disciplinas.reduce((sum, d) => sum + d.estudadas, 0);
    const progressoGeral = Math.round((totalEstudadas / totalCarga) * 100) || 0;
    const concluidas = disciplinas.filter(d => d.status === 'Concluída').length;

    document.getElementById('graduacao-progress').style.width = `${progressoGeral}%`;
    document.getElementById('graduacao-progress').textContent = `${progressoGeral}%`;
    document.getElementById('graduacao-stats').textContent = `${disciplinas.length} disciplinas cadastradas | ${concluidas} concluídas`;

    // Ordenar por status (Concluída por último)
    const sortedDisciplinas = [...disciplinas].sort((a, b) => {
        if (a.status === 'Concluída' && b.status !== 'Concluída') return 1;
        if (a.status !== 'Concluída' && b.status === 'Concluída') return -1;
        return 0;
    });

    sortedDisciplinas.forEach(disciplina => {
        // Linha da tabela
        const row = document.createElement('tr');

        // Status
        const statusCell = document.createElement('td');
        let statusBadge;
        if (disciplina.status === 'Concluída') {
            statusBadge = `<span class="badge badge-success">${disciplina.status}</span>`;
        } else if (disciplina.status === 'Em curso') {
            statusBadge = `<span class="badge badge-warning">${disciplina.status}</span>`;
        } else {
            statusBadge = `<span class="badge badge-primary">${disciplina.status}</span>`;
        }
        statusCell.innerHTML = statusBadge;
        row.appendChild(statusCell);

        // Nome
        const nomeCell = document.createElement('td');
        nomeCell.textContent = disciplina.nome;
        row.appendChild(nomeCell);

        // Carga horária
        const cargaCell = document.createElement('td');
        cargaCell.textContent = `${disciplina.carga}h`;
        row.appendChild(cargaCell);

        // Horas estudadas
        const estudadasCell = document.createElement('td');
        estudadasCell.textContent = `${disciplina.estudadas}h`;
        row.appendChild(estudadasCell);

        // Progresso
        const progressoCell = document.createElement('td');
        progressoCell.innerHTML = `
            <div class="progress-container">
                <div class="progress-bar" style="width: ${disciplina.progresso}%">${disciplina.progresso}%</div>
            </div>
        `;
        row.appendChild(progressoCell);

        // Situação
        const situacaoCell = document.createElement('td');
        if (disciplina.situacao) {
            let situacaoBadge;
            if (disciplina.situacao === 'Aprovado') {
                situacaoBadge = `<span class="badge badge-success">${disciplina.situacao}</span>`;
            } else if (disciplina.situacao === 'Reprovado') {
                situacaoBadge = `<span class="badge badge-danger">${disciplina.situacao}</span>`;
            } else {
                situacaoBadge = `<span class="badge badge-warning">${disciplina.situacao}</span>`;
            }
            situacaoCell.innerHTML = situacaoBadge;
        } else {
            situacaoCell.textContent = 'N/A';
        }
        row.appendChild(situacaoCell);

        // Ações
        const acoesCell = document.createElement('td');
        acoesCell.innerHTML = `
            <button class="btn btn-primary btn-sm edit-disciplina" data-id="${disciplina.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm delete-disciplina" data-id="${disciplina.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        row.appendChild(acoesCell);

        tableBody.appendChild(row);

        // Card no dashboard
        if (disciplina.status !== 'Concluída') {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="d-flex justify-between align-center">
                    <h3>${disciplina.nome}</h3>
                    <span class="badge ${disciplina.status === 'Em curso' ? 'badge-warning' : 'badge-primary'}">${disciplina.status}</span>
                </div>
                <div class="progress-container mt-10">
                    <div class="progress-bar" style="width: ${disciplina.progresso}%">${disciplina.progresso}%</div>
                </div>
                <div class="d-flex justify-between mt-10">
                    <small>${disciplina.estudadas}h de ${disciplina.carga}h</small>
                    <div>
                        <button class="btn btn-primary btn-sm edit-disciplina" data-id="${disciplina.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-disciplina" data-id="${disciplina.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            dashboardContainer.appendChild(card);
        }
    });

    // Adicionar eventos aos botões
    document.querySelectorAll('.edit-disciplina').forEach(btn => {
        btn.addEventListener('click', () => openModal('disciplina', btn.getAttribute('data-id')));
    });

    document.querySelectorAll('.delete-disciplina').forEach(btn => {
        btn.addEventListener('click', () => deleteItem('disciplina', btn.getAttribute('data-id')));
    });
}

// Extensão (similar às disciplinas)
function saveExtensao(e) {
    e.preventDefault();

    const form = document.getElementById('extensao-form');
    const id = document.getElementById('extensao-id').value || generateId();
    const nome = document.getElementById('extensao-nome').value;
    const carga = parseInt(document.getElementById('extensao-carga').value);
    const estudadas = parseInt(document.getElementById('extensao-estudadas').value) || 0;
    const status = document.getElementById('extensao-status').value;
    const situacao = document.getElementById('extensao-situacao').value;

    const progresso = Math.min(Math.round((estudadas / carga) * 100), 100);

    const curso = {
        id,
        nome,
        carga,
        estudadas,
        status,
        situacao,
        progresso
    };

    let cursos = getDataFromStorage('extensao');

    if (document.getElementById('extensao-id').value) {
        // Atualizar
        const index = cursos.findIndex(c => c.id === id);
        if (index !== -1) {
            cursos[index] = curso;
        }
    } else {
        // Adicionar novo
        cursos.push(curso);
    }

    saveDataToStorage('extensao', cursos);
    closeModal('extensao');
    renderExtensao();
    updateDashboardStats();
    renderCharts();
}

function renderExtensao() {
    const cursos = getDataFromStorage('extensao');

    // Renderizar na tabela de extensão
    const tableBody = document.getElementById('extensao-list');
    tableBody.innerHTML = '';

    if (cursos.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum curso de extensão cadastrado</td></tr>';
        document.getElementById('extensao-progress').style.width = '0%';
        document.getElementById('extensao-progress').textContent = '0%';
        document.getElementById('extensao-stats').textContent = '0 cursos cadastrados | 0 concluídos';
        return;
    }

    // Calcular progresso geral
    const totalCarga = cursos.reduce((sum, c) => sum + c.carga, 0);
    const totalEstudadas = cursos.reduce((sum, c) => sum + c.estudadas, 0);
    const progressoGeral = Math.round((totalEstudadas / totalCarga) * 100) || 0;
    const concluidos = cursos.filter(c => c.status === 'Concluída').length;

    document.getElementById('extensao-progress').style.width = `${progressoGeral}%`;
    document.getElementById('extensao-progress').textContent = `${progressoGeral}%`;
    document.getElementById('extensao-stats').textContent = `${cursos.length} cursos cadastrados | ${concluidos} concluídos`;

    // Ordenar por status (Concluída por último)
    const sortedCursos = [...cursos].sort((a, b) => {
        if (a.status === 'Concluída' && b.status !== 'Concluída') return 1;
        if (a.status !== 'Concluída' && b.status === 'Concluída') return -1;
        return 0;
    });

    sortedCursos.forEach(curso => {
        // Linha da tabela
        const row = document.createElement('tr');

        // Status
        const statusCell = document.createElement('td');
        let statusBadge;
        if (curso.status === 'Concluída') {
            statusBadge = `<span class="badge badge-success">${curso.status}</span>`;
        } else if (curso.status === 'Em curso') {
            statusBadge = `<span class="badge badge-warning">${curso.status}</span>`;
        } else {
            statusBadge = `<span class="badge badge-primary">${curso.status}</span>`;
        }
        statusCell.innerHTML = statusBadge;
        row.appendChild(statusCell);

        // Nome
        const nomeCell = document.createElement('td');
        nomeCell.textContent = curso.nome;
        row.appendChild(nomeCell);

        // Carga horária
        const cargaCell = document.createElement('td');
        cargaCell.textContent = `${curso.carga}h`;
        row.appendChild(cargaCell);

        // Horas estudadas
        const estudadasCell = document.createElement('td');
        estudadasCell.textContent = `${curso.estudadas}h`;
        row.appendChild(estudadasCell);

        // Progresso
        const progressoCell = document.createElement('td');
        progressoCell.innerHTML = `
            <div class="progress-container">
                <div class="progress-bar" style="width: ${curso.progresso}%">${curso.progresso}%</div>
            </div>
        `;
        row.appendChild(progressoCell);

        // Situação
        const situacaoCell = document.createElement('td');
        if (curso.situacao) {
            let situacaoBadge;
            if (curso.situacao === 'Aprovado') {
                situacaoBadge = `<span class="badge badge-success">${curso.situacao}</span>`;
            } else if (curso.situacao === 'Reprovado') {
                situacaoBadge = `<span class="badge badge-danger">${curso.situacao}</span>`;
            } else {
                situacaoBadge = `<span class="badge badge-warning">${curso.situacao}</span>`;
            }
            situacaoCell.innerHTML = situacaoBadge;
        } else {
            situacaoCell.textContent = 'N/A';
        }
        row.appendChild(situacaoCell);

        // Ações
        const acoesCell = document.createElement('td');
        acoesCell.innerHTML = `
            <button class="btn btn-primary btn-sm edit-extensao" data-id="${curso.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm delete-extensao" data-id="${curso.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        row.appendChild(acoesCell);

        tableBody.appendChild(row);
    });

    // Adicionar eventos aos botões
    document.querySelectorAll('.edit-extensao').forEach(btn => {
        btn.addEventListener('click', () => openModal('extensao', btn.getAttribute('data-id')));
    });

    document.querySelectorAll('.delete-extensao').forEach(btn => {
        btn.addEventListener('click', () => deleteItem('extensao', btn.getAttribute('data-id')));
    });
}

// Atividades
function saveAtividade(e) {
    e.preventDefault();

    const form = document.getElementById('atividade-form');
    const id = document.getElementById('atividade-id').value || generateId();
    const nome = document.getElementById('atividade-nome').value;
    const tipo = document.getElementById('atividade-tipo').value;
    const disciplina = document.getElementById('atividade-disciplina').value;
    const data = document.getElementById('atividade-data').value;
    const descricao = document.getElementById('atividade-descricao').value;
    const status = document.getElementById('atividade-status').value;

    const atividade = {
        id,
        nome,
        tipo,
        disciplina,
        data,
        descricao,
        status
    };

    let atividades = getDataFromStorage('atividade');

    if (document.getElementById('atividade-id').value) {
        // Atualizar
        const index = atividades.findIndex(a => a.id === id);
        if (index !== -1) {
            atividades[index] = atividade;
        }
    } else {
        // Adicionar novo
        atividades.push(atividade);
    }

    saveDataToStorage('atividade', atividades);
    closeModal('atividade');
    renderAtividades();
    updateDashboardStats();
    renderCharts();
}

function renderAtividades() {
    const atividades = getDataFromStorage('atividade');

    // Renderizar no kanban
    const pendingItems = document.getElementById('pending-items');
    const inProgressItems = document.getElementById('in-progress-items');
    const completedItems = document.getElementById('completed-items');

    pendingItems.innerHTML = '';
    inProgressItems.innerHTML = '';
    completedItems.innerHTML = '';

    // Renderizar próximas atividades no dashboard
    const dashboardContainer = document.getElementById('proximas-atividades');
    dashboardContainer.innerHTML = '';

    if (atividades.length === 0) {
        pendingItems.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>Nenhuma atividade pendente</p></div>';
        inProgressItems.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>Nenhuma atividade em andamento</p></div>';
        completedItems.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>Nenhuma atividade concluída</p></div>';
        dashboardContainer.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>Nenhuma atividade próxima</p></div>';

        document.getElementById('pending-count').textContent = '0';
        document.getElementById('in-progress-count').textContent = '0';
        document.getElementById('completed-count').textContent = '0';

        document.getElementById('atividades-progress').style.width = '0%';
        document.getElementById('atividades-progress').textContent = '0%';
        document.getElementById('atividades-stats').textContent = '0 atividades cadastradas | 0 concluídas';
        return;
    }

    // Contar status
    const pendentes = atividades.filter(a => a.status === 'Pendente').length;
    const emAndamento = atividades.filter(a => a.status === 'Em andamento').length;
    const concluidas = atividades.filter(a => a.status === 'Concluído').length;
    const total = atividades.length;
    const progresso = Math.round((concluidas / total) * 100) || 0;

    document.getElementById('pending-count').textContent = pendentes;
    document.getElementById('in-progress-count').textContent = emAndamento;
    document.getElementById('completed-count').textContent = concluidas;

    document.getElementById('atividades-progress').style.width = `${progresso}%`;
    document.getElementById('atividades-progress').textContent = `${progresso}%`;
    document.getElementById('atividades-stats').textContent = `${total} atividades cadastradas | ${concluidas} concluídas`;

    // Ordenar por data
    const sortedAtividades = [...atividades].sort((a, b) => new Date(a.data) - new Date(b.data));

    // Separar por status
    const atividadesPendentes = sortedAtividades.filter(a => a.status === 'Pendente');
    const atividadesEmAndamento = sortedAtividades.filter(a => a.status === 'Em andamento');
    const atividadesConcluidas = sortedAtividades.filter(a => a.status === 'Concluído');

    // Renderizar pendentes
    if (atividadesPendentes.length === 0) {
        pendingItems.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>Nenhuma atividade pendente</p></div>';
    } else {
        atividadesPendentes.forEach(atividade => {
            const item = createKanbanItem(atividade);
            pendingItems.appendChild(item);
        });
    }

    // Renderizar em andamento
    if (atividadesEmAndamento.length === 0) {
        inProgressItems.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>Nenhuma atividade em andamento</p></div>';
    } else {
        atividadesEmAndamento.forEach(atividade => {
            const item = createKanbanItem(atividade);
            inProgressItems.appendChild(item);
        });
    }

    // Renderizar concluídas
    if (atividadesConcluidas.length === 0) {
        completedItems.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>Nenhuma atividade concluída</p></div>';
    } else {
        atividadesConcluidas.forEach(atividade => {
            const item = createKanbanItem(atividade);
            completedItems.appendChild(item);
        });
    }

    // Renderizar próximas atividades no dashboard (apenas pendentes e em andamento)
    const proximasAtividades = [...atividadesPendentes, ...atividadesEmAndamento]
        .sort((a, b) => new Date(a.data) - new Date(b.data))
        .slice(0, 5); // Limitar a 5 atividades

    if (proximasAtividades.length === 0) {
        dashboardContainer.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>Nenhuma atividade próxima</p></div>';
    } else {
        proximasAtividades.forEach(atividade => {
            const card = document.createElement('div');
            card.className = 'card';

            // Formatar data
            const dataObj = new Date(atividade.data);
            const dataFormatada = dataObj.toLocaleDateString('pt-BR');

            card.innerHTML = `
                <div class="d-flex justify-between align-center">
                    <h3>${atividade.nome}</h3>
                    <span class="badge ${atividade.status === 'Em andamento' ? 'badge-warning' : 'badge-primary'}">${atividade.status}</span>
                </div>
                <p class="mt-10"><small>Tipo: ${atividade.tipo}</small></p>
                <p class="mt-10"><small>Data: ${dataFormatada}</small></p>
                <div class="d-flex justify-between mt-10">
                    <small>${getDisciplinaName(atividade.disciplina) || 'Sem disciplina'}</small>
                    <div>
                        <button class="btn btn-primary btn-sm edit-atividade" data-id="${atividade.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-atividade" data-id="${atividade.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            dashboardContainer.appendChild(card);
        });
    }

    // Adicionar eventos aos botões
    document.querySelectorAll('.edit-atividade').forEach(btn => {
        btn.addEventListener('click', () => openModal('atividade', btn.getAttribute('data-id')));
    });

    document.querySelectorAll('.delete-atividade').forEach(btn => {
        btn.addEventListener('click', () => deleteItem('atividade', btn.getAttribute('data-id')));
    });
}

function createKanbanItem(atividade) {
    const item = document.createElement('div');
item.className = 'kanban-item';
item.setAttribute('data-id', atividade.id);

// Formatar data
const dataObj = new Date(atividade.data);
const dataFormatada = dataObj.toLocaleDateString('pt-BR');

item.innerHTML = `
    <div class="item-header">
        <h4>${atividade.nome}</h4>
        <div class="item-actions">
            <button class="btn btn-primary btn-sm edit-atividade" data-id="${atividade.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm delete-atividade" data-id="${atividade.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    </div>
    <p><small>Tipo: ${atividade.tipo}</small></p>
    <p><small>Data: ${dataFormatada}</small></p>
    <p><small>${getDisciplinaName(atividade.disciplina) || 'Sem disciplina'}</small></p>
`;

// Configurar eventos de drag and drop
item.setAttribute('draggable', 'true');
item.addEventListener('dragstart', dragStart);
item.addEventListener('dragend', dragEnd);

return item;
}

function getDisciplinaName(id) {
    if (!id) return null;

    const [type, idValue] = id.split('_');

    if (type === 'disciplina') {
        const disciplinas = getDataFromStorage('disciplina');
        const disciplina = disciplinas.find(d => d.id === idValue);
        return disciplina ? disciplina.nome : null;
    } else if (type === 'extensao') {
        const cursos = getDataFromStorage('extensao');
        const curso = cursos.find(c => c.id === idValue);
        return curso ? curso.nome : null;
    }

    return null;
}

// Kanban Drag and Drop
function initKanban() {
    // Selecionar todos os itens kanban
    const kanbanItems = document.querySelectorAll('.kanban-item');
    const kanbanColumns = document.querySelectorAll('.kanban-column');

    // Adicionar eventos de drag and drop para novos itens
    function setupDragEvents(item) {
        item.setAttribute('draggable', 'true');
        item.addEventListener('dragstart', dragStart);
        item.addEventListener('dragend', dragEnd);
    }

    // Configurar eventos para itens existentes
    kanbanItems.forEach(setupDragEvents);

    // Configurar eventos para as colunas
    kanbanColumns.forEach(column => {
        column.addEventListener('dragover', dragOver);
        column.addEventListener('dragenter', dragEnter);
        column.addEventListener('dragleave', dragLeave);
        column.addEventListener('drop', drop);
    });

    // Observar mudanças no DOM para novos itens
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('kanban-item')) {
                    setupDragEvents(node);
                }
            });
        });
    });

    // Observar todas as colunas kanban
    kanbanColumns.forEach(column => {
        observer.observe(column, { childList: true, subtree: true });
    });
}


function dragStart(e) {
    draggingItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);

    // Adicionar um pequeno atraso para o efeito visual
    setTimeout(() => {
        this.style.display = 'none';
    }, 0);
}

function dragEnd() {
    this.classList.remove('dragging');
    this.style.display = 'block';
    draggingItem = null;

    // Remover classes de drag-over de todas as colunas
    document.querySelectorAll('.kanban-column').forEach(col => {
        col.classList.remove('drag-over');
    });
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.classList.add('drag-over');
}

function dragEnter(e) {
    e.preventDefault();
    this.classList.add('drag-over');
}

function dragLeave() {
    this.classList.remove('drag-over');
}

function drop(e) {
    e.preventDefault();
    this.classList.remove('drag-over');

    if (draggingItem) {
        // Verificar se estamos movendo para uma nova coluna
        const newColumn = this.closest('.kanban-column');
        const oldColumn = draggingItem.closest('.kanban-column');

        if (newColumn && oldColumn && newColumn !== oldColumn) {
            // Mover o item para a nova coluna
            this.querySelector('.kanban-items').appendChild(draggingItem);

            // Atualizar status no LocalStorage
            const atividadeId = draggingItem.getAttribute('data-id');
            const newStatus = newColumn.id.replace('-column', '').replace('-', ' ');

            let atividades = getDataFromStorage('atividade');
            const atividadeIndex = atividades.findIndex(a => a.id === atividadeId);

            if (atividadeIndex !== -1) {
                // Capitalizar a primeira letra de cada palavra no status
                const formattedStatus = newStatus.split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                atividades[atividadeIndex].status = formattedStatus;
                saveDataToStorage('atividade', atividades);

                // Atualizar contadores
                updateKanbanCounters();
                updateDashboardStats();
                renderCharts();
            }
        } else {
            // Se não mudou de coluna, apenas reordenar
            const afterElement = getDragAfterElement(this.querySelector('.kanban-items'), e.clientY);
            const itemsContainer = this.querySelector('.kanban-items');

            if (afterElement) {
                itemsContainer.insertBefore(draggingItem, afterElement);
            } else {
                itemsContainer.appendChild(draggingItem);
            }
        }
    }
}

// Função auxiliar para determinar a posição do drop
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.kanban-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Função para atualizar os contadores do Kanban
function updateKanbanCounters() {
    const atividades = getDataFromStorage('atividade');

    const pendentes = atividades.filter(a => a.status === 'Pendente').length;
    const emAndamento = atividades.filter(a => a.status === 'Em andamento').length;
    const concluidas = atividades.filter(a => a.status === 'Concluído').length;

    document.getElementById('pending-count').textContent = pendentes;
    document.getElementById('in-progress-count').textContent = emAndamento;
    document.getElementById('completed-count').textContent = concluidas;
}

// Anotações
function saveAnotacao(e) {
    e.preventDefault();

    const form = document.getElementById('anotacao-form');
    const id = document.getElementById('anotacao-id').value || generateId();
    const titulo = document.getElementById('anotacao-titulo').value;
    const conteudo = document.getElementById('anotacao-conteudo').value;

    const anotacao = {
        id,
        titulo,
        conteudo,
        createdAt: new Date().toISOString()
    };

    let anotacoes = getDataFromStorage('anotacao');

    if (document.getElementById('anotacao-id').value) {
        // Atualizar
        const index = anotacoes.findIndex(a => a.id === id);
        if (index !== -1) {
            anotacao.createdAt = anotacoes[index].createdAt; // Manter a data original
            anotacoes[index] = anotacao;
        }
    } else {
        // Adicionar novo
        anotacoes.push(anotacao);
    }

    saveDataToStorage('anotacao', anotacoes);
    closeModal('anotacao');
    renderAnotacoes();
}

function renderAnotacoes() {
    const anotacoes = getDataFromStorage('anotacao');
    const container = document.getElementById('anotacoes-container');
    container.innerHTML = '';

    if (anotacoes.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-sticky-note"></i><p>Nenhuma anotação cadastrada</p></div>';
        return;
    }

    // Ordenar por data de criação (mais recente primeiro)
    const sortedAnotacoes = [...anotacoes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sortedAnotacoes.forEach(anotacao => {
        const note = document.createElement('div');
        note.className = 'note';

        // Formatar data
        const dataObj = new Date(anotacao.createdAt);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        note.innerHTML = `
            <div class="note-title">${anotacao.titulo}</div>
            <div class="note-content">${anotacao.conteudo.replace(/\n/g, '<br>')}</div>
            <small class="text-muted">Criado em: ${dataFormatada}</small>
            <div class="note-actions">
                <button class="btn btn-primary btn-sm edit-anotacao" data-id="${anotacao.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm delete-anotacao" data-id="${anotacao.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(note);
    });

    // Adicionar eventos aos botões
    document.querySelectorAll('.edit-anotacao').forEach(btn => {
        btn.addEventListener('click', () => openModal('anotacao', btn.getAttribute('data-id')));
    });

    document.querySelectorAll('.delete-anotacao').forEach(btn => {
        btn.addEventListener('click', () => deleteItem('anotacao', btn.getAttribute('data-id')));
    });
}

// Lembretes e Calendário
function saveLembrete(e) {
    e.preventDefault();

    const form = document.getElementById('lembrete-form');
    const id = document.getElementById('lembrete-id').value || generateId();
    const titulo = document.getElementById('lembrete-titulo').value;
    const descricao = document.getElementById('lembrete-descricao').value;
    const data = document.getElementById('lembrete-data').value;
    const cor = document.getElementById('lembrete-cor').value;

    const lembrete = {
        id,
        titulo,
        descricao,
        data,
        cor
    };

    let lembretes = getDataFromStorage('lembrete');

    if (document.getElementById('lembrete-id').value) {
        // Atualizar
        const index = lembretes.findIndex(l => l.id === id);
        if (index !== -1) {
            lembretes[index] = lembrete;
        }
    } else {
        // Adicionar novo
        lembretes.push(lembrete);
    }

    saveDataToStorage('lembrete', lembretes);
    closeModal('lembrete');
    renderCalendar();
}

function initCalendar() {
    // Implementação básica do calendário
    renderCalendar();
}

function renderCalendar() {
    const calendarEl = document.getElementById('calendar');
    const lembretes = getDataFromStorage('lembrete');

    // Limpar calendário
    calendarEl.innerHTML = '';

    // Criar cabeçalho do calendário
    const today = new Date();
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.innerHTML = `<h3>${monthNames[currentMonth]} ${currentYear}</h3>`;
    calendarEl.appendChild(header);

    // Criar dias da semana
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weekdaysRow = document.createElement('div');
    weekdaysRow.className = 'calendar-weekdays';

    weekdays.forEach(day => {
        const dayEl = document.createElement('div');
        dayEl.textContent = day;
        weekdaysRow.appendChild(dayEl);
    });

    calendarEl.appendChild(weekdaysRow);

    // Criar dias do mês
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const daysGrid = document.createElement('div');
    daysGrid.className = 'calendar-days';

    // Dias vazios no início
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        daysGrid.appendChild(emptyDay);
    }

    // Dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day';
        dayEl.textContent = i;

        // Verificar se há lembretes neste dia
        const currentDate = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayLembretes = lembretes.filter(l => l.data === currentDate);

        if (dayLembretes.length > 0) {
            const reminderDot = document.createElement('div');
            reminderDot.className = 'reminder-dot';
            reminderDot.style.backgroundColor = dayLembretes[0].cor;
            dayEl.appendChild(reminderDot);

            // Tooltip com os lembretes
            const tooltip = document.createElement('div');
            tooltip.className = 'calendar-tooltip';

            dayLembretes.forEach(lembrete => {
                const tooltipItem = document.createElement('div');
                tooltipItem.className = 'tooltip-item';
                tooltipItem.innerHTML = `
                    <div class="tooltip-color" style="background-color: ${lembrete.cor}"></div>
                    <div class="tooltip-content">
                        <strong>${lembrete.titulo}</strong>
                        <p>${lembrete.descricao || ''}</p>
                    </div>
                    <div class="tooltip-actions">
                        <button class="btn btn-primary btn-sm edit-lembrete" data-id="${lembrete.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-lembrete" data-id="${lembrete.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
                tooltip.appendChild(tooltipItem);
            });

            dayEl.appendChild(tooltip);
        }

        // Destacar dia atual
        if (i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
            dayEl.classList.add('today');
        }

        daysGrid.appendChild(dayEl);
    }

    calendarEl.appendChild(daysGrid);

    // Adicionar eventos aos botões
    document.querySelectorAll('.edit-lembrete').forEach(btn => {
        btn.addEventListener('click', () => openModal('lembrete', btn.getAttribute('data-id')));
    });

    document.querySelectorAll('.delete-lembrete').forEach(btn => {
        btn.addEventListener('click', () => deleteItem('lembrete', btn.getAttribute('data-id')));
    });
}

// Pomodoro Timer
function initPomodoro() {
    document.getElementById('start-timer').addEventListener('click', startTimer);
    document.getElementById('pause-timer').addEventListener('click', pauseTimer);
    document.getElementById('reset-timer').addEventListener('click', resetTimer);

    // Carregar configurações
    document.getElementById('focus-time').addEventListener('change', updateTimerSettings);
    document.getElementById('short-break').addEventListener('change', updateTimerSettings);
    document.getElementById('long-break').addEventListener('change', updateTimerSettings);

    loadPomodoroStats();
    updateTimerDisplay();
}

function loadPomodoroStats() {
    const pomodoroData = getDataFromStorage('pomodoro');
    totalFocusedTime = pomodoroData.totalFocusedTime || 0;
    cyclesCompleted = pomodoroData.cyclesCompleted || 0;

    updatePomodoroStats();
}

function updatePomodoroStats() {
    document.getElementById('cycles-count').textContent = cyclesCompleted;

    // Converter segundos para HH:MM:SS
    const hours = Math.floor(totalFocusedTime / 3600);
    const minutes = Math.floor((totalFocusedTime % 3600) / 60);
    const seconds = totalFocusedTime % 60;

    document.getElementById('total-focused-time').textContent =
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function savePomodoroStats() {
    const pomodoroData = {
        totalFocusedTime,
        cyclesCompleted
    };

    saveDataToStorage('pomodoro', pomodoroData);
}

function updateTimerSettings() {
    const focusTime = parseInt(document.getElementById('focus-time').value) || 25;
    const shortBreak = parseInt(document.getElementById('short-break').value) || 5;
    const longBreak = parseInt(document.getElementById('long-break').value) || 15;

    if (timerType === 'focus') {
        timerSeconds = focusTime * 60;
    } else if (timerType === 'shortBreak') {
        timerSeconds = shortBreak * 60;
    } else {
        timerSeconds = longBreak * 60;
    }

    updateTimerDisplay();
}

function startTimer() {
    if (isTimerRunning) return;

    isTimerRunning = true;
    document.getElementById('start-timer').disabled = true;
    document.getElementById('pause-timer').disabled = false;
    document.getElementById('reset-timer').disabled = false;

    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();

        if (timerSeconds <= 0) {
            clearInterval(timerInterval);
            timerComplete();
        }
    }, 1000);
}

function pauseTimer() {
    if (!isTimerRunning) return;

    clearInterval(timerInterval);
    isTimerRunning = false;
    document.getElementById('start-timer').disabled = false;
    document.getElementById('pause-timer').disabled = true;
}

function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;

    const focusTime = parseInt(document.getElementById('focus-time').value) || 25;
    const shortBreak = parseInt(document.getElementById('short-break').value) || 5;
    const longBreak = parseInt(document.getElementById('long-break').value) || 15;

    if (timerType === 'focus') {
        timerSeconds = focusTime * 60;
    } else if (timerType === 'shortBreak') {
        timerSeconds = shortBreak * 60;
    } else {
        timerSeconds = longBreak * 60;
    }

    updateTimerDisplay();
    document.getElementById('start-timer').disabled = false;
    document.getElementById('pause-timer').disabled = true;
    document.getElementById('reset-timer').disabled = true;
}

function timerComplete() {
    // Tocar som de notificação
    const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
    audio.play();

    if (timerType === 'focus') {
        totalFocusedTime += (parseInt(document.getElementById('focus-time').value) || 25) * 60;
        cyclesCompleted++;

        // Verificar se é hora de uma pausa longa (a cada 4 ciclos)
        if (cyclesCompleted % 4 === 0) {
            timerType = 'longBreak';
            timerSeconds = (parseInt(document.getElementById('long-break').value) || 15) * 60;
            document.getElementById('session-type').textContent = 'Pausa Longa';
        } else {
            timerType = 'shortBreak';
            timerSeconds = (parseInt(document.getElementById('short-break').value) || 5) * 60;
            document.getElementById('session-type').textContent = 'Pausa Curta';
        }
    } else {
        timerType = 'focus';
        timerSeconds = (parseInt(document.getElementById('focus-time').value) || 25) * 60;
        document.getElementById('session-type').textContent = 'Foco';
    }

    updateTimerDisplay();
    updatePomodoroStats();
    savePomodoroStats();

    // Reiniciar automaticamente se estiver em modo foco
    if (timerType === 'focus') {
        startTimer();
    } else {
        isTimerRunning = false;
        document.getElementById('start-timer').disabled = false;
        document.getElementById('pause-timer').disabled = true;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;

    document.getElementById('timer-display').textContent =
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Metas SMART
function saveMeta(e) {
    e.preventDefault();

    const form = document.getElementById('meta-form');
    const id = document.getElementById('meta-id').value || generateId();
    const titulo = document.getElementById('meta-titulo').value;
    const descricao = document.getElementById('meta-descricao').value;
    const especifica = document.getElementById('meta-especifica').value;
    const mensuravel = document.getElementById('meta-mensuravel').value;
    const alcancavel = document.getElementById('meta-alcancavel').value;
    const relevante = document.getElementById('meta-relevante').value;
    const temporal = document.getElementById('meta-temporal').value;
    const prazo = document.getElementById('meta-prazo').value;
    const progresso = parseInt(document.getElementById('meta-progresso').value) || 0;

    const meta = {
        id,
        titulo,
        descricao,
        especifica,
        mensuravel,
        alcancavel,
        relevante,
        temporal,
        prazo,
        progresso,
        createdAt: new Date().toISOString()
    };

    let metas = getDataFromStorage('meta');

    if (document.getElementById('meta-id').value) {
        // Atualizar
        const index = metas.findIndex(m => m.id === id);
        if (index !== -1) {
            meta.createdAt = metas[index].createdAt; // Manter a data original
            metas[index] = meta;
        }
    } else {
        // Adicionar novo
        metas.push(meta);
    }

    saveDataToStorage('meta', metas);
    closeModal('meta');
    renderMetas();
    updateDashboardStats();
}

function renderMetas() {
    const metas = getDataFromStorage('meta');
    const tableBody = document.getElementById('metas-list');
    tableBody.innerHTML = '';

    // Renderizar no dashboard
    const dashboardContainer = document.getElementById('metas-container');
    dashboardContainer.innerHTML = '';

    if (metas.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma meta cadastrada</td></tr>';
        dashboardContainer.innerHTML = '<div class="empty-state"><i class="fas fa-bullseye"></i><p>Nenhuma meta cadastrada</p></div>';
        return;
    }

    // Ordenar por prazo (mais próximas primeiro)
    const sortedMetas = [...metas].sort((a, b) => new Date(a.prazo) - new Date(b.prazo));

    sortedMetas.forEach(meta => {
        // Linha da tabela
        const row = document.createElement('tr');

        // Título
        const tituloCell = document.createElement('td');
        tituloCell.textContent = meta.titulo;
        row.appendChild(tituloCell);

        // Descrição
        const descricaoCell = document.createElement('td');
        descricaoCell.textContent = meta.descricao.length > 50 ? meta.descricao.substring(0, 50) + '...' : meta.descricao;
        row.appendChild(descricaoCell);

        // Progresso
        const progressoCell = document.createElement('td');
        progressoCell.innerHTML = `
            <div class="progress-container">
                <div class="progress-bar" style="width: ${meta.progresso}%">${meta.progresso}%</div>
            </div>
        `;
        row.appendChild(progressoCell);

        // Prazo
        const prazoCell = document.createElement('td');
        const prazoObj = new Date(meta.prazo);
        const hoje = new Date();
        const diffTime = prazoObj - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        prazoCell.textContent = prazoObj.toLocaleDateString('pt-BR');

        if (diffDays < 0) {
            prazoCell.innerHTML += '<br><span class="badge badge-danger">Atrasada</span>';
        } else if (diffDays <= 7) {
            prazoCell.innerHTML += `<br><span class="badge badge-warning">Faltam ${diffDays} dias</span>`;
        }

        row.appendChild(prazoCell);

        // Status
        const statusCell = document.createElement('td');
        if (meta.progresso === 100) {
            statusCell.innerHTML = '<span class="badge badge-success">Concluída</span>';
        } else if (diffDays < 0) {
            statusCell.innerHTML = '<span class="badge badge-danger">Atrasada</span>';
        } else if (meta.progresso >= 75) {
            statusCell.innerHTML = '<span class="badge badge-success">Bom progresso</span>';
        } else if (meta.progresso >= 50) {
            statusCell.innerHTML = '<span class="badge badge-primary">Em progresso</span>';
        } else if (meta.progresso > 0) {
            statusCell.innerHTML = '<span class="badge badge-warning">Iniciada</span>';
        } else {
            statusCell.innerHTML = '<span class="badge badge-primary">Não iniciada</span>';
        }
        row.appendChild(statusCell);

        // Ações
        const acoesCell = document.createElement('td');
        acoesCell.innerHTML = `
            <button class="btn btn-primary btn-sm edit-meta" data-id="${meta.id}">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-danger btn-sm delete-meta" data-id="${meta.id}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        row.appendChild(acoesCell);

        tableBody.appendChild(row);

        // Card no dashboard (apenas metas não concluídas)
        if (meta.progresso < 100) {
            const card = document.createElement('div');
            card.className = 'card';

            card.innerHTML = `
                <h3>${meta.titulo}</h3>
                <p class="mt-10">${meta.descricao.length > 100 ? meta.descricao.substring(0, 100) + '...' : meta.descricao}</p>
                <div class="progress-container mt-10">
                    <div class="progress-bar" style="width: ${meta.progresso}%">${meta.progresso}%</div>
                </div>
                <div class="d-flex justify-between mt-10">
                    <small>Prazo: ${prazoObj.toLocaleDateString('pt-BR')}</small>
                    <div>
                        <button class="btn btn-primary btn-sm edit-meta" data-id="${meta.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm delete-meta" data-id="${meta.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
            dashboardContainer.appendChild(card);
        }
    });

    // Adicionar eventos aos botões
    document.querySelectorAll('.edit-meta').forEach(btn => {
        btn.addEventListener('click', () => openModal('meta', btn.getAttribute('data-id')));
    });

    document.querySelectorAll('.delete-meta').forEach(btn => {
        btn.addEventListener('click', () => deleteItem('meta', btn.getAttribute('data-id')));
    });
}

// Funções auxiliares
function deleteItem(type, id) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
        let data = getDataFromStorage(type);
        data = data.filter(item => item.id !== id);
        saveDataToStorage(type, data);

        // Recarregar a seção apropriada
        switch (type) {
            case 'disciplina':
                renderDisciplinas();
                renderAtividades(); // Pode afetar atividades vinculadas
                break;
            case 'extensao':
                renderExtensao();
                renderAtividades(); // Pode afetar atividades vinculadas
                break;
            case 'atividade':
                renderAtividades();
                break;
            case 'anotacao':
                renderAnotacoes();
                break;
            case 'lembrete':
                renderCalendar();
                break;
            case 'meta':
                renderMetas();
                break;
        }

        updateDashboardStats();
        renderCharts();
    }
}

function updateDashboardStats() {
    const disciplinas = getDataFromStorage('disciplina');
    const cursos = getDataFromStorage('extensao');
    const atividades = getDataFromStorage('atividade');

    // Progresso geral (média de progresso em todas as áreas)
    let progressoTotal = 0;
    let totalAreas = 0;

    // Progresso disciplinas
    if (disciplinas.length > 0) {
        const totalCarga = disciplinas.reduce((sum, d) => sum + d.carga, 0);
        const totalEstudadas = disciplinas.reduce((sum, d) => sum + d.estudadas, 0);
        const progressoDisciplinas = Math.round((totalEstudadas / totalCarga) * 100) || 0;
        progressoTotal += progressoDisciplinas;
        totalAreas++;

        document.getElementById('disciplinas-count').textContent =
            `${disciplinas.filter(d => d.status === 'Concluída').length}/${disciplinas.length}`;
    } else {
        document.getElementById('disciplinas-count').textContent = '0/0';
    }

    // Progresso cursos
    if (cursos.length > 0) {
        const totalCarga = cursos.reduce((sum, c) => sum + c.carga, 0);
        const totalEstudadas = cursos.reduce((sum, c) => sum + c.estudadas, 0);
        const progressoCursos = Math.round((totalEstudadas / totalCarga) * 100) || 0;
        progressoTotal += progressoCursos;
        totalAreas++;

        document.getElementById('cursos-count').textContent =
            `${cursos.filter(c => c.status === 'Concluída').length}/${cursos.length}`;
    } else {
        document.getElementById('cursos-count').textContent = '0/0';
    }

    // Progresso atividades
    if (atividades.length > 0) {
        const concluidas = atividades.filter(a => a.status === 'Concluído').length;
        const progressoAtividades = Math.round((concluidas / atividades.length) * 100) || 0;
        progressoTotal += progressoAtividades;
        totalAreas++;

        document.getElementById('atividades-count').textContent = `${concluidas}/${atividades.length}`;
    } else {
        document.getElementById('atividades-count').textContent = '0/0';
    }

    // Calcular média geral
    const progressoGeral = totalAreas > 0 ? Math.round(progressoTotal / totalAreas) : 0;
    document.getElementById('overall-progress').style.width = `${progressoGeral}%`;
    document.getElementById('overall-progress').textContent = `${progressoGeral}%`;
}

// Gráficos
function renderCharts() {
    renderActivitiesChart();
    renderTopDisciplinasChart();
    renderTimeDistributionChart();
    renderMonthlyProgressChart();
}

function renderActivitiesChart() {
    const atividades = getDataFromStorage('atividade');
    const ctx = document.getElementById('activities-chart').getContext('2d');

    // Destruir gráfico existente se houver
    if (window.activitiesChart) {
        window.activitiesChart.destroy();
    }

    if (atividades.length === 0) {
        document.getElementById('activities-chart').style.display = 'none';
        return;
    }

    document.getElementById('activities-chart').style.display = 'block';

    const pendentes = atividades.filter(a => a.status === 'Pendente').length;
    const emAndamento = atividades.filter(a => a.status === 'Em andamento').length;
    const concluidas = atividades.filter(a => a.status === 'Concluído').length;

    window.activitiesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pendentes', 'Em Andamento', 'Concluídas'],
            datasets: [{
                data: [pendentes, emAndamento, concluidas],
                backgroundColor: [
                    'rgba(74, 111, 165, 0.7)',
                    'rgba(243, 156, 18, 0.7)',
                    'rgba(46, 204, 113, 0.7)'
                ],
                borderColor: [
                    'rgba(74, 111, 165, 1)',
                    'rgba(243, 156, 18, 1)',
                    'rgba(46, 204, 113, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Status das Atividades'
                }
            }
        }
    });
}

function renderTopDisciplinasChart() {
    const disciplinas = getDataFromStorage('disciplina');
    const ctx = document.getElementById('top-disciplinas-chart').getContext('2d');

    // Destruir gráfico existente se houver
    if (window.topDisciplinasChart) {
        window.topDisciplinasChart.destroy();
    }

    if (disciplinas.length === 0) {
        document.getElementById('top-disciplinas-chart').style.display = 'none';
        return;
    }

    document.getElementById('top-disciplinas-chart').style.display = 'block';

    // Ordenar por horas estudadas
    const sortedDisciplinas = [...disciplinas].sort((a, b) => b.estudadas - a.estudadas).slice(0, 5);

    window.topDisciplinasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedDisciplinas.map(d => d.nome),
            datasets: [{
                label: 'Horas Estudadas',
                data: sortedDisciplinas.map(d => d.estudadas),
                backgroundColor: 'rgba(74, 111, 165, 0.7)',
                borderColor: 'rgba(74, 111, 165, 1)',
                borderWidth: 1
            }, {
                label: 'Carga Horária',
                data: sortedDisciplinas.map(d => d.carga),
                backgroundColor: 'rgba(201, 203, 207, 0.7)',
                borderColor: 'rgba(201, 203, 207, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Horas'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Disciplinas Mais Estudadas'
                }
            }
        }
    });
}

function renderTimeDistributionChart() {
    const disciplinas = getDataFromStorage('disciplina');
    const cursos = getDataFromStorage('extensao');
    const ctx = document.getElementById('time-distribution-chart').getContext('2d');

    // Destruir gráfico existente se houver
    if (window.timeDistributionChart) {
        window.timeDistributionChart.destroy();
    }

    if (disciplinas.length === 0 && cursos.length === 0) {
        document.getElementById('time-distribution-chart').style.display = 'none';
        return;
    }

    document.getElementById('time-distribution-chart').style.display = 'block';

    const totalDisciplinas = disciplinas.reduce((sum, d) => sum + d.estudadas, 0);
    const totalCursos = cursos.reduce((sum, c) => sum + c.estudadas, 0);

    window.timeDistributionChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Disciplinas', 'Cursos de Extensão'],
            datasets: [{
                data: [totalDisciplinas, totalCursos],
                backgroundColor: [
                    'rgba(74, 111, 165, 0.7)',
                    'rgba(22, 96, 136, 0.7)'
                ],
                borderColor: [
                    'rgba(74, 111, 165, 1)',
                    'rgba(22, 96, 136, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Distribuição de Tempo de Estudo'
                }
            }
        }
    });
}

function renderMonthlyProgressChart() {
    const disciplinas = getDataFromStorage('disciplina');
    const cursos = getDataFromStorage('extensao');
    const atividades = getDataFromStorage('atividade');
    const ctx = document.getElementById('monthly-progress-chart').getContext('2d');

    // Destruir gráfico existente se houver
    if (window.monthlyProgressChart) {
        window.monthlyProgressChart.destroy();
    }

    if (disciplinas.length === 0 && cursos.length === 0 && atividades.length === 0) {
        document.getElementById('monthly-progress-chart').style.display = 'none';
        return;
    }

    document.getElementById('monthly-progress-chart').style.display = 'block';

    // Simular dados mensais (na prática, você armazenaria esses dados)
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    const displayedMonths = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);

    // Gerar dados aleatórios para demonstração
    const disciplinasData = displayedMonths.map(() => Math.floor(Math.random() * 30) + 10);
    const cursosData = displayedMonths.map(() => Math.floor(Math.random() * 20) + 5);
    const atividadesData = displayedMonths.map(() => Math.floor(Math.random() * 15) + 5);

    window.monthlyProgressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: displayedMonths,
            datasets: [
                {
                    label: 'Horas em Disciplinas',
                    data: disciplinasData,
                    backgroundColor: 'rgba(74, 111, 165, 0.2)',
                    borderColor: 'rgba(74, 111, 165, 1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Horas em Cursos',
                    data: cursosData,
                    backgroundColor: 'rgba(22, 96, 136, 0.2)',
                    borderColor: 'rgba(22, 96, 136, 1)',
                    borderWidth: 2,
                    tension: 0.4
                },
                {
                    label: 'Atividades Concluídas',
                    data: atividadesData,
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 2,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Horas/Quantidade'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'bottom',
                },
                title: {
                    display: true,
                    text: 'Progresso Mensal'
                }
            }
        }
    });
}

// Exportação para PDF
function initPDFExports() {
    document.getElementById('export-graduacao-pdf').addEventListener('click', () => exportToPDF('graduacao'));
    document.getElementById('export-extensao-pdf').addEventListener('click', () => exportToPDF('extensao'));
    document.getElementById('export-atividades-pdf').addEventListener('click', () => exportToPDF('atividades'));
    document.getElementById('export-metas-pdf').addEventListener('click', () => exportToPDF('metas'));
    document.getElementById('export-all-pdf').addEventListener('click', exportAllToPDF);
}

function exportToPDF(type) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let title, data, columns, rows;

    switch (type) {
        case 'graduacao':
            title = 'Disciplinas da Graduação';
            data = getDataFromStorage('disciplina');
            columns = [
                { title: "Disciplina", dataKey: "nome" },
                { title: "Carga Horária", dataKey: "carga" },
                { title: "Horas Estudadas", dataKey: "estudadas" },
                { title: "Progresso", dataKey: "progresso" },
                { title: "Status", dataKey: "status" },
                { title: "Situação", dataKey: "situacao" }
            ];
            rows = data.map(d => ({
                nome: d.nome,
                carga: `${d.carga}h`,
                estudadas: `${d.estudadas}h`,
                progresso: `${d.progresso}%`,
                status: d.status,
                situacao: d.situacao || 'N/A'
            }));
            break;

        case 'extensao':
            title = 'Cursos de Extensão';
            data = getDataFromStorage('extensao');
            columns = [
                { title: "Curso", dataKey: "nome" },
                { title: "Carga Horária", dataKey: "carga" },
                { title: "Horas Estudadas", dataKey: "estudadas" },
                { title: "Progresso", dataKey: "progresso" },
                { title: "Status", dataKey: "status" },
                { title: "Situação", dataKey: "situacao" }
            ];
            rows = data.map(c => ({
                nome: c.nome,
                carga: `${c.carga}h`,
                estudadas: `${c.estudadas}h`,
                progresso: `${c.progresso}%`,
                status: c.status,
                situacao: c.situacao || 'N/A'
            }));
            break;

        case 'atividades':
            title = 'Atividades';
            data = getDataFromStorage('atividade');
            columns = [
                { title: "Atividade", dataKey: "nome" },
                { title: "Tipo", dataKey: "tipo" },
                { title: "Disciplina/Curso", dataKey: "disciplina" },
                { title: "Data", dataKey: "data" },
                { title: "Status", dataKey: "status" }
            ];
            rows = data.map(a => ({
                nome: a.nome,
                tipo: a.tipo,
                disciplina: getDisciplinaName(a.disciplina) || 'N/A',
                data: new Date(a.data).toLocaleDateString('pt-BR'),
                status: a.status
            }));
            break;

        case 'metas':
            title = 'Metas SMART';
            data = getDataFromStorage('meta');
            columns = [
                { title: "Meta", dataKey: "titulo" },
                { title: "Descrição", dataKey: "descricao" },
                { title: "Progresso", dataKey: "progresso" },
                { title: "Prazo", dataKey: "prazo" },
                { title: "Status", dataKey: "status" }
            ];
            rows = data.map(m => {
                const prazoObj = new Date(m.prazo);
                const hoje = new Date();
                const diffTime = prazoObj - hoje;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let status;
                if (m.progresso === 100) {
                    status = 'Concluída';
                } else if (diffDays < 0) {
                    status = 'Atrasada';
                } else {
                    status = 'Em andamento';
                }

                return {
                    titulo: m.titulo,
                    descricao: m.descricao.length > 50 ? m.descricao.substring(0, 50) + '...' : m.descricao,
                    progresso: `${m.progresso}%`,
                    prazo: prazoObj.toLocaleDateString('pt-BR'),
                    status: status
                };
            });
            break;
    }

    // Adicionar título
    doc.setFontSize(18);
    doc.text(title, 14, 20);

    // Adicionar data de exportação
    doc.setFontSize(10);
    doc.text(`Exportado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, 28);

    // Adicionar tabela
    doc.autoTable({
        head: [columns.map(col => col.title)],
        body: rows.map(row => columns.map(col => row[col.dataKey])),
        startY: 35,
        styles: {
            fontSize: 9,
            cellPadding: 3,
            overflow: 'linebreak'
        },
        headStyles: {
            fillColor: [74, 111, 165],
            textColor: [255, 255, 255],
            fontSize: 10
        },
        alternateRowStyles: {
            fillColor: [240, 240, 240]
        }
    });

    // Salvar PDF
    doc.save(`${title.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function exportAllToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título principal
    doc.setFontSize(20);
    doc.text('Relatório Completo de Estudos', 105, 15, { align: 'center' });

    // Data de exportação
    doc.setFontSize(10);
    doc.text(`Exportado em: ${new Date().toLocaleDateString('pt-BR')}`, 105, 22, { align: 'center' });

    let yPosition = 30;

    // Função para adicionar seção
    function addSection(title, data, columns) {
        // Adicionar título da seção
        doc.setFontSize(14);
        doc.text(title, 14, yPosition);
        yPosition += 8;

        // Adicionar tabela
        doc.autoTable({
            head: [columns.map(col => col.title)],
            body: data.map(row => columns.map(col => row[col.dataKey])),
            startY: yPosition,
            styles: {
                fontSize: 8,
                cellPadding: 2,
                overflow: 'linebreak'
            },
            headStyles: {
                fillColor: [74, 111, 165],
                textColor: [255, 255, 255],
                fontSize: 9
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240]
            }
        });

        // Atualizar posição Y
        yPosition = doc.lastAutoTable.finalY + 10;

        // Adicionar nova página se necessário
        if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
        }
    }

    // Disciplinas
    const disciplinas = getDataFromStorage('disciplina');
    if (disciplinas.length > 0) {
        const disciplinaColumns = [
            { title: "Disciplina", dataKey: "nome" },
            { title: "Carga Horária", dataKey: "carga" },
            { title: "Horas Estudadas", dataKey: "estudadas" },
            { title: "Progresso", dataKey: "progresso" },
            { title: "Status", dataKey: "status" },
            { title: "Situação", dataKey: "situacao" }
        ];

        const disciplinaRows = disciplinas.map(d => ({
            nome: d.nome,
            carga: `${d.carga}h`,
            estudadas: `${d.estudadas}h`,
            progresso: `${d.progresso}%`,
            status: d.status,
            situacao: d.situacao || 'N/A'
        }));

        addSection('Disciplinas da Graduação', disciplinaRows, disciplinaColumns);
    }

    // Cursos de Extensão
    const cursos = getDataFromStorage('extensao');
    if (cursos.length > 0) {
        const cursoColumns = [
            { title: "Curso", dataKey: "nome" },
            { title: "Carga Horária", dataKey: "carga" },
            { title: "Horas Estudadas", dataKey: "estudadas" },
            { title: "Progresso", dataKey: "progresso" },
            { title: "Status", dataKey: "status" },
            { title: "Situação", dataKey: "situacao" }
        ];

        const cursoRows = cursos.map(c => ({
            nome: c.nome,
            carga: `${c.carga}h`,
            estudadas: `${c.estudadas}h`,
            progresso: `${c.progresso}%`,
            status: c.status,
            situacao: c.situacao || 'N/A'
        }));

        addSection('Cursos de Extensão', cursoRows, cursoColumns);
    }

    // Atividades
    const atividades = getDataFromStorage('atividade');
    if (atividades.length > 0) {
        const atividadeColumns = [
            { title: "Atividade", dataKey: "nome" },
            { title: "Tipo", dataKey: "tipo" },
            { title: "Disciplina/Curso", dataKey: "disciplina" },
            { title: "Data", dataKey: "data" },
            { title: "Status", dataKey: "status" }
        ];

        const atividadeRows = atividades.map(a => ({
            nome: a.nome,
            tipo: a.tipo,
            disciplina: getDisciplinaName(a.disciplina) || 'N/A',
            data: new Date(a.data).toLocaleDateString('pt-BR'),
            status: a.status
        }));

        addSection('Atividades', atividadeRows, atividadeColumns);
    }

    // Metas
    const metas = getDataFromStorage('meta');
    if (metas.length > 0) {
        const metaColumns = [
            { title: "Meta", dataKey: "titulo" },
            { title: "Descrição", dataKey: "descricao" },
            { title: "Progresso", dataKey: "progresso" },
            { title: "Prazo", dataKey: "prazo" },
            { title: "Status", dataKey: "status" }
        ];

        const metaRows = metas.map(m => {
            const prazoObj = new Date(m.prazo);
            const hoje = new Date();
            const diffTime = prazoObj - hoje;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let status;
            if (m.progresso === 100) {
                status = 'Concluída';
            } else if (diffDays < 0) {
                status = 'Atrasada';
            } else {
                status = 'Em andamento';
            }

            return {
                titulo: m.titulo,
                descricao: m.descricao.length > 50 ? m.descricao.substring(0, 50) + '...' : m.descricao,
                progresso: `${m.progresso}%`,
                prazo: prazoObj.toLocaleDateString('pt-BR'),
                status: status
            };
        });

        addSection('Metas SMART', metaRows, metaColumns);
    }

    // Salvar PDF
    doc.save(`relatorio_estudos_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// Inicializar exportações PDF
initPDFExports();