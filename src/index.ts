type TransitionName<T extends string> = Capitalize<Lowercase<T>>;

type Transitions<T extends Record<string, unknown>> = keyof T extends string
  ? {
      [K in keyof T as `${TransitionName<K>}To${TransitionName<keyof T>}`]?:
        | {
            /** Any additional action you want to run automatically when nanomachine changes state */
            action?: () => void;
          }
        | true;
    }
  : never;

interface CreateMachineArgs<T extends Record<string, unknown>> {
  initialState: keyof T;
  possibleStates: T;
  /**
   * Allowed transitions list. The existence of the named transition means it's valid.
   * E.g. If transition `OneToTwo` doesn't exist, then trying to make that transition will error
   */
  transitions: Transitions<T>;
}

export const createNanomachine = <T extends Record<string, unknown>>(
  createParams: CreateMachineArgs<T>
) => {
  const { initialState, possibleStates } = createParams;
};

const exampleUsage = () => {
  enum PossibleStates {
    INIT = "INIT",
    STARTED = "STARTED",
    LOADING = "LOADING",
    FINISH = "FINISH",
  }

  const machine = createNanomachine({
    initialState: PossibleStates.INIT,
    possibleStates: {
      [PossibleStates.INIT]: {
        // Store any additional context to be associated with the state
      },
      [PossibleStates.STARTED]: {},
      [PossibleStates.LOADING]: {},
      [PossibleStates.FINISH]: {},
    },
    transitions: {
      InitToStarted: {
        action: () => {
          // Any additional stuff you want to happen during the transition
        },
      },
      StartedToLoading: true,
    },
  });
};
