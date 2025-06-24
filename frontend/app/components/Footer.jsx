export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 z-50 w-full py-3 mb-3 text-xs font-extrabold text-center text-white bg-transparent">
      © {new Date().getFullYear()} Breathe Pilates. Powered by Hephaestack.
    </footer>
  );
}