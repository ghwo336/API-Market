export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center py-12">
      <div
        className="animate-spin rounded-full h-8 w-8"
        style={{ borderBottom: "2px solid var(--green)", border: "2px solid var(--border2)", borderBottomColor: "var(--green)" }}
      />
    </div>
  );
}
