import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { TextField, TextFieldInput, TextFieldLabel } from "./ui/text-field";
import { createSignal } from "solid-js";

const SearchAlertDialog = (props: { action: (keyword: string) => void }) => {
  const [getPositiveKeywords, setPositiveKeywords] = createSignal("");
  const [getNegativeKeywords, setNegativeKeywords] = createSignal("");
  // 输入的关键词用","分割，输出的负面关键词开头加"-"，正、负关键词拼接

  const sumbit = () => {
    const p = getPositiveKeywords().trim();
    console.log(p);
    console.log(getNegativeKeywords().trim().length);
    const n =
      getNegativeKeywords().trim().length > 0
        ? `, -${getNegativeKeywords().trim().replaceAll(",", ", -")}`
        : "";
    console.log(n);

    props.action(p + n);
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger as={Button} variant="outline">
        搜索
      </AlertDialogTrigger>
      <AlertDialogPortal>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>文章搜索</AlertDialogTitle>
            <AlertDialogDescription>
              <TextField>
                <TextFieldLabel>需要包含的关键词</TextFieldLabel>
                <TextFieldInput
                  type="text"
                  value={getPositiveKeywords()}
                  onChange={(e) => setPositiveKeywords(e.currentTarget.value)}
                  placeholder="包含关键词"
                />
                <TextFieldLabel>不包含的关键词</TextFieldLabel>
                <TextFieldInput
                  type="text"
                  value={getNegativeKeywords()}
                  onChange={(e) => setNegativeKeywords(e.currentTarget.value)}
                  placeholder="不包含的关键词"
                />
              </TextField>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={sumbit}>确认</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

export default SearchAlertDialog;
