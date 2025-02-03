import type { NonUndefined, Result } from "result";
import type { JSX, Resource } from "solid-js";
interface ResultHandlerProps<T extends NonUndefined, E extends NonUndefined> {
  /**
   * Result 对象实例
   */
  result: Resource<Result<T, E>>;

  /**
   * 成功状态要渲染的节点, 接收 Ok 值作为参数
   */
  children: (props: { value: T }) => JSX.Element;

  /**
   * 错误状态要渲染的节点, 接收 Err 值作为参数
   */
  fallback: (props: { error: E }) => JSX.Element;
}

/**
 * 根据 Result 状态渲染不同内容的组件
 */
export function ResultHandler<T extends NonUndefined, E extends NonUndefined>(
  props: ResultHandlerProps<T, E>,
): JSX.Element {
  const children = () => props.children;
  const fallback = () => props.fallback;
  return props.result()?.match({
    ok: (value) => {
      return children()({ value });
    },
    err: (error) => {
      return fallback()({ error });
    },
  });
}
