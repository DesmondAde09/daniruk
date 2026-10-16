import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';

import { colors } from '@/theme/tokens';

export const iconNames = [
  'gift',
  'bolt',
  'phone',
  'wifi',
  'plane',
  'home',
  'grid',
  'receipt',
  'user',
  'bell',
  'eye',
  'eye-off',
  'arrow-right',
  'arrow-left',
  'arrow-down-left',
  'arrow-up-right',
  'shield',
  'shield-check',
  'lock',
  'copy',
  'plus',
  'search',
  'close',
  'check',
  'chevron-right',
  'chevron-left',
] as const;

export type IconName = (typeof iconNames)[number];

export interface IconProps {
  name: IconName;
  /** Width and height in pt. Defaults to 24. */
  size?: number;
  color?: string;
  /** Bell only: shows the red unread dot at the top-right of the bell. */
  unreadDot?: boolean;
}

const STROKE_WIDTH = 1.8;

function strokeProps(color: string) {
  return {
    stroke: color,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none' as const,
  };
}

/**
 * Inline stroke-based icon set (24x24 viewBox, 1.8 stroke, round caps),
 * matching the line icons in the design files.
 */
export function Icon({ name, size = 24, color = colors.text.primary, unreadDot = false }: IconProps) {
  const s = strokeProps(color);
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {name === 'gift' && (
        <>
          <Rect x={3} y={8} width={18} height={4} {...s} />
          <Path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" {...s} />
          <Line x1={12} y1={8} x2={12} y2={21} {...s} />
          <Path d="M12 8H7.5a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8z" {...s} />
          <Path d="M12 8h4.5a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8z" {...s} />
        </>
      )}
      {name === 'bolt' && <Path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" {...s} />}
      {name === 'phone' && (
        <>
          <Rect x={6} y={2} width={12} height={20} rx={2.5} {...s} />
          <Line x1={11} y1={18} x2={13} y2={18} {...s} />
        </>
      )}
      {name === 'wifi' && (
        <>
          <Path d="M2.5 9a15 15 0 0 1 19 0" {...s} />
          <Path d="M5.5 12.5a10.5 10.5 0 0 1 13 0" {...s} />
          <Path d="M8.6 16a6 6 0 0 1 6.8 0" {...s} />
          <Line x1={12} y1={19.5} x2={12.01} y2={19.5} {...s} />
        </>
      )}
      {name === 'plane' && (
        <>
          <Path d="M22 2 11 13" {...s} />
          <Path d="M22 2 15 22l-4-9-9-4 20-7z" {...s} />
        </>
      )}
      {name === 'home' && (
        <>
          <Path d="M3 9.5 12 2l9 7.5V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9.5z" {...s} />
          <Polyline points="9 22 9 12 15 12 15 22" {...s} />
        </>
      )}
      {name === 'grid' && (
        <>
          <Rect x={3} y={3} width={7} height={7} rx={1.5} {...s} />
          <Rect x={14} y={3} width={7} height={7} rx={1.5} {...s} />
          <Rect x={3} y={14} width={7} height={7} rx={1.5} {...s} />
          <Rect x={14} y={14} width={7} height={7} rx={1.5} {...s} />
        </>
      )}
      {name === 'receipt' && (
        <>
          <Path d="M5 2.5h14V21l-2.3-1.6-2.4 1.6-2.3-1.6L9.6 21l-2.3-1.6L5 21V2.5z" {...s} />
          <Line x1={9} y1={8} x2={15} y2={8} {...s} />
          <Line x1={9} y1={12} x2={15} y2={12} {...s} />
        </>
      )}
      {name === 'user' && (
        <>
          <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" {...s} />
          <Circle cx={12} cy={7} r={4} {...s} />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" {...s} />
          <Path d="M13.73 21a2 2 0 0 1-3.46 0" {...s} />
        </>
      )}
      {name === 'eye' && (
        <>
          <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" {...s} />
          <Circle cx={12} cy={12} r={3} {...s} />
        </>
      )}
      {name === 'eye-off' && (
        <>
          <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" {...s} />
          <Path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" {...s} />
          <Path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" {...s} />
          <Line x1={1} y1={1} x2={23} y2={23} {...s} />
        </>
      )}
      {name === 'arrow-right' && (
        <>
          <Line x1={5} y1={12} x2={19} y2={12} {...s} />
          <Polyline points="12 5 19 12 12 19" {...s} />
        </>
      )}
      {name === 'arrow-left' && (
        <>
          <Line x1={19} y1={12} x2={5} y2={12} {...s} />
          <Polyline points="12 19 5 12 12 5" {...s} />
        </>
      )}
      {name === 'arrow-down-left' && (
        <>
          <Line x1={17} y1={7} x2={7} y2={17} {...s} />
          <Polyline points="17 17 7 17 7 7" {...s} />
        </>
      )}
      {name === 'arrow-up-right' && (
        <>
          <Line x1={7} y1={17} x2={17} y2={7} {...s} />
          <Polyline points="7 7 17 7 17 17" {...s} />
        </>
      )}
      {name === 'shield' && <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...s} />}
      {name === 'shield-check' && (
        <>
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" {...s} />
          <Polyline points="9 11.5 11 13.5 15 9.5" {...s} />
        </>
      )}
      {name === 'lock' && (
        <>
          <Rect x={3} y={11} width={18} height={11} rx={2} {...s} />
          <Path d="M7 11V7a5 5 0 0 1 10 0v4" {...s} />
        </>
      )}
      {name === 'copy' && (
        <>
          <Rect x={9} y={9} width={13} height={13} rx={2} {...s} />
          <Path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" {...s} />
        </>
      )}
      {name === 'plus' && (
        <>
          <Line x1={12} y1={5} x2={12} y2={19} {...s} />
          <Line x1={5} y1={12} x2={19} y2={12} {...s} />
        </>
      )}
      {name === 'search' && (
        <>
          <Circle cx={11} cy={11} r={8} {...s} />
          <Line x1={21} y1={21} x2={16.65} y2={16.65} {...s} />
        </>
      )}
      {name === 'close' && (
        <>
          <Line x1={18} y1={6} x2={6} y2={18} {...s} />
          <Line x1={6} y1={6} x2={18} y2={18} {...s} />
        </>
      )}
      {name === 'check' && <Polyline points="20 6 9 17 4 12" {...s} />}
      {name === 'chevron-right' && <Polyline points="9 18 15 12 9 6" {...s} />}
      {name === 'chevron-left' && <Polyline points="15 18 9 12 15 6" {...s} />}
    </Svg>
      {name === 'bell' && unreadDot && <View style={styles.unreadDot} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.error,
    borderWidth: 1.5,
    borderColor: colors.surface.card,
  },
});
