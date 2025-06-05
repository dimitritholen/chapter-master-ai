/**
 * MCP Tool: Check Consistency
 * Validates story consistency across characters, plot threads, and timeline
 */

import { checkConsistencyDirect } from '../core/direct-functions/check-consistency.js';

export default {
	name: 'check-consistency',
	description:
		'Check story consistency across characters, plot threads, timeline, and narrative elements',
	inputSchema: {
		type: 'object',
		properties: {
			checkType: {
				type: 'string',
				enum: ['character', 'plot', 'timeline', 'style', 'all'],
				description: 'Type of consistency check to perform',
				default: 'all'
			},
			characterId: {
				type: 'number',
				description:
					'Specific character ID to check (if checkType is character)'
			},
			plotThreadId: {
				type: 'number',
				description: 'Specific plot thread ID to check (if checkType is plot)'
			},
			startChapter: {
				type: 'number',
				description: 'Starting chapter for range check',
				default: 1
			},
			endChapter: {
				type: 'number',
				description: 'Ending chapter for range check'
			},
			generateReport: {
				type: 'boolean',
				description: 'Whether to generate detailed consistency report',
				default: true
			},
			autoFix: {
				type: 'boolean',
				description: 'Whether to automatically fix minor inconsistencies',
				default: false
			},
			fixMode: {
				type: 'string',
				enum: ['conservative', 'aggressive'],
				description: 'How aggressively to fix inconsistencies',
				default: 'conservative'
			}
		}
	},
	handler: async (args, session) => {
		try {
			const {
				checkType = 'all',
				characterId,
				plotThreadId,
				startChapter = 1,
				endChapter,
				generateReport = true,
				autoFix = false,
				fixMode = 'conservative'
			} = args;

			const result = await checkConsistencyDirect({
				checkType,
				characterId,
				plotThreadId,
				startChapter,
				endChapter,
				generateReport,
				autoFix,
				fixMode,
				session
			});

			return {
				content: [
					{
						type: 'text',
						text: result.message || 'Consistency check completed'
					}
				],
				isError: false
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error checking consistency: ${error.message}`
					}
				],
				isError: true
			};
		}
	}
};
