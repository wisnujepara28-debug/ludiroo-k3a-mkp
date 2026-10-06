import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Ship, 
  Lock, 
  Mail, 
  KeyRound, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Anchor, 
  Database,
  Compass,
  AlertCircle,
  Radio
} from 'lucide-react';

interface LoginFormProps {
  onNotify: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onNotify }) => {
  const { loginWithCredentials, loginWithDemo, loginWithGoogle, firestoreConnected } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Username atau Email wajib diisi';
    }

    if (!password) {
      errs.password = 'Password wajib diisi';
    } else if (password.length < 5) {
      errs.password = 'Password minimal 5 karakter';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      onNotify('error', 'Validasi Gagal', 'Mohon lengkapi data login dengan benar.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await loginWithCredentials(email, password);
      if (res.success) {
        onNotify('success', 'Selamat Datang di JAPARA', `Sesi operasional pelayaran aktif.`);
      } else {
        onNotify('error', 'Gagal Masuk', res.message || 'Kredensial tidak cocok');
      }
    } catch (err: any) {
      onNotify('error', 'Kesalahan Sistem', err.message || 'Terjadi kesalahan autentikasi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoClick = async (role: 'Super Admin' | 'Petugas Pelabuhan') => {
    setSubmitting(true);
    try {
      if (role === 'Super Admin') {
        setEmail('wisnujepara28@gmail.com');
        setPassword('JaparaAdmin2026!');
      } else {
        setEmail('petugas.manifes@japara.co.id');
        setPassword('JaparaOperator2026!');
      }
      await loginWithDemo(role);
      onNotify('success', 'Login Cepat Berhasil', `Masuk sebagai ${role} JAPARA`);
    } catch (err: any) {
      onNotify('error', 'Login Demo Gagal', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleClick = async () => {
    setSubmitting(true);
    try {
      await loginWithGoogle();
      onNotify('success', 'Autentikasi Google Sukses', 'Akun resmi Firebase Anda telah terhubung ke JAPARA.');
    } catch (err: any) {
      onNotify('error', 'Login Google Gagal', err.message || 'Gagal terhubung ke akun Google.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Maritime Aura */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[140px]" />
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
      </div>

      <div className="relative w-full max-w-lg z-10">
        {/* Main Glass Card */}
        <div className="bg-slate-800/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden">
          
          {/* Executive Header Banner */}
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-8 sm:p-10 text-center border-b border-slate-700/60 overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-10 pointer-events-none">
              <Compass className="w-52 h-52 text-white" />
            </div>

            {/* Emblem */}
            <div className="relative inline-flex items-center justify-center mb-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/20">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Ship className="w-10 h-10 text-amber-400" />
                </div>
              </div>
              <span className="absolute -bottom-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-widest shadow-sm">
                OFFICIAL
              </span>
            </div>

            {/* Corporate Name */}
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase font-sans">
              JAPARA <span className="text-amber-400">LINES</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 font-medium tracking-wide">
              Sistem Manajemen Muatan Kapal &amp; Penumpang Terpadu
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Pelabuhan Kartini (Jepara) • Karimunjawa • Rute Nusantara
            </p>

            {/* Live Online Badge */}
            <div className="mt-5 inline-flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs border border-slate-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300 font-medium">Server Online Realtime:</span>
              <span className="text-emerald-400 font-semibold font-mono text-[11px]">Firebase Cloud</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-slate-900/60">
            {/* 1-Click Fast Demo Box */}
            <div className="bg-gradient-to-r from-blue-950/80 to-slate-900/80 border border-blue-800/40 rounded-2xl p-4.5 mb-6 shadow-inner">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Akses Cepat Demo</span>
                </div>
                <span className="text-[10px] font-semibold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
                  Instant 1-Klik
                </span>
              </div>
              <p className="text-xs text-slate-300 mb-3.5 leading-relaxed">
                Pilih profil di bawah untuk langsung menguji sistem online secara otomatis:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleDemoClick('Super Admin')}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold py-2.5 px-3 rounded-xl shadow-md transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 shrink-0 text-slate-950" />
                  <span>Demo Super Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoClick('Petugas Pelabuhan')}
                  disabled={submitting}
                  className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-bold py-2.5 px-3 rounded-xl transition transform active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4 shrink-0 text-sky-400" />
                  <span>Demo Petugas Manifes</span>
                </button>
              </div>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-700/80"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-400 font-medium uppercase tracking-wider">
                atau masuk manual
              </span>
              <div className="flex-grow border-t border-slate-700/80"></div>
            </div>

            {/* Standard Form */}
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email / Username Petugas
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="contoh: wisnujepara28@gmail.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border text-sm rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                      errors.email
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-700 focus:border-amber-400 focus:ring-amber-400/20'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 bg-slate-800/80 border text-sm rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition ${
                      errors.password
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-700 focus:border-amber-400 focus:ring-amber-400/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-rose-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition text-sm cursor-pointer disabled:opacity-50 mt-2"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk ke Sistem JAPARA</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Google Authentication */}
            <div className="mt-4 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-200 font-semibold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Masuk dengan Google (Akun Admin)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-slate-500">
          <p className="font-semibold text-slate-400 tracking-wider">
            PT JAPARA SAMUDERA LOGISTIK INDONESIA
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            Arsitektur Sinkronisasi Nyata Multi-User Cloud Firestore • Tanpa localStorage
          </p>
        </div>
      </div>
    </div>
  );
};
