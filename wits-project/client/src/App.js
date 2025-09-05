import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';

// --- API HELPER ---
const api = axios.create({
    
    baseURL: '/api', 
    headers: {
        'Content-Type': 'application/json',
    },
});

const setAuthToken = (token) => {
    if (token) {
        api.defaults.headers.common['x-auth-token'] = token;
        localStorage.setItem('token', token);
    } else {
        delete api.defaults.headers.common['x-auth-token'];
        localStorage.removeItem('token');
    }
};


// --- ICONS ---
const LogoIcon = ({ isDarkMode }) => ( <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"> <path d="M16 2.66663C8.63636 2.66663 2.66669 8.63632 2.66669 16C2.66669 23.3636 8.63636 29.3333 16 29.3333C23.3637 29.3333 29.3334 23.3636 29.3334 16C29.3334 8.63632 23.3637 2.66663 16 2.66663Z" fill={isDarkMode ? "#1F2937" : "#F3F4F6"}/> <path d="M19.68 12.32C19.68 11.4329 19.3365 10.5818 18.7276 9.9729C18.1187 9.36399 17.2676 9.02048 16.38 9.02048H12.32V16.38H16.38C17.2676 16.38 18.1187 16.0365 18.7276 15.4276C19.3365 14.8187 19.68 13.9676 19.68 13.08V12.32Z" fill={isDarkMode ? "#9CA3AF" : "#4B5563"}/> <path d="M16.38 16.38H12.32V23.74H16.38C18.42 23.74 20.06 22.1 20.06 20.06C20.06 18.02 18.42 16.38 16.38 16.38Z" fill={isDarkMode ? "#F9FAFB" : "#1F2937"}/> </svg> );
const SunIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line> </svg> );
const MoonIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path> </svg> );
const UserGroupIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path> </svg> );
const XPIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1.5l3.09 6.26L22.5 9l-5.41 5.24L18.18 21L12 17.5L5.82 21l1.09-6.76L1.5 9l7.41-1.24L12 1.5z"></path></svg> );
const ClockIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"> <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline> </svg> );
const CalendarIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400"> <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line> </svg> );
const BoltIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white dark:text-black"> <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon> </svg> );
const CheckIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg> );
const MenuIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg> );
const XIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg> );

