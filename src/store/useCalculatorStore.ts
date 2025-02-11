import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CalculatorComponent = {
  id: string;
  type: 'number' | 'operator';
  value: string;
};

interface CalculatorState {
  components: CalculatorComponent[];
  displayValue: string;
  currentOperation: string | null;
  previousValue: string | null;
  waitingForNewNumber: boolean;
  calculationHistory: {
    displayValue: string;
    previousValue: string | null;
    currentOperation: string | null;
    waitingForNewNumber: boolean;
  }[];
  currentHistoryIndex: number;
  addComponent: (component: CalculatorComponent) => void;
  removeComponent: (id: string) => void;
  updateComponents: (components: CalculatorComponent[]) => void;
  setDisplayValue: (value: string) => void;
  calculate: () => string;
  clear: () => void;
  undo: () => void;
  redo: () => void;
}

export const useCalculatorStore = create<CalculatorState>()(
  persist(
    (set, get) => ({
      components: [],
      displayValue: '0',
      currentOperation: null,
      previousValue: null,
      waitingForNewNumber: false,
      calculationHistory: [],
      currentHistoryIndex: -1,

      addComponent: (component) =>
        set((state) => ({
          ...state,
          components: [...state.components, component],
        })),

      removeComponent: (id) =>
        set((state) => ({
          ...state,
          components: state.components.filter((c) => c.id !== id),
        })),

      updateComponents: (components) =>
        set((state) => ({
          ...state,
          components,
        })),

      setDisplayValue: (value) =>
        set((state) => {
          // Save current state before any changes
          const saveHistory = (newState: Partial<CalculatorState>) => {
            const historyEntry = {
              displayValue: state.displayValue,
              previousValue: state.previousValue,
              currentOperation: state.currentOperation,
              waitingForNewNumber: state.waitingForNewNumber,
            };
            
            return {
              ...newState,
              calculationHistory: [...state.calculationHistory.slice(0, state.currentHistoryIndex + 1), historyEntry],
              currentHistoryIndex: state.currentHistoryIndex + 1,
            };
          };

          // Handle Clear
          if (value === 'C') {
            return saveHistory({
              ...state,
              displayValue: '0',
              currentOperation: null,
              previousValue: null,
              waitingForNewNumber: false,
            });
          }

          // Handle equals
          if (value === '=') {
            if (!state.previousValue || !state.currentOperation) {
              return state;
            }
            const result = get().calculate();
            return saveHistory({
              ...state,
              displayValue: result,
              previousValue: null,
              currentOperation: null,
              waitingForNewNumber: true,
            });
          }

          // Handle operators (+, -, *, /)
          if (['+', '-', '*', '/'].includes(value)) {
            // If we already have an operation pending, calculate it first
            if (state.currentOperation && state.previousValue && !state.waitingForNewNumber) {
              const result = get().calculate();
              return saveHistory({
                ...state,
                displayValue: `${result} ${value}`,
                previousValue: result,
                currentOperation: value,
                waitingForNewNumber: true,
              });
            }

            // Start a new operation
            return saveHistory({
              ...state,
              displayValue: `${state.displayValue} ${value}`,
              previousValue: state.displayValue,
              currentOperation: value,
              waitingForNewNumber: true,
            });
          }

          // Handle numbers
          if (state.waitingForNewNumber) {
            return saveHistory({
              ...state,
              displayValue: value,
              waitingForNewNumber: false,
            });
          }

          // Append number to current display
          if (state.displayValue === '0') {
            return saveHistory({
              ...state,
              displayValue: value,
            });
          }

          return saveHistory({
            ...state,
            displayValue: state.displayValue + value,
          });
        }),

      calculate: () => {
        const state = get();
        if (!state.previousValue || !state.currentOperation) {
          return state.displayValue;
        }

        const prev = parseFloat(state.previousValue);
        const current = parseFloat(state.displayValue.split(' ')[0]); // Get the number before the operator
        let result = 0;

        switch (state.currentOperation) {
          case '+':
            result = prev + current;
            break;
          case '-':
            result = prev - current;
            break;
          case '*':
            result = prev * current;
            break;
          case '/':
            if (current === 0) {
              return 'Error';
            }
            result = prev / current;
            break;
          default:
            return state.displayValue;
        }

        return Number.isInteger(result) ? result.toString() : result.toFixed(2);
      },

      clear: () =>
        set((state) => ({
          ...state,
          displayValue: '0',
          currentOperation: null,
          previousValue: null,
          waitingForNewNumber: false,
        })),

      undo: () => {
        const state = get();
        if (state.currentHistoryIndex > -1) {
          const previousState = state.calculationHistory[state.currentHistoryIndex];
          set((state) => ({
            ...state,
            displayValue: previousState.displayValue,
            previousValue: previousState.previousValue,
            currentOperation: previousState.currentOperation,
            waitingForNewNumber: previousState.waitingForNewNumber,
            currentHistoryIndex: state.currentHistoryIndex - 1,
          }));
        }
      },

      redo: () => {
        const state = get();
        if (state.currentHistoryIndex < state.calculationHistory.length - 1) {
          const nextState = state.calculationHistory[state.currentHistoryIndex + 1];
          set((state) => ({
            ...state,
            displayValue: nextState.displayValue,
            previousValue: nextState.previousValue,
            currentOperation: nextState.currentOperation,
            waitingForNewNumber: nextState.waitingForNewNumber,
            currentHistoryIndex: state.currentHistoryIndex + 1,
          }));
        }
      },
    }),
    {
      name: 'calculator-storage',
    }
  )
);
