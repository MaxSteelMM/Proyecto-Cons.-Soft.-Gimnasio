document.addEventListener('DOMContentLoaded', () => {
    const options = document.querySelectorAll('[data-routine-select]');
    const panels = document.querySelectorAll('[data-routine-panel]');
    const status = document.getElementById('routine-selection-status');

    panels.forEach(panel => {
        const daysSelect = panel.querySelector('[data-training-days]');
        const schedule = panel.querySelector('.workout-grid');
        const routineKey = panel.dataset.routinePanel;
        const option = document.querySelector(`[data-routine-select="${routineKey}"]`);
        const frequency = option.querySelector('.routine-option-frequency');
        const badge = panel.querySelector('.routine-tag');
        const badgeLabel = badge.textContent.split(' · ')[0];
        const templates = [...schedule.children].map(day => ({
            focus: day.querySelector('h4').textContent.replace(/^Día \d+\s*[–-]\s*/, ''),
            exercises: [...day.querySelectorAll('li')].map(exercise => exercise.textContent)
        }));

        const renderSchedule = () => {
            const trainingDays = Number(daysSelect.value);
            const sessions = Array.from({ length: trainingDays }, () => []);
            const repeats = trainingDays > templates.length;

            if (repeats) {
                for (let index = 0; index < trainingDays; index += 1) {
                    sessions[index].push({
                        ...templates[index % templates.length],
                        repeated: index >= templates.length
                    });
                }
            } else {
                templates.forEach((template, index) => {
                    sessions[index % trainingDays].push(template);
                });
            }

            schedule.replaceChildren(...sessions.map((session, index) => {
                const day = document.createElement('section');
                day.className = 'workout-day';

                const heading = document.createElement('h4');
                heading.textContent = `Día ${index + 1}`;
                day.append(heading);

                session.forEach(template => {
                    const segment = document.createElement('div');
                    segment.className = 'workout-segment';

                    const focus = document.createElement('h5');
                    focus.textContent = `${template.focus}${template.repeated ? ' (repetición)' : ''}`;
                    segment.append(focus);

                    const exerciseList = document.createElement('ul');
                    template.exercises.forEach(exercise => {
                        const item = document.createElement('li');
                        item.textContent = exercise;
                        exerciseList.append(item);
                    });
                    segment.append(exerciseList);
                    day.append(segment);
                });

                return day;
            }));

            const daysLabel = `${trainingDays} días por semana`;
            frequency.textContent = daysLabel;
            badge.textContent = `${badgeLabel} · ${daysLabel}`;
        };

        daysSelect.addEventListener('change', () => {
            renderSchedule();
            status.textContent = `Plan actualizado: ${option.querySelector('.routine-option-title').textContent}, ${daysSelect.value} días por semana.`;
        });

        renderSchedule();
    });

    options.forEach(option => {
        option.addEventListener('click', () => {
            const selectedRoutine = option.dataset.routineSelect;

            options.forEach(item => {
                item.setAttribute('aria-pressed', String(item === option));
            });
            panels.forEach(panel => {
                panel.hidden = panel.dataset.routinePanel !== selectedRoutine;
            });

            status.textContent = `Rutina seleccionada: ${option.querySelector('.routine-option-title').textContent}.`;
        });
    });
});
