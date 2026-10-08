/** Kinds of view model property a {@linkcode RivePanel} can write or observe. */
export type RivePropertyKind = 'number' | 'boolean' | 'enum' | 'string' | 'trigger';

/**
 * The names a {@linkcode RivePanel} binds to inside one `.riv`: artboard, state
 * machine, view model and each property with its kind. `@acme/assets/rive`
 * exports one per authored file (`riveContract`).
 */
export interface RivePanelContract {
  readonly artboard: string;
  readonly stateMachine: string;
  readonly viewModel: string;
  readonly properties: Readonly<Record<string, RivePropertyKind>>;
  /** Allowed keys per enum property. */
  readonly enums: Readonly<Record<string, readonly string[]>>;
}

type PropsOfKind<C extends RivePanelContract, K extends RivePropertyKind> = {
  [P in keyof C['properties']]: C['properties'][P] extends K ? P : never;
}[keyof C['properties']] &
  string;

type EnumKeys<C extends RivePanelContract, P> = P extends keyof C['enums'] ? C['enums'][P][number] : string;

/**
 * Values the host writes into the view model, one per non-trigger property.
 * Enum properties take one of the contract's keys.
 */
export type RivePanelValues<C extends RivePanelContract> = {
  readonly [P in PropsOfKind<C, 'number'>]: number;
} & {
  readonly [P in PropsOfKind<C, 'boolean'>]: boolean;
} & {
  readonly [P in PropsOfKind<C, 'string'>]: string;
} & {
  readonly [P in PropsOfKind<C, 'enum'>]: EnumKeys<C, P>;
};

/** Callbacks for trigger properties the artwork fires, keyed by property name. */
export type RivePanelTriggers<C extends RivePanelContract> = {
  readonly [P in PropsOfKind<C, 'trigger'>]?: () => void;
};

/**
 * A `.riv` the runtime can load: a Metro asset number from `require()` on
 * native, a same-origin URL on web. `@acme/assets/rive` exports both as
 * `riveFiles`.
 */
export type RiveFileRef = number | string;

export interface RivePanelProps<C extends RivePanelContract> {
  /** The file to load. Changing it reloads the file; changing anything else does not. */
  source: RiveFileRef;
  contract: C;
  /** Written into the view model on load and again whenever one changes. */
  values: RivePanelValues<C>;
  /** Called each time the artwork fires the matching trigger. */
  triggers?: RivePanelTriggers<C>;
  /** What the artwork shows, for assistive tech. Rive content has no semantics of its own. */
  label: string;
  /** Width over height of the artboard, so the pane keeps its shape at every width. */
  aspectRatio: number;
  className?: string;
}

/** Load and binding state of a {@linkcode RivePanel}. */
export type RivePanelStatus = { readonly kind: 'loading' } | { readonly kind: 'ready' } | { readonly kind: 'error'; readonly message: string };
