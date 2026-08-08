export type Barrier =
  | 'MULTI_VERB'
  | 'DECISION_LEFT'
  | 'TOO_LONG'
  | 'ABSTRACT'
  | 'VAGUE_QUANTITY'
  | 'CONDITIONAL'
  | 'UNBOUNDED';

export interface AtomicityResult {
  readonly atomic: boolean;
  readonly barriers: readonly Barrier[];
  /** 0..1, distance to atomic. Never shown to the user as a number. */
  readonly score: number;
  /** One sentence per barrier, in barrier order. Never blames the user. */
  readonly explanations: readonly string[];
  /** Concrete instruction for the decomposer. Empty when atomic. */
  readonly hints: readonly string[];
}

export type StepSource = 'rules' | 'model' | 'model-regated';

/** How a step can be completed. Derived, not authored. */
export type StepMode =
  | 'type'      // the step asks for typed output; we host the surface
  | 'physical'; // the step happens off screen; the user tells us

export interface StepTiming {
  /** ms from the step appearing to the first keystroke. Null if never started. */
  readonly msToFirstInput: number | null;
  /** ms from appearing to being marked done. */
  readonly msToDone: number | null;
}

export interface Step {
  readonly id: string;
  readonly text: string;
  readonly seconds: number;
  readonly depth: number;
  readonly parentId: string | null;
  readonly check: AtomicityResult;
  readonly source: StepSource;
  /** When source is 'model-regated', what the model originally said. */
  readonly rejectedProposal?: string;
  /** Which barrier killed the rejected proposal. */
  readonly rejectedFor?: Barrier;
}

export interface Session {
  readonly id: string;
  readonly assignment: string;
  readonly createdAt: string;
  readonly steps: readonly Step[];
  readonly cursor: string;
  readonly done: readonly string[];
  /** stepId -> timing. Local only, never transmitted. */
  readonly timings: Readonly<Record<string, StepTiming>>;
  /** stepId -> current typed text for hosted typing surfaces. Local only. */
  readonly typed: Readonly<Record<string, string>>;
}

/** Injected so core stays pure and tests are deterministic. */
export interface Ids {
  next(): string;
}

export const makeIds = (prefix = 's'): Ids => {
  let n = 0;
  return { next: () => `${prefix}_${String(++n).padStart(4, '0')}` };
};
