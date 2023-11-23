import { BorderWidthProps, FlexProps, GapProps, MarginProps, PaddingProps, Size, SizeProps, PositionProps, StyleProps } from "./yogaProps";

export type YogaSize = number | `${number}%` | undefined;

export interface LayoutMetrics {
  x: number;
  y: number;
  width: number;
  height: number;
  // zIndex: number;
}

export interface BoundingBox<Type> {
  left: Type;
  right: Type;
  top: Type;
  bottom: Type;
}

export function resolveSize(x: YogaSize, length: number): number {
  if (typeof x === 'number') {
    return x;
  } else if (typeof x === 'string') {
    // For simplicity purposes I assume that we have a valid percentage
    const naked = x.trim();
    if (naked.length < 2 || !naked.endsWith('%')) {
      throw new Error(`resolveSize(): invalid percentage value: ${naked}`);
    } else {
      const value = parseFloat(naked);
      return Math.round(length * value / 100.0);
    }
  } else {
    throw new Error('resolveSize() called on auto (undefined)...');
  }
}

export function resolveBox(input: BoundingBox<YogaSize>, width: number, height: number): BoundingBox<number> {
  return {
    left: resolveSize(input.left ?? 0, width),
    right: resolveSize(input.right ?? 0, width),
    top: resolveSize(input.top ?? 0, height),
    bottom: resolveSize(input.bottom ?? 0, height),
  };
}

export function shrinkMetricsToBox(metrics: LayoutMetrics, ...boxes: Array<BoundingBox<YogaSize>>): BoundingBox<number> {
  const resolvedBoxes = boxes.map((box) => resolveBox(box, metrics.width, metrics.height)),
    left = resolvedBoxes.reduce((acc, box) => acc + box.left, 0),
    top = resolvedBoxes.reduce((acc, box) => acc + box.top, 0),
    right = resolvedBoxes.reduce((acc, box) => acc + box.right, 0),
    bottom = resolvedBoxes.reduce((acc, box) => acc + box.bottom, 0);

  return {
    left: metrics.x + left,
    top: metrics.y + top,
    right: (metrics.x + metrics.width) - right,
    bottom: (metrics.y + metrics.height) - bottom,
  };
}

export function numericSize(size: YogaSize): number | undefined {
  return typeof size === 'number' ? size : undefined;
}

export type YogaConstrainedSize = {
  value: YogaSize;
  min: YogaSize;
  max: YogaSize;
}
export type YogaSizeStyle = {
  width: YogaConstrainedSize;
  height: YogaConstrainedSize;
};

type YogaMarginStyle = BoundingBox<YogaSize>;
type YogaPaddingStyle = BoundingBox<YogaSize>;
type YogaBorderStyle = BoundingBox<YogaSize>;

type YogaFlexStyle = Required<Omit<FlexProps, 'flex' | 'flexDirection'>> & {
  isRowDirection: boolean; // is one of ['row', 'row-direction']
  isMainReversed: boolean; // is one of ['row-reversed', 'column-reversed']
};

type YogaGapStyle = {
  width?: number;
  height?: number;
};

type PositionStyle = PositionProps;

// export type YogaStyle = YogaSizeStyle & YogaMarginStyle & YogaPaddingStyle & YogaBorderStyle & YogaFlexStyle & YogaGapStyle;
interface YogaStyle extends YogaSizeStyle, YogaFlexStyle {
  margin: YogaMarginStyle;
  padding: YogaPaddingStyle;
  borderWidth: YogaBorderStyle;
  gap: YogaGapStyle;
  backgroundColor?: string;
}

export interface TreeNode<NodeType> {
  parent?: NodeType;
  children: NodeType[];
}

export interface YogaNode extends TreeNode<YogaNode> {
  /**
   * The input styles parsed from provided style props.
   */
  style: YogaStyle;

  /**
   * Absolute layout metrics in screen-space coordinates.
   *
   * Initial metrics become available after the first layouting pass,
   * and then they are refined with every next pass.
   */
  metrics?: LayoutMetrics;

  /** Resolved margin values for this node. */
  resolvedMargin?: BoundingBox<number>;

