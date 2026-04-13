import {
  FileField,
  FileFieldDropzone,
  FileFieldHiddenInput,
  FileFieldItem,
  FileFieldItemDeleteTrigger,
  FileFieldItemList,
  FileFieldItemName,
  FileFieldItemPreviewImage,
  FileFieldItemSize,
  FileFieldLabel,
  FileFieldTrigger,
} from "@/components/ui/file-field";

interface CreateFileFieldProps {
  content: (body: string) => void;
}
const CreateFileField = (props: CreateFileFieldProps) => {
  return (
    <FileField
      multiple
      maxFiles={5}
      onFileAccept={async (data) => {
        const body = await data[0]?.text();
        props.content(body);
        console.log("accept data:", data);
      }}
      onFileReject={(data) => {
        console.log("reject data:", data);
      }}
      onFileChange={(data) => {
        console.log("changed data:", data);
      }}
    >
      <FileFieldDropzone>
        <FileFieldLabel>Drop your files here...</FileFieldLabel>
        <FileFieldTrigger>Choose files!</FileFieldTrigger>
      </FileFieldDropzone>
      <FileFieldHiddenInput />
      <FileFieldItemList>
        {() => (
          <FileFieldItem>
            <FileFieldItemPreviewImage />
            <FileFieldItemName />
            <FileFieldItemSize />
            <FileFieldItemDeleteTrigger />
          </FileFieldItem>
        )}
      </FileFieldItemList>
    </FileField>
  );
};

export default CreateFileField;
