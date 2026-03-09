// ─── src/screens/log medicine/components/PillIcon.tsx ───────────────────────

import React from "react";
import Svg, { Ellipse, Line } from "react-native-svg";

interface PillIconProps {
  color?: string;
  size?:  number;
}

export const PillIcon: React.FC<PillIconProps> = ({ color = "#00C9A7", size = 30 }) => (
  <Svg width={size} height={size} viewBox="0 0 30 30">
    <Ellipse
      cx={15} cy={15} rx={11} ry={6.5}
      fill={color} fillOpacity={0.12}
      stroke={color} strokeWidth={2}
      rotation={-38} origin="15,15"
    />
    <Line x1={8} y1={11} x2={22} y2={19} stroke={color} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);