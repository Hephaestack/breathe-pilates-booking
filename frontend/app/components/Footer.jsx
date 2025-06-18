export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full text-xs font-extrabold text-center text-white bg-transparent z-50 py-3">
      © {new Date().getFullYear()} Breathe Pilates. All rights reserved.
    </footer>
  );
}