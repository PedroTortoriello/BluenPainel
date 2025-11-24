'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Building, 
  Phone,
  CheckCircle,
  AlertCircle,
  Loader2,
  TrendingUp,
  Users,
  BarChart3
} from 'lucide-react'
import Image from 'next/image';


function App() {
  const [activeTab, setActiveTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    role: 'sdr'
  })

  // Form validation
  const [errors, setErrors] = useState({})

  // Clear message after 5 seconds
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password) => {
    return password.length >= 6
  }

  const validateLoginForm = () => {
    const newErrors = {}
    
    if (!loginForm.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!validateEmail(loginForm.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!loginForm.password) {
      newErrors.password = 'Senha é obrigatória'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateRegisterForm = () => {
    const newErrors = {}
    
    if (!registerForm.name) {
      newErrors.name = 'Nome é obrigatório'
    }
    
    if (!registerForm.email) {
      newErrors.email = 'Email é obrigatório'
    } else if (!validateEmail(registerForm.email)) {
      newErrors.email = 'Email inválido'
    }
    
    if (!registerForm.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (!validatePassword(registerForm.password)) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }
    
    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória'
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }
    
    if (!registerForm.company) {
      newErrors.company = 'Empresa é obrigatória'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle login
// Handle login
const handleLogin = async (e) => {
  e.preventDefault();

  if (!validateLoginForm()) return;

  setLoading(true);
  setMessage({ type: '', text: '' });

  try {
    const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    action: "login",
    email: loginForm.email,
    password: loginForm.password
  })
})


    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erro no login");
    }

    // sucesso
    setMessage({ type: "success", text: "Login realizado com sucesso! Redirecionando..." });

    // salva no localStorage
    localStorage.setItem("crm_token", data.token);
    localStorage.setItem("crm_user", JSON.stringify(data.user));

    // redireciona
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
  } catch (error) {
    setMessage({
      type: "error",
      text: error.message || "Erro ao realizar login",
    });
  } finally {
    setLoading(false);
  }
};

// Handle register
const handleRegister = async (e) => {
  e.preventDefault();

  if (!validateRegisterForm()) return;

  setLoading(true);
  setMessage({ type: "", text: "" });

  try {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "register",
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        company: registerForm.company,
        phone: registerForm.phone,
        role: registerForm.role,
      }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Erro ao criar conta");

    setMessage({
      type: "success",
      text: "Conta criada com sucesso! Faça login para continuar.",
    });

    // limpa o formulário
    setRegisterForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      company: "",
      phone: "",
      role: "sdr",
    });

    // alterna para a aba de login após sucesso
    setTimeout(() => setActiveTab("login"), 2000);
  } catch (error) {
    setMessage({
      type: "error",
      text: error.message || "Erro ao registrar usuário",
    });
  } finally {
    setLoading(false);
  }
};



  // Handle forgot password
  const handleForgotPassword = async () => {
    if (!loginForm.email) {
      setMessage({ type: 'error', text: 'Digite seu email primeiro' })
      return
    }
    
    if (!validateEmail(loginForm.email)) {
      setMessage({ type: 'error', text: 'Email inválido' })
      return
    }
    
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setMessage({ type: 'success', text: 'Instruções de recuperação enviadas para seu email!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao enviar email. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Header */}
<div className="flex justify-center mb-8">
  <Image 
    src='https://eaqifsfjoykjhcfcnibk.supabase.co/storage/v1/object/public/images/Logo.png'
    alt="Logo" 
    width={320} 
    height={320} 
    className="rounded" 
  />
</div>



        {/* Message Alert */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {message.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {message.type === 'info' && <TrendingUp className="w-5 h-5" />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="register">Criar Conta</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Login Tab */}
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                      />
                    </div>
                    {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        id="remember"
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={loginForm.rememberMe}
                        onChange={(e) => setLoginForm({...loginForm, rememberMe: e.target.checked})}
                      />
                      <Label htmlFor="remember" className="text-sm">Lembrar-me</Label>
                    </div>
                    <button
                      type="button"
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      onClick={handleForgotPassword}
                      disabled={loading}
                    >
                      Esqueci a senha
                    </button>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>

                {/* Demo credentials */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium mb-2">Credenciais de demonstração:</p>
                  <p className="text-xs text-gray-500">Email: admin@bluen.com</p>
                  <p className="text-xs text-gray-500">Senha: Bluen123</p>
                </div>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register" className="space-y-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Seu nome completo"
                          className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                        />
                      </div>
                      {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="seu@email.com"
                          className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                        />
                      </div>
                      {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="company"
                          type="text"
                          placeholder="Nome da sua empresa"
                          className={`pl-10 ${errors.company ? 'border-red-500' : ''}`}
                          value={registerForm.company}
                          onChange={(e) => setRegisterForm({...registerForm, company: e.target.value})}
                        />
                      </div>
                      {errors.company && <p className="text-sm text-red-600">{errors.company}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone (opcional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          className="pl-10"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Função</Label>
                      <select
                        id="role"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={registerForm.role}
                        onChange={(e) => setRegisterForm({...registerForm, role: e.target.value})}
                      >
                        <option value="sdr">SDR (Sales Development Representative)</option>
                        <option value="vendedor">Vendedor</option>
                        <option value="gerente">Gerente de Vendas</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reg-password">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className={`pl-10 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                        />
                      </div>
                      {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando conta...
                      </>
                    ) : (
                      'Criar Conta'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 Bluen. Todos os direitos reservados.
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600">Termos de Uso</a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600">Política de Privacidade</a>
            <a href="#" className="text-xs text-gray-400 hover:text-gray-600">Suporte</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
