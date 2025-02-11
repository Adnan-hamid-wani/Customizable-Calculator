import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CalculatorComponent } from '../store/useCalculatorStore';

interface Props {
  component: CalculatorComponent;
  onRemove?: (id: string) => void;
  onClick?: () => void;
}

export const DraggableComponent: React.FC<Props> = ({ component, onRemove, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: component.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className={`
          glass-button
          p-4 rounded-xl
          font-semibold text-lg
          w-full min-h-[60px]
          flex items-center justify-center
          ${isDragging ? 'ring-2 ring-gray-900 dark:ring-white ring-opacity-50' : ''}
        `}
        onMouseUp={(e) => {
          if (!isDragging && onClick) {
            onClick();
          }
        }}
      >
        {component.value}
      </button>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(component.id);
          }}
          className="absolute -top-2 -right-2 
                   glass-button
                   rounded-full w-6 h-6 
                   flex items-center justify-center
                   opacity-0 group-hover:opacity-100 
                   transition-all duration-200
                   hover:bg-red-500/50
                   z-10"
          aria-label="Remove component"
        >
          ×
        </button>
      )}
    </div>
  );
};
