import { Button } from "@/components/ui/button";
import {
  Switch,
  SwitchControl,
  SwitchInput,
  SwitchLabel,
  SwitchThumb,
} from "@/components/ui/switch";
import {
  TextField,
  TextFieldInput,
  TextFieldLabel,
  TextFieldTextArea,
} from "@/components/ui/text-field";
import { createArticle } from "@/libs/api";
import { createSignal, Show } from "solid-js";
import { createStore } from "solid-js/store";
import { showToast } from "@/components/app-toast";
import { Separator } from "@/components/ui/separator";

export const ArticleCreatePage = () => {
  const [getChapterSwitch, setChapterSwitch] = createSignal<boolean>(false);
  const [getArticle, setArticle] = createStore<{ title: string; body: string }>(
    { title: "", body: "" },
  );
  const [getChapter, setChapter] = createStore<{
    title: string;
    order: number;
  }>({ title: "", order: 1.0 });
  const [getAuthor, setAuthor] = createStore<{ name: string }>({ name: "" });
  const submit = async () => {
    const chapter = getChapterSwitch() ? { ...getChapter } : undefined;
    const article = {
      ...getArticle,
      chapter,
      author: getAuthor,
    };
    const result = await createArticle(article);
    switch (result.status) {
      case 201:
        showToast({ title: "成功", message: "创建成功", level: "info" });
        break;
      case 422:
        console.error(result.error);
        showToast({ title: "失败", message: "输入异常", level: "error" });
        break;
      case 400:
        console.error(result.error);
        showToast({ title: "失败", message: "输入异常", level: "error" });
        break;
      case 500:
        console.error(result.error);
        showToast({
          title: "失败",
          message: "服务器宕机，请稍后重试",
          level: "error",
        });
        break;
      default:
        console.error(result.response);
        showToast({
          title: "失败",
          message: "不知道是啥问题，请稍后重试",
          level: "error",
        });
    }
  };
  return (
    <div class="grid justify-items-center grid-rows-[auto_1fr]">
      <h1>title</h1>

      <TextField class="max-w-xl max-h-xl w-full h-full">
        <TextFieldLabel>标题</TextFieldLabel>
        <TextFieldInput
          type="text"
          value={getArticle.title}
          onChange={(e) => setArticle("title", e.currentTarget.value)}
        />
        <TextFieldLabel>作者</TextFieldLabel>
        <TextFieldInput
          type="text"
          value={getAuthor.name}
          onChange={(e) => setAuthor("name", e.currentTarget.value)}
        />

        <Switch
          checked={getChapterSwitch()}
          onChange={setChapterSwitch}
          class="flex items-center gap-x-2"
        >
          <SwitchInput />
          <SwitchControl>
            <SwitchThumb />
          </SwitchControl>
          <SwitchLabel>Airplane Mode</SwitchLabel>
        </Switch>
        <Show when={getChapterSwitch()}>
          <TextFieldLabel>章节标题</TextFieldLabel>
          <TextFieldInput
            type="text"
            value={getChapter.title}
            onChange={(e) => setChapter("title", e.currentTarget.value)}
          />
          <TextFieldLabel>排序序号</TextFieldLabel>
          <TextFieldInput
            type="number"
            value={getChapter.order}
            onChange={(e) => setChapter("order", e.currentTarget.value)}
          />
        </Show>
        <TextFieldLabel>内容</TextFieldLabel>
        <TextFieldTextArea
          placeholder="文章内容"
          value={getArticle.body}
          onChange={(e) => setArticle("body", e.currentTarget.value)}
        />
      </TextField>
      <Separator orientation="vertical" />

      <Button onClick={submit}>提交</Button>
    </div>
  );
};

export default ArticleCreatePage;