  /**
   * Absolute layout metrics for the resolved content-box.
   * This cached value is a shrinked `metrics` by resolved border + padding.
   */
  resolvedContentBox?: BoundingBox<number>;

  _debugName?: string;
}

const parseYogaSize = (src?: Size): YogaSize => src !== 'auto' ? src : undefined;

const parseYogaSizeWidth = (src: SizeProps): YogaConstrainedSize => ({
  value: parseYogaSize(src.width),
  min: parseYogaSize(src.minWidth),
  max: parseYogaSize(src.maxWidth),
});

const parseYogaSizeHeight = (src: SizeProps): YogaConstrainedSize => ({
  value: parseYogaSize(src.height),
  min: parseYogaSize(src.minHeight),
  max: parseYogaSize(src.maxHeight),
});

const parseYogaMargin = (src: MarginProps): YogaMarginStyle => ({
  left: parseYogaSize(src.marginLeft ?? src.marginHorizontal ?? src.margin),
  right: parseYogaSize(src.marginRight ?? src.marginHorizontal ?? src.margin),
  top: parseYogaSize(src.marginTop ?? src.marginVertical ?? src.margin),
  bottom: parseYogaSize(src.marginBottom ?? src.marginVertical ?? src.margin),
});

const parseYogaBorderWidth = (src: BorderWidthProps): YogaBorderStyle => ({
  left: parseYogaSize(src.borderLeftWidth ?? src.borderWidth),
  right: parseYogaSize(src.borderRightWidth ?? src.borderWidth),
  top: parseYogaSize(src.borderTopWidth ?? src.borderWidth),
  bottom: parseYogaSize(src.borderBottomWidth ?? src.borderWidth),
});

const parseYogaPadding = (src: PaddingProps): YogaPaddingStyle => ({
  left: parseYogaSize(src.paddingLeft ?? src.paddingHorizontal ?? src.padding),
  right: parseYogaSize(src.paddingRight ?? src.paddingHorizontal ?? src.padding),
  top: parseYogaSize(src.paddingTop ?? src.paddingVertical ?? src.padding),
  bottom: parseYogaSize(src.paddingBottom ?? src.paddingVertical ?? src.padding),
});

const parseYogaFlex = (src: FlexProps): YogaFlexStyle => {
  // Defaults:
  // flex: 0 -> item sized according to `width` and `height`
  // flexBasis: 0, flexGrow: 0, flexShrink: 0
  const flexDependentProps = (src.flex === undefined)
    ? {
      flexGrow: src.flexGrow ?? 0,
      flexShrink: src.flexShrink ?? 0,
    } : {
      flexGrow: src.flexGrow ?? src.flex ?? 0,
      flexShrink: src.flexShrink ?? 1,
    };

  const flexDirection = src.flexDirection ?? 'column';
  return {
    ...flexDependentProps,
    flexBasis: src.flexBasis ?? 'auto',
    flexWrap: src.flexWrap ?? 'no-wrap',
    justifyContent: src.justifyContent ?? 'flex-start',
    alignContent: src.alignContent ?? 'stretch',
    alignItems: src.alignItems ?? 'stretch',
    alignSelf: src.alignSelf ?? 'auto',
    isRowDirection: flexDirection.startsWith('row'),
    isMainReversed: flexDirection.endsWith('-reverse'),
  };
};

const parseYogaGap = (src: GapProps): YogaGapStyle => ({
  width: src.columnGap ?? src.gap, // gap between columns => width
  height: src.rowGap ?? src.gap, // gap between rows => height
});

export function parseYogaStyleProps(src: StyleProps): YogaStyle {
  const flexStyle = parseYogaFlex(src);
  const width = parseYogaSizeWidth(src);
  const height = parseYogaSizeHeight(src);
  const margin = parseYogaMargin(src);
  const padding = parseYogaPadding(src);
  const borderWidth = parseYogaBorderWidth(src);
  const gap = parseYogaGap(src);

  return {
    ...flexStyle,
    width,
    height,
    margin,
    padding,
    borderWidth,
    gap,

    // Other
    backgroundColor: src.backgroundColor,
  };
}