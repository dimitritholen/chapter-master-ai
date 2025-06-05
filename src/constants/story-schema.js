/**
 * Story element data schema definitions
 */

import { z } from 'zod';
import { STORY_STATUS_OPTIONS } from './story-status.js';
import {
	STORY_ELEMENT_TYPES,
	STORY_STRUCTURE_TYPES,
	CHARACTER_TYPES,
	SCENE_TYPES,
	GENRE_TYPES
} from './story-elements.js';

// Base story element schema
export const BaseStoryElementSchema = z.object({
	id: z.number().int().positive().describe('Unique numeric identifier'),
	type: z.enum(STORY_ELEMENT_TYPES).describe('Type of story element'),
	title: z.string().min(1).describe('Clear, concise title'),
	description: z.string().describe('Brief description of the element'),
	status: z.enum(STORY_STATUS_OPTIONS).describe('Current status'),
	priority: z.enum(['high', 'medium', 'low']).describe('Priority level'),
	dependencies: z
		.array(z.number().int())
		.optional()
		.describe('IDs of prerequisite elements'),
	tags: z
		.array(z.string())
		.optional()
		.describe('Optional tags for organization'),
	notes: z.string().optional().describe('Additional notes or comments'),
	createdAt: z.string().describe('Creation timestamp'),
	updatedAt: z.string().describe('Last update timestamp')
});

// Premise schema
export const PremiseSchema = BaseStoryElementSchema.extend({
	type: z.literal('premise'),
	content: z.string().describe('The core story premise content'),
	genre: z.enum(GENRE_TYPES).describe('Primary genre'),
	targetAudience: z.string().optional().describe('Target reader demographic'),
	themes: z.array(z.string()).optional().describe('Core themes and messages'),
	wordCountTarget: z
		.number()
		.int()
		.positive()
		.optional()
		.describe('Target word count for finished work')
});

// Outline schema
export const OutlineSchema = BaseStoryElementSchema.extend({
	type: z.literal('outline'),
	structureType: z
		.enum(STORY_STRUCTURE_TYPES)
		.describe('Story structure methodology'),
	acts: z
		.array(
			z.object({
				id: z.number().int().positive(),
				title: z.string(),
				description: z.string(),
				chapters: z.array(z.number().int()).optional() // Chapter IDs
			})
		)
		.optional()
		.describe('Act structure if applicable'),
	plotThreads: z
		.array(z.number().int())
		.optional()
		.describe('Plot thread element IDs'),
	characterArcs: z
		.array(z.number().int())
		.optional()
		.describe('Character element IDs'),
	pacing: z
		.object({
			openingHook: z.string().optional(),
			incitingIncident: z.string().optional(),
			midpoint: z.string().optional(),
			climax: z.string().optional(),
			resolution: z.string().optional()
		})
		.optional()
		.describe('Key story beats and pacing elements')
});

// Character schema
export const CharacterSchema = BaseStoryElementSchema.extend({
	type: z.literal('character'),
	characterType: z.enum(CHARACTER_TYPES).describe('Role in the story'),
	biography: z
		.object({
			age: z.number().int().optional(),
			background: z.string().optional(),
			occupation: z.string().optional(),
			relationships: z
				.array(
					z.object({
						characterId: z.number().int(),
						relationship: z.string()
					})
				)
				.optional()
		})
		.optional()
		.describe('Character background information'),
	psychology: z
		.object({
			motivations: z.array(z.string()).optional(),
			fears: z.array(z.string()).optional(),
			goals: z.array(z.string()).optional(),
			flaws: z.array(z.string()).optional(),
			strengths: z.array(z.string()).optional()
		})
		.optional()
		.describe('Character psychological profile'),
	arc: z
		.object({
			startingState: z.string().optional(),
			midpointState: z.string().optional(),
			endingState: z.string().optional(),
			keyMoments: z.array(z.string()).optional()
		})
		.optional()
		.describe('Character development arc'),
	voice: z
		.object({
			speechPatterns: z.array(z.string()).optional(),
			vocabulary: z.string().optional(),
			tone: z.string().optional(),
			distinctiveFeatures: z.array(z.string()).optional()
		})
		.optional()
		.describe('Character voice and dialogue characteristics'),
	appearance: z.string().optional().describe('Physical description'),
	traits: z.array(z.string()).optional().describe('Key personality traits')
});

// Chapter schema
export const ChapterSchema = BaseStoryElementSchema.extend({
	type: z.literal('chapter'),
	chapterNumber: z
		.number()
		.int()
		.positive()
		.describe('Chapter sequence number'),
	scenes: z.array(z.number().int()).optional().describe('Scene element IDs'),
	purpose: z.string().describe('What this chapter accomplishes in the story'),
	conflicts: z
		.array(z.string())
		.optional()
		.describe('Conflicts introduced or resolved'),
	characterMoments: z
		.array(
			z.object({
				characterId: z.number().int(),
				development: z.string()
			})
		)
		.optional()
		.describe('Character development in this chapter'),
	plotAdvancement: z
		.string()
		.optional()
		.describe('How this chapter advances the plot'),
	wordCountTarget: z
		.number()
		.int()
		.positive()
		.optional()
		.describe('Target word count'),
	content: z.string().optional().describe('Written chapter content')
});

