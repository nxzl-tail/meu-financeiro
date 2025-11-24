import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Wallet, ArrowUpCircle, ArrowDownCircle, ChevronLeft, ChevronRight, Home, 
  Utensils, Car, Gamepad2, Plus, TrendingUp, TrendingDown, ShoppingBag, 
  HeartPulse, MoreHorizontal, ShoppingCart, Zap, Trash2, Edit2, Calendar, 
  Clock, Save, X, BarChart3, Droplets, Target, CreditCard, Menu, Activity, 
  PawPrint, ArrowLeft, CheckCircle2, CalendarDays, List, Repeat, Tags, 
  RotateCcw, Ban, Sun, Moon, AlertCircle, Pencil, CalendarRange, Divide, 
  Trophy, TrendingUp as TrendingIcon, Bell, AlertTriangle, Sparkles
} from 'lucide-react';

// --- UTILITÁRIOS ---
const formatCurrency = (value) => {
  const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeValue);
};

const getWeekRangeLabel = (date) => {
  const curr = new Date(date);
  const first = curr.getDate() - curr.getDay(); // Domingo
  const last = first + 6; // Sábado
  const firstDay = new Date(curr.setDate(first));
  const lastDay = new Date(curr.setDate(last));
  const options = { day: 'numeric', month: 'short' };
  return `${firstDay.toLocaleDateString('pt-BR', options)} - ${lastDay.toLocaleDateString('pt-BR', options)}`;
};

const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return weekNo;
}

