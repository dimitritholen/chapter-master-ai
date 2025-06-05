/**
 * MCP Tool: Create Character
 * Creates a new character with comprehensive development profile
 */

import { createCharacterDirect } from '../core/direct-functions/create-character.js';

export default {
	name: 'create-character',
	description:
		'Create a new character with comprehensive development profile including psychology, arc, and voice',
	inputSchema: {
		type: 'object',
		properties: {
			name: {
				type: 'string',
				description: 'Character name'
			},
			characterType: {
				type: 'string',
				enum: ['protagonist', 'antagonist', 'supporting', 'minor'],
				description: 'Role in the story',
				default: 'supporting'
			},
			description: {
				type: 'string',
				description: 'Brief character description'
			},
			generateProfile: {
				type: 'boolean',
				description: 'Whether to generate full psychological profile',
				default: true
			},
			generateArc: {
				type: 'boolean',
				description: 'Whether to generate character development arc',
				default: true
			},
			generateVoice: {
				type: 'boolean',
				description: 'Whether to generate voice and dialogue characteristics',
				default: true
			},
			relatedCharacters: {
				type: 'array',
				items: {
					type: 'number'
				},
				description: 'IDs of related characters for relationship mapping'
			},
			priority: {
				type: 'string',
				enum: ['high', 'medium', 'low'],
				description: 'Character development priority',
				default: 'medium'
			}
		},
		required: ['name', 'characterType']
	},
	handler: async (args, session) => {
		try {
			const {
				name,
				characterType,
				description,
				generateProfile = true,
				generateArc = true,
				generateVoice = true,
				relatedCharacters,
				priority = 'medium'
			} = args;

			const result = await createCharacterDirect({
				name,
				characterType,
				description,
				generateProfile,
				generateArc,
				generateVoice,
				relatedCharacters,
				priority,
				session
			});

			return {
				content: [
					{
						type: 'text',
						text: result.message || 'Character created successfully'
					}
				],
				isError: false
			};
		} catch (error) {
			return {
				content: [
					{
						type: 'text',
						text: `Error creating character: ${error.message}`
					}
				],
				isError: true
			};
		}
	}
};
