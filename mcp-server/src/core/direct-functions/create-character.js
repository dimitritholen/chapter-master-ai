/**
 * Direct function: Create Character
 * Creates a new character with comprehensive development profile
 */

import path from 'path';
import fs from 'fs/promises';
import { findProjectRoot } from '../../../../scripts/modules/utils.js';
import { generateTextService } from '../../../../scripts/modules/ai-services-unified.js';
import { AiCharacterSchema } from '../../../../src/constants/story-schema.js';

/**
 * Create a new character with comprehensive profile
 * @param {Object} params - Parameters
 * @param {string} params.name - Character name
 * @param {string} params.characterType - Character type
 * @param {string} [params.description] - Character description
 * @param {boolean} [params.generateProfile] - Generate psychological profile
 * @param {boolean} [params.generateArc] - Generate character arc
 * @param {boolean} [params.generateVoice] - Generate voice characteristics
 * @param {number[]} [params.relatedCharacters] - Related character IDs
 * @param {string} [params.priority] - Priority level
 * @param {Object} [params.session] - MCP session
 * @returns {Promise<Object>} Result object
 */
export async function createCharacterDirect({
	name,
	characterType,
	description,
	generateProfile = true,
	generateArc = true,
	generateVoice = true,
	relatedCharacters,
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
		const charactersDir = path.join(projectRoot, 'characters');

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

		// Get premise for context
		const premise = storyBible.premise;
		if (!premise) {
			return {
				success: false,
				message:
					'❌ No premise found in story bible. Complete premise setup first.',
				error: 'Premise not found'
			};
		}

		// Generate next character ID
		const existingCharacters = storyBible.characters || [];
		const nextId =
			existingCharacters.length > 0
				? Math.max(...existingCharacters.map((c) => c.id)) + 1
				: 1;

		// Create character directory
		await fs.mkdir(charactersDir, { recursive: true });

		let characterProfile = {
			id: nextId,
			type: 'character',
			title: name,
			description: description || `${characterType} character`,
			characterType,
			status: 'draft',
			priority,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

		// Generate AI-enhanced character profile if requested
		if (generateProfile || generateArc || generateVoice) {
			const characterPrompt = `
Create a comprehensive character profile for this story character:

STORY CONTEXT:
Genre: ${premise.genre}
Themes: ${premise.themes?.join(', ') || 'Not specified'}
Premise: ${premise.content}

CHARACTER DETAILS:
Name: ${name}
Type: ${characterType}
Description: ${description || 'To be developed'}

Please create:
1. Detailed character description and background
2. Core motivations, fears, and goals
3. Key personality traits
4. Character development arc summary
5. Any relevant relationships with other characters

Return a structured character profile suitable for ${premise.genre} genre.
`;

			const characterResponse = await generateTextService(
				characterPrompt,
				'main',
				session,
				{
					schema: AiCharacterSchema,
					schemaName: 'character_profile'
				}
			);

			// Parse AI response
			let aiCharacter;
			try {
				aiCharacter =
					typeof characterResponse === 'string'
						? JSON.parse(characterResponse)
						: characterResponse;
			} catch (error) {
				// If AI response can't be parsed, continue with basic profile
				console.warn(
					'Could not parse AI character response, using basic profile'
				);
				aiCharacter = null;
			}

			// Enhance character profile with AI data
			if (aiCharacter) {
				characterProfile = {
					...characterProfile,
					description: aiCharacter.description || characterProfile.description,
					psychology: {
						motivations: aiCharacter.motivations || [],
						fears: aiCharacter.fears || [],
						goals: aiCharacter.goals || []
					},
					traits: aiCharacter.traits || [],
					arc: {
						summary: aiCharacter.arc || 'To be developed'
					}
				};
			}
		}

		// Create character file
		const characterFileName =
			name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.md';
		const characterFilePath = path.join(charactersDir, characterFileName);

		const characterContent = `# ${name}

## Character Overview
- **Type**: ${characterType}
- **Status**: ${characterProfile.status}
- **Priority**: ${priority}

## Description
${characterProfile.description}

## Psychology
${
	characterProfile.psychology
		? `
### Motivations
${characterProfile.psychology.motivations?.map((m) => `- ${m}`).join('\n') || 'To be developed'}

### Fears
${characterProfile.psychology.fears?.map((f) => `- ${f}`).join('\n') || 'To be developed'}

### Goals
${characterProfile.psychology.goals?.map((g) => `- ${g}`).join('\n') || 'To be developed'}
`
		: 'To be developed'
}

## Character Arc
${characterProfile.arc?.summary || 'To be developed'}

## Traits
${characterProfile.traits?.map((t) => `- ${t}`).join('\n') || 'To be developed'}

## Voice and Dialogue
*To be developed*

## Relationships
*To be developed*

## Notes
*Additional character notes and development ideas*

---
*Character created: ${new Date().toISOString()}*
`;

		await fs.writeFile(characterFilePath, characterContent);

		// Update story bible
		if (!storyBible.characters) {
			storyBible.characters = [];
		}
		storyBible.characters.push(characterProfile);
		storyBible.meta.updatedAt = new Date().toISOString();

		await fs.writeFile(storyBiblePath, JSON.stringify(storyBible, null, 2));

		const message = `✅ Character "${name}" created successfully!

📁 Files Created:
- Character profile: ${characterFilePath}
- Updated story bible: ${storyBiblePath}

👤 Character Details:
- Name: ${name}
- Type: ${characterType}
- ID: ${nextId}
- Status: ${characterProfile.status}

🎯 Next Steps:
- Develop character relationships
- Refine character voice and dialogue style
- Use "generate-chapter" to feature this character
- Use "check-consistency" to verify character continuity`;

		return {
			success: true,
			message,
			data: {
				character: characterProfile,
				filePath: characterFilePath,
				id: nextId
			}
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to create character: ${error.message}`,
			error: error.message
		};
	}
}
