export function log(level: string, message: string) {
  return function <
    This,
    Value extends (...args: Args) => Return,
    Args extends any[],
    Return,
  >(
    accessor: { get: (this: This) => Value }, // 自动访问器类型
    context: ClassAccessorDecoratorContext<This, Value>,
  ) {
    return {
      get(this: This) {
        const originalMethod = accessor.get.call(this);
        const date = Intl.DateTimeFormat();
        console[level](
          `${date}-${context.name.toString()}-${originalMethod} [${level}] : ${message}`,
        );

        function wrappedMethod(this: This, ...args: Args): Return {
          return originalMethod.apply(this, args);
        }
        return wrappedMethod as Value;
      },
    };
  };
}
