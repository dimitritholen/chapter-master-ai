/**
 * MCP Tool: Generate Chapter
 * Generates chapter content with scenes, character development, and plot advancement
 */

import { generateChapterDirect } from '../core/direct-functions/generate-chapter.js';

export default {
	name: 'generate-chapter',
	description:
		'Generate chapter content with scenes, character development, and plot advancement',
	inputSchema: {
		type: 'object',
		properties: {
			chapterId: {
				type: 'number',
				description: 'ID of the chapter to generate content for'
			},
			chapterNumber: {
				type: 'number',
				description: 'Chapter number if creating new chapter'
			},
			title: {
				type: 'string',
				description: 'Chapter title'
			},
			purpose: {
				type: 'string',
				description: 'What this chapter accomplishes in the story'
			},
			targetWordCount: {
				type: 'number',
				description: 'Target word count for the chapter',
				default: 3000
			},
			generateScenes: {
				type: 'boolean',
				description: 'Whether to generate individual scenes',
				default: true
			},
			sceneCount: {
				type: 'number',
				description: 'Number of scenes to generate',
				default: 3
			},
			characters: {
				type: 'array',
				items: {
					type: 'number'
				},
				description: 'Character IDs that appear in this chapter'
			},
			plotThreads: {
				type: 'array',
				items: {
					type: 'number'
				},
				description: 'Plot thread IDs advanced in this chapter'
			},
			conflicts: {
				type: 'array',
				items: {
					type: 'string'
				},
				description: 'Conflicts to introduce or resolve'
			},
			generateContent: {
				type: 'boolean',
				description: 'Whether to generate actual prose content',
				default: false
			},
			priority: {
				type: 'string',
				enum: ['high', 'medium', 'low'],
				description: 'Chapter priority',
				default: 'medium'
			}
		}
	},
	handler: async (args, session) => {
		try {
			const {
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
				priority = 'medium'
			} = args;

			const result = await generateChapterDirect({
				chapterId,
				chapterNumber,
				title,
				purpose,
				targetWordCount,
				generateScenes,
				sceneCount,
				characters,
				plotThreads,
				conflicts,
				generateContent,
				priority,
				session
			});

			return {
				content: [
					{
						type: 'text',
						text: result.message || 'Chapter generated successfully'
					}
				],
				isError: false
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error generating chapter: ${error.message}`
					}
				],
				isError: true
			};
		}
	}
};
