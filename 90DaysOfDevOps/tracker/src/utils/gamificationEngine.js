// Gamification engine for streaks, achievement badges, and milestone tracking

export function calculateStreakInfo(completionTimestamps = {}) {
  const timestamps = Object.values(completionTimestamps).filter(Boolean);
  if (timestamps.length === 0) {
    return { currentStreak: 0, maxStreak: 0, isActiveToday: false };
  }

  // Extract unique active YYYY-MM-DD dates sorted chronologically
  const uniqueDatesSet = new Set(
    timestamps.map(ts => {
      const d = new Date(ts);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().split('T')[0];
    })
  );

  const sortedDates = Array.from(uniqueDatesSet).sort();
  if (sortedDates.length === 0) {
    return { currentStreak: 0, maxStreak: 0, isActiveToday: false };
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

  const isActiveToday = uniqueDatesSet.has(todayStr);

  // Calculate max streak in history
  let maxStreak = 0;
  let tempStreak = 0;
  let prevDate = null;

  for (const dateStr of sortedDates) {
    const curr = new Date(dateStr);
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffMs = curr.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak += 1;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    maxStreak = Math.max(maxStreak, tempStreak);
    prevDate = curr;
  }

  // Calculate current active streak ending today or yesterday
  let currentStreak = 0;
  let checkDate = uniqueDatesSet.has(todayStr) ? new Date() : new Date(yesterdayDate);
  checkDate.setHours(0, 0, 0, 0);

  while (true) {
    const checkStr = checkDate.toISOString().split('T')[0];
    if (uniqueDatesSet.has(checkStr)) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    currentStreak,
    maxStreak,
    isActiveToday
  };
}

export function calculateBadges(completedTaskIds = [], completionTimestamps = {}, tasksData = {}, streakInfo = {}) {
  const completedSet = new Set(completedTaskIds);
  const totalTasks = tasksData.totalOriginalDays || 90;

  // Helper to count tasks by module
  const countModuleTasks = (moduleName) => {
    let count = 0;
    let total = 0;
    tasksData.acceleratedDays.forEach(day => {
      day.tasks.forEach(t => {
        if (t.module === moduleName) {
          total += 1;
          if (completedSet.has(t.id)) count += 1;
        }
      });
    });
    return { count, total };
  };

  // 1. Linux Novice (Days 1 - 2: Tasks 1-6)
  const linuxNoviceTaskIds = [1, 2, 3, 4, 5, 6];
  const linuxNoviceDone = linuxNoviceTaskIds.filter(id => completedSet.has(id)).length;
  const linuxNoviceUnlocked = linuxNoviceDone === linuxNoviceTaskIds.length;

  // 2. Linux Architect (All Linux tasks)
  const linuxStats = countModuleTasks('Linux Fundamentals');
  const linuxUnlocked = linuxStats.total > 0 && linuxStats.count === linuxStats.total;

  // 3. Network Engineer
  const netStats = countModuleTasks('Networking & Security');
  const netUnlocked = netStats.total > 0 && netStats.count === netStats.total;

  // 4. Shell Master
  const shellStats = countModuleTasks('Bash & Scripting');
  const shellUnlocked = shellStats.total > 0 && shellStats.count === shellStats.total;

  // 5. Docker Captain
  const dockerStats = countModuleTasks('Docker & Containers');
  const dockerUnlocked = dockerStats.total > 0 && dockerStats.count === dockerStats.total;

  // 6. Kubernetes Admin
  const k8sStats = countModuleTasks('Kubernetes & Helm');
  const k8sUnlocked = k8sStats.total > 0 && k8sStats.count === k8sStats.total;

  // 7. IaC Architect
  const iacStats = countModuleTasks('Terraform & IaC');
  const iacUnlocked = iacStats.total > 0 && iacStats.count === iacStats.total;

  // 8. Velocity Demon (6+ tasks in one single day)
  const tasksPerDay = {};
  Object.values(completionTimestamps).forEach(ts => {
    if (ts) {
      const dateKey = new Date(ts).toISOString().split('T')[0];
      tasksPerDay[dateKey] = (tasksPerDay[dateKey] || 0) + 1;
    }
  });
  const maxTasksInOneDay = Math.max(0, ...Object.values(tasksPerDay));
  const velocityDemonUnlocked = maxTasksInOneDay >= 6;

  // 9. Streak Warrior (5-day active streak)
  const streakUnlocked = (streakInfo.maxStreak || 0) >= 5;

  // 10. DevOps Legend (All 90 tasks complete)
  const legendUnlocked = completedTaskIds.length === totalTasks && totalTasks > 0;

  const badgeDefinitions = [
    {
      id: 'linux-novice',
      title: 'Linux Novice',
      category: 'Linux',
      icon: '🐧',
      description: 'Complete Days 1 & 2 Linux basics (Tasks 1–6).',
      isUnlocked: linuxNoviceUnlocked,
      current: linuxNoviceDone,
      target: linuxNoviceTaskIds.length,
      progressPercent: Math.round((linuxNoviceDone / linuxNoviceTaskIds.length) * 100)
    },
    {
      id: 'linux-architect',
      title: 'Linux Architect',
      category: 'Linux',
      icon: '⚙️',
      description: 'Master all Linux Fundamentals tasks.',
      isUnlocked: linuxUnlocked,
      current: linuxStats.count,
      target: linuxStats.total || 15,
      progressPercent: Math.round(((linuxStats.count || 0) / (linuxStats.total || 1)) * 100)
    },
    {
      id: 'network-engineer',
      title: 'Network Engineer',
      category: 'Networking',
      icon: '🌐',
      description: 'Complete all Networking & Security tasks.',
      isUnlocked: netUnlocked,
      current: netStats.count,
      target: netStats.total || 6,
      progressPercent: Math.round(((netStats.count || 0) / (netStats.total || 1)) * 100)
    },
    {
      id: 'shell-master',
      title: 'Shell Master',
      category: 'Scripting',
      icon: '📜',
      description: 'Complete all Bash Automation & Scripting tasks.',
      isUnlocked: shellUnlocked,
      current: shellStats.count,
      target: shellStats.total || 9,
      progressPercent: Math.round(((shellStats.count || 0) / (shellStats.total || 1)) * 100)
    },
    {
      id: 'docker-captain',
      title: 'Docker Captain',
      category: 'Containers',
      icon: '🐳',
      description: 'Master Docker, Containers & Registry workflows.',
      isUnlocked: dockerUnlocked,
      current: dockerStats.count,
      target: dockerStats.total || 15,
      progressPercent: Math.round(((dockerStats.count || 0) / (dockerStats.total || 1)) * 100)
    },
    {
      id: 'k8s-admin',
      title: 'Kubernetes Admin',
      category: 'Kubernetes',
      icon: '☸️',
      description: 'Complete all Kubernetes & Helm deployment tasks.',
      isUnlocked: k8sUnlocked,
      current: k8sStats.count,
      target: k8sStats.total || 15,
      progressPercent: Math.round(((k8sStats.count || 0) / (k8sStats.total || 1)) * 100)
    },
    {
      id: 'iac-architect',
      title: 'IaC Architect',
      category: 'Terraform',
      icon: '🏗️',
      description: 'Master Infrastructure as Code with Terraform & Ansible.',
      isUnlocked: iacUnlocked,
      current: iacStats.count,
      target: iacStats.total || 15,
      progressPercent: Math.round(((iacStats.count || 0) / (iacStats.total || 1)) * 100)
    },
    {
      id: 'velocity-demon',
      title: 'Velocity Demon',
      category: 'Milestones',
      icon: '⚡',
      description: 'Complete 6+ tasks (2 accelerated days) in a single day.',
      isUnlocked: velocityDemonUnlocked,
      current: Math.min(6, maxTasksInOneDay),
      target: 6,
      progressPercent: Math.min(100, Math.round((maxTasksInOneDay / 6) * 100))
    },
    {
      id: 'streak-warrior',
      title: 'Streak Warrior',
      category: 'Milestones',
      icon: '🔥',
      description: 'Maintain a 5-day active completion streak.',
      isUnlocked: streakUnlocked,
      current: Math.min(5, streakInfo.maxStreak || 0),
      target: 5,
      progressPercent: Math.min(100, Math.round(((streakInfo.maxStreak || 0) / 5) * 100))
    },
    {
      id: 'devops-legend',
      title: 'DevOps Legend',
      category: 'Mastery',
      icon: '🏆',
      description: 'Complete 100% of all 90 tasks in the DevOps curriculum.',
      isUnlocked: legendUnlocked,
      current: completedTaskIds.length,
      target: totalTasks,
      progressPercent: Math.round((completedTaskIds.length / totalTasks) * 100)
    }
  ];

  const unlockedCount = badgeDefinitions.filter(b => b.isUnlocked).length;

  return {
    badges: badgeDefinitions,
    unlockedCount,
    totalBadges: badgeDefinitions.length
  };
}
