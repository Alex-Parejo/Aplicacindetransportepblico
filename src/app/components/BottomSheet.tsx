import { ReactNode, useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { useDrag } from "@use-gesture/react";

interface BottomSheetProps {
  children: ReactNode;
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
        if (my < -100 || (vy > 0.5 && dy < 0)) {
          setIsExpanded(true);
          api.start({ y: 0, immediate: false });
        } else if (my > 100 || (vy > 0.5 && dy > 0)) {
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
      bounds: { top: -400, bottom: 0 },
      rubberband: true,
    }
  );

  return (
    <animated.div
      {...bind()}
      style={{
        y,
        touchAction: 'none',
        height: isExpanded ? '85vh' : '35vh',
        transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        paddingBottom: isExpanded ? '0' : '80px',
      }}
      className="fixed bottom-0 left-0 right-0 z-[998] bg-card rounded-t-3xl shadow-navbar border-t border-border overflow-hidden"
    >
      {/* Handle bar */}
      <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing">
        <div
          className="h-1 rounded-full bg-text-faint"
          style={{ width: '32px' }}
        />
      </div>

      {/* Content */}
      <div
        className="h-full overflow-y-auto px-5"
        style={{
          paddingBottom: isExpanded ? '24px' : '0',
        }}
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
