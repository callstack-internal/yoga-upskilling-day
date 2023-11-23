import { TreeNode, YogaNode } from '../types';

export function walkPreOrder<NodeType extends TreeNode<NodeType>>(
  node: NodeType,
  parent: NodeType | undefined,
  visitor: (node: NodeType, parent?: NodeType) => void,
) {
  visitor(node, parent);
  node.children.forEach(
    (child) => walkPreOrder(child as NodeType, node, visitor)
  );
}

export function flatMapPostOrder<NodeType extends TreeNode<NodeType>, ResultType>(
  node: NodeType,
  visitor: (node: NodeType) => ResultType,
): Array<ResultType> {
  return node.children.flatMap(
    (child) => flatMapPostOrder(child, visitor)
  ).concat(visitor(node));
}

export function buildYogaTree(root: YogaNode): YogaNode {
  // Just overwrite the parent references
  walkPreOrder(root, undefined, (node, parent) => {
    node.parent = parent;
  });
  return root;
}
