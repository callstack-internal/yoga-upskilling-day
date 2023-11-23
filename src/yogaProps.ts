export type Size = number | `${number}%` | 'auto'; // we don't support 'inherit'

export interface SizeProps {
  width?: Size;
  minWidth?: Size;
  maxWidth?: Size;

  height?: Size;
  minHeight?: Size;
  maxHeight?: Size;
}

type Edge = 'left' | 'right' | 'top' | 'bottom'; // we don't support 'start' nor 'end'

type EdgeDependentProps<Name extends string, Type, Extras extends (string | void) = void> = {
  [key in `${Name}`]?: Type;
} & {
  [key in `${Name}${Capitalize<Extras extends string ? (Edge | Extras) : Edge>}`]?: Type;
}

export type MarginProps = EdgeDependentProps<'margin', Size, 'vertical' | 'horizontal'>; // we dont support 'start' and 'end'

export type PaddingProps = EdgeDependentProps<'padding', Size, 'vertical' | 'horizontal'>; // we dont support 'start' nor 'end'

export type BorderWidthProps = {
  borderWidth?: number;
} & {
  [key in `border${Capitalize<Edge>}Width`]?: number;
}

export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

export type Alignment = 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';

export interface FlexProps {
  flex?: number;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: Size | 'content';
  flexDirection?: FlexDirection;
  flexWrap?: 'no-wrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: Alignment;
  alignSelf?: Alignment | 'auto';
  alignContent?: Alignment | 'space-between' | 'space-around';
}

export interface GapProps {
  gap?: number;
  columnGap?: number;
  rowGap?: number;
}

export interface PositionProps { // we don't support 'start' nor 'end'
  position?: 'relative' | 'absolute';
  left?: number | string;
  right?: number | string;
  top?: number | string;
  bottom?: number | string;
  // zIndex?: number;
}

export type ViewStyle = SizeProps & MarginProps & PaddingProps & BorderWidthProps & FlexProps & GapProps & PositionProps & {
  backgroundColor?: string;
};

export type TextStyle = ViewStyle & {
  fontSize?: number;
  color?: string;
};

export type StyleProps = ViewStyle | TextStyle;
