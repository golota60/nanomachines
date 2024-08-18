type TransitionName<T extends string> = Capitalize<Lowercase<T>>;

type Transitions<T extends Record<string, unknown>> = keyof T extends string
  ? {
      [K in keyof T as `${TransitionName<K>}To${TransitionName<keyof T>}`]?: {
        /** Any additional action you want to run automatically when nanomachine changes state */
        action?: () => void;
      };
    }
  : never;

interface CreateMachineArgs<T extends Record<string, unknown>> {
  initialState: keyof T;
  possibleStates: T;
  transitions: Transitions<T>;
}

export const createNanomachine = <T extends Record<string, unknown>>(
  createParams: CreateMachineArgs<T>
) => {
  const { initialState, possibleStates } = createParams;
};

const exampleUsage = () => {
  const machine = createNanomachine({
    initialState: "INIT",
    possibleStates: {
      INIT: {},
      STARTED: {},
      LOADING: {},
      FINISH: {},
    },
    transitions: {
      InitToStarted: {
        action: () => {
          // Any additional stuff you want to happen during the transition
        },
      },
    },
  });
};
