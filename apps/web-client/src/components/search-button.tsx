import type { Setter } from "solid-js";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverTitle,
  PopoverDescription,
} from "./ui/popover";
import { TextFieldRoot, TextFieldLabel, TextField } from "./ui/textfield";

export const SearchButton = (props: {
  keyword: Setter<string>;
  native: Setter<string>;
  click: () => void;
}) => {
  return (
    <Popover>
      <PopoverTrigger>Open</PopoverTrigger>
      <PopoverContent>
        <div class="grid gap-4">
          <PopoverTitle class="space-y-2">
            <h4 class="font-medium leading-none">Dimensions</h4>
          </PopoverTitle>
          <PopoverDescription class="grid gap-2">
            <TextFieldRoot class="grid grid-cols-3 items-center gap-4">
              <TextFieldLabel class="text-right">关键词</TextFieldLabel>
              <TextField
                onInput={(val) => props.keyword(val.target.value)}
                class="col-span-2 h-8"
              />
            </TextFieldRoot>
            <TextFieldRoot class="grid grid-cols-3 items-center gap-4">
              <TextFieldLabel class="text-right">不包含</TextFieldLabel>
              <TextField value={props.native()} class="col-span-2 h-8" />
            </TextFieldRoot>
            <Button onClick={props.click}>提交</Button>
          </PopoverDescription>
        </div>
      </PopoverContent>
    </Popover>
  );
};
