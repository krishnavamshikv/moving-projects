import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceRoot = path.join(__dirname, '..');
const readmePath = path.join(workspaceRoot, '2026', 'README.md');

const readmeContent = fs.readFileSync(readmePath, 'utf-8');

const modules = [
  { name: 'Linux Fundamentals', days: [1, 13], icon: 'Terminal', color: 'from-blue-500 to-indigo-600' },
  { name: 'Networking', days: [14, 15], icon: 'Network', color: 'from-cyan-500 to-blue-500' },
  { name: 'Shell Scripting', days: [16, 21], icon: 'Code2', color: 'from-emerald-500 to-teal-600' },
  { name: 'Git & GitHub', days: [22, 28], icon: 'GitBranch', color: 'from-orange-500 to-amber-600' },
  { name: 'Docker', days: [29, 37], icon: 'Box', color: 'from-blue-600 to-cyan-600' },
  { name: 'CI/CD & GitHub Actions', days: [38, 49], icon: 'Workflow', color: 'from-purple-500 to-indigo-600' },
  { name: 'Kubernetes', days: [50, 60], icon: 'Layers', color: 'from-blue-500 to-sky-500' },
  { name: 'Terraform', days: [61, 67], icon: 'Cloud', color: 'from-violet-600 to-purple-700' },
  { name: 'Ansible', days: [68, 72], icon: 'Cpu', color: 'from-red-500 to-rose-600' },
  { name: 'Observability', days: [73, 77], icon: 'Activity', color: 'from-amber-500 to-orange-500' },
  { name: 'Helm & EKS & GitOps', days: [78, 86], icon: 'Anchor', color: 'from-teal-500 to-emerald-600' },
  { name: 'Agentic AI for DevOps', days: [87, 90], icon: 'Bot', color: 'from-fuchsia-500 to-pink-600' }
];

function getModuleName(dayNum) {
  for (const mod of modules) {
    if (dayNum >= mod.days[0] && dayNum <= mod.days[1]) {
      return mod.name;
    }
  }
  return 'DevOps';
}

function extractExpectedFilename(dayReadmePath, dayFormatted) {
  if (fs.existsSync(dayReadmePath)) {
    const content = fs.readFileSync(dayReadmePath, 'utf-8');
    // Look for filename.md in Expected Output section first
    const expectedSection = content.split(/##\s+Expected Output/i)[1] || content;
    const match = expectedSection.match(/`*([a-zA-Z0-9_-]+\.md)`*/);
    if (match && match[1] && match[1] !== 'README.md') {
      return match[1];
    }
  }
  return `${dayFormatted.toLowerCase().replace(/\s+/g, '-')}-solution.md`;
}

// Parse day links and titles from 2026/README.md
const dayRegex = /\| \[Day (\d+)\]\(day-(\d+)\/\) \| (.*?) \|/g;
let match;
const daysData = [];

while ((match = dayRegex.exec(readmeContent)) !== null) {
  const dayNum = parseInt(match[1], 10);
  const title = match[3].trim();
  const dayFormatted = `Day ${String(dayNum).padStart(2, '0')}`;
  const dirName = `day-${String(dayNum).padStart(2, '0')}`;
  const pathRelative = `2026/${dirName}/README.md`;
  const dayReadmePath = path.join(workspaceRoot, '2026', dirName, 'README.md');

  const expectedFilename = extractExpectedFilename(dayReadmePath, dayFormatted);
  const acceleratedDay = Math.min(30, Math.ceil(dayNum / 3));

  daysData.push({
    id: dayNum,
    dayFormatted,
    title,
    module: getModuleName(dayNum),
    acceleratedDay,
    pathRelative,
    expectedFilename
  });
}

// Group into 30 Accelerated Days
const acceleratedDays = [];
for (let i = 1; i <= 30; i++) {
  const tasks = daysData.filter(d => d.acceleratedDay === i);
  const moduleNames = [...new Set(tasks.map(t => t.module))];
  
  acceleratedDays.push({
    accDay: i,
    title: `Accelerated Day ${i}`,
    modules: moduleNames,
    tasks
  });
}

const outputData = {
  totalOriginalDays: daysData.length,
  totalAcceleratedDays: 30,
  modules,
  tasks: daysData,
  acceleratedDays
};

const outputDir = path.join(workspaceRoot, 'tracker', 'src', 'data');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

fs.writeFileSync(path.join(outputDir, 'tasksData.json'), JSON.stringify(outputData, null, 2));
console.log(`Successfully generated tasksData.json with ${daysData.length} original tasks mapped across 30 accelerated days.`);
