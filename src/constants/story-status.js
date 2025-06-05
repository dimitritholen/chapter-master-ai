/**
 * @typedef {'draft' | 'completed' | 'in-progress' | 'review' | 'needs-revision' | 'published'} StoryElementStatus
 */

/**
 * Story element status options list
 * @type {StoryElementStatus[]}
 * @description Defines possible story element statuses:
 * - draft: Element is drafted but needs work
 * - completed: Element is complete and ready
 * - in-progress: Element is being actively worked on
 * - review: Element completed and waiting for review
 * - needs-revision: Element needs revision based on feedback
 * - published: Element is finalized and published
 */
export const STORY_STATUS_OPTIONS = [
	'draft',
	'completed',
	'in-progress',
	'review',
	'needs-revision',
	'published'
];

/**
 * Check if a given status is a valid story element status
 * @param {string} status - The status to check
 * @returns {boolean} True if the status is valid, false otherwise
 */
export function isValidStoryStatus(status) {
	return STORY_STATUS_OPTIONS.includes(status);
}

// Legacy exports for backward compatibility during transition
export const TASK_STATUS_OPTIONS = STORY_STATUS_OPTIONS;
export const isValidTaskStatus = isValidStoryStatus;
