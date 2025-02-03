import { type JSX, children } from "solid-js";

export const PaginationLayout = (props: { children: JSX.Element }) => {
  const Children = children(() => props.children);
  return (
    <>
      <div
        class="grid"
        style="height:100%;grid-template-areas: 'main' 'pagination'; grid-gap:1rem;grid-template-rows: 1fr 8rem;"
      >
        {Children()}
      </div>
    </>
  );
};
