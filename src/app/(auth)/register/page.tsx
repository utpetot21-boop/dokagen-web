import { redirect } from 'next/navigation';

// Registrasi publik ditutup — akun dikelola oleh admin dari halaman Pengaturan
export default function RegisterPage() {
  redirect('/login');
}
