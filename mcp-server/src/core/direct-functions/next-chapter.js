/**
 * Direct function: Next Chapter
 * Determines the next chapter to work on based on story progression
 */

import path from 'path';
import fs from 'fs/promises';
import { findProjectRoot } from '../../../../scripts/modules/utils.js';

/**
 * Find the next chapter to work on
 * @param {Object} params - Parameters
 * @param {string} [params.status] - Filter by status
 * @param {string} [params.priority] - Filter by priority
 * @param {boolean} [params.includeScenes] - Include scene recommendations
 * @param {string} [params.characterFocus] - Focus on specific character
 * @param {string} [params.plotThread] - Focus on specific plot thread
 * @param {Object} [params.session] - MCP session
 * @returns {Promise<Object>} Result object
 */
export async function nextChapterDirect({
	status,
	priority,
	includeScenes = true,
	characterFocus,
	plotThread,
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

		const chapters = storyBible.chapters || [];

		if (chapters.length === 0) {
			return {
				success: true,
				message:
					'📝 No chapters found in story bible.\n\n🎯 Next Steps:\n- Use "generate-chapter" to create your first chapter\n- Start with Chapter 1 to establish your story foundation',
				data: {
					nextChapter: null,
					recommendation: 'Create first chapter',
					chapterNumber: 1
				}
			};
		}

		// Filter chapters based on criteria
		let candidateChapters = chapters.filter((chapter) => {
			if (status && chapter.status !== status) return false;
			if (priority && chapter.priority !== priority) return false;
			if (
				characterFocus &&
				!chapter.characters?.includes(parseInt(characterFocus))
			)
				return false;
			if (plotThread && !chapter.plotThreads?.includes(parseInt(plotThread)))
				return false;
			return true;
		});

		// Find next chapter based on workflow logic
		let nextChapter = null;
		let reason = '';

		// Priority 1: Chapters in-progress
		const inProgressChapters = candidateChapters.filter(
			(c) => c.status === 'in-progress'
		);
		if (inProgressChapters.length > 0) {
			nextChapter = inProgressChapters[0];
			reason = 'Continue working on chapter already in progress';
		}

		// Priority 2: Chapters needing revision
		if (!nextChapter) {
			const revisionChapters = candidateChapters.filter(
				(c) => c.status === 'needs-revision'
			);
			if (revisionChapters.length > 0) {
				nextChapter = revisionChapters[0];
				reason = 'Address revision feedback';
			}
		}

		// Priority 3: Draft chapters (highest priority first)
		if (!nextChapter) {
			const draftChapters = candidateChapters.filter(
				(c) => c.status === 'draft'
			);
			if (draftChapters.length > 0) {
				// Sort by priority and chapter number
				draftChapters.sort((a, b) => {
					const priorityOrder = { high: 3, medium: 2, low: 1 };
					const priorityDiff =
						(priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
					if (priorityDiff !== 0) return priorityDiff;
					return (a.chapterNumber || 999) - (b.chapterNumber || 999);
				});
				nextChapter = draftChapters[0];
				reason = 'Continue story progression';
			}
		}

		// Priority 4: Suggest creating next sequential chapter
		if (!nextChapter) {
			const maxChapterNumber = Math.max(
				...chapters.map((c) => c.chapterNumber || 0)
			);
			const nextChapterNumber = maxChapterNumber + 1;

			return {
				success: true,
				message: `📝 All existing chapters are completed or in review.\n\n🎯 Next Step: Create Chapter ${nextChapterNumber}\n\nUse "generate-chapter" with chapterNumber=${nextChapterNumber} to continue your story.`,
				data: {
					nextChapter: null,
					recommendation: 'Create next chapter',
					chapterNumber: nextChapterNumber,
					completedChapters: chapters.filter((c) => c.status === 'completed')
						.length,
					totalChapters: chapters.length
				}
			};
		}

		// Build response message
		let message = `📖 Next Chapter to Work On: **${nextChapter.title}**\n\n`;
		message += `📊 Chapter Details:\n`;
		message += `- Number: ${nextChapter.chapterNumber}\n`;
		message += `- Status: ${nextChapter.status}\n`;
		message += `- Priority: ${nextChapter.priority}\n`;
		message += `- Purpose: ${nextChapter.purpose}\n`;
		message += `\n💡 Reason: ${reason}\n`;

		// Add scene information if requested
		if (includeScenes && nextChapter.scenes && nextChapter.scenes.length > 0) {
			const scenes = storyBible.scenes || [];
			const chapterScenes = scenes.filter((s) =>
				nextChapter.scenes.includes(s.id)
			);

			if (chapterScenes.length > 0) {
				message += `\n🎬 Scenes in this chapter:\n`;
				chapterScenes.forEach((scene, index) => {
					message += `${index + 1}. ${scene.title} (${scene.status})\n`;
				});

				// Find next scene to work on
				const nextScene = chapterScenes.find(
					(s) => s.status === 'draft' || s.status === 'in-progress'
				);
				if (nextScene) {
					message += `\n🎯 Next scene: **${nextScene.title}**`;
				}
			}
		}

		// Add character information
		if (nextChapter.characters && nextChapter.characters.length > 0) {
			const characters = storyBible.characters || [];
			const chapterCharacters = characters.filter((c) =>
				nextChapter.characters.includes(c.id)
			);

			if (chapterCharacters.length > 0) {
				message += `\n👥 Characters in this chapter:\n`;
				chapterCharacters.forEach((char) => {
					message += `- ${char.title} (${char.characterType})\n`;
				});
			}
		}

		return {
			success: true,
			message,
			data: {
				nextChapter,
				reason,
				scenes: includeScenes
					? (storyBible.scenes || []).filter((s) =>
							nextChapter.scenes?.includes(s.id)
						)
					: null
			}
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to find next chapter: ${error.message}`,
			error: error.message
		};
	}
}
