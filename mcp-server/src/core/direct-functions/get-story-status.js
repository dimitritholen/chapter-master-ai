/**
 * Direct function: Get Story Status
 * Provides comprehensive overview of story development progress
 */

import path from 'path';
import fs from 'fs/promises';
import { findProjectRoot } from '../../../../scripts/modules/utils.js';

/**
 * Get comprehensive story status overview
 * @param {Object} params - Parameters
 * @param {boolean} [params.includeChapters] - Include chapter status
 * @param {boolean} [params.includeCharacters] - Include character status
 * @param {boolean} [params.includePlotThreads] - Include plot thread status
 * @param {boolean} [params.includeWordCounts] - Include word count stats
 * @param {boolean} [params.includeNextSteps] - Include next steps
 * @param {string} [params.format] - Output format
 * @param {Object} [params.session] - MCP session
 * @returns {Promise<Object>} Result object
 */
export async function getStoryStatusDirect({
	includeChapters = true,
	includeCharacters = true,
	includePlotThreads = true,
	includeWordCounts = true,
	includeNextSteps = true,
	format = 'detailed',
	session = null
}) {
	try {
		const projectRoot = findProjectRoot() || process.cwd();
		const storyBiblePath = path.join(
			projectRoot,
			'story-bible',
			'story-bible.json'
		);

		// Check if story bible exists
		try {
			await fs.access(storyBiblePath);
		} catch (error) {
			return {
				success: false,
				message:
					'❌ No story bible found. Run "parse-premise" first to set up your story structure.',
				error: 'Story bible not found'
			};
		}

		// Load story bible
		const storyBibleData = await fs.readFile(storyBiblePath, 'utf-8');
		const storyBible = JSON.parse(storyBibleData);

		const meta = storyBible.meta || {};
		const premise = storyBible.premise || null;
		const chapters = storyBible.chapters || [];
		const characters = storyBible.characters || [];
		const scenes = storyBible.scenes || [];
		const plotThreads = storyBible.plotThreads || [];

		// Calculate overall statistics
		const stats = {
			premise: premise ? (premise.status === 'completed' ? 1 : 0) : 0,
			chapters: {
				total: chapters.length,
				draft: chapters.filter((c) => c.status === 'draft').length,
				inProgress: chapters.filter((c) => c.status === 'in-progress').length,
				completed: chapters.filter((c) => c.status === 'completed').length,
				review: chapters.filter((c) => c.status === 'review').length,
				needsRevision: chapters.filter((c) => c.status === 'needs-revision')
					.length,
				published: chapters.filter((c) => c.status === 'published').length
			},
			characters: {
				total: characters.length,
				protagonist: characters.filter((c) => c.characterType === 'protagonist')
					.length,
				antagonist: characters.filter((c) => c.characterType === 'antagonist')
					.length,
				supporting: characters.filter((c) => c.characterType === 'supporting')
					.length,
				minor: characters.filter((c) => c.characterType === 'minor').length,
				completed: characters.filter((c) => c.status === 'completed').length
			},
			scenes: {
				total: scenes.length,
				completed: scenes.filter((s) => s.status === 'completed').length
			},
			plotThreads: {
				total: plotThreads.length,
				completed: plotThreads.filter((p) => p.status === 'completed').length
			}
		};

		// Calculate completion percentages
		const completion = {
			overall: calculateOverallCompletion(stats),
			chapters:
				stats.chapters.total > 0
					? Math.round((stats.chapters.completed / stats.chapters.total) * 100)
					: 0,
			characters:
				stats.characters.total > 0
					? Math.round(
							(stats.characters.completed / stats.characters.total) * 100
						)
					: 0,
			scenes:
				stats.scenes.total > 0
					? Math.round((stats.scenes.completed / stats.scenes.total) * 100)
					: 0,
			plotThreads:
				stats.plotThreads.total > 0
					? Math.round(
							(stats.plotThreads.completed / stats.plotThreads.total) * 100
						)
					: 0
		};

		// Build status message based on format
		let message = '';

		if (format === 'summary') {
			message = buildSummaryMessage(meta, stats, completion);
		} else if (format === 'table') {
			message = buildTableMessage(stats, completion);
		} else {
			message = buildDetailedMessage(
				meta,
				stats,
				completion,
				{
					includeChapters,
					includeCharacters,
					includePlotThreads,
					includeWordCounts,
					includeNextSteps
				},
				chapters,
				characters,
				plotThreads
			);
		}

		return {
			success: true,
			message,
			data: {
				stats,
				completion,
				meta,
				chapters: includeChapters ? chapters : null,
				characters: includeCharacters ? characters : null,
				plotThreads: includePlotThreads ? plotThreads : null
			}
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to get story status: ${error.message}`,
			error: error.message
		};
	}
}

function calculateOverallCompletion(stats) {
	const weights = {
		premise: 10,
		chapters: 60,
		characters: 20,
		plotThreads: 10
	};

	let totalWeight = 0;
	let completedWeight = 0;

	// Premise
	if (stats.premise > 0) {
		totalWeight += weights.premise;
		completedWeight += weights.premise;
	}

	// Chapters
	if (stats.chapters.total > 0) {
		totalWeight += weights.chapters;
		completedWeight +=
			(stats.chapters.completed / stats.chapters.total) * weights.chapters;
	}

	// Characters
	if (stats.characters.total > 0) {
		totalWeight += weights.characters;
		completedWeight +=
			(stats.characters.completed / stats.characters.total) *
			weights.characters;
	}

	// Plot threads
	if (stats.plotThreads.total > 0) {
		totalWeight += weights.plotThreads;
		completedWeight +=
			(stats.plotThreads.completed / stats.plotThreads.total) *
			weights.plotThreads;
	}

	return totalWeight > 0
		? Math.round((completedWeight / totalWeight) * 100)
		: 0;
}

function buildSummaryMessage(meta, stats, completion) {
	return `📚 **${meta.title || 'Untitled Story'}** - ${completion.overall}% Complete

📊 Quick Stats:
- Chapters: ${stats.chapters.completed}/${stats.chapters.total} (${completion.chapters}%)
- Characters: ${stats.characters.completed}/${stats.characters.total} (${completion.characters}%)
- Scenes: ${stats.scenes.completed}/${stats.scenes.total} (${completion.scenes}%)`;
}

function buildTableMessage(stats, completion) {
	return `📊 Story Progress Table:

| Element      | Total | Completed | Progress |
|--------------|-------|-----------|----------|
| Chapters     | ${stats.chapters.total.toString().padStart(5)} | ${stats.chapters.completed.toString().padStart(9)} | ${completion.chapters.toString().padStart(6)}%   |
| Characters   | ${stats.characters.total.toString().padStart(5)} | ${stats.characters.completed.toString().padStart(9)} | ${completion.characters.toString().padStart(6)}%   |
| Scenes       | ${stats.scenes.total.toString().padStart(5)} | ${stats.scenes.completed.toString().padStart(9)} | ${completion.scenes.toString().padStart(6)}%   |
| Plot Threads | ${stats.plotThreads.total.toString().padStart(5)} | ${stats.plotThreads.completed.toString().padStart(9)} | ${completion.plotThreads.toString().padStart(6)}%   |

**Overall Progress: ${completion.overall}%**`;
}

function buildDetailedMessage(
	meta,
	stats,
	completion,
	options,
	chapters,
	characters,
	plotThreads
) {
	let message = `📚 **${meta.title || 'Untitled Story'}**\n`;
	message += `🎯 Genre: ${meta.genre || 'Unspecified'}\n`;
	message += `📈 Overall Progress: **${completion.overall}%**\n\n`;

	message += `📊 Development Status:\n`;
	message += `- ✅ Premise: ${stats.premise ? 'Complete' : 'Pending'}\n`;
	message += `- 📖 Chapters: ${stats.chapters.completed}/${stats.chapters.total} (${completion.chapters}%)\n`;
	message += `- 👥 Characters: ${stats.characters.completed}/${stats.characters.total} (${completion.characters}%)\n`;
	message += `- 🎬 Scenes: ${stats.scenes.completed}/${stats.scenes.total} (${completion.scenes}%)\n`;

	if (options.includeChapters && chapters.length > 0) {
		message += `\n📖 Chapter Details:\n`;
		const statusCounts = stats.chapters;
		if (statusCounts.draft > 0) message += `- Draft: ${statusCounts.draft}\n`;
		if (statusCounts.inProgress > 0)
			message += `- In Progress: ${statusCounts.inProgress}\n`;
		if (statusCounts.completed > 0)
			message += `- Completed: ${statusCounts.completed}\n`;
		if (statusCounts.review > 0)
			message += `- In Review: ${statusCounts.review}\n`;
		if (statusCounts.needsRevision > 0)
			message += `- Needs Revision: ${statusCounts.needsRevision}\n`;
		if (statusCounts.published > 0)
			message += `- Published: ${statusCounts.published}\n`;
	}

	if (options.includeCharacters && characters.length > 0) {
		message += `\n👥 Character Breakdown:\n`;
		const charCounts = stats.characters;
		if (charCounts.protagonist > 0)
			message += `- Protagonists: ${charCounts.protagonist}\n`;
		if (charCounts.antagonist > 0)
			message += `- Antagonists: ${charCounts.antagonist}\n`;
		if (charCounts.supporting > 0)
			message += `- Supporting: ${charCounts.supporting}\n`;
		if (charCounts.minor > 0) message += `- Minor: ${charCounts.minor}\n`;
	}

	if (options.includeNextSteps) {
		message += `\n🎯 Recommended Next Steps:\n`;

		if (stats.premise === 0) {
			message += `- ⭐ Create premise with "parse-premise"\n`;
		} else if (stats.chapters.total === 0) {
			message += `- 📝 Generate first chapter with "generate-chapter"\n`;
		} else if (stats.characters.total === 0) {
			message += `- 👤 Create main characters with "create-character"\n`;
		} else if (stats.chapters.inProgress > 0) {
			message += `- ✍️ Continue working on in-progress chapters\n`;
		} else if (stats.chapters.draft > 0) {
			message += `- 📖 Start writing draft chapters\n`;
		} else if (stats.chapters.needsRevision > 0) {
			message += `- 🔄 Address revision feedback\n`;
		} else {
			message += `- 🎉 Story looking good! Consider "check-consistency" for quality review\n`;
		}

		message += `- 📊 Use "next-chapter" to find the next chapter to work on\n`;
	}

	return message;
}
