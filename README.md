### nanomachines

the smallest state machine you could ask for

### why?

sometimes, you need a simple, small state machine to control the flow of the logic. adding a big dependency might seem overkill, but you still want to benefit from operating on a state machine.

this library is meant to be small and enable that, without making it a technical decision whether to add a state machine library or not. if you need it add it, and then easily remove it when/if you decide you don't want it.

### usage

```ts
  enum PossibleStates {
    INIT = "INIT",
    STARTED = "STARTED",
    LOADING = "LOADING",
    FINISH = "FINISH",
  }

  const machine = createNanomachine({
    // Set the initial state 
    initialState: PossibleStates.INIT,
    // Define all the possible states
    possibleStates: PossibleStates,
    /* 
    Define the possible transitions.
    If a transition from state to state is not defined, attempting to change from one to the other, will throw an error

    Defining a transition is simple:
    Add a key to `transitions` that corresponds to one of the CamelCased possible states + "TO" + another CamelCased possible state = `${stateOne}TO${stateTwo}`
    Simply the existence of that key, means that the transition is possible.
    
    All of the above has great Typescript support, so once you start typing the transition, the LSP can take the wheel and autocomplete - also, you don't need to worry about string mismatches, as Typescript also takes care of that.

    */ 
    transitions: {
      InitTOStarted: {
        action: (context) => {
          // Any additional stuff you want to happen during the transition.
          // You can add some additional logic if you want the transition to fail under certain conditions - simply throw an `Error` here if you want to fail a transition
        },
      },
      // Or, if you don't wish to execute any additional actions and just allow the transition, make it `true`
      StartedTOLoading: true,
    },
  });


  // Get the state
  const currentState = machine.getState();
  // Attempt to transition to a state.
  machine.transition(PossibleStates.FINISH);
  // Attempt to transition to a state, without throwing an error on fail(returns it instead).
  machine.transitionSafe(PossibleStates.FINISH);
```