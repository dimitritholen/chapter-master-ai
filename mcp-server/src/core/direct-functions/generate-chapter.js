/**
 * Direct function: Generate Chapter
 * Generates chapter content with scenes and plot advancement
 */

import path from 'path';
import fs from 'fs/promises';
import { findProjectRoot } from '../../../../scripts/modules/utils.js';
import { generateTextService } from '../../../../scripts/modules/ai-services-unified.js';
import { AiChapterSchema } from '../../../../src/constants/story-schema.js';

/**
 * Generate chapter content and structure
 * @param {Object} params - Parameters
 * @param {number} [params.chapterId] - Existing chapter ID
 * @param {number} [params.chapterNumber] - New chapter number
 * @param {string} [params.title] - Chapter title
 * @param {string} [params.purpose] - Chapter purpose
 * @param {number} [params.targetWordCount] - Target word count
 * @param {boolean} [params.generateScenes] - Generate scenes
 * @param {number} [params.sceneCount] - Number of scenes
 * @param {number[]} [params.characters] - Character IDs
 * @param {number[]} [params.plotThreads] - Plot thread IDs
 * @param {string[]} [params.conflicts] - Conflicts to address
 * @param {boolean} [params.generateContent] - Generate prose
 * @param {string} [params.priority] - Priority level
 * @param {Object} [params.session] - MCP session
 * @returns {Promise<Object>} Result object
 */
