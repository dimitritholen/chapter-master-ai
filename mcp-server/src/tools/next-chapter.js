/**
 * MCP Tool: Next Chapter
 * Determines the next chapter to work on based on story progression and dependencies
 */

import { nextChapterDirect } from '../core/direct-functions/next-chapter.js';

export default {
	name: 'next-chapter',
	description:
		'Find the next chapter to work on based on story progression, dependencies, and writing workflow',
	inputSchema: {
		type: 'object',
		properties: {
			status: {
				type: 'string',
				enum: ['draft', 'in-progress', 'review', 'needs-revision'],
				description: 'Filter by chapter status'
			},
			priority: {
				type: 'string',
				enum: ['high', 'medium', 'low'],
				description: 'Filter by priority level'
			},
			includeScenes: {
				type: 'boolean',
				description: 'Whether to include next scene recommendations',
				default: true
			},
			characterFocus: {
				type: 'string',
				description: 'Focus on chapters featuring specific character'
			},
			plotThread: {
				type: 'string',
				description: 'Focus on chapters advancing specific plot thread'
			}
		}
	},
	handler: async (args, session) => {
		try {
			const {
				status,
				priority,
				includeScenes = true,
				characterFocus,
				plotThread
			} = args;

			const result = await nextChapterDirect({
				status,
				priority,
				includeScenes,
				characterFocus,
				plotThread,
				session
			});

			return {
				content: [
					{
						type: 'text',
						text: result.message || 'Next chapter identified successfully'
					}
				],
				isError: false
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error finding next chapter: ${error.message}`
					}
				],
				isError: true
			};
		}
	}
};
