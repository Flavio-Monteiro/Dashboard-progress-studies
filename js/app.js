        // Variáveis globais
        let currentSection = 'dashboard';
        let currentMonth = new Date().getMonth();
        let currentYear = new Date().getFullYear();
        let pomodoroInterval;
        let pomodoroTimeLeft = 25 * 60; // 25 minutos em segundos
        let pomodoroIsRunning = false;
        let pomodoroIsPaused = false;
        let completedPomodoroCycles = 0;
        let currentPomodoroMode = 'focus'; // 'focus', 'shortBreak', 'longBreak'
        let pomodoroSubject = '';

        // Inicialização
        document.addEventListener('DOMContentLoaded', function () {
            // Carregar dados do localStorage
            loadData();

            // Configurar eventos
            setupEventListeners();

            // Mostrar seção atual
            showSection(currentSection);

            // Inicializar calendário
            renderCalendar(currentMonth, currentYear);

            // Inicializar gráficos
            renderCharts();

            // Verificar modo escuro
            checkDarkMode();
        });

        // Carregar dados do localStorage
        function loadData() {
            // Verificar se já existe dados no localStorage
            if (!localStorage.getItem('studyManagerData')) {
                // Dados iniciais
                const initialData = {
                    subjects: [],
                    courses: [],
                    activities: [],
                    reminders: [],
                    notes: [],
                    goals: [],
                    pomodoroHistory: [],
                    settings: {
                        darkMode: false,
                        pomodoro: {
                            focusDuration: 25,
                            shortBreakDuration: 5,
                            longBreakDuration: 15,
                            cyclesBeforeLongBreak: 4
                        }
                    }
                };

                localStorage.setItem('studyManagerData', JSON.stringify(initialData));
            }

            // Atualizar interface com os dados
            updateUI();
        }

        // Atualizar interface com os dados
        function updateUI() {
            const data = getData();

            // Atualizar tabelas
            renderSubjectsTable(data.subjects);
            renderCoursesTable(data.courses);
            renderActivitiesTable(data.activities);
            renderGoalsTable(data.goals);
            renderPomodoroHistoryTable(data.pomodoroHistory);

            // Atualizar calendário
            renderCalendar(currentMonth, currentYear);

            // Atualizar anotações
            renderNotes(data.notes);

            // Atualizar dashboard
            updateDashboard(data);

            // Atualizar estatísticas
            updateStatistics(data);

            // Preencher dropdowns de disciplinas/cursos
            updateRelatedToDropdowns();
        }

        // Obter dados do localStorage
        function getData() {
            return JSON.parse(localStorage.getItem('studyManagerData'));
        }

        // Salvar dados no localStorage
        function saveData(data) {
            localStorage.setItem('studyManagerData', JSON.stringify(data));
        }

        // Configurar eventos
        function setupEventListeners() {
            // Navegação do menu
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    const section = this.getAttribute('data-section');
                    showSection(section);
                });
            });

            // Alternar sidebar em mobile
            document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
            document.getElementById('sidebarToggleTop').addEventListener('click', toggleSidebar);

            // Alternar modo escuro
            document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

            // Disciplinas
            document.getElementById('saveSubject').addEventListener('click', saveSubject);
            document.getElementById('updateSubject').addEventListener('click', updateSubject);

            // Cursos
            document.getElementById('saveCourse').addEventListener('click', saveCourse);
            document.getElementById('updateCourse').addEventListener('click', updateCourse);

            // Atividades
            document.getElementById('saveActivity').addEventListener('click', saveActivity);
            document.getElementById('updateActivity').addEventListener('click', updateActivity);

            // Lembretes
            document.getElementById('saveReminder').addEventListener('click', saveReminder);
            document.getElementById('deleteReminder').addEventListener('click', deleteReminder);

            // Anotações
            document.getElementById('saveNote').addEventListener('click', saveNote);
            document.getElementById('updateNote').addEventListener('click', updateNote);

            // Metas
            document.getElementById('saveGoal').addEventListener('click', saveGoal);
            document.getElementById('updateGoal').addEventListener('click', updateGoal);
            document.getElementById('goalProgress').addEventListener('input', function () {
                document.getElementById('goalProgressValue').textContent = this.value + '%';
            });
            document.getElementById('editGoalProgress').addEventListener('input', function () {
                document.getElementById('editGoalProgressValue').textContent = this.value + '%';
            });

            // Pomodoro
            document.getElementById('startPomodoro').addEventListener('click', startPomodoro);
            document.getElementById('stopPomodoro').addEventListener('click', stopPomodoro);
            document.getElementById('pausePomodoro').addEventListener('click', pausePomodoro);
            document.getElementById('resumePomodoro').addEventListener('click', resumePomodoro);
            document.querySelectorAll('input[name="pomodoroMode"]').forEach(radio => {
                radio.addEventListener('change', changePomodoroMode);
            });

            // Calendário
            document.getElementById('prevMonth').addEventListener('click', showPrevMonth);
            document.getElementById('nextMonth').addEventListener('click', showNextMonth);

            // Confirmação de exclusão
            document.getElementById('confirmDelete').addEventListener('click', confirmDelete);

            // Exportação
            document.getElementById('confirmExport').addEventListener('click', confirmExport);
        }

        // Mostrar seção
        function showSection(section) {
            // Esconder todas as seções
            document.querySelectorAll('.section-content').forEach(sec => {
                sec.classList.add('d-none');
            });

            // Mostrar seção selecionada
            document.getElementById(section + '-section').classList.remove('d-none');

            // Atualizar menu ativo
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-section') === section) {
                    link.classList.add('active');
                }
            });

            // Atualizar seção atual
            currentSection = section;

            // Atualizar gráficos se for a seção de estatísticas
            if (section === 'estatisticas') {
                renderCharts();
            }
        }

        // Alternar sidebar
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('active');
            document.getElementById('content').classList.toggle('active');
        }

        // Verificar modo escuro
        function checkDarkMode() {
            const data = getData();
            if (data.settings.darkMode) {
                document.body.classList.add('dark-mode');
                document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
            }
        }

        // Alternar modo escuro
        function toggleDarkMode() {
            const data = getData();
            data.settings.darkMode = !data.settings.darkMode;
            saveData(data);

            document.body.classList.toggle('dark-mode');

            if (data.settings.darkMode) {
                document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-sun"></i> Modo Claro';
            } else {
                document.getElementById('darkModeToggle').innerHTML = '<i class="fas fa-moon"></i> Modo Escuro';
            }
        }

        // ========== DISCIPLINAS ========== //
        // Renderizar tabela de disciplinas
        function renderSubjectsTable(subjects) {
            const tbody = document.querySelector('#subjectsTable tbody');
            tbody.innerHTML = '';

            subjects.forEach((subject, index) => {
                const progress = Math.min(Math.round((subject.hoursStudied / subject.workload) * 100), 100);

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="text-center">
                        <input type="checkbox" class="form-check-input complete-checkbox" ${subject.status === 'Concluída' ? 'checked' : ''} data-id="${index}" data-type="subject">
                    </td>
                    <td>${subject.name}</td>
                    <td>${subject.workload}h</td>
                    <td>${subject.hoursStudied}h</td>
                    <td>
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <small>${progress}%</small>
                    </td>
                    <td><span class="status-badge ${getStatusClass(subject.status)}">${subject.status}</span></td>
                    <td><span class="status-badge ${getSituationClass(subject.finalSituation)}">${subject.finalSituation || 'N/A'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-subject" data-id="${index}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger delete-subject" data-id="${index}" data-type="subject"><i class="fas fa-trash"></i></button>
                        <button class="btn btn-sm btn-secondary export-subject" data-id="${index}" data-type="subject"><i class="fas fa-file-export"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Adicionar eventos aos botões
            document.querySelectorAll('.edit-subject').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    editSubject(id);
                });
            });

            document.querySelectorAll('.delete-subject').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    const type = this.getAttribute('data-type');
                    showConfirmationModal(id, type, 'Tem certeza que deseja excluir esta disciplina?');
                });
            });

            document.querySelectorAll('.complete-checkbox').forEach(checkbox => {
                checkbox.addEventListener('change', function () {
                    const id = this.getAttribute('data-id');
                    const type = this.getAttribute('data-type');
                    toggleCompleteStatus(id, type, this.checked);
                });
            });

            document.querySelectorAll('.export-subject').forEach(btn => {
                btn.addEventListener('click', function () {
                    const type = this.getAttribute('data-type');
                    showExportModal(type);
                });
            });
        }

        // Salvar disciplina
        function saveSubject() {
            const name = document.getElementById('subjectName').value;
            const workload = parseInt(document.getElementById('subjectWorkload').value);
            const hoursStudied = parseInt(document.getElementById('subjectHoursStudied').value) || 0;
            const status = document.getElementById('subjectStatus').value;
            const finalSituation = document.getElementById('subjectFinalSituation').value;

            if (!name || !workload) {
                alert('Preencha todos os campos obrigatórios!');
                return;
            }

            const data = getData();
            data.subjects.push({
                name,
                workload,
                hoursStudied,
                status,
                finalSituation,
                completed: status === 'Concluída'
            });

            saveData(data);
            updateUI();

            // Fechar modal e limpar formulário
            bootstrap.Modal.getInstance(document.getElementById('addSubjectModal')).hide();
            document.getElementById('subjectForm').reset();
        }

        // Editar disciplina
        function editSubject(id) {
            const data = getData();
            const subject = data.subjects[id];

            document.getElementById('editSubjectId').value = id;
            document.getElementById('editSubjectName').value = subject.name;
            document.getElementById('editSubjectWorkload').value = subject.workload;
            document.getElementById('editSubjectHoursStudied').value = subject.hoursStudied;
            document.getElementById('editSubjectStatus').value = subject.status;
            document.getElementById('editSubjectFinalSituation').value = subject.finalSituation || '';

            const modal = new bootstrap.Modal(document.getElementById('editSubjectModal'));
            modal.show();
        }

        // Atualizar disciplina
        function updateSubject() {
            const id = document.getElementById('editSubjectId').value;
            const name = document.getElementById('editSubjectName').value;
            const workload = parseInt(document.getElementById('editSubjectWorkload').value);
            const hoursStudied = parseInt(document.getElementById('editSubjectHoursStudied').value) || 0;
            const status = document.getElementById('editSubjectStatus').value;
            const finalSituation = document.getElementById('editSubjectFinalSituation').value;

            if (!name || !workload) {
                alert('Preencha todos os campos obrigatórios!');
                return;
            }

            const data = getData();
            data.subjects[id] = {
                name,
                workload,
                hoursStudied,
                status,
                finalSituation,
                completed: status === 'Concluída'
            };

            saveData(data);
            updateUI();

            // Fechar modal
            bootstrap.Modal.getInstance(document.getElementById('editSubjectModal')).hide();
        }

        // ========== CURSOS ========== //
        // Renderizar tabela de cursos
        function renderCoursesTable(courses) {
            const tbody = document.querySelector('#coursesTable tbody');
            tbody.innerHTML = '';

            courses.forEach((course, index) => {
                const progress = Math.min(Math.round((course.hoursStudied / course.workload) * 100), 100);

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="text-center">
                        <input type="checkbox" class="form-check-input complete-checkbox" ${course.status === 'Concluída' ? 'checked' : ''} data-id="${index}" data-type="course">
                    </td>
                    <td>${course.name}</td>
                    <td>${course.workload}h</td>
                    <td>${course.hoursStudied}h</td>
                    <td>
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <small>${progress}%</small>
                    </td>
                    <td><span class="status-badge ${getStatusClass(course.status)}">${course.status}</span></td>
                    <td><span class="status-badge ${getSituationClass(course.finalSituation)}">${course.finalSituation || 'N/A'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-course" data-id="${index}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger delete-course" data-id="${index}" data-type="course"><i class="fas fa-trash"></i></button>
                        <button class="btn btn-sm btn-secondary export-course" data-id="${index}" data-type="course"><i class="fas fa-file-export"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Adicionar eventos aos botões
            document.querySelectorAll('.edit-course').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    editCourse(id);
                });
            });

            document.querySelectorAll('.delete-course').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    const type = this.getAttribute('data-type');
                    showConfirmationModal(id, type, 'Tem certeza que deseja excluir este curso?');
                });
            });

            document.querySelectorAll('.complete-checkbox[data-type="course"]').forEach(checkbox => {
                checkbox.addEventListener('change', function () {
                    const id = this.getAttribute('data-id');
                    const type = this.getAttribute('data-type');
                    toggleCompleteStatus(id, type, this.checked);
                });
            });

            document.querySelectorAll('.export-course').forEach(btn => {
                btn.addEventListener('click', function () {
                    const type = this.getAttribute('data-type');
                    showExportModal(type);
                });
            });
        }

        // Salvar curso
        function saveCourse() {
            const name = document.getElementById('courseName').value;
            const workload = parseInt(document.getElementById('courseWorkload').value);
            const hoursStudied = parseInt(document.getElementById('courseHoursStudied').value) || 0;
            const status = document.getElementById('courseStatus').value;
            const finalSituation = document.getElementById('courseFinalSituation').value;

            if (!name || !workload) {
                alert('Preencha todos os campos obrigatórios!');
                return;
            }

            const data = getData();
            data.courses.push({
                name,
                workload,
                hoursStudied,
                status,
                finalSituation,
                completed: status === 'Concluída'
            });

            saveData(data);
            updateUI();

            // Fechar modal e limpar formulário
            bootstrap.Modal.getInstance(document.getElementById('addCourseModal')).hide();
            document.getElementById('courseForm').reset();
        }

        // Editar curso
        function editCourse(id) {
            const data = getData();
            const course = data.courses[id];

            document.getElementById('editCourseId').value = id;
            document.getElementById('editCourseName').value = course.name;
            document.getElementById('editCourseWorkload').value = course.workload;
            document.getElementById('editCourseHoursStudied').value = course.hoursStudied;
            document.getElementById('editCourseStatus').value = course.status;
            document.getElementById('editCourseFinalSituation').value = course.finalSituation || '';

            const modal = new bootstrap.Modal(document.getElementById('editCourseModal'));
            modal.show();
        }

        // Atualizar curso
        function updateCourse() {
            const id = document.getElementById('editCourseId').value;
            const name = document.getElementById('editCourseName').value;
            const workload = parseInt(document.getElementById('editCourseWorkload').value);
            const hoursStudied = parseInt(document.getElementById('editCourseHoursStudied').value) || 0;
            const status = document.getElementById('editCourseStatus').value;
            const finalSituation = document.getElementById('editCourseFinalSituation').value;

            if (!name || !workload) {
                alert('Preencha todos os campos obrigatórios!');
                return;
            }

            const data = getData();
            data.courses[id] = {
                name,
                workload,
                hoursStudied,
                status,
                finalSituation,
                completed: status === 'Concluída'
            };

            saveData(data);
            updateUI();

            // Fechar modal
            bootstrap.Modal.getInstance(document.getElementById('editCourseModal')).hide();
        }

        // ========== ATIVIDADES ========== //
        // Renderizar tabela de atividades
        function renderActivitiesTable(activities) {
            const tbody = document.querySelector('#activitiesTable tbody');
            tbody.innerHTML = '';

            activities.forEach((activity, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
            <td class="text-center">
                <input type="checkbox" class="form-check-input complete-checkbox" ${activity.status === 'Concluído' ? 'checked' : ''} data-id="${index}" data-type="activity">
            </td>
            <td>${activity.name}</td>
            <td>
                ${activity.type}
                ${activity.typeDescription ? `<br><small class="text-muted">${activity.typeDescription}</small>` : ''}
            </td>
            <td>${activity.relatedTo}</td>
            <td>${formatDate(activity.date)}</td>
            <td><span class="status-badge ${getStatusClass(activity.status)}">${activity.status}</span></td>
            <td>
                <button class="btn btn-sm btn-primary edit-activity" data-id="${index}"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger delete-activity" data-id="${index}" data-type="activity"><i class="fas fa-trash"></i></button>
                <button class="btn btn-sm btn-secondary export-activity" data-id="${index}" data-type="activity"><i class="fas fa-file-export"></i></button>
            </td>
        `;
                tbody.appendChild(tr);

            });

            // Adicionar eventos aos botões
            document.querySelectorAll('.edit-activity').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    editActivity(id);
                });
            });

            document.querySelectorAll('.delete-activity').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    const type = this.getAttribute('data-type');
                    showConfirmationModal(id, type, 'Tem certeza que deseja excluir esta atividade?');
                });
            });

            document.querySelectorAll('.complete-checkbox[data-type="activity"]').forEach(checkbox => {
                checkbox.addEventListener('change', function () {
                    const id = this.getAttribute('data-id');
                    const type = this.getAttribute('data-type');
                    toggleCompleteStatus(id, type, this.checked);
                });
            });

            document.querySelectorAll('.export-activity').forEach(btn => {
                btn.addEventListener('click', function () {
                    const type = this.getAttribute('data-type');
                    showExportModal(type);
                });
            });
        }

        // Salvar atividade
        function saveActivity() {
            const name = document.getElementById('activityName').value;
            const type = document.getElementById('activityType').value;
            const relatedTo = document.getElementById('activityRelatedTo').value;
            const date = document.getElementById('activityDate').value;
            const status = document.getElementById('activityStatus').value;

            if (!name || !type || !relatedTo || !date) {
                alert('Preencha todos os campos obrigatórios!');
                return;
            }

            const data = getData();
            data.activities.push({
                name,
                type,
                typeDescription: document.getElementById('activityTypeDescription').value, // Novo campo
                relatedTo,
                date,
                status,
                completed: status === 'Concluído'
            });

            saveData(data);
            updateUI();

            // Fechar modal e limpar formulário
            bootstrap.Modal.getInstance(document.getElementById('addActivityModal')).hide();
            document.getElementById('activityForm').reset();
        }

        // Editar atividade
        function editActivity(id) {
            const data = getData();
            const activity = data.activities[id];

            document.getElementById('editActivityId').value = id;
            document.getElementById('editActivityName').value = activity.name;
            document.getElementById('editActivityType').value = activity.type;
            document.getElementById('editActivityTypeDescription').value = activity.typeDescription || '';

            // Preencher dropdown de disciplinas/cursos
            const relatedToDropdown = document.getElementById('editActivityRelatedTo');
            relatedToDropdown.innerHTML = '<option value="">Selecione...</option>';

            const dataForDropdown = getData();
            dataForDropdown.subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.name;
                option.textContent = subject.name;
                if (subject.name === activity.relatedTo) {
                    option.selected = true;
                }
                relatedToDropdown.appendChild(option);
            });

            dataForDropdown.courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.name;
                option.textContent = course.name;
                if (course.name === activity.relatedTo) {
                    option.selected = true;
                }
                relatedToDropdown.appendChild(option);
            });

            document.getElementById('editActivityDate').value = activity.date;
            document.getElementById('editActivityStatus').value = activity.status;

            const modal = new bootstrap.Modal(document.getElementById('editActivityModal'));
            modal.show();
        }

        // Atualizar atividade
        // Atualizar a função updateActivity()
        function updateActivity() {
            const id = document.getElementById('editActivityId').value;
            const name = document.getElementById('editActivityName').value;
            const type = document.getElementById('editActivityType').value;
            const typeDescription = document.getElementById('editActivityTypeDescription').value;
            const relatedTo = document.getElementById('editActivityRelatedTo').value;
            const date = document.getElementById('editActivityDate').value;
            const status = document.getElementById('editActivityStatus').value;

            if (!name || !type || !relatedTo || !date) {
                alert('Preencha todos os campos obrigatórios!');
                return;
            }

            const data = getData();
            data.activities[id] = {
                name,
                type,
                typeDescription,
                relatedTo,
                date,
                status,
                completed: status === 'Concluído'
            };

            saveData(data);
            updateUI();

            // Fechar modal
            bootstrap.Modal.getInstance(document.getElementById('editActivityModal')).hide();
        }

        // ========== CALENDÁRIO ========== //
        // Renderizar calendário
        function renderCalendar(month, year) {
            document.getElementById('currentMonthYear').textContent = `${getMonthName(month)} ${year}`;

            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const daysInMonth = lastDay.getDate();
            const startingDay = firstDay.getDay();

            const calendarBody = document.getElementById('calendarBody');
            calendarBody.innerHTML = '';

            let date = 1;
            const data = getData();

            for (let i = 0; i < 6; i++) {
                // Criar apenas linhas necessárias
                if (date > daysInMonth) break;

                const row = document.createElement('tr');

                for (let j = 0; j < 7; j++) {
                    const cell = document.createElement('td');

                    if (i === 0 && j < startingDay) {
                        // Células vazias antes do primeiro dia do mês
                        cell.classList.add('text-muted');
                        cell.textContent = '';
                    } else if (date > daysInMonth) {
                        // Células vazias após o último dia do mês
                        cell.classList.add('text-muted');
                        cell.textContent = '';
                    } else {
                        // Dias do mês
                        cell.classList.add('calendar-day');

                        const dayDiv = document.createElement('div');
                        dayDiv.classList.add('calendar-day-number');
                        dayDiv.textContent = date;

                        cell.appendChild(dayDiv);

                        // Verificar se há lembretes para este dia
                        const currentDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                        const dayReminders = data.reminders.filter(r => r.date === currentDate);

                        if (dayReminders.length > 0) {
                            dayReminders.forEach(reminder => {
                                const reminderDiv = document.createElement('div');
                                reminderDiv.classList.add('reminder-item', `bg-${reminder.color}`);
                                reminderDiv.textContent = reminder.title;

                                reminderDiv.addEventListener('click', function () {
                                    viewReminder(reminder.id);
                                });

                                cell.appendChild(reminderDiv);
                            });
                        }

                        // Adicionar evento para adicionar lembrete
                        cell.addEventListener('click', function (e) {
                            if (e.target === cell || e.target.classList.contains('calendar-day-number')) {
                                document.getElementById('reminderDate').value = currentDate;
                                const modal = new bootstrap.Modal(document.getElementById('addReminderModal'));
                                modal.show();
                            }
                        });

                        date++;
                    }

                    row.appendChild(cell);
                }

                calendarBody.appendChild(row);
            }
        }

        // Mês anterior
        function showPrevMonth() {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentMonth, currentYear);
        }

        // Próximo mês
        function showNextMonth() {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentMonth, currentYear);
        }

        // Salvar lembrete
        function saveReminder() {
            const title = document.getElementById('reminderTitle').value;
            const description = document.getElementById('reminderDescription').value;
            const date = document.getElementById('reminderDate').value;
            const color = document.getElementById('reminderColor').value;

            if (!title || !date) {
                alert('Preencha todos os campos obrigatórios!');
                return;
            }

            const data = getData();
            const id = Date.now().toString();

            data.reminders.push({
                id,
                title,
                description,
                date,
                color
            });

            saveData(data);
            renderCalendar(currentMonth, currentYear);

            // Fechar modal e limpar formulário
            bootstrap.Modal.getInstance(document.getElementById('addReminderModal')).hide();
            document.getElementById('reminderForm').reset();
        }

        // Visualizar lembrete
        function viewReminder(id) {
            const data = getData();
            const reminder = data.reminders.find(r => r.id === id);

            if (!reminder) return;

            document.getElementById('viewReminderTitle').textContent = reminder.title;
            document.getElementById('viewReminderDescription').textContent = reminder.description || 'Sem descrição';
            document.getElementById('viewReminderDate').textContent = formatDate(reminder.date);

            // Configurar botão de exclusão
            document.getElementById('deleteReminder').setAttribute('data-id', id);
            document.getElementById('deleteReminder').setAttribute('data-type', 'reminder');

            const modal = new bootstrap.Modal(document.getElementById('viewReminderModal'));
            modal.show();
        }

        // Excluir lembrete
        function deleteReminder() {
            const id = document.getElementById('deleteReminder').getAttribute('data-id');

            const data = getData();
            data.reminders = data.reminders.filter(r => r.id !== id);

            saveData(data);
            renderCalendar(currentMonth, currentYear);

            // Fechar modal
            bootstrap.Modal.getInstance(document.getElementById('viewReminderModal')).hide();
        }

        // ========== ANOTAÇÕES ========== //
        // Renderizar anotações
        function renderNotes(notes) {
            const container = document.getElementById('notesContainer');
            container.innerHTML = '';

            notes.forEach((note, index) => {
                const noteDiv = document.createElement('div');
                noteDiv.classList.add('note-item');
                noteDiv.innerHTML = `
                    <h5>${note.title}</h5>
                    <p>${note.content.replace(/\n/g, '<br>')}</p>
                    <div class="text-end">
                        <button class="btn btn-sm btn-primary edit-note" data-id="${index}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger delete-note" data-id="${index}" data-type="note"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                container.appendChild(noteDiv);
            });

            // Adicionar eventos aos botões
            document.querySelectorAll('.edit-note').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    editNote(id);
                });
            });

            document.querySelectorAll('.delete-note').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    const type = this.getAttribute('data-type');
                    showConfirmationModal(id, type, 'Tem certeza que deseja excluir esta anotação?');
                });
            });
        }

        // Salvar anotação
        function saveNote() {
            const title = document.getElementById('noteTitle').value;
            const content = document.getElementById('noteContent').value;

            if (!title || !content) {
                alert('Preencha todos os campos obrigatórios!');
                return;
            }

            const data = getData();
            data.notes.push({
                title,
                content
            });

            saveData(data);
            renderNotes(data.notes);

            // Fechar modal e limpar formulário
            bootstrap.Modal.getInstance(document.getElementById('addNoteModal')).hide();
            document.getElementById('noteForm').reset();
        }

        // Editar anotação
        function editNote(id) {
            const data = getData();
            const note = data.notes[id];

            document.getElementById('editNoteId').value = id;
            document.getElementById('editNoteTitle').value = note.title;
            document.getElementById('editNoteContent').value = note.content;

            const modal = new bootstrap.Modal(document.getElementById('editNoteModal'));
            modal.show();
        }

        // Atualizar anotação
        function updateNote() {
            const id = document.getElementById('editNoteId').value;
            const title = document.getElementById('editNoteTitle').value;
            const content = document.getElementById('editNoteContent').value;

            if (!title || !content) {
                alert('Preencha todos os campos obrigatórios!');
                return;
            }

            const data = getData();
            data.notes[id] = {
                title,
                content
            };

            saveData(data);
            renderNotes(data.notes);

            // Fechar modal
            bootstrap.Modal.getInstance(document.getElementById('editNoteModal')).hide();
        }

        // ========== POMODORO ========== //
        // Iniciar Pomodoro
        function startPomodoro() {
            const data = getData();
            const settings = data.settings.pomodoro;

            // Definir tempo com base no modo selecionado
            if (document.getElementById('focusMode').checked) {
                currentPomodoroMode = 'focus';
                pomodoroTimeLeft = settings.focusDuration * 60;
            } else if (document.getElementById('shortBreakMode').checked) {
                currentPomodoroMode = 'shortBreak';
                pomodoroTimeLeft = settings.shortBreakDuration * 60;
            } else {
                currentPomodoroMode = 'longBreak';
                pomodoroTimeLeft = settings.longBreakDuration * 60;
            }

            // Atualizar interface
            updatePomodoroDisplay();

            // Mostrar/ocultar botões
            document.getElementById('startPomodoro').classList.add('d-none');
            document.getElementById('stopPomodoro').classList.remove('d-none');
            document.getElementById('pausePomodoro').classList.remove('d-none');
            document.getElementById('resumePomodoro').classList.add('d-none');

            // Iniciar contador
            pomodoroIsRunning = true;
            pomodoroIsPaused = false;

            pomodoroInterval = setInterval(function () {
                if (pomodoroTimeLeft > 0) {
                    pomodoroTimeLeft--;
                    updatePomodoroDisplay();
                } else {
                    // Tempo acabou
                    clearInterval(pomodoroInterval);
                    pomodoroIsRunning = false;

                    // Adicionar ao histórico
                    addPomodoroToHistory();

                    // Mostrar notificação
                    let message = '';
                    if (currentPomodoroMode === 'focus') {
                        completedPomodoroCycles++;
                        document.getElementById('completedCycles').textContent = completedPomodoroCycles;

                        const cyclesBeforeLongBreak = settings.cyclesBeforeLongBreak;
                        if (completedPomodoroCycles % cyclesBeforeLongBreak === 0) {
                            message = 'Sessão de foco concluída! Hora de uma pausa longa.';
                            document.getElementById('longBreakMode').checked = true;
                        } else {
                            message = 'Sessão de foco concluída! Hora de uma pausa curta.';
                            document.getElementById('shortBreakMode').checked = true;
                        }
                    } else {
                        message = 'Pausa concluída! Hora de voltar ao foco.';
                        document.getElementById('focusMode').checked = true;
                    }

                    alert(message);

                    // Resetar botões
                    document.getElementById('startPomodoro').classList.remove('d-none');
                    document.getElementById('stopPomodoro').classList.add('d-none');
                    document.getElementById('pausePomodoro').classList.add('d-none');
                    document.getElementById('resumePomodoro').classList.add('d-none');
                }
            }, 1000);
        }

        // Parar Pomodoro
        function stopPomodoro() {
            clearInterval(pomodoroInterval);
            pomodoroIsRunning = false;

            // Resetar tempo
            const data = getData();
            const settings = data.settings.pomodoro;

            if (currentPomodoroMode === 'focus') {
                pomodoroTimeLeft = settings.focusDuration * 60;
            } else if (currentPomodoroMode === 'shortBreak') {
                pomodoroTimeLeft = settings.shortBreakDuration * 60;
            } else {
                pomodoroTimeLeft = settings.longBreakDuration * 60;
            }

            updatePomodoroDisplay();

            // Resetar botões
            document.getElementById('startPomodoro').classList.remove('d-none');
            document.getElementById('stopPomodoro').classList.add('d-none');
            document.getElementById('pausePomodoro').classList.add('d-none');
            document.getElementById('resumePomodoro').classList.add('d-none');
        }

        // Pausar Pomodoro
        function pausePomodoro() {
            clearInterval(pomodoroInterval);
            pomodoroIsPaused = true;

            // Atualizar botões
            document.getElementById('pausePomodoro').classList.add('d-none');
            document.getElementById('resumePomodoro').classList.remove('d-none');
        }

        // Continuar Pomodoro
        function resumePomodoro() {
            pomodoroIsPaused = false;

            // Continuar contador
            pomodoroInterval = setInterval(function () {
                if (pomodoroTimeLeft > 0) {
                    pomodoroTimeLeft--;
                    updatePomodoroDisplay();
                } else {
                    // Tempo acabou
                    clearInterval(pomodoroInterval);
                    pomodoroIsRunning = false;

                    // Adicionar ao histórico
                    addPomodoroToHistory();

                    // Mostrar notificação
                    let message = '';
                    const data = getData();
                    const settings = data.settings.pomodoro;

                    if (currentPomodoroMode === 'focus') {
                        completedPomodoroCycles++;
                        document.getElementById('completedCycles').textContent = completedPomodoroCycles;

                        const cyclesBeforeLongBreak = settings.cyclesBeforeLongBreak;
                        if (completedPomodoroCycles % cyclesBeforeLongBreak === 0) {
                            message = 'Sessão de foco concluída! Hora de uma pausa longa.';
                            document.getElementById('longBreakMode').checked = true;
                        } else {
                            message = 'Sessão de foco concluída! Hora de uma pausa curta.';
                            document.getElementById('shortBreakMode').checked = true;
                        }
                    } else {
                        message = 'Pausa concluída! Hora de voltar ao foco.';
                        document.getElementById('focusMode').checked = true;
                    }

                    alert(message);

                    // Resetar botões
                    document.getElementById('startPomodoro').classList.remove('d-none');
                    document.getElementById('stopPomodoro').classList.add('d-none');
                    document.getElementById('pausePomodoro').classList.add('d-none');
                    document.getElementById('resumePomodoro').classList.add('d-none');
                }
            }, 1000);

            // Atualizar botões
            document.getElementById('pausePomodoro').classList.remove('d-none');
            document.getElementById('resumePomodoro').classList.add('d-none');
        }

        // Mudar modo Pomodoro
        function changePomodoroMode() {
            const data = getData();
            const settings = data.settings.pomodoro;

            if (document.getElementById('focusMode').checked) {
                currentPomodoroMode = 'focus';
                pomodoroTimeLeft = settings.focusDuration * 60;
            } else if (document.getElementById('shortBreakMode').checked) {
                currentPomodoroMode = 'shortBreak';
                pomodoroTimeLeft = settings.shortBreakDuration * 60;
            } else {
                currentPomodoroMode = 'longBreak';
                pomodoroTimeLeft = settings.longBreakDuration * 60;
            }

            updatePomodoroDisplay();
        }

        // Atualizar display do Pomodoro
        function updatePomodoroDisplay() {
            const minutes = Math.floor(pomodoroTimeLeft / 60);
            const seconds = pomodoroTimeLeft % 60;

            document.getElementById('pomodoroTimer').textContent =
                `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }

        // Adicionar sessão Pomodoro ao histórico
        function addPomodoroToHistory() {
            const data = getData();
            const settings = data.settings.pomodoro;

            let duration = 0;
            if (currentPomodoroMode === 'focus') {
                duration = settings.focusDuration;
            } else if (currentPomodoroMode === 'shortBreak') {
                duration = settings.shortBreakDuration;
            } else {
                duration = settings.longBreakDuration;
            }

            data.pomodoroHistory.push({
                date: new Date().toISOString().split('T')[0],
                type: currentPomodoroMode === 'focus' ? 'Foco' : currentPomodoroMode === 'shortBreak' ? 'Pausa Curta' : 'Pausa Longa',
                duration,
                subject: pomodoroSubject
            });

            saveData(data);
            renderPomodoroHistoryTable(data.pomodoroHistory);
        }

        // Renderizar tabela de histórico do Pomodoro
        function renderPomodoroHistoryTable(history) {
            const tbody = document.querySelector('#pomodoroHistoryTable tbody');
            tbody.innerHTML = '';

            history.forEach((session, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${formatDate(session.date)}</td>
                    <td>${session.type}</td>
                    <td>${session.duration} min</td>
                    <td>${session.subject || 'N/A'}</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // ========== METAS SMART ========== //
        // Renderizar tabela de metas
        function renderGoalsTable(goals) {
            const tbody = document.querySelector('#goalsTable tbody');
            tbody.innerHTML = '';

            goals.forEach((goal, index) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="text-center">
                        <input type="checkbox" class="form-check-input complete-checkbox" ${goal.status === 'Concluída' ? 'checked' : ''} data-id="${index}" data-type="goal">
                    </td>
                    <td>${goal.title}</td>
                    <td>
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: ${goal.progress}%" aria-valuenow="${goal.progress}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <small>${goal.progress}%</small>
                    </td>
                    <td>${formatDate(goal.deadline)}</td>
                    <td><span class="status-badge ${getStatusClass(goal.status)}">${goal.status}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary edit-goal" data-id="${index}"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger delete-goal" data-id="${index}" data-type="goal"><i class="fas fa-trash"></i></button>
                        <button class="btn btn-sm btn-info view-goal" data-id="${index}"><i class="fas fa-eye"></i></button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Adicionar eventos aos botões
            document.querySelectorAll('.edit-goal').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    editGoal(id);
                });
            });

            document.querySelectorAll('.delete-goal').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    const type = this.getAttribute('data-type');
                    showConfirmationModal(id, type, 'Tem certeza que deseja excluir esta meta?');
                });
            });

            document.querySelectorAll('.view-goal').forEach(btn => {
                btn.addEventListener('click', function () {
                    const id = this.getAttribute('data-id');
                    viewGoal(id);
                });
            });

            document.querySelectorAll('.complete-checkbox[data-type="goal"]').forEach(checkbox => {
                checkbox.addEventListener('change', function () {
                    const id = this.getAttribute('data-id');
                    const type = this.getAttribute('data-type');
                    toggleCompleteStatus(id, type, this.checked);
                });
            });
        }

        // Salvar meta
        function saveGoal() {
            const title = document.getElementById('goalTitle').value;
            const specific = document.getElementById('goalSpecific').value;
            const measurable = document.getElementById('goalMeasurable').value;
            const achievable = document.getElementById('goalAchievable').value;
            const relevant = document.getElementById('goalRelevant').value;
            const temporal = document.getElementById('goalTemporal').value;
            const progress = parseInt(document.getElementById('goalProgress').value);
            const deadline = document.getElementById('goalDeadline').value;
            const status = document.getElementById('goalStatus').value;

            if (!title || !specific || !measurable || !achievable || !relevant || !temporal || !deadline) {
                alert('Preencha todos os campos obrigatórios!');
                return;
            }

            const data = getData();
            data.goals.push({
                title,
                specific,
                measurable,
                achievable,
                relevant,
                temporal,
                progress,
                deadline,
                status,
                completed: status === 'Concluída'
            });

            saveData(data);
            renderGoalsTable(data.goals);

            // Fechar modal e limpar formulário
            bootstrap.Modal.getInstance(document.getElementById('addGoalModal')).hide();
            document.getElementById('goalForm').reset();
        }

        // Editar meta
        function editGoal(id) {
            const data = getData();
            const goal = data.goals[id];

            document.getElementById('editGoalId').value = id;
            document.getElementById('editGoalTitle').value = goal.title;
            document.getElementById('editGoalSpecific').value = goal.specific;
            document.getElementById('editGoalMeasurable').value = goal.measurable;
            document.getElementById('editGoalAchievable').value = goal.achievable;
            document.getElementById('editGoalRelevant').value = goal.relevant;
            document.getElementById('editGoalTemporal').value = goal.temporal;
            document.getElementById('editGoalProgress').value = goal.progress;
            document.getElementById('editGoalProgressValue').textContent = goal.progress + '%';
            document.getElementById('editGoalDeadline').value = goal.deadline;
            document.getElementById('editGoalStatus').value = goal.status;

            const modal = new bootstrap.Modal(document.getElementById('editGoalModal'));
            modal.show();
        }

        // Atualizar meta
        function updateGoal() {
            const id = document.getElementById('editGoalId').value;
            const title = document.getElementById('editGoalTitle').value;
            const specific = document.getElementById('editGoalSpecific').value;
            const measurable = document.getElementById('editGoalMeasurable').value;
            const achievable = document.getElementById('editGoalAchievable').value;
            const relevant = document.getElementById('editGoalRelevant').value;
            const temporal = document.getElementById('editGoalTemporal').value;
            const progress = parseInt(document.getElementById('editGoalProgress').value);
            const deadline = document.getElementById('editGoalDeadline').value;
            const status = document.getElementById('editGoalStatus').value;

            if (!title || !specific || !measurable || !achievable || !relevant || !temporal || !deadline) {
                alert('Preencha todos os campos obrigatórios!');
                return;
            }

            const data = getData();
            data.goals[id] = {
                title,
                specific,
                measurable,
                achievable,
                relevant,
                temporal,
                progress,
                deadline,
                status,
                completed: status === 'Concluída'
            };

            saveData(data);
            renderGoalsTable(data.goals);

            // Fechar modal
            bootstrap.Modal.getInstance(document.getElementById('editGoalModal')).hide();
        }

        // Visualizar meta
        function viewGoal(id) {
            const data = getData();
            const goal = data.goals[id];

            document.getElementById('viewGoalTitle').textContent = goal.title;
            document.getElementById('viewGoalProgressBar').style.width = goal.progress + '%';
            document.getElementById('viewGoalProgressText').textContent = `Progresso: ${goal.progress}%`;
            document.getElementById('viewGoalSpecific').textContent = goal.specific;
            document.getElementById('viewGoalMeasurable').textContent = goal.measurable;
            document.getElementById('viewGoalAchievable').textContent = goal.achievable;
            document.getElementById('viewGoalRelevant').textContent = goal.relevant;
            document.getElementById('viewGoalTemporal').textContent = goal.temporal;
            document.getElementById('viewGoalStatus').textContent = goal.status;
            document.getElementById('viewGoalStatus').className = `status-badge ${getStatusClass(goal.status)}`;
            document.getElementById('viewGoalDeadline').textContent = formatDate(goal.deadline);

            const modal = new bootstrap.Modal(document.getElementById('viewGoalModal'));
            modal.show();
        }

        // ========== DASHBOARD ========== //
        // Atualizar dashboard
        function updateDashboard(data) {
            // Progresso Graduação
            const graduationProgress = calculateProgress(data.subjects);
            document.getElementById('graduation-progress').textContent = graduationProgress + '%';
            document.getElementById('graduation-progress-bar').style.width = graduationProgress + '%';

            // Progresso Extensão
            const extensionProgress = calculateProgress(data.courses);
            document.getElementById('extension-progress').textContent = extensionProgress + '%';
            document.getElementById('extension-progress-bar').style.width = extensionProgress + '%';

            // Atividades Pendentes
            const pendingTasks = data.activities.filter(a => a.status === 'Pendente').length;
            document.getElementById('pending-tasks').textContent = pendingTasks;

            // Metas Concluídas
            const completedGoals = data.goals.filter(g => g.status === 'Concluída').length;
            const totalGoals = data.goals.length;
            const goalsProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

            document.getElementById('completed-goals').textContent = completedGoals;
            document.getElementById('goals-progress-bar').style.width = goalsProgress + '%';

            // Disciplinas em Andamento
            const ongoingSubjects = data.subjects.filter(s => s.status === 'Em curso');
            const ongoingSubjectsTable = document.querySelector('#ongoing-subjects-table tbody');
            ongoingSubjectsTable.innerHTML = '';

            ongoingSubjects.forEach(subject => {
                const progress = Math.min(Math.round((subject.hoursStudied / subject.workload) * 100), 100);

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${subject.name}</td>
                    <td>
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: ${progress}%" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <small>${progress}%</small>
                    </td>
                    <td><span class="status-badge ${getStatusClass(subject.status)}">${subject.status}</span></td>
                `;
                ongoingSubjectsTable.appendChild(tr);
            });

            // Próximas Atividades
            const today = new Date().toISOString().split('T')[0];
            const upcomingActivities = data.activities
                .filter(a => a.date >= today)
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 5);

            const upcomingTasksTable = document.querySelector('#upcoming-tasks-table tbody');
            upcomingTasksTable.innerHTML = '';

            upcomingActivities.forEach(activity => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${activity.name}</td>
                    <td>${formatDate(activity.date)}</td>
                    <td><span class="status-badge ${getStatusClass(activity.status)}">${activity.status}</span></td>
                `;
                upcomingTasksTable.appendChild(tr);
            });
        }

        // Calcular progresso geral
        function calculateProgress(items) {
            if (items.length === 0) return 0;

            const total = items.length;
            const completed = items.filter(i => i.status === 'Concluída').length;

            return Math.round((completed / total) * 100);
        }

        // ========== ESTATÍSTICAS ========== //
        // Atualizar estatísticas
        function updateStatistics(data) {
            // Tempo total de estudo
            const totalStudyHours = data.subjects.reduce((sum, subject) => sum + subject.hoursStudied, 0);
            document.getElementById('totalStudyTime').textContent = totalStudyHours + 'h';

            // Média diária (considerando últimos 30 dias)
            const averageDaily = Math.round(totalStudyHours / 30 * 10) / 10;
            document.getElementById('averageDailyStudy').textContent = averageDaily + 'h';

            // Taxa de conclusão
            const totalItems = data.subjects.length + data.courses.length;
            const completedItems = data.subjects.filter(s => s.status === 'Concluída').length +
                data.courses.filter(c => c.status === 'Concluída').length;
            const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
            document.getElementById('completionRate').textContent = completionRate + '%';
        }

        // Renderizar gráficos
        function renderCharts() {
            const data = getData();

            // Gráfico de tempo de estudo semanal
            const weeklyStudyTimeCtx = document.getElementById('weeklyStudyTimeChart').getContext('2d');

            // Dados de exemplo - na prática, você precisaria rastrear o tempo de estudo por dia
            const weeklyStudyTimeData = {
                labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Horas de Estudo',
                    data: [2, 3, 1.5, 2.5, 3, 1, 0.5],
                    backgroundColor: 'rgba(78, 115, 223, 0.5)',
                    borderColor: 'rgba(78, 115, 223, 1)',
                    borderWidth: 1
                }]
            };

            new Chart(weeklyStudyTimeCtx, {
                type: 'bar',
                data: weeklyStudyTimeData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return value + 'h';
                                }
                            }
                        }
                    }
                }
            });

            // Gráfico de distribuição por disciplina
            const subjectDistributionCtx = document.getElementById('subjectDistributionChart').getContext('2d');

            const subjectsData = data.subjects.map(subject => ({
                name: subject.name,
                hours: subject.hoursStudied
            })).sort((a, b) => b.hours - a.hours).slice(0, 5);

            const subjectDistributionData = {
                labels: subjectsData.map(s => s.name),
                datasets: [{
                    data: subjectsData.map(s => s.hours),
                    backgroundColor: [
                        'rgba(78, 115, 223, 0.7)',
                        'rgba(28, 200, 138, 0.7)',
                        'rgba(246, 194, 62, 0.7)',
                        'rgba(231, 74, 59, 0.7)',
                        'rgba(54, 185, 204, 0.7)'
                    ],
                    borderWidth: 1
                }]
            };

            new Chart(subjectDistributionCtx, {
                type: 'doughnut',
                data: subjectDistributionData,
                options: {
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });

            // Gráfico de progresso acumulado
            const cumulativeProgressCtx = document.getElementById('cumulativeProgressChart').getContext('2d');

            // Dados de exemplo - na prática, você precisaria rastrear o progresso ao longo do tempo
            const cumulativeProgressData = {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                datasets: [
                    {
                        label: 'Graduação',
                        data: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
                        borderColor: 'rgba(78, 115, 223, 1)',
                        backgroundColor: 'rgba(78, 115, 223, 0.1)',
                        fill: true
                    },
                    {
                        label: 'Extensão',
                        data: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24],
                        borderColor: 'rgba(28, 200, 138, 1)',
                        backgroundColor: 'rgba(28, 200, 138, 0.1)',
                        fill: true
                    }
                ]
            };

            new Chart(cumulativeProgressCtx, {
                type: 'line',
                data: cumulativeProgressData,
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            });
        }

        // ========== FUNÇÕES UTILITÁRIAS ========== //
        // Alternar status de conclusão
        function toggleCompleteStatus(id, type, isCompleted) {
            const data = getData();

            switch (type) {
                case 'subject':
                    data.subjects[id].status = isCompleted ? 'Concluída' : 'Em curso';
                    data.subjects[id].completed = isCompleted;
                    break;
                case 'course':
                    data.courses[id].status = isCompleted ? 'Concluída' : 'Em curso';
                    data.courses[id].completed = isCompleted;
                    break;
                case 'activity':
                    data.activities[id].status = isCompleted ? 'Concluído' : 'Pendente';
                    data.activities[id].completed = isCompleted;
                    break;
                case 'goal':
                    data.goals[id].status = isCompleted ? 'Concluída' : 'Em andamento';
                    data.goals[id].completed = isCompleted;
                    data.goals[id].progress = isCompleted ? 100 : 0;
                    break;
            }

            saveData(data);
            updateUI();
        }

        // Mostrar modal de confirmação
        function showConfirmationModal(id, type, message) {
            document.getElementById('confirmationMessage').textContent = message;
            document.getElementById('itemToDeleteId').value = id;
            document.getElementById('itemToDeleteType').value = type;

            const modal = new bootstrap.Modal(document.getElementById('confirmationModal'));
            modal.show();
        }

        // Confirmar exclusão
        function confirmDelete() {
            const id = document.getElementById('itemToDeleteId').value;
            const type = document.getElementById('itemToDeleteType').value;

            const data = getData();

            switch (type) {
                case 'subject':
                    data.subjects.splice(id, 1);
                    break;
                case 'course':
                    data.courses.splice(id, 1);
                    break;
                case 'activity':
                    data.activities.splice(id, 1);
                    break;
                case 'goal':
                    data.goals.splice(id, 1);
                    break;
                case 'note':
                    data.notes.splice(id, 1);
                    break;
                case 'reminder':
                    data.reminders = data.reminders.filter(r => r.id !== id);
                    break;
            }

            saveData(data);
            updateUI();

            // Fechar modal
            bootstrap.Modal.getInstance(document.getElementById('confirmationModal')).hide();
        }

        // Mostrar modal de exportação
        function showExportModal(type) {
            document.getElementById('exportType').value = type;

            const modal = new bootstrap.Modal(document.getElementById('exportModal'));
            modal.show();
        }

        // Confirmar exportação
        function confirmExport() {
            const type = document.getElementById('exportType').value;
            const format = document.querySelector('input[name="exportFormat"]:checked').value;

            const data = getData();

            if (format === 'pdf') {
                exportToPDF(type);
            } else {
                exportToJSON(type);
            }

            // Fechar modal
            bootstrap.Modal.getInstance(document.getElementById('exportModal')).hide();
        }

        // Exportar para PDF
        function exportToPDF(type) {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            const data = getData();
            let items = [];
            let title = '';

            switch (type) {
                case 'subject':
                    items = data.subjects;
                    title = 'Disciplinas da Graduação';
                    break;
                case 'course':
                    items = data.courses;
                    title = 'Cursos de Extensão';
                    break;
                case 'activity':
                    items = data.activities;
                    title = 'Atividades';
                    break;
            }

            // Adicionar título
            doc.setFontSize(18);
            doc.text(title, 14, 20);

            // Adicionar data
            doc.setFontSize(10);
            doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 28);

            // Preparar dados da tabela
            const tableData = items.map(item => {
                if (type === 'subject' || type === 'course') {
                    const progress = Math.min(Math.round((item.hoursStudied / item.workload) * 100), 100);
                    return [
                        item.name,
                        item.workload + 'h',
                        item.hoursStudied + 'h',
                        progress + '%',
                        item.status,
                        item.finalSituation || 'N/A'
                    ];
                } else {
                    return [
                        item.name,
                        item.type,
                        item.relatedTo,
                        formatDate(item.date),
                        item.status
                    ];
                }
            });

            // Cabeçalhos da tabela
            let headers = [];
            if (type === 'subject' || type === 'course') {
                headers = ['Nome', 'Carga Horária', 'Horas Estudadas', 'Progresso', 'Status', 'Situação'];
            } else {
                headers = ['Atividade', 'Tipo', 'Vinculada a', 'Data', 'Status'];
            }

            // Adicionar tabela
            doc.autoTable({
                head: [headers],
                body: tableData,
                startY: 35,
                styles: {
                    fontSize: 8,
                    cellPadding: 2
                },
                headStyles: {
                    fillColor: [78, 115, 223],
                    textColor: [255, 255, 255]
                }
            });

            // Salvar PDF
            doc.save(`${title.toLowerCase().replace(/ /g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
        }

        // Exportar para JSON
        function exportToJSON(type) {
            const data = getData();
            let items = [];
            let filename = '';

            switch (type) {
                case 'subject':
                    items = data.subjects;
                    filename = 'disciplinas_graduacao';
                    break;
                case 'course':
                    items = data.courses;
                    filename = 'cursos_extensao';
                    break;
                case 'activity':
                    items = data.activities;
                    filename = 'atividades';
                    break;
            }

            const jsonStr = JSON.stringify(items, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }

        // Atualizar dropdowns de disciplinas/cursos
        function updateRelatedToDropdowns() {
            const data = getData();
            const dropdowns = [
                document.getElementById('activityRelatedTo'),
                document.getElementById('editActivityRelatedTo')
            ];

            dropdowns.forEach(dropdown => {
                if (!dropdown) return;

                dropdown.innerHTML = '<option value="">Selecione...</option>';

                // Adicionar disciplinas
                data.subjects.forEach(subject => {
                    const option = document.createElement('option');
                    option.value = subject.name;
                    option.textContent = subject.name;
                    dropdown.appendChild(option);
                });

                // Adicionar cursos
                data.courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course.name;
                    option.textContent = course.name;
                    dropdown.appendChild(option);
                });
            });
        }

        // Obter classe CSS para status
        function getStatusClass(status) {
            switch (status) {
                case 'Não iniciada':
                    return 'status-not-started';
                case 'Pendente':
                    return 'status-not-started';
                case 'Em curso':
                case 'Em andamento':
                    return 'status-in-progress';
                case 'Concluída':
                case 'Concluído':
                    return 'status-completed';
                default:
                    return '';
            }
        }

        // Obter classe CSS para situação
        function getSituationClass(situation) {
            switch (situation) {
                case 'Aprovado':
                    return 'status-approved';
                case 'Reprovado':
                    return 'status-failed';
                case 'Recuperação':
                    return 'status-recovery';
                default:
                    return '';
            }
        }

        // Formatar data
        function formatDate(dateStr) {
            if (!dateStr) return '';

            const date = new Date(dateStr);
            return date.toLocaleDateString('pt-BR');
        }

        // Obter nome do mês
        function getMonthName(month) {
            const months = [
                'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
            ];
            return months[month];
        }