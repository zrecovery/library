import { type JSX, children } from "solid-js";
import { SearchButton } from "./search-button";

export const HolyGrailLayout = (props: { children: JSX.Element }) => {
  const Children = children(() => props.children);
  return (
    <div id="layout" class="grid grid-cols-[1fr_2fr_1fr]">
      <div class="px-4 py-2 h-[">
        <SearchButton />
      </div>
      {Children()}
      <div />
    </div>
  );
};
