/**
 * Direct function: Parse Premise
 * Analyzes story premise and generates foundational story elements
 */

import path from 'path';
import fs from 'fs/promises';
import { findProjectRoot } from '../../../../scripts/modules/utils.js';
import { generateTextService } from '../../../../scripts/modules/ai-services-unified.js';
import { AiPremiseSchema } from '../../../../src/constants/story-schema.js';
import {
	GENRE_TYPES,
	STORY_STRUCTURE_TYPES
} from '../../../../src/constants/story-elements.js';

/**
 * Parse premise and generate story bible foundation
 * @param {Object} params - Parameters
 * @param {string} params.premise - The story premise text
 * @param {string} [params.filePath] - Path to premise file
 * @param {number} [params.targetWordCount] - Target word count
 * @param {boolean} [params.generateOutline] - Whether to generate outline
 * @param {string} [params.structureType] - Story structure type
 * @param {Object} [params.session] - MCP session
 * @returns {Promise<Object>} Result object
 */
export async function parsePremiseDirect({
	premise,
	filePath = 'PREMISE.md',
	targetWordCount = 80000,
	generateOutline = true,
	structureType = 'three-act',
	session = null
}) {
	try {
		const projectRoot = findProjectRoot() || process.cwd();

		// Read premise from file if not provided directly
		let premiseText = premise;
		if (!premiseText && filePath) {
			const fullPath = path.resolve(projectRoot, filePath);
			try {
				premiseText = await fs.readFile(fullPath, 'utf-8');
			} catch (error) {
				throw new Error(
					`Could not read premise file at ${fullPath}: ${error.message}`
				);
			}
		}

		if (!premiseText || premiseText.trim().length === 0) {
			throw new Error('No premise text provided');
		}

		// Create story bible directory structure
		const storyBibleDir = path.join(projectRoot, 'story-bible');
		const charactersDir = path.join(projectRoot, 'characters');
		const chaptersDir = path.join(projectRoot, 'chapters');

		await fs.mkdir(storyBibleDir, { recursive: true });
		await fs.mkdir(charactersDir, { recursive: true });
		await fs.mkdir(chaptersDir, { recursive: true });

		// AI prompt for premise analysis
		const analysisPrompt = `
Analyze this story premise and generate foundational story elements:

PREMISE:
${premiseText}

Please analyze and return a structured response with:
1. Genre classification (from: ${GENRE_TYPES.join(', ')})
2. Core themes and messages (array of strings)
3. Target audience description
4. Enhanced premise with additional details
5. Recommended target word count (considering the scope)

Return your analysis in a structured format that can guide story development.
`;

		// Get AI analysis
		const analysisResponse = await generateTextService(
			analysisPrompt,
			'research', // Use research model for analysis
			session,
			{
				schema: AiPremiseSchema,
				schemaName: 'premise_analysis'
			}
		);

		// Parse AI response
		let analysis;
		try {
			analysis =
				typeof analysisResponse === 'string'
					? JSON.parse(analysisResponse)
					: analysisResponse;
		} catch (error) {
			throw new Error(`Failed to parse AI analysis: ${error.message}`);
		}

		// Validate analysis
		const validatedAnalysis = AiPremiseSchema.parse(analysis);

		// Create premise document
		const premiseContent = `# Story Premise

## Original Premise
${premiseText}

## Enhanced Premise
${validatedAnalysis.content}

## Story Details

### Genre
${validatedAnalysis.genre}

### Target Audience
${validatedAnalysis.targetAudience}

### Target Word Count
${validatedAnalysis.wordCountTarget || targetWordCount}

### Core Themes
${validatedAnalysis.themes.map((theme) => `- ${theme}`).join('\n')}

## Generated
- Created: ${new Date().toISOString()}
- Structure Type: ${structureType}
- Status: draft
`;

		// Save premise document
		const premiseFile = path.join(storyBibleDir, 'premise.md');
		await fs.writeFile(premiseFile, premiseContent);

		// Generate basic outline if requested
		let outlineMessage = '';
		if (generateOutline) {
			const outlinePrompt = `
Based on this analyzed premise, create a basic story outline using ${structureType} structure:

PREMISE ANALYSIS:
Genre: ${validatedAnalysis.genre}
Themes: ${validatedAnalysis.themes.join(', ')}
Target Word Count: ${validatedAnalysis.wordCountTarget}

Create a structured outline with:
1. Three-act structure (if three-act) or appropriate structure beats
2. Key plot points and turning moments
3. Character arc suggestions
4. Pacing recommendations

Provide a clear, actionable outline for ${validatedAnalysis.genre} genre.
`;

			const outlineResponse = await generateTextService(
				outlinePrompt,
				'main', // Use main model for creative work
				session
			);

			const outlineContent = `# Story Outline

## Structure Type
${structureType}

## Generated Outline
${outlineResponse}

## Metadata
- Generated: ${new Date().toISOString()}
- Based on: ${premiseFile}
- Status: draft
`;

			const outlineFile = path.join(storyBibleDir, 'outline.md');
			await fs.writeFile(outlineFile, outlineContent);
			outlineMessage = `\n- Generated basic outline: ${outlineFile}`;
		}

		// Create initial story bible metadata
		const storyBible = {
			meta: {
				title: 'Untitled Story',
				genre: validatedAnalysis.genre,
				targetWordCount: validatedAnalysis.wordCountTarget,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				version: '0.1.0'
			},
			premise: {
				id: 1,
				type: 'premise',
				title: 'Story Premise',
				description: 'Core story premise and foundation',
				status: 'completed',
				priority: 'high',
				content: validatedAnalysis.content,
				genre: validatedAnalysis.genre,
				targetAudience: validatedAnalysis.targetAudience,
				themes: validatedAnalysis.themes,
				wordCountTarget: validatedAnalysis.wordCountTarget,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString()
			}
		};

		const storyBibleFile = path.join(storyBibleDir, 'story-bible.json');
		await fs.writeFile(storyBibleFile, JSON.stringify(storyBible, null, 2));

		const message = `✅ Premise parsed successfully!

📁 Story Structure Created:
- Story bible: ${storyBibleFile}
- Premise document: ${premiseFile}${outlineMessage}
- Characters directory: ${charactersDir}
- Chapters directory: ${chaptersDir}

📊 Analysis Results:
- Genre: ${validatedAnalysis.genre}
- Target audience: ${validatedAnalysis.targetAudience}
- Target word count: ${validatedAnalysis.wordCountTarget.toLocaleString()}
- Themes: ${validatedAnalysis.themes.length}

🎯 Next Steps:
- Use "create-character" to develop main characters
- Use "generate-chapter" to start outlining chapters
- Use "get-story-status" to track progress`;

		return {
			success: true,
			message,
			data: {
				premise: validatedAnalysis,
				storyBiblePath: storyBibleFile,
				premisePath: premiseFile,
				outlinePath: generateOutline
					? path.join(storyBibleDir, 'outline.md')
					: null
			}
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to parse premise: ${error.message}`,
			error: error.message
		};
	}
}
