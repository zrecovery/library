import { Button } from "./ui/button";
import { TextField, TextFieldRoot } from "./ui/textfield";

export const SearchBar = () => {
  return (
    <div class="grid w-full max-w-sm items-center space-x-2">
      <TextFieldRoot class="w-full">
        <TextField />
      </TextFieldRoot>
      <Button type="button">Search</Button>
    </div>
  );
};
