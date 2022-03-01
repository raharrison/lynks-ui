export interface TaskDefinition {
  id: string,
  description: string,
  params: TaskParameter[]
}

export interface TaskParameter {
  name: string,
  type: TaskParameterType,
  description: string,
  value: string,
  options: string[]
}

export enum TaskParameterType {
  TEXT = "text",
  NUMBER = "number",
  ENUM = "enum",
  STATIC = "static",
  MULTI = "multi"
}
