import type { Accessor, Setter } from "solid-js";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "./ui/popover";
import { TextField, TextFieldLabel, TextFieldRoot } from "./ui/textfield";

export const SearchButton = (props: {
  keyword: Accessor<string>;
  setKeyword: Setter<string>;
  native: Accessor<string>;
  setNative: Setter<string>;
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
                onInput={(val) => props.setKeyword(val.target.value)}
                value={props.keyword()}
                class="col-span-2 h-8"
              />
            </TextFieldRoot>
            <TextFieldRoot class="grid grid-cols-3 items-center gap-4">
              <TextFieldLabel class="text-right">不包含</TextFieldLabel>
              <TextField
                onInput={(val) => props.setNative(val.target.value)}
                value={props.native()}
                class="col-span-2 h-8"
              />
            </TextFieldRoot>
            <Button onClick={props.click}>提交</Button>
          </PopoverDescription>
        </div>
      </PopoverContent>
    </Popover>
  );
};
