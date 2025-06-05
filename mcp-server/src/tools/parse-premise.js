/**
 * MCP Tool: Parse Premise
 * Analyzes a story premise and generates foundational story elements
 */

import { parsePremiseDirect } from '../core/direct-functions/parse-premise.js';

export default {
	name: 'parse-premise',
	description:
		'Parse a story premise and generate foundational story elements including genre analysis, themes, and basic structure',
	inputSchema: {
		type: 'object',
		properties: {
			premise: {
				type: 'string',
				description: 'The story premise text to analyze'
			},
			filePath: {
				type: 'string',
				description: 'Optional path to premise file (e.g., PREMISE.md)',
				default: 'PREMISE.md'
			},
			targetWordCount: {
				type: 'number',
				description: 'Target word count for the finished work',
				default: 80000
			},
			generateOutline: {
				type: 'boolean',
				description: 'Whether to generate a basic story outline',
				default: true
			},
			structureType: {
				type: 'string',
				enum: [
					'save-the-cat',
					'hero-journey',
					'three-act',
					'seven-point',
					'genre-specific'
				],
				description: 'Story structure methodology to use',
				default: 'three-act'
			}
		},
		required: ['premise']
	},
	handler: async (args, session) => {
		try {
			const {
				premise,
				filePath = 'PREMISE.md',
				targetWordCount = 80000,
				generateOutline = true,
				structureType = 'three-act'
			} = args;

			const result = await parsePremiseDirect({
				premise,
				filePath,
				targetWordCount,
				generateOutline,
				structureType,
				session
			});

			return {
				content: [
					{
						type: 'text',
						text: result.message || 'Premise parsed successfully'
					}
				],
				isError: false
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error parsing premise: ${error.message}`
					}
				],
				isError: true
			};
		}
	}
};
