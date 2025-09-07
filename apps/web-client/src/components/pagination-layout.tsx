import { type JSX, children } from "solid-js";

export const PaginationLayout = (props: { children: JSX.Element }) => {
  const Children = children(() => props.children);
  return (
    <>
      <div
        class="grid h-10"
        style="grid-template-areas: 'main' 'pagination'; grid-gap:1rem; grid-template-rows: h-10 3rem;"
      >
        {Children()}
      </div>
    </>
  );
};
