/**
 * Direct function: Check Consistency
 * Validates story consistency across characters, plot, and timeline
 */

import path from 'path';
import fs from 'fs/promises';
import { findProjectRoot } from '../../../../scripts/modules/utils.js';
import { generateTextService } from '../../../../scripts/modules/ai-services-unified.js';

/**
 * Check story consistency across various elements
 * @param {Object} params - Parameters
 * @param {string} [params.checkType] - Type of consistency check
 * @param {number} [params.characterId] - Specific character to check
 * @param {number} [params.plotThreadId] - Specific plot thread to check
 * @param {number} [params.startChapter] - Starting chapter for range check
 * @param {number} [params.endChapter] - Ending chapter for range check
 * @param {boolean} [params.generateReport] - Generate detailed report
 * @param {boolean} [params.autoFix] - Auto-fix minor issues
 * @param {string} [params.fixMode] - How aggressively to fix issues
 * @param {Object} [params.session] - MCP session
 * @returns {Promise<Object>} Result object
 */
export async function checkConsistencyDirect({
	checkType = 'all',
	characterId,
	plotThreadId,
	startChapter = 1,
	endChapter,
	generateReport = true,
	autoFix = false,
	fixMode = 'conservative',
	session = null
}) {
	try {
		const projectRoot = findProjectRoot() || process.cwd();
		const storyBiblePath = path.join(
			projectRoot,
			'story-bible',
			'story-bible.json'
		);

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

		const chapters = storyBible.chapters || [];
		const characters = storyBible.characters || [];
		const scenes = storyBible.scenes || [];
		const plotThreads = storyBible.plotThreads || [];

		const issues = [];
		const suggestions = [];

		// Filter chapters by range
		const targetChapters = chapters.filter((c) => {
			const chapterNum = c.chapterNumber || 0;
			return (
				chapterNum >= startChapter &&
				(endChapter ? chapterNum <= endChapter : true)
			);
		});

		// Character consistency checks
		if (checkType === 'character' || checkType === 'all') {
			const characterIssues = await checkCharacterConsistency(
				characterId
					? characters.filter((c) => c.id === characterId)
					: characters,
				targetChapters,
				scenes,
				session
			);
			issues.push(...characterIssues);
		}

		// Plot consistency checks
		if (checkType === 'plot' || checkType === 'all') {
			const plotIssues = await checkPlotConsistency(
				plotThreadId
					? plotThreads.filter((p) => p.id === plotThreadId)
					: plotThreads,
				targetChapters,
				scenes
			);
			issues.push(...plotIssues);
		}

		// Timeline consistency checks
		if (checkType === 'timeline' || checkType === 'all') {
			const timelineIssues = await checkTimelineConsistency(
				targetChapters,
				scenes
			);
			issues.push(...timelineIssues);
		}

		// Style consistency checks
		if (checkType === 'style' || checkType === 'all') {
			const styleIssues = await checkStyleConsistency(
				targetChapters,
				storyBible.style,
				session
			);
			issues.push(...styleIssues);
		}

		// Generate AI-powered consistency analysis
		if (issues.length > 0 && session) {
			const consistencyPrompt = `
Analyze these potential story consistency issues and provide recommendations:

STORY CONTEXT:
Genre: ${storyBible.premise?.genre || 'Unspecified'}
Chapters analyzed: ${targetChapters.length}
Characters: ${characters.length}

IDENTIFIED ISSUES:
${issues.map((issue, index) => `${index + 1}. ${issue.type}: ${issue.description}`).join('\n')}

Please provide:
1. Severity assessment for each issue (critical, moderate, minor)
2. Specific recommendations for resolution
3. Priority order for addressing issues
4. Any additional consistency concerns you notice

Focus on maintaining story coherence and character authenticity.
`;

			try {
				const aiAnalysis = await generateTextService(
					consistencyPrompt,
					'research',
					session
				);
				suggestions.push({
					type: 'ai-analysis',
					content: aiAnalysis
				});
			} catch (error) {
				console.warn('Could not get AI consistency analysis:', error.message);
			}
		}

		// Auto-fix issues if requested
		let fixedIssues = [];
		if (autoFix && issues.length > 0) {
			fixedIssues = await autoFixIssues(issues, storyBible, fixMode);

			if (fixedIssues.length > 0) {
				// Save updated story bible
				storyBible.meta.updatedAt = new Date().toISOString();
				await fs.writeFile(storyBiblePath, JSON.stringify(storyBible, null, 2));
			}
		}

		// Generate consistency report
		let reportPath = null;
		if (generateReport) {
			reportPath = await generateConsistencyReport(
				issues,
				suggestions,
				fixedIssues,
				{
					checkType,
					characterId,
					plotThreadId,
					startChapter,
					endChapter,
					chaptersAnalyzed: targetChapters.length,
					charactersAnalyzed: characters.length
				},
				projectRoot
			);
		}

		// Build response message
		const issueCount = issues.length;
		const fixedCount = fixedIssues.length;

		let message = `🔍 Consistency Check Complete\n\n`;

		if (issueCount === 0) {
			message += `✅ **No consistency issues found!**\n\n`;
			message += `📊 Analysis Summary:\n`;
			message += `- Chapters analyzed: ${targetChapters.length}\n`;
			message += `- Characters checked: ${characters.length}\n`;
			message += `- Check type: ${checkType}\n`;
			message += `\n🎉 Your story maintains good consistency across all checked elements.`;
		} else {
			message += `⚠️ **Found ${issueCount} potential issue${issueCount > 1 ? 's' : ''}**\n\n`;

			if (fixedCount > 0) {
				message += `✅ Auto-fixed ${fixedCount} issue${fixedCount > 1 ? 's' : ''}\n\n`;
			}

			message += `📊 Issues by Type:\n`;
			const issuesByType = issues.reduce((acc, issue) => {
				acc[issue.type] = (acc[issue.type] || 0) + 1;
				return acc;
			}, {});

			Object.entries(issuesByType).forEach(([type, count]) => {
				message += `- ${type}: ${count}\n`;
			});

			message += `\n🔧 Top Issues to Address:\n`;
			issues.slice(0, 3).forEach((issue, index) => {
				message += `${index + 1}. ${issue.description}\n`;
			});

			if (reportPath) {
				message += `\n📄 Detailed report: ${reportPath}`;
			}
		}

		return {
			success: true,
			message,
			data: {
				issues,
				suggestions,
				fixedIssues,
				reportPath,
				stats: {
					totalIssues: issueCount,
					fixedIssues: fixedCount,
					chaptersAnalyzed: targetChapters.length,
					charactersAnalyzed: characters.length
				}
			}
		};
	} catch (error) {
		return {
			success: false,
			message: `Failed to check consistency: ${error.message}`,
			error: error.message
		};
	}
}

