export default function Card(props: { title: string, author: string }) {
  return (
    <div class="group flex flex-col items-start gap-2 rounded-lg bg-muted p-4 transition-colors hover:bg-muted/50">
      <div class="text-sm font-medium group-hover:underline">{props.title}</div>
      <div class="text-xs text-muted-foreground">{props.author}</div>
    </div>

  )
}
