import test from 'node:test';
import assert from 'node:assert/strict';
import { validateDependencyGraph } from '../orchestration/dependency-validator.js';
import { toolRegistry } from '../tools/registry.js';
import { CreateWorkflowSchema, OrchestratorPlanSchema } from '@flowpilot/shared';

test('Dependency Validator: Valid linear DAG passes', () => {
  const nodes = [
    { key: 'task_1', dependencies: [] },
    { key: 'task_2', dependencies: ['task_1'] },
    { key: 'task_3', dependencies: ['task_2'] }
  ];

  const result = validateDependencyGraph(nodes);
  assert.equal(result.valid, true);
  assert.deepEqual(result.sortedOrder, ['task_1', 'task_2', 'task_3']);
});

test('Dependency Validator: Circular dependency is detected and rejected', () => {
  const cyclicNodes = [
    { key: 'task_a', dependencies: ['task_c'] },
    { key: 'task_b', dependencies: ['task_a'] },
    { key: 'task_c', dependencies: ['task_b'] }
  ];

  const result = validateDependencyGraph(cyclicNodes);
  assert.equal(result.valid, false);
  assert.equal(result.hasCycles, true);
});

test('Dependency Validator: Nonexistent dependency is flagged', () => {
  const invalidNodes = [
    { key: 'task_1', dependencies: ['ghost_task'] }
  ];

  const result = validateDependencyGraph(invalidNodes);
  assert.equal(result.valid, false);
  assert.match(result.error || '', /nonexistent/);
});

test('Tool Registry: Unregistered or unauthorized tool is denied', async () => {
  const result = await toolRegistry.executeTool(
    'unauthorized_tool' as any,
    {},
    { workspaceId: 'w0000000-0000-0000-0000-000000000001', workflowId: 'wf_test' }
  );
  assert.equal(result.success, false);
  assert.match(result.error || '', /not permitted or registered/);
});

test('Tool Registry: read_inventory returns data', async () => {
  const result = await toolRegistry.executeTool(
    'read_inventory',
    {},
    { workspaceId: 'w0000000-0000-0000-0000-000000000001', workflowId: 'wf_test' }
  );
  assert.equal(result.success, true);
  assert.ok(result.data.items.length > 0);
});

test('Zod Schemas: CreateWorkflowSchema validates required fields', () => {
  const valid = CreateWorkflowSchema.safeParse({
    title: 'Valid Workflow Title',
    objective: 'This objective is sufficiently descriptive to meet character minimums.',
    category: 'order_management',
    priority: 'high'
  });
  assert.equal(valid.success, true);

  const invalid = CreateWorkflowSchema.safeParse({
    title: 'No', // Too short
    objective: 'Too short'
  });
  assert.equal(invalid.success, false);
});