async function checkCharacterConsistency(
	characters,
	chapters,
	scenes,
	session
) {
	const issues = [];

	for (const character of characters) {
		// Check for character appearance in chapters where they're not listed
		const characterScenes = scenes.filter((s) =>
			s.characters?.includes(character.id)
		);
		const characterChapters = chapters.filter((c) =>
			c.characters?.includes(character.id)
		);

		// Find scenes where character appears but chapter doesn't list them
		for (const scene of characterScenes) {
			const parentChapter = chapters.find((c) => c.id === scene.chapterId);
			if (parentChapter && !parentChapter.characters?.includes(character.id)) {
				issues.push({
					type: 'character-unlisted',
					description: `Character "${character.title}" appears in scenes but not listed in chapter "${parentChapter.title}"`,
					severity: 'moderate',
					characterId: character.id,
					chapterId: parentChapter.id
				});
			}
		}

		// Check for character development continuity
		if (character.arc && characterChapters.length > 1) {
			// This would need more sophisticated logic to track character development
			// For now, just flag if character appears in multiple chapters but has undefined arc
			if (
				!character.arc.summary ||
				character.arc.summary === 'To be developed'
			) {
				issues.push({
					type: 'character-arc-undefined',
					description: `Character "${character.title}" appears in multiple chapters but lacks defined character arc`,
					severity: 'minor',
					characterId: character.id
				});
			}
		}
	}

	return issues;
}

async function checkPlotConsistency(plotThreads, chapters, scenes) {
	const issues = [];

	for (const plotThread of plotThreads) {
		// Check if plot thread is mentioned in chapters but not tracked
		const relevantChapters = chapters.filter(
			(c) =>
				c.plotThreads?.includes(plotThread.id) ||
				c.plotAdvancement
					?.toLowerCase()
					.includes(plotThread.title.toLowerCase())
		);

		if (relevantChapters.length === 0 && plotThread.status !== 'completed') {
			issues.push({
				type: 'plot-thread-unused',
				description: `Plot thread "${plotThread.title}" is not referenced in any chapters`,
				severity: 'minor',
				plotThreadId: plotThread.id
			});
		}

		// Check for unresolved plot threads
		if (plotThread.status === 'completed' && !plotThread.resolution) {
			issues.push({
				type: 'plot-thread-unresolved',
				description: `Plot thread "${plotThread.title}" marked complete but no resolution specified`,
				severity: 'moderate',
				plotThreadId: plotThread.id
			});
		}
	}

	return issues;
}

