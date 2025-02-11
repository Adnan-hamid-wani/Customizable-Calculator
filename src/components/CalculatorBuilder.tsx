import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableComponent } from './DraggableComponent';
import { useCalculatorStore, CalculatorComponent } from '../store/useCalculatorStore';
import { v4 as uuidv4 } from 'uuid';

const AVAILABLE_COMPONENTS: Omit<CalculatorComponent, 'id'>[] = [
  ...[7, 8, 9, 4, 5, 6, 1, 2, 3, 0].map(num => ({
    type: 'number' as const,
    value: num.toString(),
  })),
  { type: 'operator', value: '+' },
  { type: 'operator', value: '-' },
  { type: 'operator', value: '*' },
  { type: 'operator', value: '/' },
  { type: 'operator', value: '=' },
  { type: 'operator', value: 'C' },
];

export const CalculatorBuilder: React.FC = () => {
  const {
    components,
    addComponent,
    removeComponent,
    updateComponents,
    displayValue,
    setDisplayValue,
    undo,
    redo,
  } = useCalculatorStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = components.findIndex((item) => item.id === active.id);
      const newIndex = components.findIndex((item) => item.id === over.id);

      updateComponents(arrayMove(components, oldIndex, newIndex));
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="flex flex-row gap-8 max-w-6xl w-full">
        <div className="glass-morphism rounded-2xl p-8 w-full">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Calculator</h2>
          
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-3">
                <button
                  onClick={undo}
                  className="glass-button p-3 rounded-lg transition-all"
                  title="Undo"
                >
                  ↩️
                </button>
                <button
                  onClick={redo}
                  className="glass-button p-3 rounded-lg transition-all"
                  title="Redo"
                >
                  ↪️
                </button>
              </div>
            </div>
            <div className="calculator-display rounded-xl p-4 mb-4">
              <input
                type="text"
                readOnly
                value={displayValue}
                className="w-full text-right text-2xl font-mono bg-transparent outline-none"
              />
            </div>
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={components.map(c => c.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-4 gap-3">
                {components.map((component) => (
                  <DraggableComponent
                    key={component.id}
                    component={component}
                    onRemove={removeComponent}
                    onClick={() => setDisplayValue(component.value)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {components.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Drag and drop components here to build your calculator
            </div>
          )}
        </div>

        <div className="glass-morphism rounded-2xl p-8 w-full">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">Available Components</h2>
          <div className="grid grid-cols-4 gap-3">
            {AVAILABLE_COMPONENTS.map((component) => (
              <button
                key={component.value}
                onClick={() => addComponent({ ...component, id: uuidv4() })}
                className="glass-button p-4 rounded-xl text-lg transition-all"
              >
                {component.value}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