const FinanceApp = () => {
  // --- ESTADOS GLOBAIS ---
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [theme, setTheme] = useState('dark');

  // --- CONTROLE DE DATA ---
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const yearListRef = useRef(null);
  
  // --- FORMULÁRIO ---
  const [type, setType] = useState('saida');
  const [rawValue, setRawValue] = useState(''); 
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Mercado');
  const [status, setStatus] = useState('pago');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState({});
  
  // --- RECORRÊNCIA ---
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState('installment');
  const [recurrenceCount, setRecurrenceCount] = useState('2');

  // --- GRÁFICOS ---
  const [chartScope, setChartScope] = useState('monthly'); 
  const [chartDate, setChartDate] = useState(new Date());

  // --- MODAIS E EDIÇÃO ---
  const [editingId, setEditingId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToToggle, setItemToToggle] = useState(null);
  
  // --- CATEGORIAS & METAS ---
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false); 
  const [newCategoryName, setNewCategoryName] = useState('');
  const [budgetCategory, setBudgetCategory] = useState(''); 
  const [budgetAmount, setBudgetAmount] = useState(''); 
  const [editingBudgetCategory, setEditingBudgetCategory] = useState(null);
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  // --- CORES E TEMAS ---
  const colors = {
    bg: theme === 'dark' ? 'bg-gray-950' : 'bg-[#FAF9F6]', 
    cardBg: theme === 'dark' ? 'bg-gray-900' : 'bg-white',
    cardBorder: theme === 'dark' ? 'border-gray-800' : 'border-stone-200',
    textMain: theme === 'dark' ? 'text-gray-100' : 'text-stone-800',
    textSec: theme === 'dark' ? 'text-gray-400' : 'text-stone-500',
    inputBg: theme === 'dark' ? 'bg-gray-800' : 'bg-stone-100',
    navBg: theme === 'dark' ? 'bg-gray-900' : 'bg-[#F5F5F0]',
    accent: 'bg-indigo-600',
    accentHover: 'hover:bg-indigo-700',
    errorBorder: 'border-red-500 ring-1 ring-red-500',
  };

  // --- CATEGORIAS ---
  const defaultCategories = {
    'Luz': { icon: Zap, color: 'bg-yellow-500', label: 'Luz' },
    'Água': { icon: Droplets, color: 'bg-blue-500', label: 'Água' },
    'Mercado': { icon: ShoppingCart, color: 'bg-emerald-500', label: 'Mercado' },
    'Comida': { icon: Utensils, color: 'bg-orange-500', label: 'Comida' },
    'Lazer': { icon: Gamepad2, color: 'bg-pink-500', label: 'Lazer' },
    'Casa': { icon: Home, color: 'bg-purple-500', label: 'Casa' },
    'Transporte': { icon: Car, color: 'bg-blue-600', label: 'Transporte' },
    'Compras': { icon: ShoppingBag, color: 'bg-indigo-500', label: 'Compras' },
    'Saúde': { icon: HeartPulse, color: 'bg-red-500', label: 'Saúde' },
    'PET': { icon: PawPrint, color: 'bg-orange-400', label: 'Pet' },
    'Outros': { icon: MoreHorizontal, color: 'bg-gray-500', label: 'Outros' },
    'Salário': { icon: Wallet, color: 'bg-green-500', label: 'Salário' },
    'Renda Extra': { icon: TrendingUp, color: 'bg-teal-500', label: 'Extra' },
    'Vale Refeição': { icon: CreditCard, color: 'bg-lime-500', label: 'Vale Ref.' }
  };

  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('finance_app_prod_categories_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(key => { parsed[key].icon = Tags; });
        return parsed;
      }
    } catch (e) { console.error(e); }
    return {};
  });

  // --- METAS DO USUÁRIO ---
  const [userBudgets, setUserBudgets] = useState(() => {
    try {
        const saved = localStorage.getItem('finance_app_prod_budgets_v1');
        return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  });

  const allCategories = { ...defaultCategories, ...customCategories };
  const expenseCategories = Object.keys(allCategories).filter(k => !['Salário', 'Renda Extra', 'Vale Refeição'].includes(k));
  const incomeCategories = ['Salário', 'Vale Refeição', 'Renda Extra'];
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const yearsRange = useMemo(() => {
    const startYear = 1900;
    const endYear = 2100;
    return Array.from({length: endYear - startYear + 1}, (_, i) => startYear + i);
  }, []);

  // --- DADOS (ZERADOS PARA PRODUÇÃO) ---
  const [transactions, setTransactions] = useState(() => {
    try {
        const saved = localStorage.getItem('finance_app_prod_data_v1'); 
        if (saved) return JSON.parse(saved);
    } catch(e) { console.error(e); }
    return []; 
  });

  // --- PERSISTÊNCIA ---
  useEffect(() => { localStorage.setItem('finance_app_prod_data_v1', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { 
      const toSave = {};
      Object.keys(customCategories).forEach(k => { toSave[k] = { ...customCategories[k], icon: null }; });
      localStorage.setItem('finance_app_prod_categories_v1', JSON.stringify(toSave)); 
  }, [customCategories]);
  useEffect(() => { localStorage.setItem('finance_app_prod_budgets_v1', JSON.stringify(userBudgets)); }, [userBudgets]);
  useEffect(() => {
    const savedTheme = localStorage.getItem('finance_app_theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);
  useEffect(() => { localStorage.setItem('finance_app_theme', theme); }, [theme]);

  // Auto-scroll date picker
  useEffect(() => {
    if (isDatePickerOpen && yearListRef.current) {
      setTimeout(() => {
        const yearElement = document.getElementById(`year-${currentYear}`);
        if (yearElement) yearElement.scrollIntoView({ behavior: 'auto', block: 'center' });
      }, 100);
    }
  }, [isDatePickerOpen]);

  // --- INPUT HELPERS ---
  const handleValueChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); 
    setRawValue(val);
    if (val && errors.amount) setErrors(prev => ({ ...prev, amount: false }));
  };
  const getDisplayValue = () => {
    if (!rawValue) return '';
    const numberVal = parseInt(rawValue) / 100;
    return numberVal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  const getFloatValue = () => {
    if (!rawValue) return 0;
    return parseInt(rawValue) / 100;
  };

  const handleUpdateBudget = () => {
    const val = parseFloat(newBudgetAmount);
    if (!isNaN(val) && val > 0) {
        const newBudgets = [...userBudgets];
        const idx = newBudgets.findIndex(b => b.category === editingBudgetCategory);
        if (idx >= 0) newBudgets[idx].amount = val;
        else newBudgets.push({ category: editingBudgetCategory, amount: val });
        setUserBudgets(newBudgets);
    }
    setEditingBudgetCategory(null);
    setNewBudgetAmount('');
  };

  useEffect(() => {
    if (editingId) {
        const t = transactions.find(tr => tr.id === editingId);
        if(t) {
            setRawValue(Math.round(t.amount * 100).toString());
            if (!allCategories[t.category]) setCategory(t.type === 'entrada' ? incomeCategories[0] : expenseCategories[0]);
        }
    }
  }, [editingId]); 

  const resetForm = () => {
    setRawValue(''); setDescription(''); setDueDate(''); setStatus('pago'); 
    setIsRecurring(false); setEditingId(null); setRecurrenceCount('2');
    setErrors({});
    setCategory(type === 'entrada' ? incomeCategories[0] : expenseCategories[0]);
  };

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  // --- NAVEGAÇÃO ---
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(prev => prev + 1); } 
    else { setCurrentMonth(prev => prev + 1); }
  };
  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(prev => prev - 1); } 
    else { setCurrentMonth(prev => prev - 1); }
  };
  const jumpToDate = (m, y) => { setCurrentMonth(m); setCurrentYear(y); setIsDatePickerOpen(false); };
  const jumpToToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setIsDatePickerOpen(false);
  };
  const nextChartPeriod = () => {
    const d = new Date(chartDate);
    if(chartScope === 'weekly') d.setDate(d.getDate() + 7);
    else if(chartScope === 'monthly') d.setMonth(d.getMonth() + 1);
    else if(chartScope === 'yearly') d.setFullYear(d.getFullYear() + 1);
    setChartDate(d);
  };
  const prevChartPeriod = () => {
    const d = new Date(chartDate);
    if(chartScope === 'weekly') d.setDate(d.getDate() - 7);
    else if(chartScope === 'monthly') d.setMonth(d.getMonth() - 1);
    else if(chartScope === 'yearly') d.setFullYear(d.getFullYear() - 1);
    setChartDate(d);
  };
  const getChartPeriodLabel = () => {
    if (chartScope === 'weekly') return getWeekRangeLabel(chartDate);
    if (chartScope === 'monthly') return `${months[chartDate.getMonth()]} ${chartDate.getFullYear()}`;
    if (chartScope === 'yearly') return `${chartDate.getFullYear()}`;
  };

  // --- CÁLCULOS ---
  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay(); 
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [currentMonth, currentYear]);

  const filteredTransactions = transactions.filter(t => t.month === currentMonth && t.year === currentYear);
  const totalIncome = filteredTransactions.filter(t => t.type === 'entrada').reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'saida').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalIncome - totalExpense;

  const alerts = useMemo(() => {
    const now = new Date();
    now.setHours(0,0,0,0);
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(now.getDate() + 3);
    return transactions
      .filter(t => t.type === 'saida' && t.status === 'pendente')
      .filter(t => {
         const tDate = new Date(t.date);
         tDate.setHours(0,0,0,0);
         return tDate < now || (tDate >= now && tDate <= threeDaysFromNow);
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [transactions]);

  const chartData = useMemo(() => {
    let relevant = [];
    let accumulatedBalance = 0;
    
    if (chartScope === 'weekly') {
        const curr = new Date(chartDate);
        const first = curr.getDate() - curr.getDay();
        const last = first + 6;
        const startOfWeek = new Date(curr.setDate(first)); startOfWeek.setHours(0,0,0,0);
        const endOfWeek = new Date(curr.setDate(last)); endOfWeek.setHours(23,59,59,999);

        relevant = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= startOfWeek && tDate <= endOfWeek;
        });

        const allUntilEnd = transactions.filter(t => new Date(t.date) <= endOfWeek);
        const inc = allUntilEnd.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0);
        const exp = allUntilEnd.filter(t => t.type === 'saida').reduce((acc, t) => acc + t.amount, 0);
        accumulatedBalance = inc - exp;

    } else if (chartScope === 'monthly') {
        relevant = transactions.filter(t => t.month === chartDate.getMonth() && t.year === chartDate.getFullYear());
        const endOfMonth = new Date(chartDate.getFullYear(), chartDate.getMonth() + 1, 0);
        const allUntilEnd = transactions.filter(t => new Date(t.date) <= endOfMonth);
        accumulatedBalance = allUntilEnd.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0) - allUntilEnd.filter(t => t.type === 'saida').reduce((acc, t) => acc + t.amount, 0);

    } else if (chartScope === 'yearly') {
        relevant = transactions.filter(t => t.year === chartDate.getFullYear());
        const endOfYear = new Date(chartDate.getFullYear(), 11, 31);
        const allUntilEnd = transactions.filter(t => new Date(t.date) <= endOfYear);
        accumulatedBalance = allUntilEnd.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0) - allUntilEnd.filter(t => t.type === 'saida').reduce((acc, t) => acc + t.amount, 0);
    }

    const income = relevant.filter(t => t.type === 'entrada').reduce((acc, t) => acc + t.amount, 0);
    const expense = relevant.filter(t => t.type === 'saida').reduce((acc, t) => acc + t.amount, 0);
    const periodFlow = income - expense;

    const cats = {};
    relevant.forEach(t => { 
        if (t.type === 'saida') cats[t.category] = (cats[t.category] || 0) + t.amount; 
    });
    const sortedCats = Object.entries(cats)
        .map(([cat, val]) => ({ cat, val }))
        .sort((a, b) => b.val - a.val);
    
    const maxVal = sortedCats.length > 0 ? sortedCats[0].val : 0;
    const chartItems = sortedCats.map(item => ({
        ...item,
        percent: maxVal > 0 ? (item.val / maxVal) * 100 : 0
    }));

    return { income, expense, periodFlow, accumulatedBalance, chartItems };
  }, [transactions, chartDate, chartScope]);

  const budgetStatus = useMemo(() => {
    const currentData = {};
    const currentMonthTransactions = transactions.filter(t => t.month === currentMonth && t.year === currentYear);
    currentMonthTransactions.forEach(t => { if (t.type === 'saida') currentData[t.category] = (currentData[t.category] || 0) + t.amount; });
    
    return userBudgets.map(budget => {
        const spent = currentData[budget.category] || 0;
        const limit = budget.amount;
        let percent = Math.min((spent / limit) * 100, 100);
        let color = 'bg-emerald-500';
        if (percent > 75) color = 'bg-yellow-500';
        if (percent >= 100) color = 'bg-red-500';
        return { cat: budget.category, spent, limit, percent, color };
    }).sort((a, b) => b.percent - a.percent);
  }, [transactions, userBudgets, currentMonth, currentYear]);

  const calculateAverage = (targetCategory) => {
    let total = 0;
    let count = 0;
    for (let i = 1; i <= 3; i++) {
      const targetDate = new Date(currentYear, currentMonth - i, 1);
      const targetM = targetDate.getMonth();
      const targetY = targetDate.getFullYear();
      const monthlyTransactions = transactions.filter(t => t.type === 'saida' && t.month === targetM && t.year === targetY && t.category === targetCategory);
      if (monthlyTransactions.length > 0) {
        total += monthlyTransactions.reduce((acc, t) => acc + t.amount, 0);
        count++; 
      }
    }
    return count === 0 ? 0 : total / count;
  };
  const avgLight = calculateAverage('Luz');
  const avgWater = calculateAverage('Água');
  const petStats = useMemo(() => {
    const allPet = transactions.filter(t => t.category === 'PET' && t.type === 'saida');
    return { total: allPet.reduce((acc, t) => acc + t.amount, 0), history: allPet.sort((a, b) => new Date(b.date) - new Date(a.date)) };
  }, [transactions]);

  // --- ACTIONS ---
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newCat = { [newCategoryName]: { icon: Tags, color: 'bg-gray-600', label: newCategoryName } };
    setCustomCategories({ ...customCategories, ...newCat });
    setCategory(newCategoryName); 
    setNewCategoryName('');
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (catName) => {
      const newCustom = { ...customCategories };
      delete newCustom[catName];
      setCustomCategories(newCustom);
      if (category === catName) setCategory(expenseCategories[0]);
  };

  const handleSaveBudget = () => {
    if(!budgetCategory || !budgetAmount) return;
    const val = parseFloat(budgetAmount);
    if(val <= 0) return;
    const newBudgets = [...userBudgets];
    const existingIndex = newBudgets.findIndex(b => b.category === budgetCategory);
    if(existingIndex >= 0) newBudgets[existingIndex].amount = val;
    else newBudgets.push({ category: budgetCategory, amount: val });
    setUserBudgets(newBudgets);
    setIsBudgetModalOpen(false); setBudgetCategory(''); setBudgetAmount('');
  };

  const handleDeleteBudget = (catName) => {
      setUserBudgets(userBudgets.filter(b => b.category !== catName));
  };

  const handleSaveTransaction = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!description.trim()) newErrors.description = true;
    const finalVal = getFloatValue();
    if (finalVal <= 0) newErrors.amount = true;
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const baseDate = dueDate ? new Date(dueDate + 'T12:00:00') : new Date();
    const newTransactions = [];

    if (isRecurring) {
      const count = parseInt(recurrenceCount) || 1;
      const installmentValue = recurrenceType === 'installment' ? finalVal / count : finalVal;
      const groupId = Date.now().toString();

      for (let i = 0; i < count; i++) {
        const nextDate = new Date(baseDate);
        nextDate.setMonth(baseDate.getMonth() + i); 
        const descSuffix = recurrenceType === 'installment' ? ` (${i+1}/${count})` : '';
        const uniqueId = `${groupId}-${i}-${Math.random().toString(36).substr(2,5)}`;
        newTransactions.push({
          id: uniqueId, groupId: groupId, type, amount: parseFloat(installmentValue.toFixed(2)),
          category, description: description + descSuffix, month: nextDate.getMonth(), year: nextDate.getFullYear(),
          status: type === 'entrada' ? 'pago' : status, date: nextDate.toISOString()
        });
      }
    } else {
      const uniqueId = editingId || `${Date.now()}-${Math.random().toString(36).substr(2,5)}`;
      newTransactions.push({
        id: uniqueId, type, amount: parseFloat(finalVal.toFixed(2)),
        category, description, month: baseDate.getMonth(), year: baseDate.getFullYear(),
        status: type === 'entrada' ? 'pago' : status, date: baseDate.toISOString()
      });
    }

    if (editingId) {
      if (isRecurring) {
        const filtered = transactions.filter(t => t.id !== editingId);
        setTransactions([...newTransactions, ...filtered]);
      } else {
        setTransactions(prev => prev.map(t => t.id === editingId ? newTransactions[0] : t));
      }
    } else {
      setTransactions(prev => [...newTransactions, ...prev]);
    }

    if (newTransactions.length > 0) { setCurrentMonth(baseDate.getMonth()); setCurrentYear(baseDate.getFullYear()); }
    resetForm();
  };

  const handleEdit = (t) => {
    setEditingId(t.id); setType(t.type); setDescription(t.description.replace(/\s\(\d+\/\d+\)$/, '')); 
    setCategory(t.category); setStatus(t.status); setDueDate(t.date ? t.date.split('T')[0] : '');
    setIsRecurring(false); setErrors({}); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const initiateStatusToggle = (t) => { if (t.type === 'entrada') return; setItemToToggle(t); setStatusModalOpen(true); };
  const confirmStatusToggle = () => {
    if (itemToToggle) {
      const newStatus = itemToToggle.status === 'pago' ? 'pendente' : 'pago';
      setTransactions(transactions.map(item => item.id === itemToToggle.id ? { ...item, status: newStatus } : item));
      setItemToToggle(null); setStatusModalOpen(false);
    }
  };
  const initiateDelete = (id) => { setItemToDelete(id); setDeleteModalOpen(true); };
  const confirmDelete = () => {
    setTransactions(transactions.filter(t => t.id !== itemToDelete));
    if (editingId === itemToDelete) resetForm();
    setDeleteModalOpen(false); setItemToDelete(null);
  };

  useEffect(() => {
    if (!editingId) setCategory(type === 'entrada' ? incomeCategories[0] : expenseCategories[0]);
  }, [type, editingId]);

  return (
    <div className={`min-h-screen ${colors.bg} ${colors.textMain} font-sans flex justify-center transition-colors duration-500`}>
      
      {/* MENU LATERAL */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          <div className={`relative ${colors.navBg} w-72 h-full shadow-2xl border-l ${colors.cardBorder} animate-in slide-in-from-right duration-300 flex flex-col p-6`}>
            <button onClick={() => setIsMenuOpen(false)} className={`absolute top-4 left-4 ${colors.textSec} hover:${colors.textMain} p-2`}><X size={28} /></button>
            <div className="flex items-center justify-between mb-10 mt-2">
                <button onClick={toggleTheme} className={`p-3 rounded-2xl ${colors.cardBg} border ${colors.cardBorder} ${colors.textSec} hover:${colors.textMain} hover:shadow-lg transition-all`}>{theme === 'dark' ? <Sun size={24}/> : <Moon size={24}/>}</button>
                <h2 className="text-2xl font-bold flex items-center gap-2">Finanças <Wallet className="text-indigo-500" size={28}/></h2>
            </div>
            <nav className="space-y-4">
              <button onClick={() => { setCurrentView('dashboard'); setIsMenuOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-lg ${colors.textSec} hover:${colors.cardBg} hover:${colors.textMain} transition-all active:scale-95 shadow-sm border border-transparent hover:${colors.cardBorder}`}><Home size={24} /> Início</button>
              <button onClick={() => { setCurrentView('goals'); setIsMenuOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-lg ${colors.textSec} hover:${colors.cardBg} hover:${colors.textMain} transition-all active:scale-95 shadow-sm border border-transparent hover:${colors.cardBorder}`}><Target size={24} /> Metas</button>
              <button onClick={() => { setCurrentView('charts'); setIsMenuOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-lg ${colors.textSec} hover:${colors.cardBg} hover:${colors.textMain} transition-all active:scale-95 shadow-sm border border-transparent hover:${colors.cardBorder}`}><BarChart3 size={24} /> Gráficos</button>
              <button onClick={() => { setCurrentView('averages'); setIsMenuOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-lg ${colors.textSec} hover:${colors.cardBg} hover:${colors.textMain} transition-all active:scale-95 shadow-sm border border-transparent hover:${colors.cardBorder}`}><Activity size={24} /> Médias</button>
              <button onClick={() => { setCurrentView('pet'); setIsMenuOpen(false); }} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold text-lg ${colors.textSec} hover:${colors.cardBg} hover:${colors.textMain} transition-all active:scale-95 shadow-sm border border-transparent hover:${colors.cardBorder}`}><PawPrint size={24} /> Gastos Pet</button>
            </nav>
          </div>
        </div>
      )}

      {/* MODAIS (DATA, CATEGORIA, DELETE, STATUS) */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
           <div className={`${colors.cardBg} rounded-3xl border ${colors.cardBorder} w-full max-w-xs p-6 shadow-2xl h-[550px] flex flex-col relative`}>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-bold">Período</h3>
                 <button onClick={() => setIsDatePickerOpen(false)} className={`p-2 rounded-full hover:bg-gray-500/10 ${colors.textSec}`}><X size={24}/></button>
              </div>
              <button onClick={jumpToToday} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold mb-6 transition-colors shadow-xl shadow-indigo-500/30 active:scale-95"><RotateCcw size={20} /> Ir para o Mês Atual</button>
              <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-500/30" ref={yearListRef}>
                 {yearsRange.map(year => (
                    <div key={year} id={`year-${year}`} className="mb-8 scroll-mt-4">
                       <h4 className={`font-bold text-xl mb-4 sticky top-0 ${colors.cardBg} z-10 py-2 border-b ${colors.cardBorder} ${year === currentYear ? 'text-indigo-500' : colors.textSec}`}>{year}</h4>
                       <div className="grid grid-cols-3 gap-3">
                          {months.map((m, idx) => (
                             <button key={`${year}-${idx}`} onClick={() => jumpToDate(idx, year)} className={`text-sm py-3 rounded-xl font-bold transition-all active:scale-90 ${currentMonth === idx && currentYear === year ? 'bg-indigo-600 text-white shadow-lg transform scale-105' : `${colors.inputBg} ${colors.textSec} hover:bg-gray-500/10`}`}>{m.substring(0, 3)}</button>
                          ))}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}
      
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className={`${colors.cardBg} rounded-3xl p-6 w-full max-w-sm border ${colors.cardBorder} shadow-2xl`}>
             <h3 className="text-xl font-bold mb-4">Nova Categoria</h3>
             <input type="text" placeholder="Nome (ex: Jogos)" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className={`w-full ${colors.inputBg} ${colors.textMain} p-4 rounded-2xl border ${colors.cardBorder} mb-6 outline-none focus:border-indigo-500 text-lg`} />
             <div className="flex gap-3">
               <button onClick={() => setIsCategoryModalOpen(false)} className="flex-1 py-3 bg-gray-500/20 rounded-xl font-bold">Cancelar</button>
               <button onClick={handleAddCategory} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20">Criar</button>
             </div>
           </div>
        </div>
      )}

      {isBudgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
           <div className={`${colors.cardBg} rounded-3xl p-6 w-full max-w-sm border ${colors.cardBorder} shadow-2xl`}>
             <h3 className="text-xl font-bold mb-4">Nova Meta</h3>
             <div className="space-y-4 mb-6">
                <div>
                    <label className={`text-xs font-bold ${colors.textSec} mb-1 block`}>Categoria</label>
                    <select value={budgetCategory} onChange={e => setBudgetCategory(e.target.value)} className={`w-full ${colors.inputBg} ${colors.textMain} p-3 rounded-xl border ${colors.cardBorder} outline-none`}>
                        <option value="">Selecione...</option>
                        {expenseCategories.map(cat => (!userBudgets.find(b => b.category === cat) ? <option key={cat} value={cat}>{cat}</option> : null))}
                    </select>
                </div>
                <div>
                    <label className={`text-xs font-bold ${colors.textSec} mb-1 block`}>Valor Limite (R$)</label>
                    <input type="number" placeholder="Ex: 500" value={budgetAmount} onChange={e => setBudgetAmount(e.target.value)} className={`w-full ${colors.inputBg} ${colors.textMain} p-3 rounded-xl border ${colors.cardBorder} outline-none`} />
                </div>
             </div>
             <div className="flex gap-3">
               <button onClick={() => setIsBudgetModalOpen(false)} className="flex-1 py-3 bg-gray-500/20 rounded-xl font-bold">Cancelar</button>
               <button onClick={handleSaveBudget} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20">Salvar</button>
             </div>
           </div>
        </div>
      )}

      {editingBudgetCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
           <div className={`${colors.cardBg} rounded-3xl p-6 w-full max-w-sm border ${colors.cardBorder} shadow-2xl`}>
             <h3 className="text-xl font-bold mb-2">Definir Meta</h3>
             <p className={`text-sm ${colors.textSec} mb-4`}>Quanto quer gastar com <strong>{editingBudgetCategory}</strong>?</p>
             <input type="number" placeholder="0.00" value={newBudgetAmount} onChange={e => setNewBudgetAmount(e.target.value)} className={`w-full ${colors.inputBg} ${colors.textMain} p-4 rounded-2xl border ${colors.cardBorder} mb-6 outline-none focus:border-indigo-500 text-2xl font-bold text-center`} autoFocus/>
             <div className="flex gap-3">
               <button onClick={() => setEditingBudgetCategory(null)} className="flex-1 py-3 bg-gray-500/20 rounded-xl font-bold">Cancelar</button>
               <button onClick={handleUpdateBudget} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20">Salvar</button>
             </div>
           </div>
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className={`${colors.cardBg} rounded-3xl p-6 w-full max-w-sm border ${colors.cardBorder} shadow-2xl text-center`}>
            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Trash2 size={32} className="text-red-500" /></div>
            <h3 className="text-xl font-bold mb-2">Apagar Item?</h3>
            <div className="flex gap-3 w-full mt-4">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-3 bg-gray-500/20 rounded-xl font-bold">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-500/30">Apagar</button>
            </div>
          </div>
        </div>
      )}

      {statusModalOpen && itemToToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className={`${colors.cardBg} rounded-3xl p-6 w-full max-w-sm border ${colors.cardBorder} shadow-2xl text-center`}>
            <div className={`${itemToToggle.status === 'pago' ? 'bg-yellow-500/10' : 'bg-emerald-500/10'} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                {itemToToggle.status === 'pago' ? <Clock size={32} className="text-yellow-500"/> : <CheckCircle2 size={32} className="text-emerald-500"/>}
            </div>
            <h3 className="text-lg font-bold mb-1">Alterar Status?</h3>
            <p className={`text-sm ${colors.textSec} mb-6`}>Mudar <strong>{itemToToggle.description}</strong> para <span className={`font-bold ml-1 ${itemToToggle.status === 'pago' ? 'text-yellow-500' : 'text-emerald-500'}`}>{itemToToggle.status === 'pago' ? 'PENDENTE' : 'PAGO'}</span>?</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => { setStatusModalOpen(false); setItemToToggle(null); }} className="flex-1 py-3 bg-gray-500/20 rounded-xl font-bold">Cancelar</button>
              <button onClick={confirmStatusToggle} className={`flex-1 py-3 text-white rounded-xl font-bold shadow-lg ${itemToToggle.status === 'pago' ? 'bg-yellow-500 shadow-yellow-500/30' : 'bg-emerald-600 shadow-emerald-600/30'}`}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* --- APP PRINCIPAL --- */}
      <div className={`w-full max-w-md ${colors.bg} min-h-screen flex flex-col relative shadow-2xl border-x ${colors.cardBorder} transition-colors duration-500`}>
        
        {/* HEADER */}
        <header className={`pt-6 pb-4 px-6 flex items-center justify-between ${colors.navBg} sticky top-0 z-20 border-b ${colors.cardBorder}`}>
          <div className="flex-1 flex items-center gap-3">
            {currentView === 'dashboard' ? (
               <div className="flex items-center gap-2 w-full">
                 <button onClick={prevMonth} className={`p-2 rounded-full ${colors.textSec} hover:${colors.cardBg} hover:${colors.textMain} transition-colors active:scale-90`}><ChevronLeft size={24} /></button>
                 <button onClick={() => setIsDatePickerOpen(true)} className={`flex flex-col items-center flex-1 hover:bg-gray-500/10 rounded-xl py-1 transition-all active:scale-95`}>
                   <span className="text-xl font-bold leading-none">{months[currentMonth]}</span>
                   <span className={`text-xs ${colors.textSec} font-medium mt-0.5`}>{currentYear}</span>
                 </button>
                 <button onClick={nextMonth} className={`p-2 rounded-full ${colors.textSec} hover:${colors.cardBg} hover:${colors.textMain} transition-colors active:scale-90`}><ChevronRight size={24} /></button>
                 <button onClick={() => setViewMode(prev => prev === 'list' ? 'calendar' : 'list')} className={`p-2 ml-2 rounded-xl transition-all active:scale-90 ${viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : `${colors.textSec} hover:bg-gray-500/10`}`}>{viewMode === 'list' ? <CalendarDays size={24} /> : <List size={24} />}</button>
               </div>
            ) : (
               <div className="flex items-center gap-3">
                 <button onClick={() => setCurrentView('dashboard')} className={`p-2 ${colors.cardBg} border ${colors.cardBorder} rounded-full hover:bg-gray-500/10 transition-all active:scale-90`}><ArrowLeft size={24} /></button>
                 <span className="text-xl font-bold">
                    {currentView === 'goals' && "Metas"}
                    {currentView === 'charts' && "Gráficos"}
                    {currentView === 'averages' && "Médias"}
                    {currentView === 'pet' && "Espaço Pet"}
                 </span>
               </div>
            )}
          </div>
          <button onClick={() => setIsMenuOpen(true)} className={`p-2 -mr-2 ${colors.textSec} hover:bg-gray-500/10 rounded-xl transition-colors active:scale-90`}><Menu size={32} /></button>
        </header>

        <div className="flex-1 animate-in fade-in duration-300">
          {currentView === 'dashboard' && (
            <>
              {/* ALARMES */}
              {alerts.length > 0 && (
                  <div className="px-6 pt-4 animate-in slide-in-from-top-2">
                      <div className={`${colors.cardBg} border-l-4 ${colors.cardBorder} rounded-r-xl p-4 shadow-lg flex items-start gap-3 relative overflow-hidden`}>
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${alerts.some(a => new Date(a.date) < new Date().setHours(0,0,0,0)) ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
                          <Bell className={alerts.some(a => new Date(a.date) < new Date().setHours(0,0,0,0)) ? 'text-red-500' : 'text-yellow-500'} size={20} />
                          <div className="flex-1">
                              <h4 className={`text-sm font-bold ${colors.textMain} mb-1`}>Atenção às Contas!</h4>
                              <div className="space-y-1">
                                  {alerts.slice(0, 2).map(a => {
                                      const isLate = new Date(a.date) < new Date().setHours(0,0,0,0);
                                      return (
                                          <div key={a.id} className="flex justify-between text-xs">
                                              <span className={`${colors.textSec} truncate max-w-[150px]`}>{a.description}</span>
                                              <span className={`font-bold ${isLate ? 'text-red-500' : 'text-yellow-500'}`}>{isLate ? 'VENCEU' : new Date(a.date).toLocaleDateString('pt-BR', {day: '2-digit', month: 'short'})}</span>
                                          </div>
                                      );
                                  })}
                                  {alerts.length > 2 && <p className="text-[10px] text-gray-500 text-center mt-1">e mais {alerts.length - 2}...</p>}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* DASHBOARD: SALDO */}
              {viewMode === 'list' && (
                <div className="px-6 space-y-6 mb-8">
                  {/* CARD SALDO */}
                  <div className={`${colors.cardBg} rounded-[2rem] p-6 shadow-xl border ${colors.cardBorder} relative overflow-hidden mt-4`}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600 rounded-full mix-blend-overlay filter blur-3xl opacity-10"></div>
                    <div className="relative z-10">
                        <p className={`${colors.textSec} text-xs font-bold uppercase tracking-widest mb-2`}>Saldo Previsto</p>
                        <h1 className={`text-4xl font-black mb-6 tracking-tight ${balance >= 0 ? colors.textMain : 'text-red-500'}`}>{formatCurrency(balance)}</h1>
                        <div className="grid grid-cols-2 gap-4">
                        <div className={`${colors.bg} p-4 rounded-2xl border ${colors.cardBorder}`}>
                            <div className="flex items-center gap-2 mb-1"><div className="bg-emerald-500/20 p-1.5 rounded-lg"><ArrowUpCircle size={16} className="text-emerald-500" /></div><span className={`text-xs font-bold ${colors.textSec}`}>Entradas</span></div>
                            <span className="text-lg font-bold text-emerald-500 block truncate">{formatCurrency(totalIncome)}</span>
                        </div>
                        <div className={`${colors.bg} p-4 rounded-2xl border ${colors.cardBorder}`}>
                            <div className="flex items-center gap-2 mb-1"><div className="bg-rose-500/20 p-1.5 rounded-lg"><ArrowDownCircle size={16} className="text-rose-500" /></div><span className={`text-xs font-bold ${colors.textSec}`}>Saídas</span></div>
                            <span className="text-lg font-bold text-rose-500 block truncate">{formatCurrency(totalExpense)}</span>
                        </div>
                        </div>
                    </div>
                  </div>

                  {/* FORMULÁRIO DE INSERÇÃO */}
                  <div className={`${colors.cardBg} rounded-[2rem] p-5 border ${editingId ? 'border-indigo-500 ring-2 ring-indigo-500/20' : colors.cardBorder} shadow-lg transition-all`}>
                    <div className="flex justify-between items-center mb-5">
                        <h3 className={`text-xs font-bold uppercase tracking-wider ${colors.textSec}`}>{editingId ? 'Editando Lançamento' : 'Novo Lançamento'}</h3>
                        {editingId && (
                            <button onClick={resetForm} className="text-xs bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-red-500/20 transition-colors">
                                <Ban size={12} /> Cancelar
                            </button>
                        )}
                    </div>
                    
                    {/* TIPO TOGGLE (SEGMENTED) */}
                    <div className={`flex ${colors.inputBg} p-1.5 rounded-2xl mb-6`}>
                      <button onClick={() => setType('entrada')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all ${type === 'entrada' ? 'bg-emerald-500 text-white shadow-md' : `${colors.textSec} hover:${colors.textMain}`}`}><TrendingUp size={20} /> Entradas</button>
                      <button onClick={() => setType('saida')} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-bold transition-all ${type === 'saida' ? 'bg-rose-500 text-white shadow-md' : `${colors.textSec} hover:${colors.textMain}`}`}><TrendingDown size={20} /> Saídas</button>
                    </div>

                    <form onSubmit={handleSaveTransaction} className="space-y-6">
                      {/* INPUT GIGANTE */}
                      <div className="flex justify-center mb-2">
                          <div className="flex items-baseline gap-1 relative">
                            <span className={`text-2xl font-medium ${colors.textSec}`}>R$</span>
                            <input 
                                type="text" 
                                inputMode="numeric"
                                value={getDisplayValue()} 
                                onChange={handleValueChange}
                                placeholder="0,00"
                                className={`text-5xl font-bold bg-transparent ${colors.textMain} outline-none placeholder-gray-700 w-full text-center max-w-[280px] ${errors.amount ? 'text-red-500 placeholder-red-500/50 animate-pulse' : ''}`}
                            />
                            {errors.amount && <AlertCircle size={16} className="text-red-500 absolute -right-6 top-4" />}
                          </div>
                      </div>

                      {/* CATEGORIAS */}
                      <div className="grid grid-cols-4 gap-2">
                        {(type === 'entrada' ? incomeCategories : expenseCategories).map((key) => {
                          const data = allCategories[key] || defaultCategories['Outros'];
                          const isSelected = category === key;
                          const isCustom = customCategories[key] !== undefined;
                          return (
                            <div key={key} className="relative group">
                                <button type="button" onClick={() => setCategory(key)} className={`w-full flex flex-col items-center justify-center p-2 rounded-2xl transition-all border-2 ${isSelected ? `bg-indigo-500/10 border-indigo-500 text-indigo-500 scale-105` : `${colors.inputBg} border-transparent ${colors.textSec} hover:bg-gray-500/10`}`}>
                                  {data.icon ? <data.icon size={24} className={`mb-2 ${isSelected ? 'text-indigo-500' : data.color.replace('bg-', 'text-')}`} /> : <Tags size={24} className="mb-2 text-gray-500"/>}
                                  <span className="text-[9px] font-bold uppercase tracking-wide truncate w-full">{data.label}</span>
                                </button>
                                {isCustom && <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteCategory(key); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>}
                            </div>
                          );
                        })}
                        {type === 'saida' && <button type="button" onClick={() => setIsCategoryModalOpen(true)} className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 border-dashed ${colors.cardBorder} ${colors.textSec} hover:bg-gray-500/10 opacity-70`}><Plus size={24} className="mb-2" /><span className="text-[9px] font-bold uppercase">Novo</span></button>}
                      </div>

                      <div className="flex gap-3">
                          {type === 'saida' && (
                            <div className={`flex flex-1 bg-${colors.bg} rounded-2xl p-1 border ${colors.cardBorder}`}>
                               <button type="button" onClick={() => setStatus('pago')} className={`flex-1 flex flex-col items-center justify-center rounded-xl py-3 transition-all ${status === 'pago' ? 'bg-emerald-500 text-white shadow-md' : `${colors.textSec} hover:${colors.textMain}`}`}><CheckCircle2 size={20} className="mb-1"/><span className="text-[9px] font-bold uppercase">Pago</span></button>
                               <button type="button" onClick={() => setStatus('pendente')} className={`flex-1 flex flex-col items-center justify-center rounded-xl py-3 transition-all ${status === 'pendente' ? 'bg-yellow-500 text-white shadow-md' : `${colors.textSec} hover:${colors.textMain}`}`}><Clock size={20} className="mb-1"/><span className="text-[9px] font-bold uppercase">Pendente</span></button>
                            </div>
                          )}
                          <div className={`flex-1 ${colors.inputBg} p-3 rounded-2xl border border-${colors.cardBorder} flex flex-col justify-center`}>
                             <span className={`text-[10px] font-bold uppercase ${colors.textSec} mb-1 pl-1`}>{status === 'pendente' ? 'Vencimento' : 'Data'}</span>
                             <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={`bg-transparent ${colors.textMain} text-sm font-bold outline-none w-full`} />
                          </div>
                      </div>

                      {/* Recorrência */}
                      <div className={`${colors.inputBg} p-4 rounded-2xl border ${colors.cardBorder}`}>
                          <div className="flex justify-between items-center mb-3">
                             <div className="flex items-center gap-2"><div className={`p-1.5 rounded-lg ${isRecurring ? 'bg-indigo-600 text-white' : 'bg-gray-500/20 text-gray-500'}`}><Repeat size={18} /></div><span className={`text-sm font-bold ${colors.textMain}`}>Repetir Lançamento</span></div>
                             <button type="button" onClick={() => setIsRecurring(!isRecurring)} className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${isRecurring ? 'bg-indigo-600' : 'bg-gray-500/30'}`}><div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isRecurring ? 'translate-x-6' : 'translate-x-0'}`}></div></button>
                          </div>
                          {isRecurring && (
                            <div className="animate-in slide-in-from-top-4 pt-2 space-y-3">
                               <div className={`flex gap-2`}>
                                  <button type="button" onClick={() => setRecurrenceType('fixed')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${recurrenceType === 'fixed' ? `border-indigo-500 bg-indigo-500/10 ${colors.textMain}` : `${colors.cardBorder} ${colors.textSec} hover:bg-gray-500/10`}`}><CalendarRange size={20} className="mb-1"/><span className="text-xs font-bold">Fixo</span><span className="text-[8px] opacity-70">Assinatura / Mensal</span></button>
                                  <button type="button" onClick={() => setRecurrenceType('installment')} className={`flex-1 flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${recurrenceType === 'installment' ? `border-indigo-500 bg-indigo-500/10 ${colors.textMain}` : `${colors.cardBorder} ${colors.textSec} hover:bg-gray-500/10`}`}><Divide size={20} className="mb-1"/><span className="text-xs font-bold">Parcelado</span><span className="text-[8px] opacity-70">Compra em X vezes</span></button>
                               </div>
                               <div className="flex items-center justify-between bg-gray-500/10 rounded-xl px-4 py-3">
                                  <span className={`text-xs font-bold ${colors.textSec}`}>Duração (Meses):</span>
                                  <div className="flex items-center gap-4"><button type="button" onClick={() => setRecurrenceCount(Math.max(2, parseInt(recurrenceCount) - 1).toString())} className={`p-1.5 rounded-full hover:bg-gray-500/20 ${colors.textMain}`}><ChevronLeft size={20}/></button><span className={`text-xl font-bold ${colors.textMain} w-10 text-center`}>{recurrenceCount}</span><button type="button" onClick={() => setRecurrenceCount((parseInt(recurrenceCount) + 1).toString())} className={`p-1.5 rounded-full hover:bg-gray-500/20 ${colors.textMain}`}><ChevronRight size={20}/></button></div>
                               </div>
                               {editingId && <p className="text-[10px] text-orange-500 font-bold text-center bg-orange-500/10 py-2 rounded-lg">⚠️ Editar aqui irá recriar toda a série.</p>}
                            </div>
                          )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <input 
                            type="text" 
                            placeholder={type === 'entrada' ? "Descrição (ex: Venda)" : "Descrição (ex: Luz)"} 
                            value={description} 
                            onChange={(e) => { setDescription(e.target.value); if (errors.description) setErrors(prev => ({ ...prev, description: false })); }} 
                            className={`${colors.inputBg} ${colors.textMain} p-4 rounded-2xl border ${errors.description ? colors.errorBorder : colors.cardBorder} flex-1 placeholder-gray-500 outline-none focus:border-indigo-500 font-medium transition-all`} 
                        />
                        <button type="submit" className={`px-6 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-bold transition-transform active:scale-95 ${colors.accent} ${colors.accentHover}`}>{editingId ? <Save size={24} /> : <Plus size={32} />}</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* LISTA DE TRANSAÇÕES */}
              {viewMode === 'list' && (
                <div className="flex-1 px-6 pb-24">
                  <div className="flex items-center justify-between mb-4 mt-2">
                    <h3 className={`text-lg font-bold ${colors.textMain}`}>Lançamentos</h3>
                    <span className={`text-xs font-bold ${colors.cardBg} px-2.5 py-1 rounded-lg border ${colors.cardBorder} ${colors.textSec}`}>{filteredTransactions.length}</span>
                  </div>
                  <div className="space-y-3">
                    {filteredTransactions.length === 0 ? (
                      <div className={`text-center py-12 flex flex-col items-center justify-center opacity-40 ${colors.textSec}`}>
                        <Wallet size={48} className="mb-4" />
                        <p className="font-medium">Nada por aqui neste mês.</p>
                      </div>
                    ) : filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map((t) => {
                      const CatInfo = allCategories[t.category] || defaultCategories['Outros'];
                      const dateObj = new Date(t.date);
                      const displayDate = `${dateObj.getUTCDate()}/${dateObj.getUTCMonth()+1}`;
                      const isLate = t.status === 'pendente' && new Date(t.date) < new Date().setHours(0,0,0,0);

                      return (
                        <div key={t.id} className={`${colors.cardBg} p-4 rounded-3xl border flex items-center gap-4 relative overflow-hidden shadow-sm ${isLate ? 'border-red-500/50 bg-red-500/5' : colors.cardBorder}`}>
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${t.type === 'entrada' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                          <div className={`p-3 rounded-2xl ${CatInfo.color} text-white shadow-md`}>{CatInfo.icon ? <CatInfo.icon size={20} /> : <Tags size={20}/>}</div>
                          <div className="flex-1">
                            <p className={`font-bold text-base leading-tight ${colors.textMain}`}>{t.description}</p>
                            <div className="flex items-center gap-2 mt-1.5"><span className={`text-xs font-bold ${colors.textSec} flex items-center gap-1`}><CalendarDays size={12} /> {displayDate}</span>{isLate && <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold tracking-wide">VENCIDO</span>}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`font-black text-sm ${t.type === 'entrada' ? 'text-emerald-500' : 'text-rose-500'}`}>{t.type === 'entrada' ? '+' : '-'} {formatCurrency(t.amount)}</span>
                            {t.type === 'saida' && (
                              <button onClick={() => initiateStatusToggle(t)} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${t.status === 'pago' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'}`}>{t.status === 'pago' ? <CheckCircle2 size={12} /> : <Clock size={12} />} {t.status === 'pago' ? 'PAGO' : 'PENDENTE'}</button>
                            )}
                          </div>
                          <div className={`flex flex-col gap-3 pl-3 border-l ${colors.cardBorder} ml-1`}>
                             <button onClick={() => handleEdit(t)} className={`${colors.textSec} hover:text-indigo-500`}><Edit2 size={16} /></button>
                             <button onClick={() => initiateDelete(t.id)} className={`${colors.textSec} hover:text-red-500`}><Trash2 size={16} /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* MODO CALENDÁRIO */}
              {viewMode === 'calendar' && (
                <div className="flex-1 px-4 pb-24 mt-4 animate-in fade-in zoom-in-95 duration-300">
                   <div className={`${colors.cardBg} rounded-3xl p-5 border ${colors.cardBorder} shadow-xl`}>
                      <div className="grid grid-cols-7 gap-1 mb-4 text-center">
                         {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => <span key={i} className={`text-xs font-bold ${i === 0 || i === 6 ? 'text-indigo-500' : colors.textSec}`}>{d}</span>)}
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((day, idx) => {
                           if (day === null) return <div key={idx} className="aspect-square"></div>;
                           const dayTransactions = filteredTransactions.filter(t => new Date(t.date).getUTCDate() === day);
                           const hasIncome = dayTransactions.some(t => t.type === 'entrada');
                           const hasPaidExpense = dayTransactions.some(t => t.type === 'saida' && t.status === 'pago');
                           const hasPendingExpense = dayTransactions.some(t => t.type === 'saida' && t.status === 'pendente' && new Date(t.date) >= new Date().setHours(0,0,0,0));
                           const hasOverdue = dayTransactions.some(t => t.type === 'saida' && t.status === 'pendente' && new Date(t.date) < new Date().setHours(0,0,0,0));

                           return (
                             <div key={idx} className={`aspect-square ${colors.inputBg} rounded-2xl flex flex-col items-center justify-center relative border ${colors.cardBorder} shadow-sm`}>
                                <span className={`text-sm ${day === new Date().getDate() && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear() ? 'text-white font-bold bg-indigo-600 w-7 h-7 rounded-full flex items-center justify-center shadow-lg' : `${colors.textMain} font-medium`}`}>{day}</span>
                                <div className="flex gap-1 mt-1.5">
                                   {hasOverdue && <div className="w-1.5 h-1.5 rounded-full bg-red-500 ring-1 ring-red-500 animate-pulse"></div>}
                                   {!hasOverdue && hasPendingExpense && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>}
                                   {hasPaidExpense && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>}
                                   {hasIncome && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                                </div>
                             </div>
                           );
                        })}
                      </div>
                      <div className="flex justify-center gap-3 mt-4 flex-wrap">
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className={`text-[9px] font-bold uppercase ${colors.textSec}`}>Entrada</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className={`text-[9px] font-bold uppercase ${colors.textSec}`}>Pago</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500"></div><span className={`text-[9px] font-bold uppercase ${colors.textSec}`}>Pendente</span></div>
                          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div><span className={`text-[9px] font-bold uppercase ${colors.textSec}`}>Vencido</span></div>
                      </div>
                   </div>
                </div>
              )}
            </>
          )}

          {/* TELA: GRÁFICOS AVANÇADOS */}
          {currentView === 'charts' && (
            <div className="p-6">
              <div className={`flex items-center justify-between mb-6 ${colors.cardBg} p-2 rounded-2xl border ${colors.cardBorder}`}>
                  <button onClick={prevChartPeriod} className={`p-2 rounded-xl ${colors.textSec} hover:bg-gray-500/10`}><ChevronLeft size={20}/></button>
                  <div className="text-center"><span className={`text-xs font-bold uppercase ${colors.textSec}`}>Período</span><p className={`text-sm font-bold ${colors.textMain}`}>{getChartPeriodLabel()}</p></div>
                  <button onClick={nextChartPeriod} className={`p-2 rounded-xl ${colors.textSec} hover:bg-gray-500/10`}><ChevronRight size={20}/></button>
              </div>

              <div className={`flex ${colors.inputBg} p-1 rounded-xl mb-6`}>
                  <button onClick={() => setChartScope('weekly')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${chartScope === 'weekly' ? `${colors.cardBg} ${colors.textMain} shadow-sm` : colors.textSec}`}>Semanal</button>
                  <button onClick={() => setChartScope('monthly')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${chartScope === 'monthly' ? `${colors.cardBg} ${colors.textMain} shadow-sm` : colors.textSec}`}>Mensal</button>
                  <button onClick={() => setChartScope('yearly')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${chartScope === 'yearly' ? `${colors.cardBg} ${colors.textMain} shadow-sm` : colors.textSec}`}>Anual</button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className={`${colors.cardBg} p-3 rounded-2xl border ${colors.cardBorder} text-center`}><span className={`text-[10px] font-bold uppercase ${colors.textSec}`}>Entradas</span><p className="text-emerald-500 font-bold text-xs truncate">{formatCurrency(chartData.income)}</p></div>
                  <div className={`${colors.cardBg} p-3 rounded-2xl border ${colors.cardBorder} text-center`}><span className={`text-[10px] font-bold uppercase ${colors.textSec}`}>Saídas</span><p className="text-rose-500 font-bold text-xs truncate">{formatCurrency(chartData.expense)}</p></div>
                  <div className={`${colors.cardBg} p-3 rounded-2xl border ${colors.cardBorder} text-center`}><span className={`text-[10px] font-bold uppercase ${colors.textSec}`}>Acumulado</span><p className={`${chartData.accumulatedBalance >= 0 ? colors.textMain : 'text-red-500'} font-bold text-xs truncate`}>{formatCurrency(chartData.accumulatedBalance)}</p></div>
              </div>

              <div className={`${colors.cardBg} rounded-[2rem] p-6 border ${colors.cardBorder} shadow-xl`}>
                <h3 className={`text-sm mb-6 font-bold uppercase ${colors.textSec} tracking-wider`}>Detalhamento</h3>
                <div className="space-y-6">
                  {chartData.chartItems.length === 0 ? (
                      <p className={`text-center text-sm ${colors.textSec} py-4`}>Sem dados para este período.</p>
                  ) : chartData.chartItems.map((item, index) => {
                     const catInfo = allCategories[item.cat] || defaultCategories['Outros'];
                     return (
                      <div key={item.cat} className="flex items-center gap-4">
                          <span className={`text-sm font-black w-6 ${colors.textSec}`}>#{index + 1}</span>
                          <div className={`p-2 rounded-xl ${catInfo.color} bg-opacity-20`}>{catInfo.icon ? <catInfo.icon size={18} className={colors.textMain} /> : <Tags size={18}/>}</div>
                          <div className="flex-1">
                            <div className="flex justify-between text-sm font-bold mb-1.5"><span className={colors.textMain}>{item.cat}</span><span className={colors.textSec}>{formatCurrency(item.val)}</span></div>
                            <div className={`w-full ${colors.inputBg} rounded-full h-2 overflow-hidden`}><div className={`h-full ${catInfo.color} opacity-80 rounded-full`} style={{ width: `${item.percent}%` }}></div></div>
                          </div>
                      </div>
                     );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TELA: MÉDIAS */}
          {currentView === 'averages' && (
             <div className="p-6 space-y-6">
                <div className={`${colors.cardBg} p-6 rounded-[2rem] border ${colors.cardBorder} flex items-center justify-between shadow-lg`}><div><p className="text-yellow-500 font-bold flex items-center gap-2 text-lg"><Zap size={24}/> Luz (Média)</p><p className={`text-xs mt-1 mb-2 ${colors.textSec} font-medium`}>Base: Últimos 3 meses</p><p className={`text-4xl font-black mt-1 ${colors.textMain}`}>{formatCurrency(avgLight)}</p></div></div>
                <div className={`${colors.cardBg} p-6 rounded-[2rem] border ${colors.cardBorder} flex items-center justify-between shadow-lg`}><div><p className="text-blue-500 font-bold flex items-center gap-2 text-lg"><Droplets size={24}/> Água (Média)</p><p className={`text-xs mt-1 mb-2 ${colors.textSec} font-medium`}>Base: Últimos 3 meses</p><p className={`text-4xl font-black mt-1 ${colors.textMain}`}>{formatCurrency(avgWater)}</p></div></div>
             </div>
          )}

          {/* TELA: METAS */}
          {currentView === 'goals' && (
            <div className="p-6">
               <div className={`${colors.cardBg} p-6 rounded-[2rem] border ${colors.cardBorder} shadow-xl`}>
                  <div className="flex justify-between items-center mb-6">
                      <h3 className={`text-sm font-bold uppercase ${colors.textSec} tracking-wider`}>Suas Metas</h3>
                      <button onClick={() => setIsBudgetModalOpen(true)} className={`text-xs font-bold ${colors.accentText} border border-${colors.accent} px-3 py-1 rounded-lg`}>+ Nova Meta</button>
                  </div>
                  <div className="space-y-8">
                    {budgetStatus.map((b) => {
                      const catInfo = allCategories[b.cat];
                      if(!catInfo) return null;
                      return (
                        <div key={b.cat} className="w-full group relative">
                          <div className="flex justify-between items-end mb-2">
                             <div className="flex items-center gap-3"><div className={`${colors.inputBg} p-2 rounded-xl`}>{catInfo.icon ? <catInfo.icon size={18} className={colors.textMain}/> : <Tags size={18}/>}</div> <span className={`text-base font-bold ${colors.textMain}`}>{b.cat}</span></div>
                             <span className={`text-xs font-bold ${colors.textSec}`}>{formatCurrency(b.spent)} <span className="opacity-50">/ {formatCurrency(b.limit)}</span></span>
                          </div>
                          <div className={`w-full ${colors.inputBg} rounded-full h-3 overflow-hidden`}><div className={`h-full ${b.color} rounded-full shadow-lg transition-all duration-500`} style={{ width: `${b.percent}%` }}></div></div>
                          <button onClick={() => { setEditingBudgetCategory(b.cat); setNewBudgetAmount(b.limit.toString()); }} className="absolute -right-2 -top-2 bg-indigo-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Pencil size={10}/></button>
                          <button onClick={() => handleDeleteBudget(b.cat)} className="absolute -right-8 -top-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                        </div>
                      );
                    })}
                    {budgetStatus.length === 0 && <p className={`text-center text-sm ${colors.textSec}`}>Nenhuma meta definida.</p>}
                  </div>
               </div>
            </div>
          )}

          {/* TELA: PET */}
          {currentView === 'pet' && (
            <div className="p-6">
              <div className="bg-orange-500 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden mb-8">
                  <div className="absolute -bottom-10 -right-10 text-orange-700 opacity-20 transform rotate-12"><PawPrint size={180} /></div>
                  <p className="text-orange-100 text-xs font-bold uppercase mb-2 tracking-widest">Total investido</p>
                  <h1 className="text-5xl font-black text-white tracking-tight">{formatCurrency(petStats.total)}</h1>
              </div>
              <div className="space-y-4">
                  {petStats.history.length === 0 ? (
                      <div className={`text-center py-12 ${colors.textSec}`}>
                          <PawPrint size={48} className="mx-auto mb-4 opacity-50" />
                          <p>Nenhum gasto com pet registrado.</p>
                      </div>
                  ) : petStats.history.map((t) => (
                    <div key={t.id} className={`${colors.cardBg} p-4 rounded-3xl border ${colors.cardBorder} flex justify-between items-center shadow-sm`}>
                      <div className="flex items-center gap-4"><div className="bg-orange-500/10 p-3 rounded-2xl"><PawPrint size={20} className="text-orange-500" /></div><div><p className={`font-bold text-base ${colors.textMain}`}>{t.description}</p><p className={`text-xs font-medium ${colors.textSec}`}>{new Date(t.date).toLocaleDateString()}</p></div></div>
                      <span className="font-black text-orange-500 text-base">{formatCurrency(t.amount)}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FinanceApp;