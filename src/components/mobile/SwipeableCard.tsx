import { ReactNode, useState, useRef } from 'react';
import { motion, PanInfo, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Pencil, Copy, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeableCardProps {
  children: ReactNode;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  className?: string;
}

const SWIPE_THRESHOLD = 80;

export function SwipeableCard({ 
  children, 
  onEdit, 
  onDuplicate, 
  onDelete,
  className 
}: SwipeableCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Transform for action reveals
  const leftActionOpacity = useTransform(x, [0, SWIPE_THRESHOLD], [0, 1]);
  const rightActionOpacity = useTransform(x, [-SWIPE_THRESHOLD, 0], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const { offset, velocity } = info;
    
    if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
      // Swipe right - Duplicate
      onDuplicate?.();
    } else if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
      // Swipe left - Edit
      onEdit?.();
    }
    
    // Reset position
    x.set(0);
  };

  const handleLongPress = () => {
    if (onDelete) {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl" ref={containerRef}>
      {/* Left action (Duplicate) */}
      <motion.div 
        className="swipe-action-duplicate absolute inset-y-0 left-0 w-20 flex items-center justify-center"
        style={{ opacity: leftActionOpacity }}
      >
        <Copy className="h-6 w-6" />
      </motion.div>

      {/* Right action (Edit) */}
      <motion.div 
        className="swipe-action-edit absolute inset-y-0 right-0 w-20 flex items-center justify-center"
        style={{ opacity: rightActionOpacity }}
      >
        <Pencil className="h-6 w-6" />
      </motion.div>

      {/* Main card */}
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -100, right: 100 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        onTap={() => {}}
        whileTap={{ scale: 0.98 }}
        className={cn('card-mobile p-4 relative z-10 cursor-grab active:cursor-grabbing', className)}
      >
        <div 
          className="touch-none"
          onContextMenu={(e) => {
            e.preventDefault();
            handleLongPress();
          }}
        >
          {children}
        </div>
      </motion.div>

      {/* Delete confirmation overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 bg-destructive/95 rounded-xl flex items-center justify-center gap-4 p-4"
          >
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="flex-1 py-3 bg-white/20 rounded-lg text-white font-medium tap-target"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onDelete?.();
                setShowDeleteConfirm(false);
              }}
              className="flex-1 py-3 bg-white rounded-lg text-destructive font-semibold tap-target flex items-center justify-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
