import { ClassConstructor } from 'class-transformer';
import { NonAbstract, ObjectLiteral } from '../types';

export function UseEffect(...args: any[]): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
  };
}

export function UseState<T>(initialValue: T): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
  };
}

abstract class Component<T extends ObjectLiteral = {}> {
  props: T;

  constructor(props: T) {
    this.props = props;
  }

  abstract render(): React.ReactNode;
}

export class MyComponent extends Component<{ name: string }> {
  static My = 11;

  @UseEffect()
  effect() {
    console.log('useEffect');
  }

  render() {
    return <div>{this.props.name}</div>;
  }
}

function reactify<
  TClass extends ObjectLiteral,
  UProps extends TClass extends NonAbstract<
    typeof Component<infer U & ObjectLiteral>
  >
    ? U
    : never,
>(ComponentClass: TClass): React.ComponentType<UProps> {
  return function (props: UProps) {
    const instance = new (ComponentClass as any)(props);
    return instance.render();
  };
}

export const My = reactify(MyComponent);
