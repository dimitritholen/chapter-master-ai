/**
 * tools/index.js
 * Export all Chapter Master story development tools for MCP server
 */

// Legacy task tools (for backward compatibility during transition)
import { registerListTasksTool } from './get-tasks.js';
import { registerSetTaskStatusTool } from './set-task-status.js';
import { registerParsePRDTool } from './parse-prd.js';
import { registerUpdateTool } from './update.js';
import { registerUpdateTaskTool } from './update-task.js';
import { registerUpdateSubtaskTool } from './update-subtask.js';
import { registerGenerateTool } from './generate.js';
import { registerShowTaskTool } from './get-task.js';
import { registerNextTaskTool } from './next-task.js';
import { registerExpandTaskTool } from './expand-task.js';
import { registerAddTaskTool } from './add-task.js';
import { registerAddSubtaskTool } from './add-subtask.js';
import { registerRemoveSubtaskTool } from './remove-subtask.js';
import { registerAnalyzeProjectComplexityTool } from './analyze.js';
import { registerClearSubtasksTool } from './clear-subtasks.js';
import { registerExpandAllTool } from './expand-all.js';
import { registerRemoveDependencyTool } from './remove-dependency.js';
import { registerValidateDependenciesTool } from './validate-dependencies.js';
import { registerFixDependenciesTool } from './fix-dependencies.js';
import { registerComplexityReportTool } from './complexity-report.js';
import { registerAddDependencyTool } from './add-dependency.js';
import { registerRemoveTaskTool } from './remove-task.js';
import { registerInitializeProjectTool } from './initialize-project.js';
import { registerModelsTool } from './models.js';
import { registerMoveTaskTool } from './move-task.js';

// New story-focused tools
import parsePremiseTool from './parse-premise.js';
import nextChapterTool from './next-chapter.js';
import createCharacterTool from './create-character.js';
import generateChapterTool from './generate-chapter.js';
import checkConsistencyTool from './check-consistency.js';
import getStoryStatusTool from './get-story-status.js';

import logger from '../logger.js';

/**
 * Register all Chapter Master story tools with the MCP server
 * @param {Object} server - FastMCP server instance
 */
export function registerChapterMasterTools(server) {
	try {
		// Register story development tools in logical workflow order

		// Group 1: Story Initialization & Setup
		registerInitializeProjectTool(server);
		registerModelsTool(server);
		server.addTool(parsePremiseTool);

		// Group 2: Story Status & Overview
		server.addTool(getStoryStatusTool);
		server.addTool(nextChapterTool);
		server.addTool(checkConsistencyTool);

		// Group 3: Character Development
		server.addTool(createCharacterTool);

		// Group 4: Chapter & Scene Generation
		server.addTool(generateChapterTool);

		// Group 5: Legacy task tools (for backward compatibility)
		registerListTasksTool(server);
		registerShowTaskTool(server);
		registerNextTaskTool(server);
		registerSetTaskStatusTool(server);
		registerParsePRDTool(server);
		registerUpdateTool(server);
		registerUpdateTaskTool(server);
		registerUpdateSubtaskTool(server);
		registerGenerateTool(server);
		registerAddTaskTool(server);
		registerAddSubtaskTool(server);
		registerRemoveSubtaskTool(server);
		registerClearSubtasksTool(server);
		registerMoveTaskTool(server);
		registerAnalyzeProjectComplexityTool(server);
		registerExpandTaskTool(server);
		registerExpandAllTool(server);
		registerComplexityReportTool(server);
		registerAddDependencyTool(server);
		registerRemoveDependencyTool(server);
		registerValidateDependenciesTool(server);
		registerFixDependenciesTool(server);
		registerRemoveTaskTool(server);

		logger.info('All Chapter Master tools registered successfully');
	} catch (error) {
		logger.error(`Error registering Chapter Master tools: ${error.message}`);
		throw error;
	}
}

// Legacy export for backward compatibility
export function registerTaskMasterTools(server) {
	return registerChapterMasterTools(server);
}

export default {
	registerTaskMasterTools
};
