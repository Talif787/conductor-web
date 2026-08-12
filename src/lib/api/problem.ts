// RFC7807 problem+json, as returned by the control-api error handlers.
export interface ProblemDetails {
  type?: string;
  title?: string;
  detail?: string;
  status?: number;
  [key: string]: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly problem: ProblemDetails;

  constructor(status: number, problem: ProblemDetails) {
    super(problem.detail || problem.title || `Request failed (${status})`);
    this.name = "ApiError";
    this.status = status;
    this.problem = problem;
  }
}
