export function Footer() {
  return (
    <footer className="py-8 mt-auto border-t border-divider w-full text-center flex flex-col items-center justify-center gap-2">
      <div className="flex items-center gap-2 text-muted font-medium text-sm">
        <div className="w-4 h-4 bg-primary rounded-sm flex items-center justify-center">
           <span className="text-surface text-[8px]">N</span>
        </div>
        NoteNest Collaborative Space
      </div>
      <p className="text-xs text-muted/70">
        © {new Date().getFullYear()} NoteNest. Built securely.
      </p>
    </footer>
  );
}