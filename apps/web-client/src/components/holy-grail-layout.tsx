import { type JSX, Show, children } from "solid-js";

export const HolyGrailLayout = (props: { children: JSX.Element, search?:{
  enable: boolean,
  body?: JSX.Element
} }) => {
  const Children = children(() => props.children);
  return (
    <div id="layout" class="grid grid-cols-[1fr_2fr_1fr]">
      <div class="px-4 py-2">
        <Show when={props.search?.enable ?? false}>
          {props.search?.body ?? <div />}
        </Show>
      </div>
      {Children()}
      <div />
    </div>
  );
};
