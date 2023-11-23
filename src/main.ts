import { fabric } from 'fabric';
import { StyleProps } from './yogaProps';
import { Component, HStack, VStack } from './components';
import { buildYogaTree, layout } from './algorithm';

type StyleSheetStyles = {[key: string]: StyleProps};

// Our stylesheet (basically copied from React Native code)
const styles: StyleSheetStyles = {
  label: {
    flex: 1,
    alignSelf: 'center',
    // textAlign: 'center',
  },
  button: {
    minWidth: 50,
    minHeight: 50,
    justifyContent: 'center',
    borderWidth: 2,
    // textAlign: 'center',
    // borderRadius: 10,
    backgroundColor: 'skyblue',
  },
};

// Let's build the tree for our counter component
const tree = buildYogaTree(
  Component('Container', {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    padding: 10,
  }, [
    Component('1.Square', {
      // width: 100,
      height: 100,
      backgroundColor: 'red',
    }),
    Component('2.Rectangle', {
      width: 50,
      height: 50,
      backgroundColor: 'green',
    }),
    Component('3.Square', {
      width: 100,
      height: 100,
      backgroundColor: 'blue',
    }),
  ]),
);

// const tree = buildYogaTree(
//   VStack('Root(Screen)', {
//     width: 400, height: 250,
//   }, [
//     VStack('Top', { justifyContent: 'center', flex: 5 }, [
//       HStack('Inner', { alignItems: 'center' }, [
//         Component('Decrement', {...styles.button, height: '50%' }),
//         Component('Counter', {...styles.button, height: '50%', flex: 1 }),
//         Component('Increment', {...styles.button, height: '50%' }),
//       ]),
//     ]),
//     Component('Button#Reset', {...styles.button, flex: 1, width: '100%' }),
//   ]),
// );

console.log('Generated Yoga tree:', tree);


const canvas = new fabric.Canvas('app');
canvas.fill = 'black';

let pseudoScreen = new fabric.Rect({
  left: 0,
  top: 0,
  fill: 'gray',
  width: 400,
  height: 250,
  selectable: false,
});
canvas.add(pseudoScreen);

layout(tree, 400, 250)
  .forEach((node) => {
    const { x, y, width, height } = node.metrics!;

    const box = new fabric.Rect({
      left: x,
      top: y,
      width,
      height,
      stroke: 'gold',
      fill: node.style.backgroundColor ?? 'black',
    });
    canvas.add(box);
  });