async function checkTimelineConsistency(chapters, scenes) {
	const issues = [];

	// Check for chapter sequence gaps
	const chapterNumbers = chapters
		.map((c) => c.chapterNumber)
		.filter((n) => n)
		.sort((a, b) => a - b);
	for (let i = 1; i < chapterNumbers.length; i++) {
		if (chapterNumbers[i] - chapterNumbers[i - 1] > 1) {
			issues.push({
				type: 'chapter-sequence-gap',
				description: `Gap in chapter sequence: Chapter ${chapterNumbers[i - 1]} followed by Chapter ${chapterNumbers[i]}`,
				severity: 'minor'
			});
		}
	}

	// Check for duplicate chapter numbers
	const duplicates = chapterNumbers.filter(
		(num, index) => chapterNumbers.indexOf(num) !== index
	);
	duplicates.forEach((num) => {
		issues.push({
			type: 'duplicate-chapter-number',
			description: `Duplicate chapter number: ${num}`,
			severity: 'critical'
		});
	});

	return issues;
}

async function checkStyleConsistency(chapters, styleGuide, session) {
	const issues = [];

	// Basic style consistency checks
	if (styleGuide) {
		// Check POV consistency
		if (styleGuide.pov) {
			// This would need content analysis to check POV consistency
			// For now, just note if POV is defined but chapters don't specify POV
			const chaptersWithoutPOV = chapters.filter((c) => !c.pov);
			if (chaptersWithoutPOV.length > 0) {
				issues.push({
					type: 'pov-undefined',
					description: `${chaptersWithoutPOV.length} chapters don't specify POV character`,
					severity: 'minor'
				});
			}
		}

		// Check tense consistency
		if (styleGuide.tense) {
			// This would need content analysis for actual implementation
			// Placeholder for tense consistency checking
		}
	}

	return issues;
}

async function autoFixIssues(issues, storyBible, fixMode) {
	const fixedIssues = [];

	for (const issue of issues) {
		let fixed = false;

		// Conservative fixes only for minor issues
		if (fixMode === 'conservative' && issue.severity !== 'minor') {
			continue;
		}

		switch (issue.type) {
			case 'character-unlisted':
				// Add character to chapter's character list
				const chapter = storyBible.chapters?.find(
					(c) => c.id === issue.chapterId
				);
				if (chapter && !chapter.characters?.includes(issue.characterId)) {
					if (!chapter.characters) chapter.characters = [];
					chapter.characters.push(issue.characterId);
					fixed = true;
				}
				break;

			case 'duplicate-chapter-number':
				// This would need more complex logic to renumber chapters
				// Skip for now
				break;

			default:
				// No auto-fix available for this issue type
				break;
		}

		if (fixed) {
			fixedIssues.push({
				...issue,
				fixedAt: new Date().toISOString(),
				fixMode
			});
		}
	}

	return fixedIssues;
}

async function generateConsistencyReport(
	issues,
	suggestions,
	fixedIssues,
	checkParams,
	projectRoot
) {
	const reportContent = `# Story Consistency Report

Generated: ${new Date().toISOString()}

## Check Parameters
- Check Type: ${checkParams.checkType}
- Character ID: ${checkParams.characterId || 'All'}
- Plot Thread ID: ${checkParams.plotThreadId || 'All'}
- Chapter Range: ${checkParams.startChapter} - ${checkParams.endChapter || 'End'}
- Chapters Analyzed: ${checkParams.chaptersAnalyzed}
- Characters Analyzed: ${checkParams.charactersAnalyzed}

## Summary
- Total Issues Found: ${issues.length}
- Issues Auto-Fixed: ${fixedIssues.length}
- Remaining Issues: ${issues.length - fixedIssues.length}

## Issues Found

${
	issues.length === 0
		? 'No issues found! ✅'
		: issues
				.map(
					(issue, index) => `
### ${index + 1}. ${issue.type}
- **Description**: ${issue.description}
- **Severity**: ${issue.severity}
- **Character ID**: ${issue.characterId || 'N/A'}
- **Chapter ID**: ${issue.chapterId || 'N/A'}
- **Plot Thread ID**: ${issue.plotThreadId || 'N/A'}
`
				)
				.join('\n')
}

## Auto-Fixed Issues

${
	fixedIssues.length === 0
		? 'No issues were auto-fixed.'
		: fixedIssues
				.map(
					(issue, index) => `
### ${index + 1}. ${issue.type}
- **Description**: ${issue.description}
- **Fixed At**: ${issue.fixedAt}
- **Fix Mode**: ${issue.fixMode}
`
				)
				.join('\n')
}

## AI Suggestions

${
	suggestions.length === 0
		? 'No AI suggestions available.'
		: suggestions
				.map(
					(suggestion, index) => `
### ${index + 1}. ${suggestion.type}
${suggestion.content}
`
				)
				.join('\n')
}

## Recommendations

1. Review and address remaining issues based on severity
2. Consider running consistency checks regularly during development
3. Use AI suggestions to improve story coherence
4. Update character profiles and plot threads as needed

---
*Generated by Chapter Master AI*
`;

	const reportPath = path.join(
		projectRoot,
		'story-bible',
		`consistency-report-${Date.now()}.md`
	);
	await fs.writeFile(reportPath, reportContent);

	return reportPath;
}
