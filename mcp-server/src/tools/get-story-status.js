/**
 * MCP Tool: Get Story Status
 * Provides comprehensive overview of story development progress
 */

import { getStoryStatusDirect } from '../core/direct-functions/get-story-status.js';

export default {
	name: 'get-story-status',
	description:
		'Get comprehensive overview of story development progress including completion percentages and next steps',
	inputSchema: {
		type: 'object',
		properties: {
			includeChapters: {
				type: 'boolean',
				description: 'Include chapter-by-chapter status',
				default: true
			},
			includeCharacters: {
				type: 'boolean',
				description: 'Include character development status',
				default: true
			},
			includePlotThreads: {
				type: 'boolean',
				description: 'Include plot thread progress',
				default: true
			},
			includeWordCounts: {
				type: 'boolean',
				description: 'Include word count statistics',
				default: true
			},
			includeNextSteps: {
				type: 'boolean',
				description: 'Include recommended next steps',
				default: true
			},
			format: {
				type: 'string',
				enum: ['summary', 'detailed', 'table'],
				description: 'Output format for the status report',
				default: 'detailed'
			}
		}
	},
	handler: async (args, session) => {
		try {
			const {
				includeChapters = true,
				includeCharacters = true,
				includePlotThreads = true,
				includeWordCounts = true,
				includeNextSteps = true,
				format = 'detailed'
			} = args;

			const result = await getStoryStatusDirect({
				includeChapters,
				includeCharacters,
				includePlotThreads,
				includeWordCounts,
				includeNextSteps,
				format,
				session
			});

			return {
				content: [
					{
						type: 'text',
						text: result.message || 'Story status retrieved successfully'
					}
				],
				isError: false
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error getting story status: ${error.message}`
					}
				],
				isError: true
			};
		}
	}
};