// --- UI COMPONENTS ---
const Navbar = ({ currentPage, setCurrentPage, isAdmin, isDarkMode, toggleDarkMode, isAuthenticated, handleLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navLinks = ['Home', 'Puzzles'];
    if (isAuthenticated) {
        navLinks.push('Dashboard');
    }
    if (isAdmin) {
        navLinks.push('Admin');
    }

    const handleNavClick = (page) => {
        setCurrentPage(page);
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick('home')}>
                        <LogoIcon isDarkMode={isDarkMode} />
                        <span className="text-xl font-bold text-gray-800 dark:text-gray-200">Wits</span>
                    </div>
                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => (
                            <button
                                key={link}
                                onClick={() => handleNavClick(link.toLowerCase())}
                                className={`text-sm font-medium transition-colors ${currentPage === link.toLowerCase() ? 'text-black dark:text-white font-semibold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                            >
                                {link}
                            </button>
                        ))}
                    </nav>
                    <div className="flex items-center space-x-4">
                        <button onClick={toggleDarkMode} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200">
                            {isDarkMode ? <SunIcon /> : <MoonIcon />}
                        </button>
                        {isAuthenticated ? (
                            <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">Sign Out</button>
                        ) : (
                            <>
                                <button onClick={() => handleNavClick('signin')} className="hidden sm:inline-block text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Sign In</button>
                                <button onClick={() => handleNavClick('signup')} className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">Sign Up</button>
                            </>
                        )}
                         {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
                                {isMenuOpen ? <XIcon /> : <MenuIcon />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
             {/* Mobile Menu Panel */}
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.map(link => (
                            <button
                                key={link}
                                onClick={() => handleNavClick(link.toLowerCase())}
                                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${currentPage === link.toLowerCase() ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                {link}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </header>
    );
};

const PuzzleCard = ({ puzzle, onSelectPuzzle, isSolved }) => {
    const difficultyStyles = {
        Easy: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
        Hard: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    return (
        <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1 ${isSolved ? 'opacity-60' : ''}`}>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${difficultyStyles[puzzle.difficulty]}`}>{puzzle.difficulty}</span>
                        {isSolved && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">Solved</span>}
                    </div>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{puzzle.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{puzzle.category}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 h-10 line-clamp-2">{puzzle.question}</p>
            </div>
            <div className="mt-6">
                 <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                        <UserGroupIcon />
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{puzzle.solvedCount?.toLocaleString()}</span> Solved
                    </div>
                     <div className="flex items-center gap-2">
                        <XPIcon />
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{puzzle.xpReward || 100}</span> XP
                    </div>
                </div>
                <button onClick={() => onSelectPuzzle(puzzle)} className={`w-full text-center py-2.5 mt-4 rounded-lg font-semibold transition bg-black hover:bg-gray-800 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200`}>
                    {isSolved ? 'View Puzzle' : 'Start Puzzle'}
                </button>
            </div>
        </div>
    );
};

const InteractiveGridBackground = ({ isDarkMode }) => {
    const canvasRef = useRef(null);
    const mouse = useRef({ x: -1000, y: -1000, radius: 80 });

    const handleMouseMove = useCallback((e) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        mouse.current.x = e.clientX - rect.left;
        mouse.current.y = e.clientY - rect.top;
    }, []);

    const handleMouseLeave = useCallback(() => {
        mouse.current.x = -1000;
        mouse.current.y = -1000;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseLeave);
        resizeCanvas();

        let dots = [];
        const dotSpacing = 30;
        const dotSize = 2;
        
        const createDots = () => {
            dots = [];
            for (let x = dotSpacing / 2; x < canvas.width; x += dotSpacing) {
                for (let y = dotSpacing / 2; y < canvas.height; y += dotSpacing) {
                    dots.push({ x: x, y: y, ox: x, oy: y });
                }
            }
        }
        createDots();


        const animate = () => {
            if (!ctx) return;
            const dotColor = isDarkMode ? 'rgba(107, 114, 128, 0.5)' : 'rgba(209, 213, 219, 0.7)';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            dots.forEach(dot => {
                const dx = mouse.current.x - dot.x;
                const dy = mouse.current.y - dot.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const force = Math.max(0, (mouse.current.radius - dist) / mouse.current.radius);
                
                if (dist < mouse.current.radius) {
                    dot.x -= (dx / dist) * force * 4;
                    dot.y -= (dy / dist) * force * 4;
                } else {
                    dot.x += (dot.ox - dot.x) * 0.1;
                    dot.y += (dot.oy - dot.y) * 0.1;
                }

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dotSize, 0, Math.PI * 2);
                ctx.fillStyle = dotColor;
                ctx.fill();
            });
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseLeave);
        };
    }, [isDarkMode, handleMouseMove, handleMouseLeave]);

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-0" />;
};

// --- PAGE COMPONENTS ---

const HomePage = ({ setCurrentPage, onSelectPuzzle, isDarkMode, dailyPuzzle }) => {
    return (
        <div className="bg-white dark:bg-black relative">
            <div className="fixed inset-0 z-0">
                <InteractiveGridBackground isDarkMode={isDarkMode} />
            </div>
            <main className="relative z-10">
                <div className="py-20 sm:py-28 text-center overflow-hidden">
                    <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Solve Puzzles, Sharpen Your Mind
                        </h1>
                        <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
                            Challenge yourself with our curated collection of brain teasers, logic puzzles, and mathematical challenges.
                        </p>
                        <div className="mt-8 flex justify-center gap-4">
                            <button onClick={() => setCurrentPage('puzzles')} className="px-8 py-3 text-base font-medium text-white bg-black rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">Get Started</button>
                        </div>
                    </div>
                </div>

                <div className="py-20 sm:py-28">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Today's Challenge</h2>
                        <p className="mt-4 max-w-xl mx-auto text-gray-600 dark:text-gray-300">
                            Take on our daily puzzle challenge and build your solving streak.
                        </p>
                       {dailyPuzzle ? (
                         <div className="mt-10 max-w-2xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-6 text-left">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <CalendarIcon />
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Challenge</p>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-800">Available</span>
                            </div>
                            <div className="mt-4">
                                <div className="flex justify-between items-baseline">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">{dailyPuzzle.title}</h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">{dailyPuzzle.category}</span>
                                        <span className={`px-2 py-0.5 text-xs rounded ${dailyPuzzle.difficulty === 'Easy' ? 'bg-green-100 text-green-700' : dailyPuzzle.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{dailyPuzzle.difficulty}</span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{dailyPuzzle.question}</p>
                            </div>
                            <button onClick={() => onSelectPuzzle(dailyPuzzle)} className="mt-6 w-full flex items-center justify-center gap-2 py-3 text-base font-medium text-white bg-black rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                                <BoltIcon />
                                Start Daily Challenge
                            </button>
                        </div>
                       ) : <p className="mt-10 text-gray-500">Loading daily challenge...</p>}
                    </div>
                </div>
            </main>
        </div>
    );
};