export async function generateChapterDirect({
	chapterId,
	chapterNumber,
	title,
	purpose,
	targetWordCount = 3000,
	generateScenes = true,
	sceneCount = 3,
	characters,
	plotThreads,
	conflicts,
	generateContent = false,
	priority = 'medium',
	session = null
}) {
	try {
		const projectRoot = findProjectRoot() || process.cwd();
		const storyBiblePath = path.join(
			projectRoot,
			'story-bible',
			'story-bible.json'
		);
		const chaptersDir = path.join(projectRoot, 'chapters');

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

		const premise = storyBible.premise;
		const existingChapters = storyBible.chapters || [];
		const existingCharacters = storyBible.characters || [];

		// Determine chapter details
		let workingChapter;
		let isNewChapter = false;

		if (chapterId) {
			// Find existing chapter
			workingChapter = existingChapters.find((c) => c.id === chapterId);
			if (!workingChapter) {
				return {
					success: false,
					message: `❌ Chapter with ID ${chapterId} not found.`,
					error: 'Chapter not found'
				};
			}
		} else {
			// Create new chapter
			isNewChapter = true;
			const nextId =
				existingChapters.length > 0
					? Math.max(...existingChapters.map((c) => c.id)) + 1
					: 1;
			const nextChapterNum =
				chapterNumber ||
				(existingChapters.length > 0
					? Math.max(...existingChapters.map((c) => c.chapterNumber || 0)) + 1
					: 1);

			workingChapter = {
				id: nextId,
				type: 'chapter',
				title: title || `Chapter ${nextChapterNum}`,
				chapterNumber: nextChapterNum,
				description: purpose || 'Chapter description to be developed',
				purpose: purpose || 'Chapter purpose to be defined',
				status: 'draft',
				priority,
				characters: characters || [],
				plotThreads: plotThreads || [],
				conflicts: conflicts || [],
				scenes: [],
				targetWordCount,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			};
		}

		// Create chapters directory
		await fs.mkdir(chaptersDir, { recursive: true });

		// Generate AI-enhanced chapter structure
		const characterNames = existingCharacters
			.filter((c) => workingChapter.characters?.includes(c.id))
			.map((c) => c.title)
			.join(', ');

		const chapterPrompt = `
Create a detailed chapter structure for this story:

STORY CONTEXT:
Genre: ${premise?.genre || 'Unspecified'}
Premise: ${premise?.content || 'Story premise not available'}

CHAPTER DETAILS:
Number: ${workingChapter.chapterNumber}
Title: ${workingChapter.title}
Purpose: ${workingChapter.purpose}
Target Word Count: ${targetWordCount}
Characters: ${characterNames || 'To be determined'}
Conflicts: ${workingChapter.conflicts?.join(', ') || 'To be developed'}

Please create:
1. Enhanced chapter title and description
2. Specific purpose and goals for this chapter
3. Conflicts to introduce or resolve
4. Plot advancement details
5. Character development moments

Return a structured chapter outline that fits the ${premise?.genre || 'general'} genre.
`;

		const chapterResponse = await generateTextService(
			chapterPrompt,
			'main',
			session,
			{
				schema: AiChapterSchema,
				schemaName: 'chapter_structure'
			}
		);

		// Parse AI response
		let aiChapter;
		try {
			aiChapter =
				typeof chapterResponse === 'string'
					? JSON.parse(chapterResponse)
					: chapterResponse;
		} catch (error) {
			console.warn(
				'Could not parse AI chapter response, using basic structure'
			);
			aiChapter = null;
		}

		// Enhance chapter with AI data
		if (aiChapter) {
			workingChapter.title = aiChapter.title || workingChapter.title;
			workingChapter.description =
				aiChapter.description || workingChapter.description;
			workingChapter.purpose = aiChapter.purpose || workingChapter.purpose;
			workingChapter.conflicts =
				aiChapter.conflicts || workingChapter.conflicts;
			workingChapter.plotAdvancement = aiChapter.plotAdvancement;
			workingChapter.characterMoments =
				aiChapter.characterMoments?.map((moment) => ({
					description: moment
				})) || [];
		}

		// Generate scenes if requested
		if (generateScenes) {
			const scenes = [];
			for (let i = 1; i <= sceneCount; i++) {
				const sceneId = (storyBible.scenes?.length || 0) + i;
				const scene = {
					id: sceneId,
					type: 'scene',
					title: `${workingChapter.title} - Scene ${i}`,
					description: `Scene ${i} of chapter ${workingChapter.chapterNumber}`,
					sceneType: 'dialogue', // Default, could be enhanced with AI
					chapterId: workingChapter.id,
					characters: workingChapter.characters || [],
					setting: 'To be determined',
					purpose: `Advance chapter goals - scene ${i}`,
					status: 'draft',
					priority: 'medium',
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				};
				scenes.push(scene);
				workingChapter.scenes.push(sceneId);
			}

			// Add scenes to story bible
			if (!storyBible.scenes) {
				storyBible.scenes = [];
			}
			storyBible.scenes.push(...scenes);
		}

		// Create chapter file
		const chapterFileName = `chapter-${workingChapter.chapterNumber.toString().padStart(2, '0')}.md`;
		const chapterFilePath = path.join(chaptersDir, chapterFileName);

		const chapterContent = `# ${workingChapter.title}

## Chapter ${workingChapter.chapterNumber}

### Purpose
${workingChapter.purpose}

### Description
${workingChapter.description}

### Plot Advancement
${workingChapter.plotAdvancement || 'To be developed'}

### Characters
${characterNames || 'Characters to be determined'}

### Conflicts
${workingChapter.conflicts?.map((c) => `- ${c}`).join('\n') || 'Conflicts to be developed'}

### Character Development
${workingChapter.characterMoments?.map((m) => `- ${m.description || m}`).join('\n') || 'Character moments to be developed'}

### Scenes
${workingChapter.scenes?.map((sceneId, index) => `- Scene ${index + 1}: [Scene ID ${sceneId}]`).join('\n') || 'Scenes to be developed'}

### Chapter Content
${generateContent ? '*Content to be written*' : '*Use generate-content option to create prose*'}

---
**Chapter Details:**
- Target Word Count: ${targetWordCount}
- Status: ${workingChapter.status}
- Priority: ${priority}
- Created: ${workingChapter.createdAt}
- Updated: ${workingChapter.updatedAt}
`;

		await fs.writeFile(chapterFilePath, chapterContent);

		// Update story bible
		if (isNewChapter) {
			if (!storyBible.chapters) {
				storyBible.chapters = [];
			}
			storyBible.chapters.push(workingChapter);
		} else {
			// Update existing chapter
			const chapterIndex = storyBible.chapters.findIndex(
				(c) => c.id === workingChapter.id
			);
			if (chapterIndex >= 0) {
				storyBible.chapters[chapterIndex] = workingChapter;
			}
		}

		storyBible.meta.updatedAt = new Date().toISOString();
		await fs.writeFile(storyBiblePath, JSON.stringify(storyBible, null, 2));

		const message = `✅ Chapter ${workingChapter.chapterNumber} ${isNewChapter ? 'created' : 'updated'} successfully!

📁 Files ${isNewChapter ? 'Created' : 'Updated'}:
- Chapter file: ${chapterFilePath}
- Updated story bible: ${storyBiblePath}

📖 Chapter Details:
- Title: ${workingChapter.title}
- Number: ${workingChapter.chapterNumber}
- Purpose: ${workingChapter.purpose}
- Target Words: ${targetWordCount.toLocaleString()}
- Scenes: ${workingChapter.scenes?.length || 0}
- Status: ${workingChapter.status}

🎯 Next Steps:
- Develop individual scenes
- Write chapter content
- Use "next-chapter" to find next chapter to work on
- Use "check-consistency" to verify story flow`;

		return {
			success: true,
			message,
			data: {
				chapter: workingChapter,
				filePath: chapterFilePath,
				isNewChapter,
				sceneCount: workingChapter.scenes?.length || 0
			}
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to generate chapter: ${error.message}`,
			error: error.message
		};
	}
}