// Scene schema
export const SceneSchema = BaseStoryElementSchema.extend({
	type: z.literal('scene'),
	sceneType: z.enum(SCENE_TYPES).describe('Type of scene'),
	chapterId: z.number().int().describe('Parent chapter ID'),
	characters: z
		.array(z.number().int())
		.describe('Character IDs present in scene'),
	setting: z.string().describe('Where and when the scene takes place'),
	purpose: z.string().describe('What this scene accomplishes'),
	conflict: z.string().optional().describe('Central conflict or tension'),
	dialogue: z.boolean().optional().describe('Whether scene is dialogue-heavy'),
	action: z.boolean().optional().describe('Whether scene is action-heavy'),
	pov: z.number().int().optional().describe('Point of view character ID'),
	content: z.string().optional().describe('Written scene content'),
	beats: z
		.array(z.string())
		.optional()
		.describe('Individual story beats within scene')
});

// Plot thread schema
export const PlotThreadSchema = BaseStoryElementSchema.extend({
	type: z.literal('plot-thread'),
	threadType: z
		.enum(['main', 'subplot', 'character-arc'])
		.describe('Type of plot thread'),
	introduction: z
		.string()
		.optional()
		.describe('Where/how thread is introduced'),
	development: z
		.array(z.string())
		.optional()
		.describe('Key development points'),
	resolution: z.string().optional().describe('How thread is resolved'),
	characters: z
		.array(z.number().int())
		.optional()
		.describe('Characters involved'),
	chapters: z
		.array(z.number().int())
		.optional()
		.describe('Chapters where thread appears')
});

// Story bible schema (container for all story elements)
export const StoryBibleSchema = z.object({
	meta: z
		.object({
			title: z.string().describe('Story title'),
			author: z.string().optional().describe('Author name'),
			genre: z.enum(GENRE_TYPES).describe('Primary genre'),
			targetWordCount: z.number().int().positive().optional(),
			createdAt: z.string().describe('Creation timestamp'),
			updatedAt: z.string().describe('Last update timestamp'),
			version: z.string().optional().describe('Story version')
		})
		.describe('Story metadata'),

	premise: PremiseSchema.optional().describe('Core story premise'),
	outline: OutlineSchema.optional().describe('Story outline structure'),
	characters: z
		.array(CharacterSchema)
		.optional()
		.describe('Character elements'),
	chapters: z.array(ChapterSchema).optional().describe('Chapter elements'),
	scenes: z.array(SceneSchema).optional().describe('Scene elements'),
	plotThreads: z
		.array(PlotThreadSchema)
		.optional()
		.describe('Plot thread elements'),

	// Research and world-building
	research: z
		.array(
			z.object({
				id: z.number().int().positive(),
				topic: z.string(),
				content: z.string(),
				sources: z.array(z.string()).optional(),
				tags: z.array(z.string()).optional()
			})
		)
		.optional()
		.describe('Research notes and world-building'),

	// Style and voice guidelines
	style: z
		.object({
			voice: z.string().optional().describe('Overall narrative voice'),
			tense: z.string().optional().describe('Narrative tense'),
			pov: z.string().optional().describe('Point of view style'),
			tone: z.string().optional().describe('Overall tone'),
			styleNotes: z.array(z.string()).optional().describe('Style guidelines')
		})
		.optional()
		.describe('Style and voice guidelines')
});

// AI generation schemas for prompting
export const AiPremiseSchema = z.object({
	content: z.string().describe('The core story premise'),
	genre: z.enum(GENRE_TYPES).describe('Primary genre'),
	themes: z.array(z.string()).describe('Core themes and messages'),
	targetAudience: z.string().describe('Target reader demographic'),
	wordCountTarget: z.number().int().positive().describe('Target word count')
});

export const AiCharacterSchema = z.object({
	title: z.string().describe('Character name'),
	description: z.string().describe('Brief character description'),
	characterType: z.enum(CHARACTER_TYPES).describe('Role in the story'),
	motivations: z.array(z.string()).describe('Core motivations'),
	fears: z.array(z.string()).describe('Primary fears'),
	goals: z.array(z.string()).describe('Character goals'),
	traits: z.array(z.string()).describe('Key personality traits'),
	arc: z.string().describe('Character development arc summary')
});

export const AiChapterSchema = z.object({
	title: z.string().describe('Chapter title'),
	description: z.string().describe('Chapter summary'),
	purpose: z.string().describe('What this chapter accomplishes'),
	conflicts: z.array(z.string()).describe('Conflicts in this chapter'),
	plotAdvancement: z.string().describe('How this chapter advances the plot'),
	characterMoments: z
		.array(z.string())
		.describe('Key character development moments')
});

export const AiSceneSchema = z.object({
	title: z.string().describe('Scene title or summary'),
	description: z.string().describe('Scene description'),
	sceneType: z.enum(SCENE_TYPES).describe('Type of scene'),
	setting: z.string().describe('Scene setting'),
	purpose: z.string().describe('Scene purpose'),
	conflict: z.string().describe('Scene conflict or tension'),
	beats: z.array(z.string()).describe('Key story beats in scene')
});

// Export validation functions
export function validateStoryElement(element, type) {
	const schemas = {
		premise: PremiseSchema,
		outline: OutlineSchema,
		character: CharacterSchema,
		chapter: ChapterSchema,
		scene: SceneSchema,
		'plot-thread': PlotThreadSchema
	};

	const schema = schemas[type];
	if (!schema) {
		throw new Error(`Unknown story element type: ${type}`);
	}

	return schema.parse(element);
}

export function validateStoryBible(storyBible) {
	return StoryBibleSchema.parse(storyBible);
}
