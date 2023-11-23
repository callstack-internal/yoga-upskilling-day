import { YogaNode, parseYogaStyleProps }  from './types';
import { StyleProps } from './yogaProps';

export function Component(name: string, styleProps: StyleProps, children?: YogaNode[]): YogaNode {
  return {
    parent: undefined, // will be linked by `buildYogaTree()`
    children: children ?? [],
    style: parseYogaStyleProps(styleProps),
    _debugName: name,
  };
}

function makeComponent(name: string, baseProps: StyleProps) {
  let counter = 0;
  return (id: string, styleProps?: StyleProps, children?: YogaNode[]) => {
    return Component(
      `${name}#${id}${counter++}`,
      { ...baseProps, ...styleProps },
      children
    );
  };
}

export const VStack = makeComponent('VStack', {
  flex: 1,
  flexDirection: 'column',
});

export const HStack = makeComponent('HStack', {
  flex: 1,
  flexDirection: 'row',
});
