export interface StepDefinition {
  key: number;
  label: string;
  shortLabel: string;
}

export const STEPS: StepDefinition[] = [
  { key: 1, label: 'Basic Info', shortLabel: 'Info' },
  { key: 2, label: 'Korean Name', shortLabel: 'Name' },
  { key: 3, label: 'Identity', shortLabel: 'Identity' },
  { key: 4, label: 'Fan Expression', shortLabel: 'Express' },
  { key: 5, label: 'Identity Card', shortLabel: 'Card' },
  { key: 6, label: 'Final Preview', shortLabel: 'Preview' },
];

export function renderProgressNav(
  container: HTMLElement,
  currentStep: number,
  completedSteps: Set<number>,
): void {
  container.innerHTML = '';

  const nav = document.createElement('div');
  nav.className = 'progress-nav';
  nav.setAttribute('aria-label', 'Step navigation');

  STEPS.forEach((step, index) => {
    const isCurrent = step.key === currentStep;
    const isCompleted = completedSteps.has(step.key);
    const isLast = index === STEPS.length - 1;

    // Step item
    const item = document.createElement('div');
    item.className = 'progress-step';

    if (isCurrent) item.classList.add('current');
    if (isCompleted) item.classList.add('completed');

    // Connector line
    if (!isLast) {
      const connector = document.createElement('div');
      connector.className = 'progress-connector';
      if (isCompleted) connector.classList.add('completed');
      if (isCurrent) connector.classList.add('current');
      item.appendChild(connector);
    }

    // Circle / indicator
    const circle = document.createElement('div');
    circle.className = 'progress-circle';
    if (isCompleted) {
      circle.textContent = '✓';
    } else {
      circle.textContent = String(step.key);
    }
    item.appendChild(circle);

    // Label
    const label = document.createElement('span');
    label.className = 'progress-label';
    label.textContent = step.label;
    item.appendChild(label);

    nav.appendChild(item);
  });

  container.appendChild(nav);
}
