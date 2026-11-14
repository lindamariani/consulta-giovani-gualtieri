type Props = {
  title: string;
  label?: string;
};

export default function OwnerLoadingScreen({
  label = "CARICAMENTO...",
}: Props) {
  return (
    <main className="owner-loading" role="status" aria-live="polite" aria-busy="true">
      {label.toUpperCase()}
    </main>
  );
}
