import { type JSX, children } from "solid-js";

export const HolyGrailLayout = (props: { children: JSX.Element }) => {
  const Children = children(() => props.children);
  return (
    <div id="layout">
      <div />
      {Children()}
      <div />
    </div>
  );
};
