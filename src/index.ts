type TransitionName<T extends string> = Capitalize<Lowercase<T>>;

type Transitions<T extends Record<string, unknown>> = keyof T extends string
  ? {
      [K in keyof T as `${TransitionName<K>}To${TransitionName<keyof T>}`]?:
        | {
            /**
             * Any additional action you want to run automatically when nanomachine changes state.
             * You can influence the transiton via this function.
             * If your transition should only be valid under a condition, you can `throw` here to stop the transition.
             * Then, your exact error will be re-thrown when you call `transition`.
             *
             * @param {unknown} context - The context to pass when executing `action` function during the transition.
             */
            action?: (context: unknown) => void;
          }
        | true;
    }
  : never;

interface CreateMachineArgs<T extends Record<S, unknown>, S extends string> {
  initialState: S;
  possibleStates: T;
  /**
   * Allowed transitions list. The existence of the named transition means it's valid.
   * E.g. If transition `OneToTwo` doesn't exist, then trying to make that transition will error
   */
  transitions: Transitions<T>;
}

export const createNanomachine = <
  T extends Record<S, unknown>,
  S extends string
>(
  createParams: CreateMachineArgs<T, S>
) => {
  const { initialState, possibleStates, transitions } = createParams;
  let state = initialState;

  const possibleStatesValues = Object.values(possibleStates);
  const possibleStatesNames = Object.keys(possibleStates);
  const transitionBase = (targetState: S) => {
    if (!targetState)
      throw new Error(
        `\`targetState\` was not provided while attempting to transition from state "${state}".`
      );
    if (possibleStatesNames.includes(targetState)) {
      throw new Error(
        `\`targetState\` is not listed as a possible state to transition from state "${state}".`
      );
    }

    state = targetState;
  };

  return {
    /** Attempt to transition to a target state, throws on fail */
    transition: transitionBase,
    /** A non-throw version of `transition`. Returns `false` on fail. */
    transitionSafe: (targetState: S) => {
      let transitionResult;
      try {
        transitionResult = transitionBase(targetState);
      } catch (err) {
        transitionResult = err;
      }

      return transitionResult;
    },
  };
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
        action: (context: unknown) => {
          // Any additional stuff you want to happen during the transition. Can influence the result!
        },
      },
      StartedToLoading: true,
    },
  });
};
