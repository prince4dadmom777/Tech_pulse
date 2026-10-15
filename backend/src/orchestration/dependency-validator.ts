export interface TaskNode {
  key: string;
  dependencies: string[];
}

export interface DependencyValidationResult {
  valid: boolean;
  sortedOrder?: string[];
  error?: string;
  hasCycles?: boolean;
}

export function validateDependencyGraph(nodes: TaskNode[]): DependencyValidationResult {
  const taskKeys = new Set(nodes.map(n => n.key));
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.key, 0);
    adjList.set(node.key, []);
  }

  // Check that all dependencies reference existing tasks and build adjacency list
  for (const node of nodes) {
    for (const dep of node.dependencies) {
      if (!taskKeys.has(dep)) {
        return {
          valid: false,
          error: `Task "${node.key}" references nonexistent dependency "${dep}"`
        };
      }
      if (dep === node.key) {
        return {
          valid: false,
          hasCycles: true,
          error: `Task "${node.key}" cannot depend on itself.`
        };
      }
      adjList.get(dep)!.push(node.key);
      inDegree.set(node.key, (inDegree.get(node.key) || 0) + 1);
    }
  }

  // Kahn's Algorithm for Topological Sort & Cycle Detection
  const queue: string[] = [];
  for (const [key, degree] of inDegree.entries()) {
    if (degree === 0) {
      queue.push(key);
    }
  }

  const sortedOrder: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift()!;
    sortedOrder.push(current);

    const neighbors = adjList.get(current) || [];
    for (const neighbor of neighbors) {
      const newDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) {
        queue.push(neighbor);
      }
    }
  }

  if (sortedOrder.length !== nodes.length) {
    return {
      valid: false,
      hasCycles: true,
      error: 'Circular dependency detected in workflow task execution graph.'
    };
  }

  return {
    valid: true,
    sortedOrder
  };
}
