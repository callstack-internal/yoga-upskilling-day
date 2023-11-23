import { YogaNode, YogaSize, resolveSize, numericSize, BoundingBox, resolveBox, LayoutMetrics, shrinkMetricsToBox } from './types';
import { Alignment } from './yogaProps';
import { flatMapPostOrder } from './utils/tree';
export { buildYogaTree } from './utils/tree';

const identity = <T>(value: T): T => value;

function measureMinContentForAxis(node: YogaNode, axis: 'width' | 'height') {
  const size = node.style[axis];

  // TODO: Implement proper sizing code
  let resultingSize = numericSize(size.value) ?? 50;

  // If the min-size constraits were provided as numbers, then apply them.
  // We also have to make sure, that the content size is clamped to zero.
  const minSize = numericSize(size.min) ?? 0;
  const maxSize = numericSize(size.max) ?? +Infinity;
  return Math.max(minSize, Math.min(resultingSize, maxSize));
}

export function layout(root: YogaNode, ownerWidth: number, ownerHeight: number) {
  // Let's walk the tree bottom-up (post-order traversal) while collecting
  // all nodes into an array. This way, we will have all our leaf nodes at
  // the beginning, and the root node will be the last.
  let nodes = flatMapPostOrder(root, identity);

  // In the first pass we will perform an intrinsic "content-based automatic sizing".
  // Basically, we will try to propagate the widths and the heights upwards, starting
  // from the leaf nodes (i.e. bottom-up traversal). This should properly (and easily)
  // resolve content-sized nodes in parents that don't have those set explicitly.
  //
  // NOTE: We can only rely on "absolute lengths" (i.e. sizes such as width or height
  //       that are numbers). Percentage lengths rely on parent size, therefore during
  //       this pass we will ignore them (treat them as 0), and resolve them in the
  //       second (top-to-bottom) pass.
  nodes.forEach((node) => {
    node.metrics = {
      x: 0,
      y: 0,
      width: measureMinContentForAxis(node, 'width'),
      height: measureMinContentForAxis(node, 'height'),
    };
  });

  // The second pass is top-down and tries to resolve flex.
  nodes.reverse().forEach((node) => {
    console.log("Visiting node (top-down pass):", node._debugName, node);

    // TODO: Implement all the rest
  });

  console.log("End of layout:", root);

  // HACK: Return all the leaf nodes for rendering
  return nodes.filter((node) => node.children.length === 0);
}
