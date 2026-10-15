// Utility functions for calculating completion velocity, dynamic end dates, and streak metrics

export function calculateVelocityMetrics(completedTaskIds, completionTimestamps, startDateStr, totalTasks = 90) {
  const startDate = startDateStr ? new Date(startDateStr) : new Date();
  startDate.setHours(0, 0, 0, 0);

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const completedCount = completedTaskIds.length;
  const remainingTasks = Math.max(0, totalTasks - completedCount);
  const progressPercent = Math.round((completedCount / totalTasks) * 100);

  // Calendar days elapsed since cohort start date (Day 1 on start date, Day 2 on next day, etc.)
  const diffTime = now.getTime() - startDate.getTime();
  const rawDaysDiff = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const currentCohortDay = Math.max(1, rawDaysDiff + 1); // e.g. Day 1, Day 2, etc.

  // Target pace: 3.0 tasks/day (accelerated 30-day cohort)
  const targetPace = 3.0;
  const standardCohortDays = Math.ceil(totalTasks / targetPace); // 30 days
  const originalEndDate = new Date(startDate);
  originalEndDate.setDate(originalEndDate.getDate() + standardCohortDays);

  // Expected tasks completed by today based on 3.0 tasks/day target pace
  const expectedTasksToDate = Math.min(totalTasks, currentCohortDay * targetPace);
  const taskDelta = completedCount - expectedTasksToDate; // positive = ahead, negative = behind

  // Remaining days of work needed to complete remaining tasks at target pace (3.0 tasks/day)
  const daysNeededToComplete = Math.ceil(remainingTasks / targetPace);

  // The base reference date for remaining work:
  // If today is before start date, project from start date; otherwise project from today
  const baseDate = now.getTime() < startDate.getTime() ? new Date(startDate) : new Date(now);

  let estimatedEndDate = new Date(baseDate);
  let daysSaved = 0;
  let daysDelayed = 0;
  let paceStatus = 'On Track';
  let statusColor = 'text-cyan-400';

  if (remainingTasks === 0) {
    paceStatus = '🎉 Cohort Completed!';
    statusColor = 'text-emerald-400';
    estimatedEndDate = new Date(now);
    const diffFromOriginal = Math.round((originalEndDate.getTime() - estimatedEndDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diffFromOriginal > 0) {
      daysSaved = diffFromOriginal;
    } else if (diffFromOriginal < 0) {
      daysDelayed = Math.abs(diffFromOriginal);
    }
  } else {
    // Project completion date starting from baseDate (today) at target pace (3.0 tasks/day)
    estimatedEndDate.setDate(baseDate.getDate() + daysNeededToComplete);

    // Difference between target pace completion date and original standard end date
    const diffFromOriginal = Math.round((estimatedEndDate.getTime() - originalEndDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffFromOriginal > 0) {
      daysDelayed = diffFromOriginal;
      paceStatus = `🐢 ${daysDelayed} ${daysDelayed === 1 ? 'Day' : 'Days'} Behind Schedule`;
      statusColor = 'text-rose-400';
    } else if (diffFromOriginal < 0) {
      daysSaved = Math.abs(diffFromOriginal);
      paceStatus = `🚀 ${daysSaved} ${daysSaved === 1 ? 'Day' : 'Days'} Ahead of Schedule!`;
      statusColor = 'text-emerald-400';
    } else {
      paceStatus = `✨ Right On Track (Day ${currentCohortDay})`;
      statusColor = 'text-cyan-400';
    }
  }

  // Calculate actual daily velocity
  const currentVelocity = completedCount > 0 ? parseFloat((completedCount / currentCohortDay).toFixed(1)) : 0;

  return {
    completedCount,
    totalTasks,
    remainingTasks,
    progressPercent,
    currentCohortDay,
    expectedTasksToDate,
    taskDelta,
    daysElapsed: currentCohortDay,
    daysNeededToComplete,
    targetPace,
    velocity: currentVelocity,
    todayDateStr: formatDate(now),
    startDateStr: formatDate(startDate),
    originalEndDateStr: formatDate(originalEndDate),
    estimatedEndDateStr: formatDate(estimatedEndDate),
    daysSaved,
    daysDelayed,
    paceStatus,
    statusColor
  };
}

export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
