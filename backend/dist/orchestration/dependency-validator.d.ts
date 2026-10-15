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
export declare function validateDependencyGraph(nodes: TaskNode[]): DependencyValidationResult;
//# sourceMappingURL=dependency-validator.d.ts.map