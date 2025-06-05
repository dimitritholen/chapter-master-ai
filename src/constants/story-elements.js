/**
 * Story element types and their hierarchical relationships
 */

/**
 * @typedef {'premise' | 'outline' | 'character' | 'chapter' | 'scene' | 'plot-thread'} StoryElementType
 */

/**
 * Story element types list
 * @type {StoryElementType[]}
 */
export const STORY_ELEMENT_TYPES = [
	'premise',
	'outline',
	'character',
	'chapter',
	'scene',
	'plot-thread'
];

/**
 * Story structure types based on professional writing methodologies
 * @typedef {'save-the-cat' | 'hero-journey' | 'three-act' | 'seven-point' | 'genre-specific'} StoryStructureType
 */

export const STORY_STRUCTURE_TYPES = [
	'save-the-cat', // Save the Cat! Writes a Novel (15-beat structure)
	'hero-journey', // Campbell's Hero's Journey
	'three-act', // Three-Act Structure with midpoint
	'seven-point', // Seven-Point Story Structure
	'genre-specific' // Genre-specific templates (Romance, Mystery, etc.)
];

/**
 * Character types in story development
 * @typedef {'protagonist' | 'antagonist' | 'supporting' | 'minor'} CharacterType
 */

export const CHARACTER_TYPES = [
	'protagonist',
	'antagonist',
	'supporting',
	'minor'
];

/**
 * Scene types for story pacing and structure
 * @typedef {'action' | 'dialogue' | 'exposition' | 'climax' | 'transition' | 'flashback'} SceneType
 */

export const SCENE_TYPES = [
	'action',
	'dialogue',
	'exposition',
	'climax',
	'transition',
	'flashback'
];

/**
 * Genre types for story classification and structure guidance
 * @typedef {'fantasy' | 'romance' | 'thriller' | 'mystery' | 'science-fiction' | 'literary' | 'young-adult' | 'horror' | 'historical'} GenreType
 */

export const GENRE_TYPES = [
	'fantasy',
	'romance',
	'thriller',
	'mystery',
	'science-fiction',
	'literary',
	'young-adult',
	'horror',
	'historical'
];

/**
 * Check if a given type is a valid story element type
 * @param {string} type - The type to check
 * @returns {boolean} True if the type is valid, false otherwise
 */
export function isValidStoryElementType(type) {
	return STORY_ELEMENT_TYPES.includes(type);
}

/**
 * Check if a given type is a valid story structure type
 * @param {string} type - The type to check
 * @returns {boolean} True if the type is valid, false otherwise
 */
export function isValidStoryStructureType(type) {
	return STORY_STRUCTURE_TYPES.includes(type);
}

/**
 * Check if a given type is a valid character type
 * @param {string} type - The type to check
 * @returns {boolean} True if the type is valid, false otherwise
 */
export function isValidCharacterType(type) {
	return CHARACTER_TYPES.includes(type);
}

/**
 * Check if a given type is a valid scene type
 * @param {string} type - The type to check
 * @returns {boolean} True if the type is valid, false otherwise
 */
export function isValidSceneType(type) {
	return SCENE_TYPES.includes(type);
}

/**
 * Check if a given type is a valid genre type
 * @param {string} type - The type to check
 * @returns {boolean} True if the type is valid, false otherwise
 */
export function isValidGenreType(type) {
	return GENRE_TYPES.includes(type);
}

/**
 * Get the hierarchical parent type for a story element
 * @param {StoryElementType} elementType - The element type
 * @returns {StoryElementType|null} The parent type, or null if top-level
 */
export function getParentElementType(elementType) {
	const hierarchy = {
		scene: 'chapter',
		chapter: 'outline',
		character: 'outline',
		'plot-thread': 'outline',
		outline: 'premise'
	};

	return hierarchy[elementType] || null;
}

/**
 * Get the child element types for a story element
 * @param {StoryElementType} elementType - The element type
 * @returns {StoryElementType[]} Array of child types
 */
export function getChildElementTypes(elementType) {
	const children = {
		premise: ['outline'],
		outline: ['character', 'chapter', 'plot-thread'],
		chapter: ['scene'],
		character: [],
		scene: [],
		'plot-thread': []
	};

	return children[elementType] || [];
}
