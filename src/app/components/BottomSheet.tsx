import { ReactNode, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

interface BottomSheetProps {
  children?: ReactNode;
  collapsedContent?: ReactNode;
  expandedContent?: ReactNode;
}

export function BottomSheet({ children, collapsedContent, expandedContent }: BottomSheetProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const [{ y }, api] = useSpring(() => ({
    y: 0,
  }));

  const bind = useDrag(
    ({ last, movement: [, my], velocity: [, vy], direction: [, dy] }) => {
      if (last) {
        // Snap to expanded or collapsed based on drag direction and velocity
        if (my < -80 || (vy > 0.4 && dy < 0)) {
          setIsExpanded(true);
          api.start({ y: 0, immediate: false });
        } else if (my > 80 || (vy > 0.4 && dy > 0)) {
          setIsExpanded(false);
          api.start({ y: 0, immediate: false });
        } else {
          api.start({ y: 0, immediate: false });
        }
      } else {
        api.start({ y: my, immediate: true });
      }
    },
    {
      from: () => [0, y.get()],
      filterTaps: true,
      bounds: { top: -450, bottom: 0 },
      rubberband: true,
    }
  );

  return (
    <animated.div
      {...bind()}
      style={{
        y,
        touchAction: 'none',
        height: isExpanded ? '80%' : '38%',
        transition: 'height 350ms cubic-bezier(0.23, 1, 0.32, 1)',
        paddingBottom: isExpanded ? '32px' : '96px', // Extra spacing for floating tab bar
      }}
      className="absolute bottom-0 left-0 right-0 z-[998] rounded-t-[28px] glass-panel select-none overflow-hidden"
    >
      {/* Handle bar drag indicator */}
      <div className="flex justify-center pt-3 pb-3 cursor-grab active:cursor-grabbing border-b border-white/[0.02]">
        <div
          className="h-1 rounded-full bg-white/20 transition-colors group-hover:bg-white/40"
          style={{ width: '40px' }}
        />
      </div>

      {/* Content area */}
      <div
        className="h-full overflow-y-auto px-6 py-4 scrollbar-hide"
      >
        {isExpanded ? (
          expandedContent || children
        ) : (
          collapsedContent || children
        )}
      </div>
    </animated.div>
  );
}
