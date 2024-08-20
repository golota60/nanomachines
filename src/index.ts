type ActionType = <T = unknown>(context: T) => void;

type TransitionName<T extends string> = Capitalize<Lowercase<T>>;

type Transitions<T extends Record<string, unknown>> = keyof T extends string
  ? {
      [K in keyof T as `${TransitionName<K>}TO${TransitionName<keyof T>}`]?:
        | {
            /**
             * Any additional action you want to run automatically when nanomachine changes state.
             * You can influence the transiton via this function.
             * If your transition should only be valid under a condition, you can `throw` here to stop the transition.
             * Then, your exact error will be re-thrown when you call `transition`.
             *
             * @param {unknown} context - The context to pass when executing `action` function during the transition. If not provided when executing `transition`, then default to `undefined`.
             */
            action?: ActionType;
          }
        | true;
    }
  : never;

// Get the key of Record as string
type Keyof<T extends Record<string, unknown>> = Extract<keyof T, string>;

interface CreateMachineArgs<T extends Record<string, unknown>> {
  initialState: Keyof<T>;
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
  const { initialState, possibleStates, transitions } = createParams;
  let state = initialState;

  const possibleStatesNames = Object.keys(possibleStates);

  const transitionsEntries = Object.entries(transitions);

  const transitionBase = (targetState: Keyof<T>, extraContext?: unknown) => {
    if (!targetState || typeof targetState !== "string")
      throw new Error(
        `\`targetState\` was not provided while attempting to transition. State at the time of this error: "${state}".`
      );
    if (!possibleStatesNames.includes(targetState)) {
      throw new Error(
        `\`targetState\` is not listed as a part of \`possibleStates\`. State at the time of this error: "${state}".`
      );
    }
    const validTargetTransitions = transitionsEntries.reduce<Keyof<T>[]>(
      (acc, [transitionName, actions]) => {
        // We should be safe to split by `TO` even if the state has `TO` in it's name, cause transitions are CamelCasedTOCamelCased.
        const [fromTransition, toTransition] = transitionName.split("TO");

        if (fromTransition !== state) {
          // Filter all the transitions not from the current one
          return acc;
        }

        return [...acc, toTransition as Keyof<T>];
      },
      []
    );

    if (!validTargetTransitions.includes(targetState)) {
      throw new Error(
        `Attempted invalid state change. \`targetState\` "${targetState}" is not listed as a possible state to transition from state "${state}". Add \`${state}TO${targetState}\` in \`transitions\` to if you want to make this transition valid.`
      );
    }

    const transitionKey = `${state}TO${targetState}`;
    // Execute any additional actions
    const transitionObject = transitions[transitionKey] as {
      action?: ActionType;
    };

    if (transitionObject.action) {
      transitionObject.action(extraContext);
    }

    state = targetState;
  };

  return {
    /** Attempt to transition to a target state, throws on fail */
    transition: transitionBase,
    /** A non-throw version of `transition`. Returns `false` on fail. */
    transitionSafe: (targetState: Keyof<T>, extraContext?: unknown) => {
      let transitionResult;
      try {
        transitionResult = transitionBase(targetState, extraContext);
      } catch (err) {
        transitionResult = err;
      }

      return transitionResult;
    },
    getState: () => state,
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
    possibleStates: PossibleStates,
    transitions: {
      InitTOStarted: {
        action: (context) => {
          // Any additional stuff you want to happen during the transition. Can influence the success of the transition!
        },
      },
      StartedTOLoading: true,
    },
  });

  // Get the state
  const currentState = machine.getState();
  // Attempt to transition to a state.
  machine.transition(PossibleStates.FINISH);
  // Attempt to transition to a state, without throwing an error on fail(returns it instead).
  machine.transitionSafe(PossibleStates.FINISH);
};
