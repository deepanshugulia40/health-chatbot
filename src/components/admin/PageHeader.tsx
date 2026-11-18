export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <header className="mb-8">
      <p className="eyebrow">Admin</p>
      <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>}
    </header>
  );
}