const PuzzlesPage = ({ puzzles, onSelectPuzzle, user }) => {
    const [difficulty, setDifficulty] = useState('All');
    const [category, setCategory] = useState('All');

    const filteredPuzzles = puzzles.filter(p => {
        const difficultyMatch = difficulty === 'All' || p.difficulty === difficulty;
        const categoryMatch = category === 'All' || p.category === category;
        return difficultyMatch && categoryMatch;
    });
    
    // This check handles the backend's data inconsistency (id vs puzzleId)

    const solvedPuzzleIds = new Set(user?.recentlySolved?.map(p => p.puzzleId) || []);

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Explore Puzzles</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
                        Choose from our collection of brain-teasing puzzles.
                    </p>
                </div>

                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">Difficulty Level</label>
                        <div className="flex space-x-2 bg-white dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-800">
                            {['All', 'Easy', 'Medium', 'Hard'].map(level => (
                                <button key={level} onClick={() => setDifficulty(level)} className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${difficulty === level ? 'bg-black text-white shadow dark:bg-white dark:text-black' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                        <div className="flex space-x-2 bg-white dark:bg-gray-900 p-1 rounded-lg border border-gray-200 dark:border-gray-800">
                            {['All', 'Math', 'Logic', 'Visual'].map(cat => (
                                <button key={cat} onClick={() => setCategory(cat)} className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${category === cat ? 'bg-black text-white shadow dark:bg-white dark:text-black' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Showing {filteredPuzzles.length} puzzles</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPuzzles.length > 0 ? filteredPuzzles.map(puzzle => (
                        <PuzzleCard key={puzzle.id} puzzle={puzzle} onSelectPuzzle={onSelectPuzzle} isSolved={solvedPuzzleIds.has(puzzle.id)} />
                    )) : <p className="text-gray-500 md:col-span-3 text-center">No puzzles found. Try adjusting your filters or add a new puzzle in the admin panel!</p>}
                </div>
            </div>
        </div>
    );
};

const DashboardPage = ({ user }) => {
    
    const StatCard = ({ icon, value, label, color }) => (
        <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl h-full">
            <div className={`p-4 rounded-full mb-4 ${color}`}>
                {icon}
            </div>
            <p className="text-4xl font-bold text-gray-800 dark:text-gray-200">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
        </div>
    );

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Your Progress</h1>
                    <p className="mt-4 max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
                        Track your puzzle-solving journey and celebrate your achievements.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <StatCard 
                        icon={<XPIcon />} 
                        value={user.xp} 
                        label="Total XP Earned" 
                        color="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400"
                    />
                    <StatCard 
                        icon={<CheckIcon />} 
                        value={user.puzzlesSolved} 
                        label="Puzzles Solved" 
                        color="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Difficulty Breakdown</h4>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <p className="text-xl font-bold text-green-700 dark:text-green-400">{user.difficultyBreakdown.easy}</p>
                                <p className="text-sm text-green-600 dark:text-green-500">Easy</p>
                            </div>
                            <div className="flex-1 text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <p className="text-xl font-bold text-yellow-700 dark:text-yellow-400">{user.difficultyBreakdown.medium}</p>
                                <p className="text-sm text-yellow-600 dark:text-yellow-500">Medium</p>
                            </div>
                            <div className="flex-1 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <p className="text-xl font-bold text-red-700 dark:text-red-400">{user.difficultyBreakdown.hard}</p>
                                <p className="text-sm text-red-600 dark:text-red-500">Hard</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PuzzlePage = ({ puzzle, user, onPuzzleSolved, onDeductXp, onNavigateAway }) => {
    const [timeRemaining, setTimeRemaining] = useState(puzzle.timeLimit * 60);
    const [revealedHints, setRevealedHints] = useState([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [submissionStatus, setSubmissionStatus] = useState('idle');
    const [isSolutionRevealed, setIsSolutionRevealed] = useState(false);
    
    useEffect(() => {
        setTimeRemaining(puzzle.timeLimit * 60);
        setRevealedHints([]);
        setUserAnswer('');
        setSubmissionStatus('idle');
        setIsSolutionRevealed(false);

        const timer = setInterval(() => {
            setTimeRemaining(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, [puzzle]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const revealHint = async () => {
        if (puzzle.hints && revealedHints.length < puzzle.hints.length) {
            await onDeductXp(10);
            setRevealedHints([...revealedHints, puzzle.hints[revealedHints.length]]);
        }
    };
    
    const revealSolution = async () => {
        if (!isSolutionRevealed) {
            await onDeductXp(50);
            setIsSolutionRevealed(true);
        }
    };

    const handleAnswerSubmit = async (e) => {
        e.preventDefault();
        if (!userAnswer) return;
    
        const isAlreadySolved = user.recentlySolved.some(p => p.puzzleId === puzzle.id);
    
        if (isAlreadySolved) {
            if (userAnswer.trim().toLowerCase() === puzzle.answer.trim().toLowerCase()) {
                setSubmissionStatus('correct_resolved');
            } else {
                setSubmissionStatus('incorrect');
                setUserAnswer('');
            }
            return;
        }
    
        try {
            const res = await api.post(`/puzzles/${puzzle.id}/solve`, { userAnswer });
            setSubmissionStatus('correct_new');
            // ✅ UPDATED: The backend now returns the full user object directly
            onPuzzleSolved(res.data);
        } catch (error) {
            console.error("Answer submission failed:", error.response?.data?.msg || error.message);
            setSubmissionStatus('incorrect');
            setUserAnswer('');
        }
    };

    const handleTryAgain = () => setSubmissionStatus('idle');
    const handleNextPuzzle = () => onNavigateAway();

    const difficultyStyles = { Easy: 'bg-green-100 text-green-800', Medium: 'bg-yellow-100 text-yellow-800', Hard: 'bg-red-100 text-red-800' };
    const isInputDisabled = submissionStatus === 'correct_new' || submissionStatus === 'correct_resolved';

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <button onClick={onNavigateAway} className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    Back to Puzzles
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                         <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{puzzle.title}</h1>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">{puzzle.question}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Your Answer</h2>
                            <form onSubmit={handleAnswerSubmit}>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <input type="text" placeholder="Enter your answer..." value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} disabled={isInputDisabled} className="flex-grow px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-black dark:focus:ring-white text-gray-800 dark:text-gray-200 disabled:opacity-50" />
                                    <button type="submit" disabled={isInputDisabled} className="px-6 py-3 text-base font-semibold text-white bg-black rounded-lg hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                                        Submit Answer
                                    </button>
                                </div>
                            </form>
                            
                            {(submissionStatus === 'correct_new' || submissionStatus === 'correct_resolved') && (
                                <div className="mt-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-center">
                                    <p className="font-semibold">Correct!</p>
                                    {submissionStatus === 'correct_resolved' && (
                                        <p className="text-sm mt-1">You've solved this one before. Stats were not updated.</p>
                                    )}
                                    <button onClick={handleNextPuzzle} className="mt-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">Next Puzzle</button>
                                </div>
                            )}

                             {submissionStatus === 'incorrect' && (
                                <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-center">
                                    <p className="font-semibold">Incorrect, please try again.</p>
                                    <button onClick={handleTryAgain} className="mt-2 px-4 py-2 text-sm font-medium text-red-800 bg-red-200 rounded-lg hover:bg-red-300">Try Again</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Details</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center"> <span className="text-gray-500 dark:text-gray-400">Difficulty</span> <span className={`font-semibold px-2 py-0.5 rounded-full ${difficultyStyles[puzzle.difficulty]}`}>{puzzle.difficulty}</span> </div>
                                <div className="flex justify-between items-center"> <span className="text-gray-500 dark:text-gray-400">Category</span> <span className="font-semibold text-gray-800 dark:text-gray-200">{puzzle.category}</span> </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 text-center">
                            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400"> <ClockIcon /> <h3 className="text-lg font-medium">Time Remaining</h3> </div>
                            <p className="text-5xl font-bold text-gray-800 dark:text-gray-200 my-3">{formatTime(timeRemaining)}</p>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"> <div className="bg-black dark:bg-white h-2 rounded-full" style={{ width: `${(timeRemaining / (puzzle.timeLimit * 60)) * 100}%` }}></div> </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Hints ({revealedHints.length}/{puzzle.hints?.length || 0})</h3>
                            <div className="space-y-3">
                                {revealedHints.map((hint, index) => ( <p key={index} className="text-sm text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg"> {hint} </p> ))}
                                {puzzle.hints && revealedHints.length < puzzle.hints.length && ( <button onClick={revealHint} className="w-full mt-2 py-2 text-sm font-semibold text-black dark:text-white border border-black dark:border-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"> Reveal Hint (-10 XP) </button> )}
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Solution</h3>
                            {isSolutionRevealed ? ( <p className="text-sm text-gray-600 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg font-semibold">{puzzle.answer}</p> ) : ( <button onClick={revealSolution} className="w-full py-2 text-sm font-semibold text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"> Reveal Solution (-50 XP) </button> )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AuthPage = ({ isSignIn, setCurrentPage, handleAuth }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) {
            alert("Please fill in all fields.");
            return;
        }
        if (!isSignIn && password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        handleAuth({ email, password }, isSignIn);
    };

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen flex items-center justify-center py-12">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{isSignIn ? 'Sign In' : 'Sign Up'}</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        {isSignIn ? 'Welcome back!' : 'Create an account to start solving.'}
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                            <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input type="password" name="password" id="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" />
                        </div>
                        {!isSignIn && (
                             <div>
                                <label htmlFor="confirm-password"
                                    className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm
                                    Password</label>
                                <input type="password" name="confirm-password" id="confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" />
                            </div>
                        )}
                        {isSignIn && (
                            <div className="text-sm text-right">
                                <button type="button" onClick={() => setCurrentPage('forgotpassword')} className="font-medium text-black dark:text-white hover:underline">
                                    Forgot Password?
                                </button>
                            </div>
                        )}
                        <div>
                            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                                {isSignIn ? 'Sign In' : 'Create Account'}
                            </button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        {isSignIn ? "Don't have an account? " : "Already have an account? "}
                        <button onClick={() => setCurrentPage(isSignIn ? 'signup' : 'signin')} className="font-medium text-black dark:text-white hover:underline">
                            {isSignIn ? 'Sign Up' : 'Sign In'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

const ForgotPasswordPage = ({ handleForgotPassword, setCurrentPage }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await handleForgotPassword(email);
        if (success) {
            setMessage('If an account with that email exists, a password reset link has been sent.');
        } else {
            setMessage('An error occurred. Please try again later.');
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen flex items-center justify-center py-12">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Forgot Password</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">
                        Enter your email to receive a reset link.
                    </p>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
                    {message ? (
                        <p className="text-center text-green-600 dark:text-green-400">{message}</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                <input type="email" name="email" id="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" />
                            </div>
                            <div>
                                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                                    Send Reset Link
                                </button>
                            </div>
                        </form>
                    )}
                     <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                        Remembered your password?{' '}
                        <button onClick={() => setCurrentPage('signin')} className="font-medium text-black dark:text-white hover:underline">
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

const ResetPasswordPage = ({ handleResetPassword, setCurrentPage }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [token, setToken] = useState('');

    useEffect(() => {
        // Extract token from URL
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token');
        if (urlToken) {
            setToken(urlToken);
        } else {
            setMessage('Invalid or missing reset token.');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            return;
        }
        if (!token) {
             setMessage('Invalid or missing reset token.');
            return;
        }

        const success = await handleResetPassword(token, password);
        if (success) {
            setMessage('Your password has been reset successfully! You can now sign in.');
            setTimeout(() => setCurrentPage('signin'), 3000);
        } else {
            setMessage('Failed to reset password. The link may have expired.');
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen flex items-center justify-center py-12">
            <div className="max-w-md w-full mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Reset Your Password</h1>
                </div>
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
                    {message ? (
                        <p className="text-center text-green-600 dark:text-green-400">{message}</p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</label>
                                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200" />
                            </div>
                            <div>
                                <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};


const AdminPage = ({ puzzles, onAddPuzzle, onDeletePuzzle }) => {
    const [newPuzzle, setNewPuzzle] = useState({ title: '', question: '', answer: '', difficulty: 'Easy', category: 'Logic', hints: '', timeLimit: 5, featured: false, xpReward: 100 });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewPuzzle(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const puzzleToAdd = {
            ...newPuzzle,
            hints: newPuzzle.hints.split(',').map(h => h.trim()).filter(h => h),
            timeLimit: parseInt(newPuzzle.timeLimit, 10),
            xpReward: parseInt(newPuzzle.xpReward, 10)
        };
        onAddPuzzle(puzzleToAdd);
        setNewPuzzle({ title: '', question: '', answer: '', difficulty: 'Easy', category: 'Logic', hints: '', timeLimit: 5, featured: false, xpReward: 100 });
    };

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Add Puzzle Form */}
                    <div>
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
                            <p className="mt-4 text-gray-600 dark:text-gray-300">Add new puzzles to the database.</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm">
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">Add New Puzzle</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div> <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label> <input type="text" name="title" value={newPuzzle.title} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800" required /> </div>
                                <div> <label htmlFor="question" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Question</label> <textarea name="question" rows="3" value={newPuzzle.question} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800" required></textarea> </div>
                                <div> <label htmlFor="answer" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Answer</label> <input type="text" name="answer" value={newPuzzle.answer} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800" required /> </div>
                                <div> <label htmlFor="hints" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hints (comma-separated)</label> <input type="text" name="hints" value={newPuzzle.hints} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800" /> </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div> <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Difficulty</label> <select name="difficulty" value={newPuzzle.difficulty} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"> <option>Easy</option> <option>Medium</option> <option>Hard</option> </select> </div>
                                    <div> <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label> <select name="category" value={newPuzzle.category} onChange={handleInputChange} className="mt-1 block w-full pl-3 pr-10 py-2 border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"> <option>Math</option> <option>Logic</option> <option>Visual</option> </select> </div>
                                    <div> <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Time Limit (mins)</label> <input type="number" name="timeLimit" value={newPuzzle.timeLimit} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800" /> </div>
                                    <div> <label htmlFor="xpReward" className="block text-sm font-medium text-gray-700 dark:text-gray-300">XP Reward</label> <input type="number" name="xpReward" value={newPuzzle.xpReward} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-white dark:bg-gray-800" /> </div>
                                    <div className="flex items-end pb-2 sm:col-span-2"> <div className="flex items-center h-5"> <input name="featured" type="checkbox" checked={newPuzzle.featured} onChange={handleInputChange} className="h-4 w-4 text-black border-gray-300 rounded bg-gray-50" /> </div> <div className="ml-3 text-sm"> <label htmlFor="featured" className="font-medium text-gray-700 dark:text-gray-300">Mark as Featured (Daily Puzzle)</label> </div> </div>
                                </div>
                                <div> <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"> Add Puzzle </button> </div>
                            </form>
                        </div>
                    </div>

                    {/* Manage Puzzles List */}
                    <div>
                         <div className="text-center mb-10">
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Manage Puzzles</h1>
                            <p className="mt-4 text-gray-600 dark:text-gray-300">View and delete existing puzzles.</p>
                        </div>
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-8 shadow-sm max-h-[80vh] overflow-y-auto">
                           {puzzles.map(puzzle => (
                               <div key={puzzle.id} className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-800">
                                   <div>
                                       <p className="font-semibold text-gray-800 dark:text-gray-200">{puzzle.title}</p>
                                       <p className="text-xs text-gray-500 dark:text-gray-400">{puzzle.category} - {puzzle.difficulty}</p>
                                   </div>
                                   <button onClick={() => onDeletePuzzle(puzzle.id)} className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 dark:bg-red-900/40 dark:text-red-300 dark:hover:bg-red-900/60">
                                       Delete
                                   </button>
                               </div>
                           ))}
                           {puzzles.length === 0 && <p className="text-gray-500 text-center">No puzzles to display.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const RestrictedPage = () => (
    <div className="bg-gray-50 dark:bg-black min-h-screen flex items-center justify-center">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-300">You do not have permission to view this page.</p>
        </div>
    </div>
);

const Footer = () => (
    <footer className="bg-gray-100 dark:bg-gray-950/50 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Wits. All rights reserved.</p>
        </div>
    </footer>
);

// --- MAIN APP COMPONENT ---
export default function App() {
    const [currentPage, setCurrentPage] = useState('home');
    const [selectedPuzzle, setSelectedPuzzle] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [puzzles, setPuzzles] = useState([]);

    const loadUser = useCallback(async () => {
        if (localStorage.token) {
            setAuthToken(localStorage.token);
            try {
                const res = await api.get('/auth');
                setCurrentUser(res.data);
                setIsAuthenticated(true);
            } catch (err) {
                console.error("Auth token invalid", err);
                setAuthToken(null);
            }
        }
        setLoading(false);
    }, []);

    const fetchPuzzles = useCallback(async () => {
        try {
            const res = await api.get('/puzzles');
            const formattedPuzzles = res.data.map(p => ({ ...p, id: p._id }));
            setPuzzles(formattedPuzzles);
        } catch (err) {
            console.error("Failed to fetch puzzles", err);
        }
    }, []);

    useEffect(() => {
        const path = window.location.pathname;
        const params = new URLSearchParams(window.location.search);
        if (path.startsWith('/resetpassword') && params.has('token')) {
            setCurrentPage('resetpassword');
        }

        loadUser();
        fetchPuzzles();
    }, [loadUser, fetchPuzzles]);


    const handleLogout = () => {
        setAuthToken(null);
        setIsAuthenticated(false);
        setCurrentUser(null);
        setCurrentPage('home');
    };

    const handleAuth = async (credentials, isSignIn) => {
        const endpoint = isSignIn ? '/auth/login' : '/auth/register';
        try {
            const res = await api.post(endpoint, credentials);
            setAuthToken(res.data.token);
            await loadUser();
            setCurrentPage('dashboard');
        } catch (err) {
            const errorMsg = err.response?.data?.msg || 'An error occurred.';
            alert(`Authentication failed: ${errorMsg}`);
            console.error(err.response);
        }
    };

    const handleForgotPassword = async (email) => {
        try {
            await api.post('/auth/forgot-password', { email });
            return true; // Indicate success
        } catch (err) {
            console.error('Forgot password error:', err.response);
            // Don't reveal if email exists, but return false for error state
            return false;
        }
    };

    const handleResetPassword = async (token, password) => {
        try {
            await api.post('/auth/reset-password', { token, password });
            return true; // Indicate success
        } catch (err) {
            console.error('Reset password error:', err.response);
            return false;
        }
    };
    
    const handleSelectPuzzle = (puzzle) => {
        if (!isAuthenticated) {
            alert("Please sign in to solve puzzles.");
            setCurrentPage('signin');
            return;
        }
        setSelectedPuzzle(puzzle);
        setCurrentPage('puzzle');
    };

    const handlePuzzleSolved = async (updatedUserFromServer) => {
        setCurrentUser(updatedUserFromServer);
        await fetchPuzzles();
    };

    const handleNavigateAway = () => {
        setSelectedPuzzle(null);
        setCurrentPage('puzzles');
    };
    
    const handleAddPuzzle = async (newPuzzleData) => {
        try {
            await api.post('/puzzles', newPuzzleData);
            alert('Puzzle added successfully!');
            await fetchPuzzles();
        } catch (err) {
            alert('Failed to add puzzle.');
            console.error(err);
        }
    };
    
    const handleDeletePuzzle = async (puzzleId) => {
        if (window.confirm("Are you sure you want to delete this puzzle?")) {
            try {
                await api.delete(`/puzzles/${puzzleId}`);
                await fetchPuzzles();
            } catch (err) {
                 alert('Failed to delete puzzle.');
                 console.error(err);
            }
        }
    };

    const handleDeductXp = async (amount) => {
        try {
            const res = await api.post('/users/deduct-xp', { amount });
            setCurrentUser(res.data);
        } catch (err) {
            console.error("Failed to deduct XP:", err);
        }
    };

    const renderPage = () => {
        if (loading) {
            return <div className="min-h-screen bg-gray-50 dark:bg-black flex justify-center items-center"><p className="text-gray-500">Loading...</p></div>;
        }

        const isAdmin = currentUser?.isAdmin || false;
        
        if (currentPage === 'puzzle' && selectedPuzzle) {
            return <PuzzlePage 
                puzzle={selectedPuzzle}
                user={currentUser}
                onPuzzleSolved={handlePuzzleSolved} 
                onDeductXp={handleDeductXp} 
                onNavigateAway={handleNavigateAway}
            />;
        }

        switch (currentPage) {
            case 'home':
                const featuredPuzzle = puzzles.find(p => p.featured) || puzzles[0];
                return <HomePage setCurrentPage={setCurrentPage} onSelectPuzzle={handleSelectPuzzle} isDarkMode={isDarkMode} dailyPuzzle={featuredPuzzle} />;
            case 'puzzles':
                return <PuzzlesPage puzzles={puzzles} onSelectPuzzle={handleSelectPuzzle} user={currentUser} />;
            case 'dashboard':
                return isAuthenticated && currentUser ? <DashboardPage user={currentUser} /> : <AuthPage isSignIn={true} setCurrentPage={setCurrentPage} handleAuth={handleAuth} />;
            case 'admin':
                return isAdmin ? <AdminPage puzzles={puzzles} onAddPuzzle={handleAddPuzzle} onDeletePuzzle={handleDeletePuzzle} /> : <RestrictedPage />;
            case 'signin':
                return <AuthPage isSignIn={true} setCurrentPage={setCurrentPage} handleAuth={handleAuth} />;
            case 'signup':
                 return <AuthPage isSignIn={false} setCurrentPage={setCurrentPage} handleAuth={handleAuth} />;
            case 'forgotpassword':
                return <ForgotPasswordPage handleForgotPassword={handleForgotPassword} setCurrentPage={setCurrentPage} />;
            case 'resetpassword':
                return <ResetPasswordPage handleResetPassword={handleResetPassword} setCurrentPage={setCurrentPage} />;
            default:
                return <HomePage setCurrentPage={setCurrentPage} onSelectPuzzle={handleSelectPuzzle} isDarkMode={isDarkMode} dailyPuzzle={puzzles[0]} />;
        }
    };

    return (
        <div className={isDarkMode ? 'dark' : ''}>
            <div className="font-sans antialiased bg-white dark:bg-black">
                <Navbar 
                    currentPage={currentPage} 
                    setCurrentPage={setCurrentPage} 
                    isAdmin={currentUser?.isAdmin || false} 
                    isDarkMode={isDarkMode} 
                    toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                    isAuthenticated={isAuthenticated}
                    handleLogout={handleLogout}
                />
                <main>
                    {renderPage()}
                </main>
                <Footer />
            </div>
        </div>
    );
}