import React, { useEffect, useState } from 'react';
import { ObjectLiteral } from '../types';
import { NonAbstract } from '../types';

abstract class Component<T extends ObjectLiteral = {}> {
  props: T;
  k: number;

  constructor(props: T) {
    this.props = props;
    this.k = Math.random();
  }

  abstract render(): React.ReactNode;
}

const stateFields = new WeakMap<ObjectLiteral, Map<string, any>>();
type EffectDependencyFactory = (self: any) => unknown[];
const effectMethods = new WeakMap<
  ObjectLiteral,
  Map<string, EffectDependencyFactory | undefined>
>();

export function UseState<T>(initialValue: T): PropertyDecorator {
  return function (target, propertyKey) {
    const constructor = target.constructor;
    if (!stateFields.has(constructor)) {
      stateFields.set(constructor, new Map());
    }
    stateFields.get(constructor)!.set(propertyKey as string, initialValue);
  };
}

export function UseEffect(deps?: (self: any) => unknown[]): PropertyDecorator {
  return function (target, propertyKey) {
    const constructor = target.constructor;
    if (!effectMethods.has(constructor)) {
      effectMethods.set(constructor, new Map());
    }
    effectMethods.get(constructor)!.set(propertyKey as string, deps);
  };
}

export function reactify<
  TClass extends ObjectLiteral,
  UProps extends TClass extends NonAbstract<
    typeof Component<infer U & ObjectLiteral>
  >
    ? U
    : never,
>(ComponentClass: TClass): React.FC<UProps> {
  return function Reactified(props: UProps) {
    const stateMap = stateFields.get(ComponentClass) ?? new Map();
    const effectSet = effectMethods.get(ComponentClass) ?? new Map();

    const instance = new (ComponentClass as any)(props);
    instance.props = props;

    // Attach useState to decorated fields
    for (const [key, initialValue] of stateMap.entries()) {
      const [value, setter] = useState(initialValue);
      Object.defineProperty(instance, key, {
        get: () => value,
        set: setter,
      });
    }

    for (const [methodName, depsFactory] of effectSet.entries()) {
      const deps = depsFactory?.(instance); // <-- safely evaluates with bound instance
      useEffect(() => {
        instance[methodName]();
      }, deps);
    }

    console.log(instance.k);

    return instance.render();
  };
}

export class MyComponent extends Component<{ name: string }> {
  @UseState(0)
  counter: number;

  @UseState(true)
  otherState!: boolean;

  @UseEffect()
  logEffect() {
    console.log('Mounted!', this.counter);
  }

  @UseEffect((self) => [self.counter])
  effect() {
    console.log('Runs when counter changes');
  }

  render() {
    return (
      <div>
        Hello, {this.props.name}. Count: {this.counter}
        <button onClick={() => (this.counter += 1)}>+</button>
        <button onClick={() => (this.otherState = !this.otherState)}>
          {this.otherState ? 'true' : 'false'}
        </button>
      </div>
    );
  }
}

export const My = reactify(MyComponent);
